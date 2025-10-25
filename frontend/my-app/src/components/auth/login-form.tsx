"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useGoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import authService from "@/services/auth.service";
import { ApiUser, LoginResponse, DecodedToken } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ."),
  password: z.string().min(1, "Mật khẩu không được để trống."),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = form;

  const handleLoginSuccess = (response: LoginResponse, rememberMe: boolean) => {
    const decodedToken = jwtDecode<DecodedToken>(response.accessToken);
    const roleString =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    const userRoleAsNumber = roleString === "Admin" ? 0 : 1;
    const userPayload: ApiUser = {
      id: decodedToken.sub,
      email: decodedToken.email,
      role: userRoleAsNumber,
    };

    login(userPayload, response.accessToken);

    if (rememberMe) {
      localStorage.setItem("refreshToken", response.refreshToken);
    } else {
      sessionStorage.setItem("refreshToken", response.refreshToken);
    }

    toast({
      title: "Đăng nhập thành công!",
      description: "Chào mừng bạn đã trở lại.",
    });

    if (userRoleAsNumber === 1) {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
    router.refresh();
  };

  const handleLoginError = (error: any, provider: string) => {
    console.error(`❗ Đăng nhập ${provider} thất bại:`, error);
    toast({
      title: "Đăng nhập thất bại",
      description:
        error.response?.data?.message ||
        `Đã có lỗi xảy ra khi đăng nhập bằng ${provider}.`,
      variant: "destructive",
    });
  };

  const onFormSubmit = async (values: LoginFormValues) => {
    try {
      const response = await authService.login(values);
      handleLoginSuccess(response, values.rememberMe);
    } catch (error: any) {
      handleLoginError(error, "Email");
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      try {
        const response = await authService.loginWithGoogle(tokenResponse.code);
        handleLoginSuccess(response, true);
      } catch (error) {
        handleLoginError(error, "Google");
      }
    },
    onError: () =>
      handleLoginError({ message: "Google login failed" }, "Google"),
  });

  const responseFacebook = async (profile: any) => {
    const accessToken = (profile as any)?.accessToken;
    if (accessToken) {
      try {
        const apiResponse = await authService.loginWithFacebook(accessToken);
        handleLoginSuccess(apiResponse, true);
      } catch (error) {
        handleLoginError(error, "Facebook");
      }
    } else {
      handleLoginError(
        { message: "Facebook login failed: No access token" },
        "Facebook"
      );
    }
  };

  const handleFacebookLoginFail = (error: any) => {
    console.error("Facebook login failed:", error);
    handleLoginError(
      { message: "Người dùng đã hủy hoặc có lỗi xảy ra." },
      "Facebook"
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Địa chỉ Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Nhập email của bạn"
              {...register("email")}
              className="pl-10 h-12 bg-input border-border"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu của bạn"
              {...register("password")}
              className="pl-10 pr-10 h-12 bg-input border-border"
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
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="rounded border-border"
            />
            <span className="text-muted-foreground">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-primary hover:text-primary/80 underline underline-offset-4"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => googleLogin()}
          disabled={isSubmitting}
          className="w-full h-12"
        >
          Google
        </Button>
        <FacebookLogin
          appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ""}
          onSuccess={responseFacebook}
          onFail={handleFacebookLoginFail}
          render={(renderProps: { onClick?: () => void }) => (
            <Button
              variant="outline"
              type="button"
              onClick={renderProps.onClick}
              disabled={isSubmitting}
              className="w-full h-12"
            >
              Facebook
            </Button>
          )}
        />
      </div>
    </div>
  );
}
