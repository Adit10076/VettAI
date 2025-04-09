import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "../../../../../lib/prisma";

export async function GET(request: NextRequest) {
  // This just ensures the callback is properly handled
  console.log("Received Google callback", request.url);
  
  // Check for error parameter
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const code = searchParams.get('code');
  
  if (error) {
    console.error("Google auth error:", error);
    if (error === "OAuthAccountNotLinked") {
      // If we get an OAuthAccountNotLinked error and have a code
      // We can extract the email from the state and attempt to sign them in
      try {
        const email = searchParams.get('email');
        if (email) {
          console.log("Attempting to link account for email:", email);
          
          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { email },
          });
          
          if (user) {
            // Redirect to login with a special parameter
            return NextResponse.redirect(new URL(`/login?linkEmail=${email}`, request.url));
          }
        }
      } catch (err) {
        console.error("Error processing OAuth link:", err);
      }
      
      return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }
  
  try {
    // Check if the user is authenticated after the callback
    const session = await auth();
    
    if (session) {
      console.log("User authenticated via Google, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      console.log("Google auth failed, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error: any) {
    console.error("Error in Google callback:", error);
    
    // Special handling for account linking errors
    if (error?.message?.includes("OAuthAccountNotLinked")) {
      // Try to extract email from the error message
      const emailMatch = error.message.match(/email address: ([^\s]+)/);
      const email = emailMatch ? emailMatch[1] : null;
      
      if (email) {
        return NextResponse.redirect(
          new URL(`/login?linkEmail=${email}`, request.url)
        );
      }
      
      return NextResponse.redirect(
        new URL("/login?error=OAuthAccountNotLinked", request.url)
      );
    }
    
    return NextResponse.redirect(
      new URL("/login?error=GoogleCallbackError", request.url)
    );
  }
} 