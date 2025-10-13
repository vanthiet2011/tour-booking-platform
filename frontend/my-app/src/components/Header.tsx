"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Plane,
  Hotel,
  MapPin,
  Menu,
  X,
  User,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  console.log("User object in Header:", user);
  const router = useRouter();

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      if (token) {
        await fetch("http://localhost:8000/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Logout API failed, clearing local session anyway.");
    } finally {
      logout();
      router.push("/");
      router.refresh();
    }
  };

  const navItems = [
    { name: "Điểm đến", href: "/destinations", icon: MapPin },
    { name: "Tour", href: "/tours", icon: Compass },
    { name: "Vé máy bay", href: "/flights", icon: Plane },
    { name: "Khách sạn", href: "/hotels", icon: Hotel },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              VietNature Tours
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent rounded-md"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {user.role === 0 && (
                    <Link href="/admin/dashboard">
                      <Button variant="destructive" size="sm">
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Quản trị
                      </Button>
                    </Link>
                  )}

                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      Hồ sơ
                    </Button>
                  </Link>

                  <Button
                    onClick={handleLogout}
                    size="sm"
                    className="bg-gray-700 text-white hover:bg-gray-800"
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Đăng ký
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu button */}
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="flex flex-col md:hidden gap-4 mt-4 border-t pt-4">
            <Link href="/#destinations" onClick={() => setIsMenuOpen(false)}>
              Điểm đến
            </Link>
            <Link href="/#tours" onClick={() => setIsMenuOpen(false)}>
              Tour
            </Link>

            <div className="border-t my-2"></div>

            {user ? (
              <>
                {user.role == 0 && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Quản trị
                  </Link>
                )}
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  Hồ sơ
                </Link>
                <button
                  className="text-left text-red-600"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
