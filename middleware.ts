import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();
  
  // Always skip middleware for all API routes, especially auth-related ones
  if (path.startsWith("/api/")) {
    console.log(`Skipping middleware for API route: ${path}`);
    return NextResponse.next();
  }

  // Define which paths are public and which need authentication
  const isPublicPath = 
    path === "/" || 
    path === "/login" || 
    path === "/signup";

  // Get the session using JWT token - this works in Edge
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  const isAuthenticated = !!token;
  console.log(`Middleware: Path ${path}, Authenticated: ${isAuthenticated}`);

  // Don't redirect on the root path
  if (path === "/") {
    return NextResponse.next();
  }

  // Get the base URL from environment or use the request URL
  const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    console.log(`Redirecting authenticated user from ${path} to /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  }

  if (!isPublicPath && !isAuthenticated) {
    console.log(`Redirecting unauthenticated user from ${path} to /login`);
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  return NextResponse.next();
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