"use server";

import { refreshAccessTokenAction } from "@/app/actions/actionsAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const createAPIClient = async (
  config: RequestInit = {}
): Promise<(input: RequestInfo, init?: RequestInit) => Promise<Response>> => {
  return async (input: RequestInfo, init: RequestInit = {}) => {
    const mergedConfig: RequestInit = {
      ...config,
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
        ...init.headers,
      },
    };

    const response = await fetch(input, mergedConfig);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API Error: ${response.statusText}`, {
        url: input,
        status: response.status,
        data: errorData,
      });
      throw new Error(response.statusText);
    }

    return response;
  };
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
    cache?: "force-cache" | "no-cache";
    tags?: string[];
  } = {}
): Promise<Response & { json: () => Promise<T> }> {
  const { method = "GET", data, params, includeCookies = false, headers = {}, tags, timeout } = options;

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

  const api = await createAPIClient({
    headers: requestHeaders,
    cache: options.cache,
    next: { tags, revalidate: 3600 },
  });

  const url = new URL(process.env.IS_KOSHER_MANAGER_URL! + endpoint);
  if (params) {
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
  }

  try {
    const response = await api(url.toString(), {
      method,
      body: data ? JSON.stringify(data) : undefined,
      headers: requestHeaders,
    });
    if (response.status === 401) {
      console.warn("Access token expired, trying to refresh...");
      try {
        const refreshed = await refreshAccessTokenAction();

        if (refreshed) {
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
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response;
  } catch (error: any) {
    throw error;
  }
}
