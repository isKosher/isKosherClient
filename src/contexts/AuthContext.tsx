"use client";
import type React from "react";
import { createContext, useState, type ReactNode } from "react";
import type { AuthContextType, User } from "../types/auth";
import type { User as FirebaseUser } from "firebase/auth";
import axios from "axios";
import { handleLogin } from "@/app/(public)/login/actionsAuth";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (userData: FirebaseUser) => {
    try {
      const idToken = await userData.getIdToken();
      const response = await handleLogin(idToken);
      if (!response.success) {
        throw new Error(response.error || "Login failed");
      }

      const user: User = {
        name: userData.displayName || "Unknown",
        photoURL: userData.photoURL || "",
        email: userData.email || "",
      };
      setUser(user);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/v1/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
