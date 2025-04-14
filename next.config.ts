import type { NextConfig } from "next";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'https://vett-ai.vercel.app';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@auth/prisma-adapter'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'vett-ai.vercel.app'],
    },
  },
  env: {
    NEXTAUTH_URL: NEXTAUTH_URL,
    AUTH_API_URL: `${NEXTAUTH_URL}/api/auth`,
  },
};

export default nextConfig;
