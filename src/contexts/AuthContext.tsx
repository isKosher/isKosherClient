"use client";
import React, { createContext, useState, ReactNode, useEffect } from "react";
import { AuthContextType, User } from "../types/auth";
import axiosInstance from "@/utils/axiosConfig";
import { User as FirebaseUser } from "firebase/auth";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const COOKIE_NAME = "auth_user";

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};

const getCookie = (name: string) => {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((c) => c.trim().startsWith(name + "="));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from cookie on mount
  useEffect(() => {
    const storedUser = getCookie(COOKIE_NAME);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log(storedUser);
    }
  }, []);

  const login = async (userData: FirebaseUser) => {
    const googleToken = (await userData.getIdTokenResult()).token;
    console.log(googleToken);
    const response = await axiosInstance.post(
      "/api/v1/auth/login",
      {},
      {
        headers: {
          Authorization: `${googleToken}`,
        },
      }
    );

    const user: User = {
      name: userData.displayName || "Unknown",
      photoURL: userData.photoURL || "",
      email: userData.email || "",
    };
    setUser(user);
    // Save to cookie
    setCookie(COOKIE_NAME, JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    // Remove cookie
    removeCookie(COOKIE_NAME);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
