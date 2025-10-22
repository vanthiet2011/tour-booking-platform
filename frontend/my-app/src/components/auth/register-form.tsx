"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import authService from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";

// ------------------ Validation Schema ------------------
const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ."),
    password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên."),
    confirmPassword: z
      .string()
      .min(1, "Xác nhận mật khẩu không được bỏ trống."),
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu và xác nhận mật khẩu không khớp.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.acceptTerms === true, {
    message: "Bạn phải đồng ý với điều khoản.",
    path: ["acceptTerms"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ------------------ RegisterForm Component ------------------
export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = form;

  // ------------------ Success & Error Handlers ------------------
  const handleRegisterSuccess = () => {
    toast({
      title: "Đăng ký thành công!",
      description: "Tài khoản đã được tạo. Vui lòng đăng nhập.",
    });
    router.push("/login");
  };

  const handleRegisterError = (error: any, provider: string) => {
    console.error(`❗ Đăng ký ${provider} thất bại:`, error);
    toast({
      title: "Đăng ký thất bại",
      description:
        error.response?.data?.message ||
        `Đã có lỗi xảy ra khi đăng ký bằng ${provider}.`,
      variant: "destructive",
    });
  };

  // ------------------ Form Submit ------------------
  const onFormSubmit = async (values: RegisterFormValues) => {
    try {
      await authService.register({
        email: values.email,
        password: values.password,
      });
      handleRegisterSuccess();
    } catch (error: any) {
      handleRegisterError(error, "Email");
    }
  };

  // ------------------ Google Register ------------------
  const googleRegister = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (tokenResponse) => {
      try {
        const response = await authService.loginWithGoogle(tokenResponse.code);
        handleRegisterSuccess();
      } catch (error) {
        handleRegisterError(error, "Google");
      }
    },
    onError: () =>
      handleRegisterError({ message: "Google register failed" }, "Google"),
  });

  // ------------------ Facebook Register ------------------
  const responseFacebook = async (profile: any) => {
    const accessToken = profile?.accessToken;
    if (accessToken) {
      try {
        await authService.loginWithFacebook(accessToken);
        handleRegisterSuccess();
      } catch (error) {
        handleRegisterError(error, "Facebook");
      }
    } else {
      handleRegisterError(
        { message: "Facebook register failed: No access token" },
        "Facebook"
      );
    }
  };

  const handleFacebookLoginFail = (error: any) => {
    handleRegisterError(
      { message: "Người dùng hủy hoặc lỗi xảy ra." },
      "Facebook"
    );
  };

  // ------------------ JSX ------------------
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Địa chỉ Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="vd: nguyenvana@example.com"
              {...register("email")}
              className="pl-10 h-12 bg-input border-border"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              {...register("confirmPassword")}
              className="pl-10 pr-10 h-12 bg-input border-border"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Accept Terms */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            {...register("acceptTerms")}
            className="mt-1 rounded border-border"
          />
          <p className="text-xs text-muted-foreground">
            Tôi đồng ý với{" "}
            <a href="#" className="text-primary underline">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="text-primary underline">
              Chính sách bảo mật
            </a>
            .
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
        >
          {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Hoặc đăng ký bằng
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={() => googleRegister()}
          disabled={isSubmitting}
          className="h-12"
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
              className="h-12"
            >
              Facebook
            </Button>
          )}
        />
      </div>
    </div>
  );
}
