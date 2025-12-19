// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/layout/theme-provider"; // 1. Import ThemeProvider
import { Toaster } from "@/components/ui/toaster";
import destinationService from "@/services/destination.service";
import { Destination } from "@/types/destination";

export const metadata: Metadata = {
  title: "VietNature - Khám phá Việt Nam",
  description: "Nền tảng đặt tour du lịch hàng đầu Việt Nam.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  let destinations: Destination[] = [];
  try {
    const paginatedData = await destinationService.getAll({ limit: 999 });
    destinations = paginatedData.items;
  } catch (error) {
    console.error("Lỗi không thể tải điểm đến cho Header:", error);
  }
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <GoogleOAuthProvider clientId={googleClientId}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <Header destinations={destinations} />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
