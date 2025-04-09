"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo from "../components/Logo";

export default function SubmitIdea() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    problem: "",
    solution: "",
    targetAudience: "",
    businessModel: "saas"
  });

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading while checking auth status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-emerald-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  // Don't render form for unauthenticated users
  if (status !== "authenticated") {
    return null;
  }

  const businessModelOptions = [
    { value: "saas", label: "Software as a Service (SaaS)" },
    { value: "subscription", label: "Subscription" },
    { value: "marketplace", label: "Marketplace" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "freemium", label: "Freemium" },
    { value: "advertising", label: "Advertising" },
    { value: "hardware", label: "Hardware/Device" },
    { value: "other", label: "Other" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send this data to your API
      // For now, we'll just simulate a submission and redirect
      console.log("Form data:", formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to results page
      router.push("/dashboard/results");
    } catch (error) {
      console.error("Error submitting idea:", error);
      // Handle error here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard">
            <Logo size="md" animated={false} />
          </Link>
        </div>
        <div>
          <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Tell us about your startup idea</h1>
          <p className="text-gray-300 mb-8">
            Fill out the form below to get AI-powered insights about your business concept.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Startup Idea Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Startup Idea Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="E.g., AI-Powered Resume Builder"
                />
              </div>

              {/* Problem Description */}
              <div>
                <label htmlFor="problem" className="block text-sm font-medium text-gray-300 mb-1">
                  Problem Description *
                </label>
                <textarea
                  id="problem"
                  name="problem"
                  required
                  value={formData.problem}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="What problem are you trying to solve? Who experiences this problem?"
                />
              </div>

              {/* Your Solution */}
              <div>
                <label htmlFor="solution" className="block text-sm font-medium text-gray-300 mb-1">
                  Your Solution *
                </label>
                <textarea
                  id="solution"
                  name="solution"
                  required
                  value={formData.solution}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="How does your product or service solve the problem?"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-300 mb-1">
                  Target Audience *
                </label>
                <textarea
                  id="targetAudience"
                  name="targetAudience"
                  required
                  value={formData.targetAudience}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Who will use your product? Define your target market."
                />
              </div>

              {/* Business Model */}
              <div>
                <label htmlFor="businessModel" className="block text-sm font-medium text-gray-300 mb-1">
                  Business Model *
                </label>
                <select
                  id="businessModel"
                  name="businessModel"
                  required
                  value={formData.businessModel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {businessModelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-6 rounded-lg font-medium transition duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Analyzing..." : "Submit Idea"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 