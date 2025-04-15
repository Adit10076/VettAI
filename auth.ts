// pages/api/auth/[...nextauth].ts

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import prisma from "./lib/prisma";
// Do not alter these imports if you rely on exporting GET and POST routes.
// import { getAuthBaseUrl, getCallbackUrl } from "./lib/auth-config";  // Not used in this sample.
import { signIn as nextAuthSignIn } from "next-auth/react"; // Optional: for client-side usage if needed

// Extend JWT type to include provider info
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: string;
  }
}

// Extend Session user to include provider info
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Force NextAuth to run in Node.js mode
export const runtime = "nodejs";

/**
 * Authentication Helper Functions
 * These functions handle user registration, credentials verification, and optionally trigger sign-in flows.
 */

export async function registerUser(name: string, email: string, password: string) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });
    if (user) {
      return { success: true, user: { id: user.id, name: user.name, email: user.email } };
    }
    return { success: false, message: "Failed to create user" };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Failed to register user" };
  }
}

export async function verifyCredentials(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.hashedPassword) {
      return { success: false, message: "Invalid credentials" };
    }
    const passwordMatch = await compare(password, user.hashedPassword);
    if (!passwordMatch) {
      return { success: false, message: "Invalid credentials" };
    }
    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, message: "Failed to verify credentials" };
  }
}

// Optional helper to trigger Google sign-in (client-side usage; do not alter exports here)
export function signInWithGoogle() {
  return nextAuthSignIn("google", { callbackUrl: "/dashboard", redirect: true });
}

// Optional helper to trigger credentials sign-in (client-side usage)
export async function signInWithCredentials(email: string, password: string) {
  const verifyResult = await verifyCredentials(email, password);
  if (!verifyResult.success) {
    return verifyResult;
  }
  const result = await nextAuthSignIn("credentials", {
    email,
    password,
    callbackUrl: "/dashboard",
    redirect: false,
  });
  return { success: !result?.error, error: result?.error };
}

/**
 * NextAuth API Route Configuration
 * Do not change the structure of exports below if you're relying on GET and POST routes.
 */
export const { 
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          // Explicitly cast email to string
          const email = credentials.email as string;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.hashedPassword) return null;
          const passwordMatch = await compare(credentials.password as string, user.hashedPassword);
          if (!passwordMatch) return null;
          return { id: user.id, email: user.email, name: user.name, image: user.image || null };
        } catch (error) {
          console.error("Error in credentials authorize:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, user, account }) {
      // On first sign-in, store user id and provider info in token.
      if (account && user) {
        token.id = user.id;
        if (account.provider) token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        if (token.provider) session.user.provider = token.provider as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("/api/auth/signin") || url.includes("/api/auth/callback")) {
        return `${baseUrl}/dashboard`;
      }
      if (url.endsWith("/dashboard") || url === "/dashboard") {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
    async signIn({ user, account }) {
      // For Google sign-in, link account if an existing user is found.
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });
        if (existingUser) {
          const linkedAccount = existingUser.accounts.find((acc: any) => acc.provider === "google");
          if (!linkedAccount) {
            try {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: "oauth",
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope?.toString(),
                  id_token: account.id_token?.toString(),
                  session_state: account.session_state?.toString(),
                },
              });
            } catch (error) {
              console.error("Error linking Google account:", error);
              // Allow sign in even if linking fails.
            }
          }
        }
      }
      return true;
    },
  },
});
