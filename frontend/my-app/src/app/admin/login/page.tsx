"use client";

import { AdminLoginForm } from "@/components/admin/auth/admin-login-form";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Cổng Quản Trị</h1>
          <p className="text-sm text-muted-foreground text-center">
            Vui lòng đăng nhập bằng tài khoản Admin để tiếp tục
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
