'use server';

import { hash, compare } from "bcryptjs";
import { signIn } from "../../auth";
import prisma from "../../lib/prisma";

// Server action for user registration
export async function registerUserAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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
      // Sign the user in
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

// Server action for credential login
export async function loginUserAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

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

// Server action to verify credentials
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