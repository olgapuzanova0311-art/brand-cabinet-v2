import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { api, clearToken, getToken, setToken, UnauthorizedError } from "../api/client";
import type { Client } from "../api/types";

interface AuthContextValue {
  client: Client | null;
  loading: boolean;
  networkError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    referral_code?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshClient: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const refreshClient = useCallback(async () => {
    if (!getToken()) {
      setClient(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<Client>("/me");
      setClient(me);
      setNetworkError(null);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        clearToken();
        setClient(null);
      } else {
        setNetworkError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshClient();
  }, [refreshClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await api.post<{ access_token: string }>("/auth/login", {
        email,
        password,
      });
      setToken(access_token);
      await refreshClient();
    },
    [refreshClient],
  );

  const register = useCallback(
    async (data: { name: string; email: string; phone?: string; password: string; referral_code?: string }) => {
      const { access_token } = await api.post<{ access_token: string }>("/auth/register", data);
      setToken(access_token);
      await refreshClient();
    },
    [refreshClient],
  );

  const logout = useCallback(() => {
    clearToken();
    setClient(null);
  }, []);

  return (
    <AuthContext.Provider value={{ client, loading, networkError, login, register, logout, refreshClient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
