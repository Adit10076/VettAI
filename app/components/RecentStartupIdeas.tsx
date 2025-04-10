"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, PresentationIcon, BarChart4, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import Loader from './Loader';

type StartupIdea = {
  id: string;
  title: string;
  overallScore: number;
  marketPotentialScore: number;
  technicalFeasibilityScore: number;
  createdAt: string;
};

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.5
    }
  })
};

const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.1 }
};

export default function RecentStartupIdeas() {
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch recent ideas
  useEffect(() => {
    async function fetchIdeas() {
      try {
        setLoading(true);
        const response = await fetch('/api/startup-ideas');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ideas: ${response.status}`);
        }
        
        const data = await response.json();
        setIdeas(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent ideas:', err);
        setError('Failed to load your recent analyses. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchIdeas();
  }, []);

  // Handle deletion of an idea
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this startup idea analysis?')) {
      return;
    }
    
    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/startup-ideas/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }
      
      // Update state to remove the deleted idea
      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert('Failed to delete the startup idea. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-800/70 to-gray-800/40 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700/50 flex justify-center items-center"
      >
        <Loader text="Loading recent analyses..." />
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-800/70 to-gray-800/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50"
      >
        <div className="flex items-center text-red-400 mb-2">
          <AlertCircle size={18} className="mr-2" />
          <p>Something went wrong</p>
        </div>
        <p className="text-gray-400 text-sm">{error}</p>
      </motion.div>
    );
  }

  // Empty state
  if (ideas.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-800/70 to-gray-800/40 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700/50 text-center"
      >
        <p className="text-gray-300">You haven't submitted any ideas yet.</p>
        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4"
        >
          <Link 
            href="/submit-idea" 
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white transition-all duration-300 shadow-md"
          >
            <BarChart4 size={16} className="mr-2" />
            Submit your first idea
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // Render list of ideas
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800/70 to-gray-800/40 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 overflow-hidden"
    >
      <div className="divide-y divide-gray-700/50">
        {ideas.map((idea, i) => (
          <motion.div 
            key={idea.id} 
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-800/30 transition-colors duration-300"
          >
            <div className="flex-1">
              <Link 
                href={`/dashboard/results?id=${idea.id}`}
                className="text-lg font-medium text-white hover:text-teal-400 transition-colors duration-300"
              >
                {idea.title}
              </Link>
              <div className="mt-2 flex flex-wrap gap-3">
                <div className="bg-gradient-to-r from-teal-900/40 to-teal-800/30 rounded-full px-3 py-1 text-xs font-medium text-teal-300 border border-teal-700/30 shadow-sm">
                  Overall: {idea.overallScore}
                </div>
                <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 rounded-full px-3 py-1 text-xs font-medium text-blue-300 border border-blue-700/30 shadow-sm">
                  Market: {idea.marketPotentialScore}
                </div>
                <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/30 rounded-full px-3 py-1 text-xs font-medium text-purple-300 border border-purple-700/30 shadow-sm">
                  Tech: {idea.technicalFeasibilityScore}
                </div>
              </div>
              <div className="text-gray-400 text-xs mt-2">
                {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div whileHover="hover" initial="rest" variants={buttonHover}>
                <Link 
                  href={`/dashboard/results?id=${idea.id}`}
                  className="p-2 bg-gray-700/50 text-teal-300 hover:bg-gray-700 rounded-full transition-colors duration-300 flex items-center justify-center border border-gray-600/30"
                  title="View analysis"
                >
                  <BarChart4 size={18} />
                </Link>
              </motion.div>
              
              <motion.div whileHover="hover" initial="rest" variants={buttonHover}>
                <Link 
                  href={`/dashboard/results?id=${idea.id}&pitchdeck=true`}
                  className="p-2 bg-gray-700/50 text-purple-300 hover:bg-gray-700 rounded-full transition-colors duration-300 flex items-center justify-center border border-gray-600/30"
                  title="Generate pitch deck"
                >
                  <PresentationIcon size={18} />
                </Link>
              </motion.div>
              
              <motion.div whileHover="hover" initial="rest" variants={buttonHover}>
                <button
                  onClick={() => handleDelete(idea.id)}
                  disabled={deleteLoading === idea.id}
                  className={`p-2 bg-gray-700/50 text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors duration-300 flex items-center justify-center border border-gray-600/30 ${
                    deleteLoading === idea.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Delete"
                >
                  {deleteLoading === idea.id ? (
                    <Loader size="sm" color="gray" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 