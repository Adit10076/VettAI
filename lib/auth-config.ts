/**
 * This file provides centralized configuration for URL handling in authentication
 */

// Get the callback URL for after successful authentication
export function getCallbackUrl(): string {
  return "/dashboard";
}

// Get the base URL for the application
export function getAuthBaseUrl(): string {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

// Get the full URL for NextAuth API endpoints
export function getAuthApiUrl(): string {
  return `${getAuthBaseUrl()}/api/auth`;
}

// Get the full URL for a specific auth endpoint
export function getAuthUrl(path: string): string {
  // Make sure the path starts with a slash if not already
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getAuthApiUrl()}${normalizedPath}`;
} 