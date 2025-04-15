'use server';

import { signIn } from "next-auth/react"; // This won't work in a server component
import { cookies } from "next/headers";

/**
 * Simplified Server Actions for Authentication
 * 
 * These server actions provide a clean interface for client components to interact with
 * the consolidated authentication API.
 */

// Server action for user registration
export async function registerUserAction(formData: FormData) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Registration failed',
      };
    }

    return { success: true, message: 'Registration successful' };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An error occurred during registration',
    };
  }
}

// Server action for credential login
export async function loginUserAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    console.log(`Processing login for ${email}`);
    
    // In server actions we can't directly use signIn from next-auth/react
    // We need to let the client handle the actual sign-in
    // This function just verifies credentials
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Invalid credentials' 
      };
    }
    
    return { 
      success: true,
      user: data.user
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Failed to login" };
  }
}

// Google login is handled client-side with next-auth