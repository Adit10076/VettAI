"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Logo from "../../components/Logo";
import Loader from "../../components/Loader";
import RecentStartupIdeas from "../../components/RecentStartupIdeas";

export default function AllIdeas() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    if (status === "loading") {
      return; // Still loading, wait
    }
    
    setIsLoading(false);
    
    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return <Loader fullPage text="Loading your ideas..." />;
  }

  // Only render if authenticated
  if (status !== "authenticated") {
    return null; // This will prevent flashing content before redirect
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
              All Startup Ideas
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Your Startup Idea Analyses</h1>
            <Link 
              href="/submit-idea" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              Submit New Idea
            </Link>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle size={18} className="text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-300 text-sm">
                View all your submitted startup ideas and their analysis results. 
                Click on any idea to see its complete analysis or generate a pitch deck.
              </p>
            </div>
          </div>
          
          <RecentStartupIdeas />
        </div>
      </main>
    </div>
  );
} 