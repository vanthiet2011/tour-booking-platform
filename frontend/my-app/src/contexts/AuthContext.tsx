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
  isLoading: boolean;
  login: (user: ApiUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserOnLoad = async () => {
      const token = Cookies.get("accessToken");
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch {
          console.log("AuthContext: Invalid or expired token. Logging out.");
          setUser(null);
          Cookies.remove("accessToken");
        }
      }
      setIsLoading(false);
    };

    fetchUserOnLoad();
  }, []);

  const login = (user: ApiUser, token: string) => {
    setUser(user);
    Cookies.set("accessToken", token, { expires: 7, path: "/" });
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("accessToken", { path: "/" });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {!isLoading && children}
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
