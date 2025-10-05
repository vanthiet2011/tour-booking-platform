// src/components/admin/Sidebar.tsx

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
  Globe, // Import icon mới
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/tours", icon: Plane, label: "Quản lý Tours" },
  // Thêm mục mới vào đây
  { href: "/admin/destinations", icon: Globe, label: "Quản lý Điểm đến" },
  { href: "/admin/bookings", icon: CalendarCheck, label: "Quản lý Đặt chỗ" },
  { href: "/admin/customers", icon: Users, label: "Khách hàng" },
  { href: "/admin/reports", icon: LineChart, label: "Báo cáo" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-card text-card-foreground md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MapPin className="h-6 w-6 text-primary" />
          <span>VietTravel Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith(item.href) && // Sử dụng startsWith để làm nổi bật mục cha
                item.href !== "/admin/dashboard" &&
                "bg-primary text-primary-foreground hover:bg-primary/90",
              pathname === item.href &&
                "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
