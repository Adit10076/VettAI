"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "../components/Logo";
import { PlusCircle, BarChart4, Target, Briefcase, LogOut } from "lucide-react";
import RecentStartupIdeas from "../components/RecentStartupIdeas";
import Loader from "../components/Loader";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-3xl"></div>
        <div className="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] rounded-full bg-teal-700/10 blur-3xl"></div>
      </div>
      
      {/* Header with glass effect */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/70 border-b border-gray-800/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center">
            <Logo size="md" animated={true} />
          </Link>
          <div className="flex items-center space-x-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-gray-300 hidden sm:block"
            >
              {session?.user?.name || session?.user?.email}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-4 py-2 rounded-full text-sm flex items-center transition-all duration-300 border border-gray-700/50 shadow-md"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </motion.button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
        {/* Welcome Card with CTA */}
        <motion.div 
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeInUp}
          className="bg-gradient-to-br from-gray-800/70 to-gray-800/40 backdrop-blur-sm rounded-xl p-6 shadow-xl mb-8 border border-gray-700/50"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Welcome to VettAI</h2>
              <p className="text-gray-300 mb-4 md:mb-0">
                Start validating your startup ideas with AI-powered tools.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link 
                href="/submit-idea" 
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center shadow-lg transition-all duration-300"
              >
                <PlusCircle size={18} className="mr-2" />
                Submit New Idea
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Recent Analyses Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeInUp}
          className="mb-10"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Analyses</h2>
            <Link href="/dashboard/all-ideas" className="text-teal-400 hover:text-teal-300 text-sm transition-colors duration-300">
              View all
            </Link>
          </div>
          
          <RecentStartupIdeas />
        </motion.div>
        
        {/* Tools & Features */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeInUp}
        >
          <h2 className="text-xl font-semibold mb-6">Tools & Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link href="/submit-idea" className="block bg-gradient-to-br from-gray-800/70 to-gray-800/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 hover:border-teal-700/50 transition-all duration-300">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-teal-600/30 to-teal-400/10 rounded-lg mr-4 shadow-inner">
                    <PlusCircle size={24} className="text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-teal-400 mb-2">New Idea Analysis</h3>
                    <p className="text-gray-400 text-sm">Submit a new startup idea for AI evaluation and insights.</p>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link href="/dashboard/all-ideas" className="block bg-gradient-to-br from-gray-800/70 to-gray-800/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 hover:border-purple-700/50 transition-all duration-300">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-purple-600/30 to-purple-400/10 rounded-lg mr-4 shadow-inner">
                    <BarChart4 size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-purple-400 mb-2">Past Results</h3>
                    <p className="text-gray-400 text-sm">View analyses of your previously submitted startup ideas.</p>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <div className="bg-gradient-to-br from-gray-800/70 to-gray-800/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-indigo-600/30 to-indigo-400/10 rounded-lg mr-4 shadow-inner">
                    <Target size={24} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-indigo-400 mb-2">Market Research</h3>
                    <p className="text-gray-400 text-sm">Coming soon: In-depth market research for your target industry.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="mt-20 border-t border-gray-800/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2023 VettAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 