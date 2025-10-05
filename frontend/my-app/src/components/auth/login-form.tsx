"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth, ApiUser } from "@/contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { loginUser } from "@/lib/api";

interface DecodedToken {
  nameid: string;
  email: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginUser(formData);

      if (!Cookies.get("accessToken") && data.accessToken) {
        Cookies.set("accessToken", data.accessToken, {
          expires: 1,
          sameSite: "Lax",
          path: "/",
        });
      }

      const decodedToken = jwtDecode<DecodedToken>(data.accessToken);
      const userRole = parseInt(
        decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
        10
      );
      const userPayload: ApiUser = {
        id: decodedToken.nameid,
        email: decodedToken.email,
        role: userRole,
        name: decodedToken.email,
      };

      login(userPayload, data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      console.log("✅ Login success");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("❗ Login failed:", error);
      alert("Đăng nhập thất bại: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="pl-10 h-12 bg-input border-border focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="pl-10 pr-10 h-12 bg-input border-border focus:border-primary focus:ring-primary"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* REMEMBER + FORGOT */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded border-border" />
          <span className="text-muted-foreground">Remember me</span>
        </label>
        <a
          href="#"
          className="text-primary hover:text-primary/80 underline underline-offset-4"
        >
          Forgot password?
        </a>
      </div>

      {/* SUBMIT */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}
