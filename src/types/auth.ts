// src/types/auth.ts

import { User as FirebaseUser } from "firebase/auth";

export interface User {
  photoURL: string;
  name: string;
  email: string;
  // Add any additional user properties here
}

export interface AuthContextType {
  user: User | null;
  login: (userData: FirebaseUser) => Promise<void>;
  logout: () => void;
  // Add any additional authentication methods here
}
