"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";
import Logo from "../components/Logo";
import { PlusCircle, BarChart4, Target, Briefcase } from "lucide-react";
import RecentStartupIdeas from "../components/RecentStartupIdeas";
import Loader from "../components/Loader";

export default function Dashboard() {
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
    } else {
      console.log("User authenticated:", session?.user?.email);
    }
  }, [status, router, session]);

  if (isLoading || status === "loading") {
    return <Loader fullPage text="Loading dashboard..." />;
  }

  // Only render dashboard if authenticated
  if (status !== "authenticated") {
    return null; // This will prevent flashing content before redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center">
            <Logo size="md" animated={false} />
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-gray-300">
              {session?.user?.name || session?.user?.email}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card with CTA */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Welcome to VettAI</h2>
              <p className="text-gray-300 mb-4 md:mb-0">
                Start validating your startup ideas with AI-powered tools.
              </p>
            </div>
            <Link 
              href="/submit-idea" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center"
            >
              <PlusCircle size={18} className="mr-2" />
              Submit New Idea
            </Link>
          </div>
        </div>
        
        {/* Recent Analyses Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Analyses</h2>
            <Link href="/dashboard/all-ideas" className="text-emerald-400 hover:text-emerald-300 text-sm">
              View all
            </Link>
          </div>
          
          <RecentStartupIdeas />
        </div>
        
        {/* Tools & Features */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Tools & Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/submit-idea" className="bg-gray-800 rounded-lg p-5 hover:bg-gray-700 transition group">
              <div className="flex items-start">
                <div className="p-2 bg-emerald-900/30 rounded-lg mr-4">
                  <PlusCircle size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-emerald-400 mb-2 group-hover:text-emerald-300">New Idea Analysis</h3>
                  <p className="text-gray-400 text-sm">Submit a new startup idea for AI evaluation and insights.</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/all-ideas" className="bg-gray-800 rounded-lg p-5 hover:bg-gray-700 transition group">
              <div className="flex items-start">
                <div className="p-2 bg-emerald-900/30 rounded-lg mr-4">
                  <BarChart4 size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-emerald-400 mb-2 group-hover:text-emerald-300">Past Results</h3>
                  <p className="text-gray-400 text-sm">View analyses of your previously submitted startup ideas.</p>
                </div>
              </div>
            </Link>
            
            <div className="bg-gray-800 rounded-lg p-5">
              <div className="flex items-start">
                <div className="p-2 bg-emerald-900/30 rounded-lg mr-4">
                  <Target size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-emerald-400 mb-2">Market Research</h3>
                  <p className="text-gray-400 text-sm">Coming soon: In-depth market research for your target industry.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 