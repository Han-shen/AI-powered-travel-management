import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("smart_travel_token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("smart_travel_user") || "null"));

  const saveAuth = (payload) => {
    localStorage.setItem("smart_travel_token", payload.access_token);
    localStorage.setItem("smart_travel_user", JSON.stringify(payload.user));
    setToken(payload.access_token);
    setUser(payload.user);
  };

  const signup = async (form) => {
    const { data } = await api.post("/auth/signup", {
      name: form.name?.trim(),
      email: form.email?.trim(),
      password: form.password,
    });
    saveAuth(data);
  };

  const login = async (form) => {
    const { data } = await api.post("/auth/login", {
      email: form.email?.trim(),
      password: form.password,
    });
    saveAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("smart_travel_token");
    localStorage.removeItem("smart_travel_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, signup, login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
