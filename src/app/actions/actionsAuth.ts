"use server";
import { clearTokensAction, setTokensAction } from "@/app/actions/tokenCookieActions";
import { LoginResponse } from "@/types";
import { extractTokens, serverApi } from "@/utils/apiClient";
import { cookies } from "next/headers";

export async function handleLoginAction(idToken: string): Promise<LoginResponse> {
  try {
    const response: Response = await serverApi.postRaw(
      `/auth/login`,
      {},
      {
        headers: {
          Authorization: `${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { accessToken, refreshToken } = extractTokens(response.headers.getSetCookie());
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

    const response = await serverApi.postRaw(`/auth/refresh-token`, null, {
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const { accessToken, refreshToken } = extractTokens(response.headers.getSetCookie());
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
    await serverApi.postRaw(`/auth/logout`, null, {});
    await clearTokensAction();
    console.log("Logged out successfully!");
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
}
