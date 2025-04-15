import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const searchParamsStr = searchParams.toString();
  const isApiRoute = pathname.startsWith("/api");
  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

  // Bypass middleware for critical paths
  if (
    isApiRoute ||
    pathname.includes("/_next") ||
    pathname.includes("/static") ||
    pathname.includes("/favicon.ico") ||
    searchParamsStr.includes("callbackUrl=") ||
    searchParamsStr.includes("error=")
  ) {
    return NextResponse.next();
  }

  // Public routes configuration
  const publicRoutes = new Set([
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email"
  ]);

  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isAuthenticated = !!token;
    
    // Redirect authenticated users from auth pages to dashboard
    if (publicRoutes.has(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", baseUrl));
    }

    // Protect private routes
    if (!publicRoutes.has(pathname) && !isAuthenticated) {
      const loginUrl = new URL("/login", baseUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Error:", error);
    // Fallback to error page or maintain current path
    return NextResponse.redirect(new URL("/error", baseUrl));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|site.webmanifest|robots.txt).*)",
  ],
};