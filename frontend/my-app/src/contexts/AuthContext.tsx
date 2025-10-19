// src/contexts/AuthContext.tsx
"use client";

import Cookies from "js-cookie";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import authService from "@/services/auth.service";
import { ApiUser } from "@/types/auth";

interface AuthContextType {
  user: ApiUser | null;
  token: string | null;
  isLoading: boolean;
  login: (user: ApiUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(
    () => Cookies.get("accessToken") || null
  );

  useEffect(() => {
    const fetchUserOnLoad = async () => {
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error(
            "Failed to fetch user on load, token might be invalid:",
            error
          );
          setUser(null);
          setToken(null);
          Cookies.remove("accessToken");
        }
      }
      setIsLoading(false);
    };

    fetchUserOnLoad();
  }, [token]);

  const login = (user: ApiUser, token: string) => {
    setUser(user);
    setToken(token);
    Cookies.set("accessToken", token, { expires: 7, path: "/" });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove("accessToken", { path: "/" });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
