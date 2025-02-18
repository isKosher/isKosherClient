"use server";

import { cookies } from "next/headers";

export async function setTokensAction(
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
}

export async function clearTokensAction() {
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
