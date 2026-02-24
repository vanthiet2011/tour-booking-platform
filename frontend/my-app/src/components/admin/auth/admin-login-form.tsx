"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { jwtDecode } from "jwt-decode";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/auth.service";

interface DecodedToken {
  sub: string;
  email: string;
  [key: string]: any;
}

interface ApiUser {
  id: string;
  email: string;
  role: number;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

type ApiError = AxiosError<{ message?: string }>;

const loginSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ."),
  password: z.string().min(1, "Mật khẩu không được để trống."),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AdminLoginForm() {
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

  const handleLoginSuccess = (response: LoginResponse, rememberMe: boolean) => {
    const decodedToken = jwtDecode<DecodedToken>(response.accessToken);
    const roleString =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];

    if (roleString !== "Admin") {
      toast({
        variant: "destructive",
        title: "Từ chối truy cập",
        description: "Tài khoản của bạn không có quyền quản trị hệ thống.",
      });
      return;
    }
    const userRoleAsNumber = 1;

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
      description: "Chào mừng Quản trị viên.",
    });
    router.push("/admin");
    router.refresh();
  };

  const onFormSubmit = async (values: LoginFormValues) => {
    try {
      const response = await authService.login(values);
      handleLoginSuccess(response as any, values.rememberMe);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast({
        title: "Lỗi đăng nhập",
        description:
          apiError.response?.data?.message ||
          "Email hoặc mật khẩu không chính xác.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="admin@vietnature.vn"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="remember"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Đăng nhập
        </Button>
      </form>
    </Form>
  );
}
