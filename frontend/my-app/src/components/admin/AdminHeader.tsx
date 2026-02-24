"use client";

import { Bell, Menu, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/layout/mode-toggle";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName =
    user?.fullName ||
    (user?.email
      ? user.email.split("@")[0].charAt(0).toUpperCase() +
        user.email.split("@")[0].slice(1)
      : "Admin");

  const initials = displayName.charAt(0).toUpperCase();
  const getAvatarUrl = (url: string | null | undefined) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    const backendBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://localhost:7193";
    return `${backendBaseUrl}/${url}`;
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="h-12 border-b bg-white dark:bg-slate-900 dark:border-slate-800 sticky top-0 z-30 px-4 md:px-6 shadow-sm">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
        </div>

        <div className="flex items-center">
          {/* Nút thông báo */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900"></span>
          </Button>

          <ModeToggle />

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="pl-1 pr-2 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                {/* Avatar tròn đồng nhất với Sidebar */}
                <Avatar className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  <AvatarImage
                    src={getAvatarUrl(user?.avatarUrl)}
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-emerald-600 text-white text-[10px] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate max-w-[120px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-none">
                    Quản trị viên
                  </span>
                </div>

                <ChevronDown className="h-3 w-3 text-slate-400 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-60 mt-2 rounded-2xl shadow-xl border-slate-100 dark:border-slate-800 dark:bg-slate-900 p-2"
            >
              <DropdownMenuLabel className="px-3 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-200">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="mx-2 bg-slate-100 dark:bg-slate-800" />

              <DropdownMenuItem
                onSelect={() => router.push("/admin/profile")}
                className="cursor-pointer rounded-xl py-2 px-3 focus:bg-emerald-50 dark:focus:bg-emerald-900/30 focus:text-emerald-700 dark:focus:text-emerald-400 transition-colors"
              >
                <User className="mr-2 h-4 w-4 dark:text-slate-400" />
                <span className="font-medium dark:text-slate-200">Hồ sơ cá nhân</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 focus:bg-slate-50 dark:focus:bg-slate-800 transition-colors">
                <Settings className="mr-2 h-4 w-4 text-slate-400" />
                <span className="font-medium dark:text-slate-200">Cài đặt hệ thống</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="mx-2 bg-slate-100 dark:bg-slate-800" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-xl cursor-pointer py-2 px-3 focus:bg-rose-50 dark:focus:bg-rose-900/30 text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400 font-semibold transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
