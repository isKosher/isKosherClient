"use server";
import { setTokensAction } from "@/app/actions/auth";
import { LoginResponse } from "@/types";
import axios from "axios";
import { cookies } from "next/headers";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function handleLoginAction(
  idToken: string
): Promise<LoginResponse> {
  try {
    const response = await axios.post(
      "https://iskoshermanager.onrender.com/api/v1/auth/login",
      {},
      {
        headers: {
          Authorization: `${idToken}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const cookies = response.headers["set-cookie"];
    if (!cookies || cookies.length === 0) {
      throw new Error("No cookies received from server");
    }

    const accessTokenCookie = cookies.find((cookie) =>
      cookie.includes("access_token")
    );
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.includes("refresh_token")
    );

    if (accessTokenCookie && refreshTokenCookie) {
      const accessToken = accessTokenCookie.split(";")[0].split("=")[1];
      const refreshToken = refreshTokenCookie.split(";")[0].split("=")[1];
      await setTokensAction(accessToken, refreshToken);
    }

    return { success: true };
  } catch (error) {
    console.error("Login failed", error);
    return { success: false, error: "Login failed" };
  }
}

export async function refreshAccessTokenAction(): Promise<boolean> {
  try {
    let headers: Record<string, string> = {};

    const cookieStore = await cookies();
    const cookiesHeader = cookieStore
      .getAll()
      .map((cookieHeader) => ` ${cookieHeader.name}=${cookieHeader.value}`)
      .join("; ");
    headers["Cookie"] = cookiesHeader;

    headers["Content-Type"] = "application/json";
    const response = await axios.post(
      "https://iskoshermanager.onrender.com/api/v1/auth/refresh-token",
      null,
      {
        headers,
        withCredentials: true,
      }
    );

    const cookiesa = response.headers["set-cookie"];
    if (!cookiesa || cookiesa.length === 0) {
      throw new Error("No cookies received from server");
    }
    console.log(cookiesa);

    const accessTokenCookie = cookiesa.find((cookie) =>
      cookie.includes("access_token")
    );
    const refreshTokenCookie = cookiesa.find((cookie) =>
      cookie.includes("refresh_token")
    );

    if (accessTokenCookie && refreshTokenCookie) {
      const accessToken = accessTokenCookie.split(";")[0].split("=")[1];
      const refreshToken = refreshTokenCookie.split(";")[0].split("=")[1];
      await setTokensAction(accessToken, refreshToken);
    }
    console.log("✅ Access token refreshed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    return false;
  }
}
