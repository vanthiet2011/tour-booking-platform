"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X, User, ShieldCheck } from "lucide-react";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-nature to-ocean rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              VietTravel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#destinations"
              className="text-foreground hover:text-primary transition-colors"
            >
              Điểm đến
            </Link>
            <Link
              href="/#tours"
              className="text-foreground hover:text-primary transition-colors"
            >
              Tour
            </Link>
            <Link
              href="/#hotels"
              className="text-foreground hover:text-primary transition-colors"
            >
              Khách sạn
            </Link>
            <Link
              href="/#flights"
              className="text-foreground hover:text-primary transition-colors"
            >
              Vé máy bay
            </Link>
            <Link
              href="/#about"
              className="text-foreground hover:text-primary transition-colors"
            >
              Về chúng tôi
            </Link>
            {/* Các link khác có thể thêm sau */}
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
