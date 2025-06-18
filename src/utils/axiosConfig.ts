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
        ...config.headers,
        ...init.headers,
      },
    };
    try {
      const response = await fetch(input, mergedConfig);
      return response;
    } catch (response: any) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      console.error(`API Error: ${response.statusText}`, {
        url: input,
        status: response.status,
        data: errorData,
      });

      const errorMessage = errorData?.message || response.statusText || "Unknown error occurred";
      throw new Error(errorMessage);
    }
  };
};
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiFetchBaseOptions {
  method?: HttpMethod;
  data?: any;
  params?: Record<string, any>;
  includeCookies?: boolean;
  headers?: Record<string, string>;
  timeout?: number;
  cache?: "force-cache" | "no-cache";
  tags?: string[];
  credentials?: string;
  raw?: boolean;
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchBaseOptions = {}): Promise<T> {
  const {
    method = "GET",
    data,
    params,
    includeCookies = false,
    headers = {},
    timeout,
    cache,
    tags,
    raw = false,
  } = options;

  const requestHeaders = { ...headers };

  if (method !== "GET" && data && !(data instanceof FormData)) {
    requestHeaders["Content-Type"] ??= "application/json";
  }

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
    cache,
    next: { tags, revalidate: 3600 },
  });

  const url = new URL(`${process.env.IS_KOSHER_MANAGER_URL}${endpoint}`);
  if (params) {
    for (const key of Object.keys(params)) {
      url.searchParams.append(key, params[key]);
    }
  }

  const response = await api(url.toString(), {
    method,
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    headers: requestHeaders,
  });

  if (response.status === 401) {
    try {
      console.warn("Access token expired, trying to refresh...");
      const refreshed = await refreshAccessTokenAction();
      if (refreshed) {
        return apiFetch<T>(endpoint, options);
      } else {
        redirect("/logout");
      }
    } catch {
      redirect("/logout");
    }
  }

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  if (raw) return response as T;
  try {
    let formattedResponse = await response.json();
    return formattedResponse as T;
  } catch {
    return response.text() as T;
  }
}
