"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import Logo from "../../components/Logo";

export default function Results() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data that would come from an API in a real application
  const mockResults = {
    overall: 78,
    marketPotential: 82,
    technicalFeasibility: 74,
    swot: {
      strengths: [
        "Strong differentiation from existing solutions",
        "Clear target market with defined pain points",
        "Scalable business model"
      ],
      weaknesses: [
        "High technical complexity",
        "Requires significant initial investment",
        "Longer time to market than competitors"
      ],
      opportunities: [
        "Growing market with increasing demand",
        "Potential for strategic partnerships",
        "International expansion possibilities"
      ],
      threats: [
        "Established competitors with greater resources",
        "Regulatory challenges in certain markets",
        "Rapidly evolving technology landscape"
      ]
    },
    mvpSuggestions: [
      "Focus on core feature solving the main pain point",
      "Implement basic user authentication and profiles",
      "Create simple analytics dashboard",
      "Build feedback collection mechanism",
      "Ensure responsive design for mobile users"
    ],
    businessModelIdeas: [
      "Freemium with premium features",
      "Monthly subscription",
      "Usage-based pricing",
      "Enterprise licensing"
    ]
  };

  useEffect(() => {
    // Check authentication status
    if (status === "loading") {
      return; // Still loading, wait
    }
    
    setIsLoading(false);
    
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-emerald-500">Loading results...</div>
      </div>
    );
  }

  // Only render results if authenticated
  if (status !== "authenticated") {
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
              Idea Analysis Results
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
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-md text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-2">{mockResults.overall}</div>
            <div className="text-gray-300 text-sm">Overall Score</div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 shadow-md text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-2">{mockResults.marketPotential}</div>
            <div className="text-gray-300 text-sm">Market Potential</div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 shadow-md text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-2">{mockResults.technicalFeasibility}</div>
            <div className="text-gray-300 text-sm">Technical Feasibility</div>
          </div>
        </div>
        
        {/* SWOT Analysis */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">SWOT Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-emerald-400 font-semibold mb-4">Strengths</h3>
              <ul className="space-y-2">
                {mockResults.swot.strengths.map((item, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-emerald-400 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-red-400 font-semibold mb-4">Weaknesses</h3>
              <ul className="space-y-2">
                {mockResults.swot.weaknesses.map((item, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-blue-400 font-semibold mb-4">Opportunities</h3>
              <ul className="space-y-2">
                {mockResults.swot.opportunities.map((item, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-yellow-400 font-semibold mb-4">Threats</h3>
              <ul className="space-y-2">
                {mockResults.swot.threats.map((item, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* MVP Suggestions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">MVP Suggestions</h2>
          <div className="bg-gray-800 rounded-xl p-6 shadow-md">
            <ul className="space-y-2">
              {mockResults.mvpSuggestions.map((item, index) => (
                <li key={index} className="text-gray-300 flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Business Model Ideas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Business Model Ideas</h2>
          <div className="bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex flex-wrap gap-2">
              {mockResults.businessModelIdeas.map((item, index) => (
                <span 
                  key={index} 
                  className="bg-gray-700 text-emerald-400 px-3 py-1 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Export Options */}
        <div className="flex justify-center mt-12">
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center mr-4">
            <Download size={16} className="mr-2" />
            Export PDF
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center">
            <Download size={16} className="mr-2" />
            Download Pitch Deck
          </button>
        </div>
      </main>
    </div>
  );
} 