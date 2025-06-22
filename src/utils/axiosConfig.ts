"use server";

import { refreshAccessTokenAction } from "@/app/actions/actionsAuth";
import { REVALIDATE_TIME } from "@/lib/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiFetchBaseOptions } from "./apiClient";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export const createAPIClient = async (
  config: RequestInit & { timeout?: number } = {}
): Promise<(input: RequestInfo, init?: RequestInit) => Promise<Response>> => {
  return async (input: RequestInfo, init: RequestInit = {}) => {
    const { timeout = 30000, ...restConfig } = config;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const mergedConfig: RequestInit = {
      ...restConfig,
      ...init,
      signal: controller.signal,
      headers: {
        ...restConfig.headers,
        ...init.headers,
      },
    };

    try {
      const response = await fetch(input, mergedConfig);
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        console.error("Request timed out after", timeout, "ms");
        throw new Error(`Request timed out after ${timeout} ms`);
      }
      throw error;
    }
  };
};

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
    cache: cache ?? "no-cache", // Default to no-cache unless specified
    timeout: timeout ?? 30000,
    next: { tags, revalidate: REVALIDATE_TIME },
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
    const formattedResponse = await response.json();
    return formattedResponse as T;
  } catch {
    return response.text() as T;
  }
}
