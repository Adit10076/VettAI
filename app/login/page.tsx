"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../auth-layout";
import GoogleButton from "../components/GoogleButton";
import { signIn } from "next-auth/react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const errorParam = searchParams.get('error');
  const linkEmailParam = searchParams.get('linkEmail');
  
  useEffect(() => {
    // Handle direct error parameters
    if (errorParam) {
      if (errorParam === 'OAuthAccountNotLinked') {
        setError("An account already exists with the same email address. Please sign in with your credentials.");
      } else {
        setError(`Authentication error: ${errorParam}`);
      }
    }
    
    // Pre-fill email from linkEmail parameter
    if (linkEmailParam) {
      setEmail(linkEmailParam);
      setError("Please sign in with your password to link your Google account.");
    }
  }, [errorParam, linkEmailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // First validate credentials with our API
      const validateResponse = await fetch("/api/auth/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok) {
        setError(validateData.error || "Authentication failed");
        setIsLoading(false);
        return;
      }

      // If validation succeeds, use NextAuth signIn
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        // Check if we need to link a Google account
        if (linkEmailParam && linkEmailParam === email) {
          console.log("User successfully logged in, now redirecting to Google auth to link account");
          // Redirect to Google auth to link the account
          signIn("google", { 
            callbackUrl: "/dashboard",
            redirect: true
          });
          return;
        }
        
        // Regular successful authentication
        router.push("/dashboard");
      } else {
        setError("Failed to create session. Please try again.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { 
        callbackUrl: "/api/auth/google/callback",
        redirect: true
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    
      <AuthLayout title="Welcome Back">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="auth-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-400">
                Remember me
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm auth-link">
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="auth-button mb-4"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Log In"}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="mt-4">
          <GoogleButton 
            text="Continue with Google" 
            onClick={handleGoogleLogin} 
          />
        </div>
        
        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link href="/signup" className="auth-link">
            Sign Up
          </Link>
        </p>
      </AuthLayout>
    
  );
} 