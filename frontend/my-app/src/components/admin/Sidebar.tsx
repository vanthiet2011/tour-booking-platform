"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plane,
  CalendarCheck,
  Users,
  LineChart,
  MapPin,
  Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/tours", icon: Plane, label: "Quản lý Tours" },
  { href: "/admin/destinations", icon: Globe, label: "Quản lý Điểm đến" },
  { href: "/admin/bookings", icon: CalendarCheck, label: "Quản lý Đặt chỗ" },
  { href: "/admin/customers", icon: Users, label: "Khách hàng" },
  { href: "/admin/reports", icon: LineChart, label: "Báo cáo" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName =
    user?.fullName ||
    (user?.email
      ? user.email.split("@")[0].charAt(0).toUpperCase() +
        user.email.split("@")[0].slice(1)
      : "Admin");
  const avatarFallback = displayName.charAt(0).toUpperCase();
  const getAvatarUrl = (url: string | null | undefined) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    const backendBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://localhost:7193";
    return `${backendBaseUrl}/${url}`;
  };

  return (
    <aside className="hidden h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 md:flex">
      <div className="flex h-12 items-center border-b border-slate-200 dark:border-slate-800 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-900 dark:text-slate-100">VietNature Admin</span>
        </Link>
      </div>

      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <AvatarImage
              src={getAvatarUrl(user?.avatarUrl)}
              alt={displayName}
              className="aspect-square h-full w-full object-cover"
            />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold uppercase">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col leading-tight overflow-hidden">
            <span className="text-xs text-muted-foreground dark:text-slate-400">Xin chào,</span>
            <span className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
              {displayName}
            </span>
            <span className="text-[11px] text-muted-foreground dark:text-slate-500 truncate max-w-[140px]">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive
                  ? "bg-emerald-600 text-white shadow-md dark:bg-emerald-600/90"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-current")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
