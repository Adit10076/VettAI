/**
 * This file provides centralized configuration for URL handling in authentication
 * to prevent URL parsing errors when dealing with relative URLs.
 */

// Get the correct base URL for auth endpoints
export function getAuthBaseUrl(): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return baseUrl;
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

// Get the callback URL for after successful authentication
export function getCallbackUrl(): string {
  return `${getAuthBaseUrl()}/dashboard`;
} 