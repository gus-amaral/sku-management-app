"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { User as UserType, Permission } from "@/lib/types";

interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  hasPermission: (p: Permission) => boolean;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserType | null>(null);

  const setUser = useCallback((u: UserType | null) => {
    setUserState(u);
  }, []);

  const hasPermission = useCallback(
    (p: Permission) => (user?.permissions ?? []).includes(p),
    [user]
  );

  const login = useCallback((userId: string) => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => setUserState(data.user))
      .catch(() => setUserState(null));
  }, []);

  const logout = useCallback(() => setUserState(null), []);

  return (
    <AuthContext.Provider value={{ user, setUser, hasPermission, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
