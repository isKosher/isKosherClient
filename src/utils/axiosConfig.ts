"use server";

import { refreshAccessTokenAction } from "@/app/actions/actionsAuth";
import { AXIOS_DEFAULT_TIMEOUT } from "@/lib/constants";
import axios, { AxiosResponse, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";
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
  let retry = true;
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
    if (error.response?.status === 401 && retry) {
      console.warn("Access token expired, trying to refresh...");

      try {
        const refreshed = await refreshAccessTokenAction();

        if (refreshed) {
          retry = true;
          return apiFetch(endpoint, { ...options });
        } else {
          retry = false;
          console.error("Failed to refresh token");
          throw new Error("Session expired. Please log in again.");
        }
      } catch (refreshError: any) {
        retry = false;
        console.error("Error refreshing token:", refreshError.message);
        throw new Error("Authentication failed. Please log in again.");
      }
    }
    throw error;
  }
}
