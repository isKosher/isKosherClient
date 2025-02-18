import { apiFetch } from "./axiosConfig";

export const serverApi = {
  get: <T>(endpoint: string, options: Omit<Parameters<typeof apiFetch>[1], "method"> = {}) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    data: any,
    options: Omit<Parameters<typeof apiFetch>[1], "method" | "data"> = {}
  ) => apiFetch<T>(endpoint, { ...options, method: "POST", data }),

  put: <T>(
    endpoint: string,
    data: any,
    options: Omit<Parameters<typeof apiFetch>[1], "method" | "data"> = {}
  ) => apiFetch<T>(endpoint, { ...options, method: "PUT", data }),

  patch: <T>(
    endpoint: string,
    data: any,
    options: Omit<Parameters<typeof apiFetch>[1], "method" | "data"> = {}
  ) => apiFetch<T>(endpoint, { ...options, method: "PATCH", data }),

  delete: <T>(endpoint: string, options: Omit<Parameters<typeof apiFetch>[1], "method"> = {}) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Extracts access and refresh tokens from the "Set-Cookie" header.
 */
export const extractTokens = (setCookieHeader: string[] | undefined) => {
  if (!setCookieHeader || setCookieHeader.length === 0) {
    throw new Error("No cookies received from server");
  }

  const accessToken = setCookieHeader
    .find((cookie) => cookie.includes("access_token"))
    ?.split(";")[0]
    .split("=")[1];

  const refreshToken = setCookieHeader
    .find((cookie) => cookie.includes("refresh_token"))
    ?.split(";")[0]
    .split("=")[1];

  if (!accessToken || !refreshToken) {
    throw new Error("Missing access or refresh token in cookies");
  }

  return { accessToken, refreshToken };
};
