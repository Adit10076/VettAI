import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();
  
  console.log(`Middleware processing: ${path}${searchParams ? `?${searchParams}` : ''}`);
  
  // Always skip middleware for all API routes, static files, callbacks, auth routes
  if (path.startsWith("/api/") || 
      path.includes("/callback") || 
      path.includes("/auth") || 
      path === "/login" || 
      path === "/signup" || 
      path === "/" ||
      path.includes("/_next/") ||
      path.includes("favicon.ico") ||
      searchParams.includes("code=") ||
      searchParams.includes("error=")) {
    console.log(`Skipping middleware for path: ${path}`);
    return NextResponse.next();
  }

  try {
    // Get the session using JWT token - this works in Edge
    console.log("Checking authentication token");
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    const isAuthenticated = !!token;
    console.log(`User authenticated: ${isAuthenticated}, User ID: ${token?.sub || 'none'}`);
    
    // Get the base URL from environment or use the request URL
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated) {
      console.log(`Unauthenticated access to protected route: ${path}`);
      const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, baseUrl));
    }

    console.log(`Access granted to: ${path}`);
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