"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "../auth-layout";
import GoogleButton from "../components/GoogleButton";
import { signIn } from "next-auth/react";
import { loginUserAction } from "../lib/actions";

// Inner component that uses useSearchParams and holds the login logic.
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const errorParam = searchParams.get("error");
  const linkEmailParam = searchParams.get("linkEmail");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (errorParam) {
      if (errorParam === "OAuthAccountNotLinked") {
        setError("An account already exists with this email. Use password login to link.");
      } else {
        setError(`Authentication error: ${errorParam}`);
      }
    }

    if (linkEmailParam) {
      setEmail(linkEmailParam);
      setError("Please login with your password to link your Google account.");
    }
  }, [errorParam, linkEmailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await loginUserAction(formData);

      if (!result.success) {
        setError(result.message || "Authentication failed");
        setIsLoading(false);
        return;
      }

      if (linkEmailParam && linkEmailParam === email) {
        await signIn("google", { callbackUrl, redirect: true });
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(signInResult.error || "Authentication failed");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Failed to sign in with Google. Try again.");
      setIsLoading(false);
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

        <button type="submit" className="auth-button mb-4" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Log In"}
        </button>
      </form>

      <div className="divider">
        <span>OR</span>
      </div>

      <div className="mt-4">
        <GoogleButton text="Continue with Google" onClick={handleGoogleLogin} />
      </div>

      <p className="text-center mt-6 text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="auth-link">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
}

// Outer component wrapping LoginContent in a Suspense boundary.
export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
