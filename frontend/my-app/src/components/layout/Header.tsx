"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Search,
  User as UserIcon,
  BookMarked,
  LayoutDashboard,
  LogOut,
  MapPin,
  Compass,
  Plane,
  Hotel,
  Home,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { title } from "process";

const mainNav = [
  { title: "Trang chủ", href: "/", icon: Home },
  { title: "Điểm đến", href: "/destinations", icon: MapPin },
  { title: "Tour", href: "/tours", icon: Compass },
  { title: "Vé máy bay", href: "/flights", icon: Plane },
  { title: "Khách sạn", href: "/hotels", icon: Hotel },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 0;

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      if (token) {
        await fetch("http://localhost:8000/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      console.warn("Logout API failed, clearing local session anyway.");
    } finally {
      logout();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground hover:text-primary transition-colors">
            VietNature
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {mainNav.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent rounded-md"
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-2">
          {/* Tìm kiếm (nếu bạn cần giữ) */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          {/* Dropdown User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full"
              >
                {user ? (
                  <Avatar className="h-8 w-8">
                    {/* Thay AvatarImage nếu user có ảnh */}
                    {/* <AvatarImage src={user.avatarUrl} alt={user.fullName} /> */}
                    <AvatarFallback>
                      {user.email ? user.email[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <DropdownMenuLabel className="flex flex-col items-start gap-1 px-3 py-2 border-b border-muted/40">
                    <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role === 0 ? "Quản trị viên" : "Khách hàng"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/20 rounded-md transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        <span>Trang quản trị</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    asChild
                    className="gap-2 px-3 py-2 hover:bg-muted/20 cursor-pointer"
                  >
                    <Link href="/profile" className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="px-3 py-2 hover:bg-muted/20 cursor-pointer"
                  >
                    <Link
                      href="/profile/my-bookings"
                      className="flex items-center gap-2"
                    >
                      <BookMarked className="w-4 h-4 text-muted-foreground" />
                      <span>Tour đã đặt</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Đăng nhập
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register">
                      <BookMarked className="mr-2 h-4 w-4" />
                      Đăng ký
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile nav (dropdown khi click menu) */}
      {isMenuOpen && (
        <div className="md:hidden border-t px-4 pb-4 mt-2 space-y-2">
          {mainNav.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="block px-2 py-2 rounded-md hover:bg-accent text-sm font-medium text-muted-foreground"
            >
              {item.title}
            </Link>
          ))}

          <div className="border-t my-2"></div>

          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-2 py-2 rounded-md hover:bg-accent"
                >
                  Trang quản trị
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block px-2 py-2 rounded-md hover:bg-accent"
              >
                Hồ sơ
              </Link>
              <Link
                href="/profile/my-bookings"
                onClick={() => setIsMenuOpen(false)}
                className="block px-2 py-2 rounded-md hover:bg-accent"
              >
                Tour đã đặt
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-2 py-2 text-red-600 rounded-md hover:bg-accent"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-2 py-2 rounded-md hover:bg-accent"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block px-2 py-2 rounded-md hover:bg-accent"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
