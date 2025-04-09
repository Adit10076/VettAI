"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Trash2, PresentationIcon, BarChart4, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Loader from './Loader';

type StartupIdea = {
  id: string;
  title: string;
  overallScore: number;
  marketPotentialScore: number;
  technicalFeasibilityScore: number;
  createdAt: string;
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
      <div className="bg-gray-800 rounded-xl p-6 shadow-md flex justify-center items-center">
        <Loader text="Loading recent analyses..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center text-red-400 mb-2">
          <AlertCircle size={18} className="mr-2" />
          <p>Something went wrong</p>
        </div>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  // Empty state
  if (ideas.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-md text-center">
        <p className="text-gray-400">You haven't submitted any ideas yet.</p>
        <Link 
          href="/submit-idea" 
          className="text-emerald-400 hover:underline inline-flex items-center mt-2"
        >
          <BarChart4 size={16} className="mr-1" />
          Submit your first idea
        </Link>
      </div>
    );
  }

  // Render list of ideas
  return (
    <div className="bg-gray-800 rounded-xl shadow-md divide-y divide-gray-700">
      {ideas.map((idea) => (
        <div key={idea.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <Link 
              href={`/dashboard/results?id=${idea.id}`}
              className="text-lg font-medium text-white hover:text-emerald-400 transition"
            >
              {idea.title}
            </Link>
            <div className="mt-1 flex flex-wrap gap-3">
              <div className="bg-gray-700 rounded-full px-2 py-1 text-xs text-emerald-400">
                Score: {idea.overallScore}
              </div>
              <div className="bg-gray-700 rounded-full px-2 py-1 text-xs text-blue-400">
                Market: {idea.marketPotentialScore}
              </div>
              <div className="bg-gray-700 rounded-full px-2 py-1 text-xs text-purple-400">
                Tech: {idea.technicalFeasibilityScore}
              </div>
            </div>
            <div className="text-gray-400 text-xs mt-2">
              {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href={`/dashboard/results?id=${idea.id}`}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition"
              title="View analysis"
            >
              <BarChart4 size={18} />
            </Link>
            <Link 
              href={`/dashboard/results?id=${idea.id}&pitchdeck=true`}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition"
              title="Generate pitch deck"
            >
              <PresentationIcon size={18} />
            </Link>
            <button
              onClick={() => handleDelete(idea.id)}
              disabled={deleteLoading === idea.id}
              className={`p-2 text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-lg transition ${
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
          </div>
        </div>
      ))}
    </div>
  );
} 