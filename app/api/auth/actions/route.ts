import { NextRequest, NextResponse } from "next/server";
import { registerUser, verifyCredentials } from "../../../../auth";

/**
 * API route handler for authentication actions
 * This handles registration and login actions via a single API endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, name, email, password } = data;

    if (action === "register") {
      // Registration action
      if (!name || !email || !password) {
        return NextResponse.json(
          { success: false, message: "Missing required fields" },
          { status: 400 }
        );
      }

      const result = await registerUser(name, email, password);
      return NextResponse.json(result);
    } 
    else if (action === "login") {
      // Login action
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: "Email and password are required" },
          { status: 400 }
        );
      }

      const result = await verifyCredentials(email, password);
      return NextResponse.json({ ...result, ok: result.success });
    }
    else {
      // Unknown action
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
} 