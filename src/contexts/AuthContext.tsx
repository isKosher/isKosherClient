"use client";
import type React from "react";
import { createContext, useEffect, useState, type ReactNode } from "react";
import type { AuthContextType, User } from "../types/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { handleLoginAction, logoutAction } from "@/app/actions/actionsAuth";
import { useRouter } from "next/navigation";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (userData: FirebaseUser) => {
    try {
      const idToken = await userData.getIdToken();
      const response = await handleLoginAction(idToken);
      if (!response.success) {
        throw new Error(response.error || "Login failed");
      }

      const user: User = {
        name: userData.displayName || "Unknown",
        photoURL: userData.photoURL || "",
        email: userData.email || "",
      };
      setUser(user);
      localStorage.setItem("user_data", JSON.stringify(user));
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutAction();
      localStorage.removeItem("user_data");
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
