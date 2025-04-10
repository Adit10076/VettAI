"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Plus, Rocket, User } from "lucide-react";
import Logo from "../../components/Logo";
import Loader from "../../components/Loader";
import RecentStartupIdeas from "../../components/RecentStartupIdeas";
import { motion } from "framer-motion";

export default function AllIdeas() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    setIsLoading(false);
    
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return <Loader fullPage text="Loading your ideas..." />;
  }

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900 text-white">
      <header className="bg-gray-900/80 backdrop-blur-lg shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center group">
              <Logo size="md" animated={true} />
              <ArrowLeft size={20} className="ml-4 text-gray-400 group-hover:text-white transition-colors" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Idea Vault
              </h1>
              <p className="text-sm text-gray-400">Historical Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                <span className="font-bold">{session?.user?.name?.[0] || session?.user?.email?.[0]}</span>
              </div>
              <div className="text-sm">
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-gray-400 text-xs">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <motion.div 
          className="lg:col-span-3 space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700/50">
            <nav className="space-y-4">
              <Link
                href="/submit-idea"
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Plus size={18} className="text-emerald-400" />
                  <span className="text-sm font-medium">New Analysis</span>
                </span>
                <Rocket size={16} className="text-emerald-400" />
              </Link>
              
              <div className="pt-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Quick Access</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-700/30 transition-colors">
                    🔍 Top Rated Ideas
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-700/30 transition-colors">
                    📈 Growth Potential
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-700/30 transition-colors">
                    🛠 Needs Refinement
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  Innovation Archive
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                  Explore your historical analyses and track progress
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                  {session?.user?.name?.split(' ')[0] || 'Innovator'}
                </span>
              </div>
            </div>

            <div className="bg-emerald-900/20 rounded-xl p-4 mb-6 flex items-start border border-emerald-500/30">
              <AlertCircle size={18} className="text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-1">Pro Tip</h3>
                <p className="text-gray-300 text-sm">
                  Use the sorting options and filters to quickly find specific analyses. 
                  Star important ideas for quick reference.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Analyses</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 rounded-lg bg-gray-700/50 text-sm">
                    Sort by Date ▼
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-gray-700/50 text-sm">
                    Filter ▾
                  </button>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <RecentStartupIdeas />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}