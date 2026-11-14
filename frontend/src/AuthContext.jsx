import { createContext, useContext, useMemo, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);
const STORAGE_KEY = "qa_management_auth";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
    catch { return null; }
  });

  const saveSession = (data, email) => {
    const next = { token: data.access_token, role: data.role, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  };

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    saveSession(data, email);
  };

  const register = async (email, password) => {
    await api.register({ email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const value = useMemo(() => ({ session, login, register, logout }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}