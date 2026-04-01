import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authMe, authLogin, authRegister } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("uniborrow_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadMe = async () => {
    try {
      if (!token) {
        setUser(null);
        return;
      }
      const { user: me } = await authMe();
      setUser(me);
      localStorage.setItem("uniborrow_user", JSON.stringify(me));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("uniborrow_user");
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    loadMe().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (payload) => {
    const { token: newToken, user: me } = await authLogin(payload);
    localStorage.setItem("token", newToken);
    localStorage.setItem("uniborrow_user", JSON.stringify(me));
    setToken(newToken);
    setUser(me);
    return me;
  };

  const register = async (payload) => {
    const { token: newToken, user: me } = await authRegister(payload);
    localStorage.setItem("token", newToken);
    localStorage.setItem("uniborrow_user", JSON.stringify(me));
    setToken(newToken);
    setUser(me);
    return me;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("uniborrow_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      register,
      logout,
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

