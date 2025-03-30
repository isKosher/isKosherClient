"use server";

import { refreshAccessTokenAction } from "@/app/actions/actionsAuth";
import { AXIOS_DEFAULT_TIMEOUT } from "@/lib/constants";
import axios, { AxiosResponse, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export const createAPIClient = async (config: AxiosRequestConfig = {}): Promise<AxiosInstance> => {
  const instance = axios.create({
    baseURL: process.env.IS_KOSHER_MANAGER_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: AXIOS_DEFAULT_TIMEOUT,
    ...config,
  });

  // Add response interceptor for logging and error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.code === "ECONNABORTED" ||
        error.message.includes("Network Error") ||
        error.message.includes("ENOTFOUND")
      ) {
        console.error("נתקלנו בשגיאת תקשורת:", {
          errorType: "שגיאת חיבור לשרת",
          details: error.message,
        });

        // Create a custom network error
        return Promise.reject({
          isNetworkError: true,
          message: "אין חיבור לאינטרנט או שהשרת אינו זמין כרגע",
          originalError: error,
        });
      }
      console.error(`API Error: ${error.message}`, {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );

  return instance;
};

export async function apiFetch<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    data?: any;
    params?: Record<string, any>;
    includeCookies?: boolean;
    headers?: Record<string, string>;
    timeout?: number;
  } = {}
): Promise<AxiosResponse<T>> {
  const { method = "GET", data, params, includeCookies = false, headers = {}, timeout } = options;
  let isRefreshAttempt = endpoint === "/auth/refresh-token";

  const requestHeaders: Record<string, string> = { ...headers };

  if (includeCookies) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    if (cookieHeader) {
      requestHeaders["Cookie"] = cookieHeader;
    }
  }

  const api = await createAPIClient({ timeout });

  try {
    const response = await api.request({
      url: endpoint,
      method,
      data,
      params,
      headers: requestHeaders,
    });

    return response;
  } catch (error: any) {
    // Only attempt refresh if this isn't already a refresh token request
    if (error.response?.status === 401 && !isRefreshAttempt) {
      console.warn("Access token expired, trying to refresh...");
      try {
        const refreshed = await refreshAccessTokenAction();

        if (refreshed) {
          // Try the original request again
          return apiFetch(endpoint, { ...options });
        } else {
          console.error("Failed to refresh token");
          redirect("/logout");
        }
      } catch (refreshError: any) {
        console.error("Error refreshing token:", refreshError.message);
        redirect("/logout");
      }
    }
    throw error;
  }
}
