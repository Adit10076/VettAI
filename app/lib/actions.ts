'use server';

import { registerUser, verifyCredentials } from "../../auth";

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
    // Validate inputs
    if (!name || !email || !password) {
      return { success: false, message: "All fields are required" };
    }
    
    // Call the registerUser function directly
    const result = await registerUser(name, email, password);
    return result;
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
    // Validate inputs
    if (!email || !password) {
      return { success: false, message: "Email and password are required" };
    }
    
    // First verify the credentials
    const result = await verifyCredentials(email, password);
    
    if (!result.success) {
      return result;
    }
    
    // Credentials are valid, return success
    return { 
      success: true, 
      user: result.user
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Failed to login" };
  }
}