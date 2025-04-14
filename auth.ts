import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import prisma from "./lib/prisma";
import { getAuthBaseUrl, getCallbackUrl } from "./lib/auth-config";
import { JWT } from "next-auth/jwt";

// Extend JWT type to include provider
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: string;
  }
}

// Extend Session User to include provider
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

// Define common return types for authentication functions
export type AuthResult = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
};

// Force NextAuth to run in Node.js mode
export const runtime = "nodejs";

/**
 * Simplified Authentication API
 * 
 * This file serves as the single source of truth for all authentication operations.
 * It consolidates user registration, credential verification, and sign-in functionality.
 */

// Authentication helper functions
export async function registerUser(name: string, email: string, password: string): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    if (user) {
      return { 
        success: true, 
        user: { 
          id: user.id, 
          name: user.name || undefined, 
          email: user.email 
        } 
      };
    }

    return { success: false, message: "Failed to create user" };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Failed to register user" };
  }
}

// Function to verify credentials
export async function verifyCredentials(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      return { success: false, message: "Invalid credentials" };
    }

    const passwordMatch = await compare(password, user.hashedPassword);

    if (!passwordMatch) {
      return { success: false, message: "Invalid credentials" };
    }

    return { 
      success: true, 
      user: { 
        id: user.id,
        name: user.name || undefined,
        email: user.email
      } 
    };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, message: "Failed to verify credentials" };
  }
}

// Function to sign in with Google
export async function signInWithGoogle() {
  return signIn("google", { 
    callbackUrl: "/dashboard",
    redirect: true
  });
}

// Function to sign in with credentials and handle the result
export async function signInWithCredentials(email: string, password: string): Promise<AuthResult> {
  try {
    // First verify the credentials
    const verifyResult = await verifyCredentials(email, password);
    
    if (!verifyResult.success) {
      return verifyResult;
    }
    
    // Then sign in
    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });

    return { 
      success: !result?.error,
      message: result?.error || "Authentication successful",
      user: verifyResult.user
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, message: "Authentication failed" };
  }
}

// Create auth configuration
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
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          // If no user or no hashed password (for users created via social login)
          if (!user || !user.hashedPassword) {
            return null;
          }

          const passwordMatch = await compare(credentials.password as string, user.hashedPassword);

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
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
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (account && user) {
        // Add user ID to token
        token.id = user.id;
        // Add provider information
        if (account.provider) {
          token.provider = account.provider;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Add user ID to session
        session.user.id = token.sub!;
        // Add provider information if available
        if (token.provider) {
          session.user.provider = token.provider as string;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle Google OAuth callback specifically
      if (url.includes("/api/auth/callback/google")) {
        console.log("Google OAuth callback detected, redirecting to dashboard");
        return `${baseUrl}/dashboard`;
      }
      
      // Always redirect to dashboard after any authentication
      if (url.includes("/api/auth/signin") || url.includes("/api/auth/callback")) {
        console.log("Auth callback detected, redirecting to dashboard");
        return `${baseUrl}/dashboard`;
      }
      
      // For dashboard redirects, ensure we use the full URL
      if (url.endsWith('/dashboard') || url === '/dashboard') {
        console.log("Dashboard URL detected, using full URL");
        return `${baseUrl}/dashboard`;
      }
      
      // If url is relative, prepend the base URL
      if (url.startsWith("/")) {
        console.log(`Handling relative URL: ${url}`);
        return `${baseUrl}${url}`;
      }
      
      // If url is absolute but within the same site, allow it
      if (url.startsWith(baseUrl)) {
        console.log(`Allowing same-site URL: ${url}`);
        return url;
      }
      
      // Otherwise return to base URL
      console.log(`Fallback to base URL: ${baseUrl}`);
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        console.log(`Google sign-in attempt for ${user.email}`);
        
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true }
        });
        
        if (existingUser) {
          console.log(`Existing user found with email ${user.email}`);
          
          // Check if Google account is already linked
          const linkedAccount = existingUser.accounts.find(
            (acc: any) => acc.provider === "google"
          );
          
          if (!linkedAccount) {
            console.log(`Linking Google account to existing user ID: ${existingUser.id}`);
            // Link the Google account to the existing user
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
                  session_state: account.session_state?.toString()
                }
              });
              console.log("Successfully linked Google account");
            } catch (error) {
              console.error("Error linking Google account:", error);
              // Allow sign in anyway
            }
          } else {
            console.log("Google account already linked, proceeding with sign in");
          }
          
          // Return true to allow sign in with the existing user
          return true;
        } else {
          console.log(`No existing user found, creating new user for ${user.email}`);
        }
      }
      return true;
    }
  }
});