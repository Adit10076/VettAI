import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import prisma from "./lib/prisma";
import { getAuthBaseUrl, getCallbackUrl } from "./lib/auth-config";

// Force NextAuth to run in Node.js mode
export const runtime = "nodejs";

/**
 * Simplified Authentication API
 * 
 * This file serves as the single source of truth for all authentication operations.
 * It consolidates user registration, credential verification, and sign-in functionality.
 */

// Authentication helper functions
export async function registerUser(name: string, email: string, password: string) {
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
          name: user.name, 
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
export async function verifyCredentials(email: string, password: string) {
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
        name: user.name,
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
    callbackUrl: getCallbackUrl(),
    redirect: true
  });
}

// Function to sign in with credentials and handle the result
export async function signInWithCredentials(email: string, password: string) {
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
      error: result?.error,
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
        console.log("authorize called with credentials:", 
          credentials ? { email: credentials.email, hasPassword: !!credentials.password } : "no credentials");
        
        if (!credentials?.email || !credentials.password) {
          console.log("Missing email or password");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          console.log("User found:", user ? { id: user.id, email: user.email, hasPassword: !!user.hashedPassword } : "not found");

          // If no user or no hashed password (for users created via social login)
          if (!user || !user.hashedPassword) {
            console.log("User not found or no password hash");
            return null;
          }

          const passwordMatch = await compare(credentials.password as string, user.hashedPassword);
          console.log("Password match:", passwordMatch);

          if (!passwordMatch) {
            console.log("Password doesn't match");
            return null;
          }

          console.log("Authentication successful, returning user");
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
  debug: process.env.NODE_ENV !== 'production',
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT callback:", { tokenSub: token.sub, userId: user?.id, accountType: account?.provider });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", { sessionUserId: session.user?.id, tokenSub: token.sub });
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Custom redirect logic for authentication flows
      console.log(`NextAuth redirect called. URL: ${url}, baseUrl: ${baseUrl}`);
      
      // For dashboard redirects, ensure we use the full URL
      if (url.endsWith('/dashboard') || url === '/dashboard') {
        const fullUrl = `${baseUrl}/dashboard`;
        console.log(`Redirecting to dashboard: ${fullUrl}`);
        return fullUrl;
      }
      
      // For relative URLs, prepend the base URL
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log(`Redirecting to: ${fullUrl}`);
        return fullUrl;
      }
      
      // Default case: return the URL as is
      console.log(`Using default redirect to: ${url}`);
      return url;
    },
    // Allow signin if the user already exists with same email
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true }
        });
        
        if (existingUser) {
          console.log("Existing user found with same email, allowing sign in");
          
          // Check if Google account is already linked
          const linkedAccount = existingUser.accounts.find(
            (acc: any) => acc.provider === "google"
          );
          
          if (!linkedAccount) {
            console.log("Linking Google account to existing user");
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
            } catch (error) {
              console.error("Error linking Google account:", error);
              // Allow sign in anyway
            }
          }
          
          // Return true to allow sign in with the existing user
          return true;
        }
      }
      return true;
    }
  }
});