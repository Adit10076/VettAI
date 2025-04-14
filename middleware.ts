import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();
  
  // Always skip middleware for all API routes, static files, and auth-related callbacks
  if (path.startsWith("/api/") || 
      path.includes("/callback") || 
      path.includes("/auth") || 
      path.includes("/_next/") ||
      path.includes("favicon.ico") ||
      searchParams.includes("code=") ||
      searchParams.includes("error=")) {
    return NextResponse.next();
  }

  // Define which paths are public and which need authentication
  const isPublicPath = 
    path === "/" || 
    path === "/login" || 
    path === "/signup";

  try {
    // Get the session using JWT token - this works in Edge
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    const isAuthenticated = !!token;
    
    // Get the base URL from environment or use the request URL
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    // Redirect logic
    if (isPublicPath && isAuthenticated) {
      // Redirect authenticated users away from login/signup pages
      return NextResponse.redirect(new URL("/dashboard", baseUrl));
    }

    if (!isPublicPath && !isAuthenticated) {
      // Redirect unauthenticated users away from protected routes
      const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, baseUrl));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Continue the request in case of error to avoid blocking users
    return NextResponse.next();
  }
}

// Only run middleware on matching paths, excluding api routes, static files, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (All API routes, especially auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 