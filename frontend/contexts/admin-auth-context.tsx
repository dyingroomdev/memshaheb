"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AdminAuthContextValue = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const STORAGE_KEY = "admin_token";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      setToken(stored);
    }
    setLoading(false);
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      token,
      loading,
      login: (newToken: string) => {
        setToken(newToken);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, newToken);
        }
      },
      logout: () => {
        setToken(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    }),
    [token, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
