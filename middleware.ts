import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();
  
  // Always skip middleware for all API routes, static assets, and auth-related callbacks
  if (path.startsWith("/api/") || 
      path.includes("/callback") || 
      path.includes("/auth") || 
      path.includes("_next") ||
      path === "/login" ||
      path === "/signup" ||
      searchParams.includes("code=")) {
    console.log(`Skipping middleware for API/auth/public route: ${path}`);
    return NextResponse.next();
  }

  // Define which paths are public and which need authentication
  const isPublicPath = path === "/";

  // Don't redirect on the root path
  if (isPublicPath) {
    return NextResponse.next();
  }

  try {
    // Get the session using JWT token - this works in Edge
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    const isAuthenticated = !!token;
    console.log(`Middleware: Path ${path}, Authenticated: ${isAuthenticated}, Token:`, 
      token ? `User: ${token.email || 'unknown'}` : 'None');

    // Get the base URL from environment or use the request URL
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    // Only redirect unauthenticated users from protected routes
    if (!isAuthenticated) {
      console.log(`Redirecting unauthenticated user from ${path} to /login`);
      return NextResponse.redirect(new URL("/login", baseUrl));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Continue the request in case of error to avoid blocking users
    return NextResponse.next();
  }
}

// Only run middleware on matching paths
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