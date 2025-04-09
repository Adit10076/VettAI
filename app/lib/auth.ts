'use server';

// Import the PrismaClient
import { hash } from "bcryptjs";
import { signIn } from "../../auth";
import prisma from "../../lib/prisma";

// Function to register a new user with credentials
export async function registerUser(
  name: string,
  email: string, 
  password: string
) {
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

    // If user creation was successful, sign them in
    if (user) {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

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

// Function to sign in with Google
export async function signInWithGoogle() {
  return signIn("google", { callbackUrl: "/" });
}

// Function to sign in with credentials
export async function signInWithCredentials(email: string, password: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
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