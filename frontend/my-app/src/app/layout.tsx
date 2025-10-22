// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider"; // 1. Import ThemeProvider
import { Toaster } from "@/components/ui/toaster";

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
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

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
              <Header />
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
