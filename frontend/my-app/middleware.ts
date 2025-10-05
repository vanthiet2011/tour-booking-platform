import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
    | number
    | string;
  exp: number;
}

export function middleware(request: NextRequest) {
  console.log("🔥 Middleware triggered for:", request.nextUrl.pathname);
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get("accessToken")?.value;

    console.log("🔥 Token in middleware:", token);

    if (!token) {
      console.log("❗ Không có token → redirect /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("🔥 Decoded token:", decoded);

      const rawRole =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const userRole =
        typeof rawRole === "string" ? parseInt(rawRole, 10) : rawRole;

      if (decoded.exp * 1000 < Date.now()) {
        console.log("❗ Token expired → redirect /login");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (userRole !== 0) {
        console.log("❗ Không phải admin (role =", userRole, ") → redirect /");
        return NextResponse.redirect(new URL("/", request.url));
      }

      console.log("✅ Là admin → cho phép truy cập");
    } catch (error) {
      console.error("❗ Invalid token:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
