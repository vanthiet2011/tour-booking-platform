"use client";
import Cookies from "js-cookie";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: number;
}

interface AuthContextType {
  user: ApiUser | null;
  token: string | null;
  login: (user: ApiUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => Cookies.get("accessToken") || null
  );

  useEffect(() => {
    const fetchUserOnLoad = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error("Token is invalid or expired.");
          setUser(null);
          Cookies.remove("accessToken");
        }
      } catch (err) {
        console.error("Failed to fetch user on load:", err);
        setUser(null);
        Cookies.remove("accessToken");
      }
    };

    fetchUserOnLoad();
  }, [token]);

  const login = (user: ApiUser, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("accessToken", token);
    Cookies.set("accessToken", token, { expires: 7, path: "/" });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("accessToken");
    Cookies.remove("accessToken", { path: "/" });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
