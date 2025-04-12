'use server';

import { signInWithGoogle } from "../../auth";

/**
 * Simplified Server Actions for Authentication
 * 
 * These server actions provide a clean interface for client components to interact with
 * the consolidated authentication API.
 */

// Server action for user registration
export async function registerUserAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    // Use the consolidated auth API
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        name,
        email,
        password
      }),
    });
    
    return await response.json();
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
    // Use the consolidated auth API
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        email,
        password
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Failed to login" };
  }
}

// Server action for Google login
export async function googleLoginAction() {
  return signInWithGoogle();
}