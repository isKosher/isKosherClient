// src/types/auth.ts

export interface User {
  id: string;
  name: string;
  email: string;
  // Add any additional user properties here
}

export interface AuthContextType {
  user: User | null;
  login: (userData:User) => void;
  logout: () => void;
  // Add any additional authentication methods here
}