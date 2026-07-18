import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./authContextObject";

const AUTH_URL = (import.meta.env.VITE_AUTH_URL || "https://trichofy-backend.onrender.com/auth").replace(/\/$/, "");

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_URL}/me`, { credentials: "include" });
      if (!res.ok) { setUser(null); return null; }
      const data = await res.json();
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setAuthLoading(false));
  }, [refreshUser]);

  const register = useCallback(async ({ name, email, password, role, brandName }) => {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password, role, brandName }),
    });
    const data = await parseResponse(res);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await parseResponse(res);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async ({ idToken, role, brandName }) => {
    const res = await fetch(`${AUTH_URL}/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken, role, brandName }),
    });
    const data = await parseResponse(res);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${AUTH_URL}/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setUser(null);
  }, []);

  const value = { user, authLoading, register, login, loginWithGoogle, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
