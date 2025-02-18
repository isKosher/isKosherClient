"use server";
import { clearTokensAction, setTokensAction } from "@/app/actions/tokenCookieActions";
import { BASE_URL_IS_KOSHER_MANAGER } from "@/lib/constants";
import { LoginResponse } from "@/types";
import { extractTokens, serverApi } from "@/utils/apiClient";
import axios from "axios";
import { cookies } from "next/headers";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function handleLoginAction(idToken: string): Promise<LoginResponse> {
  try {
    const response = await axios.post(
      `${BASE_URL_IS_KOSHER_MANAGER}/auth/login`,
      {},
      {
        headers: {
          Authorization: `${idToken}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const { accessToken, refreshToken } = extractTokens(response.headers["set-cookie"]);
    await setTokensAction(accessToken, refreshToken);

    return { success: true };
  } catch (error) {
    console.error("Login failed", error);
    return { success: false, error: "Login failed" };
  }
}

export async function refreshAccessTokenAction(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await axios.post(`${BASE_URL_IS_KOSHER_MANAGER}/auth/refresh-token`, null, {
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    const { accessToken, refreshToken } = extractTokens(response.headers["set-cookie"]);
    await setTokensAction(accessToken, refreshToken);

    console.log("Access token refreshed successfully!");
    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

export async function logoutAction(): Promise<boolean> {
  try {
    await serverApi.post(`${BASE_URL_IS_KOSHER_MANAGER}/auth/logout`, null, {});
    await clearTokensAction();
    console.log("Logged out successfully!");
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
}
