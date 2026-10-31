import { createContext } from "react";
import type { ProfileUser } from "../api/usersApi";

export type UserRecord = ProfileUser;

export interface AuthContextValue {
  user: UserRecord | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  signup: (values: {
    name: string;
    username: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    password: string;
    rePassword: string;
  }) => Promise<void>;
  signin: (values: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
