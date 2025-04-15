import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const searchParamsStr = request.nextUrl.searchParams.toString();

  // Skip middleware for API routes, auth callbacks, or if the URL includes an OAuth code.
  if (
    path.startsWith("/api/") ||
    path.includes("/callback") ||
    path.includes("/auth") ||
    searchParamsStr.includes("code=")
  ) {
    console.log(`Skipping middleware for API/auth route: ${path}`);
    return NextResponse.next();
  }

  // Define which paths are public (accessible without authentication).
  const isPublicPath =
    path === "/" ||
    path === "/login" ||
    path === "/signup";

  // Do not redirect on the root path.
  if (path === "/") {
    return NextResponse.next();
  }

  try {
    // Retrieve the JWT token; works at the Edge.
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const isAuthenticated = !!token;
    console.log(
      `Middleware: Path ${path}, Authenticated: ${isAuthenticated}, Token:`,
      token ? `User: ${token.email || 'unknown'}` : 'None'
    );

    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    // Redirect authenticated users from public pages to the dashboard.
    if (isPublicPath && isAuthenticated) {
      console.log(`Redirecting authenticated user from ${path} to /dashboard`);
      return NextResponse.redirect(new URL("/dashboard", baseUrl));
    }

    // Redirect unauthenticated users trying to access protected pages to the login page.
    if (!isPublicPath && !isAuthenticated) {
      console.log(`Redirecting unauthenticated user from ${path} to /login`);
      return NextResponse.redirect(new URL("/login", baseUrl));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // In case of error, allow request to proceed to avoid blocking users.
    return NextResponse.next();
  }
}

// Run this middleware on all paths except for API routes, static files, images, and favicon.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
