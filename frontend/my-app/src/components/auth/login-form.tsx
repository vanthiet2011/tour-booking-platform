"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import authService from "@/services/auth.service";
import { ApiUser } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface DecodedToken {
  nameid: string;
  email: string;
  name: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authService.login(formData);

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
        name: decodedToken.name,
      };

      login(userPayload, data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn đã trở lại.",
      });

      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("❗ Đăng nhập thất bại:", error);
      toast({
        title: "Đăng nhập thất bại",
        description:
          error.response?.data?.message ||
          "Email hoặc mật khẩu không chính xác.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Địa chỉ Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Nhập email của bạn"
            value={formData.email}
            onChange={handleChange}
            className="pl-10 h-12 bg-input border-border focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Mật khẩu
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu của bạn"
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

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded border-border" />
          <span className="text-muted-foreground">Ghi nhớ đăng nhập</span>
        </label>
        <a
          href="#"
          className="text-primary hover:text-primary/80 underline underline-offset-4"
        >
          Quên mật khẩu?
        </a>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
