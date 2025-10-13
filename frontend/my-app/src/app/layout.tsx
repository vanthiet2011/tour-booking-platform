// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider"; // 1. Import ThemeProvider

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "VietNature Tours - Khám phá Việt Nam",
  description: "Nền tảng đặt tour du lịch hàng đầu Việt Nam.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Thêm suppressHydrationWarning để tránh lỗi với theme
    <html lang="vi" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          lora.variable
        )}
      >
        {/* 2. Bọc toàn bộ ứng dụng bằng ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
