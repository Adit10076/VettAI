/**
 * This file provides centralized configuration for URL handling in authentication
 */

// Get the callback URL for after successful authentication
export function getCallbackUrl(): string {
  const baseUrl = getAuthBaseUrl();
  return `${baseUrl}/dashboard`;
}

// Get the base URL for the application
export function getAuthBaseUrl(): string {
  // First try NEXTAUTH_URL which is the canonical setting for Next-Auth
  let url = process.env.NEXTAUTH_URL;
  
  // As a fallback, check for VERCEL environment variables
  if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }
  
  // If still no URL, use localhost for development
  if (!url) {
    url = "http://localhost:3000";
  }
  
  // Ensure we have a valid base URL with protocol
  return url.startsWith('http') ? url : `https://${url}`;
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