"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../auth-layout";
import GoogleButton from "../components/GoogleButton";

import { signIn } from "next-auth/react";
import { registerUserAction } from "../lib/actions";

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('name', fullName);
      formData.append('email', email);
      formData.append('password', password);
      
      const result = await registerUserAction(formData);
      
      if (result.success) {
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/dashboard",
          redirect: true
        });
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signIn("google", { 
        callbackUrl: "/dashboard",
        redirect: true
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (

      <AuthLayout title="Create Your Account">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-400 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="auth-input"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
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
              className={`auth-input ${formErrors.password ? "border-red-500" : ""}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            {formErrors.password && (
              <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`auth-input ${formErrors.confirmPassword ? "border-red-500" : ""}`}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="auth-button mt-6 mb-4"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="mt-4">
          <GoogleButton 
            text="Continue with Google" 
            onClick={handleGoogleSignup}
            disabled={isLoading}
          />
        </div>
        
        <p className="text-center mt-6 text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="auth-link">
            Log In
          </Link>
        </p>
      </AuthLayout>
  );
} 