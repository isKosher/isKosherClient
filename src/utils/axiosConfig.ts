"use server";

import { refreshAccessTokenAction } from "@/app/(public)/login/actionsAuth";
import axios, { type AxiosInstance } from "axios";
import { cookies } from "next/headers";

const BASE_URL = "https://iskoshermanager.onrender.com/api/v1";

export const createAPIClient = async (): Promise<AxiosInstance> => {
  "use server";
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
};

export async function apiFetch<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    data?: any;
    includeCookies?: boolean;
    retry?: boolean;
  } = {}
): Promise<T> {
  const {
    method = "GET",
    data,
    includeCookies = false,
    retry = true,
  } = options;

  const headers: Record<string, string> = {};

  if (includeCookies) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    headers["Cookie"] = cookieHeader;
  }

  const api = await createAPIClient();

  try {
    const response = await api.request({
      url: endpoint,
      method,
      data,
      headers,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 && retry) {
      console.warn("🔄 Access token expired, trying to refresh...");

      const refreshed = await refreshAccessTokenAction();

      if (refreshed) {
        return apiFetch(endpoint, { ...options, retry: false });
      } else {
        console.error("❌ Failed to refresh token. Logging out.");
        throw new Error("Session expired. Please log in again.");
      }
    }
    throw error;
  }
}
