import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
  user: any;
  setUser: (_: any) => void;
  token: string;
  setToken: (_: string) => void;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithCoinbase: (params: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [token, setToken] = useState<string>("");
  const login = async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    if (response.data.token) {
      setUser({ ...response.data, token: response.data.token });
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      return true;
    }
    return false;
  };

  const loginWithCoinbase = async (params: string) => {
    const response = await api.get(`/auth/coinbase/callback${params}`);
    if (response.data.token) {
      setUser({ ...response.data, token: response.data.token });
      localStorage.setItem("token", response.data.token);
      return true;
    }
    return false;
  };

  const register = async (username: string, password: string) => {
    await api.post("/auth/register", { username, password });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        login,
        register,
        logout,
        loginWithCoinbase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
