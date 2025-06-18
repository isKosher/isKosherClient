import { apiFetch, ApiFetchBaseOptions } from "./axiosConfig";

export const serverApi = {
  get: <T>(url: string, options?: Omit<ApiFetchBaseOptions, "method" | "raw">) => {
    return apiFetch<T>(url, { ...options, method: "GET" });
  },
  getRaw: (url: string, options?: Omit<ApiFetchBaseOptions, "method" | "raw">) =>
    apiFetch<Response>(url, { ...options, method: "GET", raw: true }),
  post: <T>(url: string, data?: any, options?: Omit<ApiFetchBaseOptions, "method" | "raw" | "data">) =>
    apiFetch<T>(url, { ...options, method: "POST", data }),
  postRaw: (url: string, data?: any, options?: Omit<ApiFetchBaseOptions, "method" | "raw" | "data">) =>
    apiFetch<Response>(url, { ...options, method: "POST", data, raw: true }),
  put: <T>(url: string, data?: any, options?: Omit<ApiFetchBaseOptions, "method" | "raw" | "data">) =>
    apiFetch<T>(url, { ...options, method: "PUT", data }),
  putRaw: (url: string, data?: any, options?: Omit<ApiFetchBaseOptions, "method" | "raw" | "data">) =>
    apiFetch<Response>(url, { ...options, method: "PUT", data, raw: true }),
  delete: <T>(url: string, options?: Omit<ApiFetchBaseOptions, "method" | "raw">) =>
    apiFetch<T>(url, { ...options, method: "DELETE" }),
  deleteRaw: (url: string, options?: Omit<ApiFetchBaseOptions, "method" | "raw">) =>
    apiFetch<Response>(url, { ...options, method: "DELETE", raw: true }),
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
