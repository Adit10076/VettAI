import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();
  
  // Check if this is a callback from Google OAuth
  const isAuthCallback = 
    path.includes("/api/auth/callback") || 
    path.startsWith("/api/auth") ||
    (searchParams && searchParams.includes("code="));

  // Skip middleware for auth callbacks
  if (isAuthCallback) {
    console.log(`Skipping middleware for auth callback: ${path}${searchParams ? `?${searchParams}` : ''}`);
    return NextResponse.next();
  }

  // Define which paths are public and which need authentication
  const isPublicPath = 
    path === "/" || 
    path === "/login" || 
    path === "/signup" || 
    path.startsWith("/api/");

  // Skip the middleware for API routes and auth-related paths
  if (path.startsWith("/api/") || path.includes("auth")) {
    return NextResponse.next();
  }

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

  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    console.log(`Redirecting authenticated user from ${path} to /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !isAuthenticated) {
    console.log(`Redirecting unauthenticated user from ${path} to /login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Only run middleware on matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 