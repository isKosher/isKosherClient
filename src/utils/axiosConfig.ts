"use server";
import axios, { AxiosInstance } from "axios";
import { cookies } from "next/headers";

// Constants
const BASE_URL = "https://iskoshermanager.onrender.com/api/v1";

// Token management
export async function setTokens(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
}

export async function clearTokens() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function getTokens() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("access_token")?.value,
    refreshToken: cookieStore.get("refresh_token")?.value,
  };
}

// API client configuration
const createAPIClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return api;
};

// API utilities
export async function apiFetch<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    data?: any;
    requiresAuth?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", data, requiresAuth = false } = options;
  const api = createAPIClient();

  try {
    const headers: Record<string, string> = {};
    if (requiresAuth) {
      const { accessToken } = await getTokens();
      if (!accessToken) {
        throw new Error("No access token available");
      }
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await api.request({
      url: endpoint,
      method,
      data,
      headers,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 && requiresAuth) {
      // Here you can implement token refresh logic
      // For now, throwing an error
      throw new Error("Session expired. Please log in again.");
    }
    throw error;
  }
}

// Type definitions for API responses
