import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signin as signinRequest, signup as signupRequest } from "../api/authApi";
import { ApiError, TOKEN_STORAGE_KEY } from "../api/client";
import { extractProfileUser, getProfile } from "../api/usersApi";
import { AuthContext, type AuthContextValue, type UserRecord } from "./AuthContext";
import { extractJwtToken } from "./authUtils";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
  const [authError, setAuthError] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setAuthError(null);
    setIsLoading(false);
  }, []);

  const saveAuth = useCallback((data: unknown) => {
    const nextToken = extractJwtToken(data);
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(null);
    setAuthError(null);
    setIsLoading(true);
  }, []);

  const signup = useCallback(async (values: Parameters<typeof signupRequest>[0]) => {
    const response = await signupRequest(values);
    saveAuth(response.data);
  }, [saveAuth]);

  const signin = useCallback(async (values: Parameters<typeof signinRequest>[0]) => {
    const response = await signinRequest(values);
    saveAuth(response.data);
  }, [saveAuth]);

  const updateToken = useCallback((nextToken: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setToken(nextToken);
    setIsLoading(true);
  }, []);

  useEffect(() => {
    if (!token) return;

    let active = true;
    getProfile()
      .then((response) => {
        if (active) {
          setUser(extractProfileUser(response.data));
          setAuthError(null);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          logout();
          return;
        }
        setAuthError(
          error instanceof Error ? error.message : "Unable to initialize your account.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [logout, token]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token),
      authError,
      signup,
      signin,
      logout,
      updateToken,
    }),
    [authError, isLoading, logout, signin, signup, token, updateToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
