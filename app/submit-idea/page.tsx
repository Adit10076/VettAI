"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import Logo from "../components/Logo";
import Loader from "../components/Loader";

interface StartupIdea {
  title: string;
  problem: string;
  solution: string;
  audience: string;
  businessModel: string;
}

export default function SubmitIdea() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<StartupIdea>({
    title: "",
    problem: "",
    solution: "",
    audience: "",
    businessModel: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    
    try {
      // First, get analysis from backend API
      const response = await fetch("http://localhost:8000/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const analysisData = await response.json();
      
      // Store result in sessionStorage to access it on the results page
      sessionStorage.setItem("startupAnalysis", JSON.stringify(analysisData));
      sessionStorage.setItem("startupIdea", JSON.stringify(formData));
      
      // Save to database
      const saveResponse = await fetch("/api/startup-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: formData,
          analysis: analysisData
        }),
      });
      
      if (!saveResponse.ok) {
        console.error("Failed to save to database, but continuing...");
      } else {
        const saveData = await saveResponse.json();
        // Store idea ID for reference
        sessionStorage.setItem("currentIdeaId", saveData.id);
      }
      
      // Navigate to results page
      router.push("/dashboard/results");
    } catch (error) {
      console.error("Submission error:", error);
      setFormError("Failed to analyze your startup idea. Please check if the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auth check
  if (status === "loading") {
    return <Loader fullPage text="Loading your session..." />;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Logo size="md" animated={false} />
            </Link>
            <span className="ml-4 text-xl font-semibold text-gray-300">
              Submit New Idea
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-gray-300">
              {session?.user?.name || session?.user?.email}
            </div>
            <Link href="/dashboard" className="flex items-center text-gray-300 hover:text-white">
              <ArrowLeft size={16} className="mr-1" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-xl shadow-md p-6 md:p-8 mb-8">
          <h1 className="text-2xl font-bold mb-6">Let's Analyze Your Startup Idea</h1>
          
          {formError && (
            <div className="bg-red-900/30 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-6">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Startup Name/Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., TaskMaster - AI-powered task management"
              />
            </div>
            
            <div>
              <label htmlFor="problem" className="block text-sm font-medium text-gray-300 mb-2">
                Problem You're Solving
              </label>
              <textarea
                id="problem"
                name="problem"
                required
                value={formData.problem}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe the problem your startup addresses..."
              />
            </div>
            
            <div>
              <label htmlFor="solution" className="block text-sm font-medium text-gray-300 mb-2">
                Your Solution
              </label>
              <textarea
                id="solution"
                name="solution"
                required
                value={formData.solution}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Explain how your product/service solves the problem..."
              />
            </div>
            
            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-2">
                Target Audience
              </label>
              <textarea
                id="audience"
                name="audience"
                required
                value={formData.audience}
                onChange={handleChange}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Who are your primary users/customers..."
              />
            </div>
            
            <div>
              <label htmlFor="businessModel" className="block text-sm font-medium text-gray-300 mb-2">
                Business Model
              </label>
              <textarea
                id="businessModel"
                name="businessModel"
                required
                value={formData.businessModel}
                onChange={handleChange}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="How will you generate revenue..."
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader size="sm" color="white" />
                    <span className="ml-2">Analyzing...</span>
                  </div>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Analyze Idea
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 