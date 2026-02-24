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
import userService from "@/services/user.service";

interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  login: (user: ApiUser, token: string) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<ApiUser>) => void;
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
          const authData = await authService.getMe();
          let fullUserData: ApiUser = { ...authData };
          try {
            const profileData = await userService.getMe();
            fullUserData = {
              ...fullUserData,
              fullName: profileData.fullName,
              avatarUrl: profileData.avatarUrl,
            };
          } catch {
            console.log("Profile chưa tồn tại hoặc không tải được.");
            fullUserData.fullName = null;
            fullUserData.avatarUrl = null;
          }
          setUser(fullUserData);
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

  const login = async (authData: ApiUser, token: string) => {
    Cookies.set("accessToken", token, { expires: 7, path: "/" });
    let fullUserData = { ...authData };
    try {
      const profileData = await userService.getMe();
      fullUserData = {
        ...fullUserData,
        fullName: profileData.fullName,
        avatarUrl: profileData.avatarUrl,
      };
    } catch {
      fullUserData.fullName = null;
      fullUserData.avatarUrl = null;
    }

    setUser(fullUserData);
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("accessToken", { path: "/" });
  };

  const updateUser = (updatedData: Partial<ApiUser>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        ...updatedData,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, updateUser }}
    >
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
