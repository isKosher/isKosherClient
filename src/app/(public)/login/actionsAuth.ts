"use server";
import { LoginResponse } from "@/types";
import { setTokens } from "@/utils/axiosConfig";
import axios from "axios";

export async function handleLogin(idToken: string): Promise<LoginResponse> {
  try {
    const response = await axios.post(
      `https://iskoshermanager.onrender.com/api/v1/auth/login`,
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

    const accessTokenCookie = cookies.find((cookie) => cookie.includes("access_token"));
    const refreshTokenCookie = cookies.find((cookie) => cookie.includes("refresh_token"));

    if (accessTokenCookie && refreshTokenCookie) {
      const accessToken = accessTokenCookie.split(";")[0].split("=")[1];
      const refreshToken = refreshTokenCookie.split(";")[0].split("=")[1];
      await setTokens(accessToken, refreshToken);
    }

    return { success: true };
  } catch (error) {
    console.error("Login failed", error);
    return { success: false, error: "Login failed" };
  }
}
