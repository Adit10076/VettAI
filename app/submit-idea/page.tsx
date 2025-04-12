"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Lightbulb,
  User,
  TrendingUp,
  Crosshair,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";
import Loader from "../components/Loader";

interface StartupIdea {
  title: string;
  problem: string;
  solution: string;
  audience: string;
  businessModel: string;
}

const formSections = [
  { id: "title", icon: <Rocket size={18} />, label: "Concept Core" },
  { id: "problem", icon: <Crosshair size={18} />, label: "Problem Space" },
  {
    id: "solution",
    icon: <Lightbulb size={18} />,
    label: "Innovative Solution",
  },
  { id: "audience", icon: <User size={18} />, label: "Target Market" },
  {
    id: "businessModel",
    icon: <TrendingUp size={18} />,
    label: "Revenue Strategy",
  },
];

export default function SubmitIdea() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState<StartupIdea>({
    title: "",
    problem: "",
    solution: "",
    audience: "",
    businessModel: "",
  });

  useEffect(() => {
    const filledFields = Object.values(formData).filter(
      (v) => v.trim() !== ""
    ).length;
    const newProgress = (filledFields / 5) * 100;
    setProgress(newProgress);

    // Removed the activeSection update based on filled fields
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const analysisData = await response.json();

      sessionStorage.setItem("startupAnalysis", JSON.stringify(analysisData));
      sessionStorage.setItem("startupIdea", JSON.stringify(formData));

      const saveResponse = await fetch("/api/startup-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: formData,
          analysis: {
            ...analysisData,
            risks: analysisData.risks || {},
          },
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse
          .json()
          .catch(() => ({ error: "Unknown error" }));
        setFormError(`Failed to save: ${errorData.error || "Unknown error"}`);
      } else {
        const saveData = await saveResponse.json();
        sessionStorage.setItem("currentIdeaId", saveData.id);
        router.push("/dashboard/results");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setFormError(
        "Failed to analyze your startup idea. Please check the backend server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading")
    return <Loader fullPage text="Loading session..." />;
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
      <header className="bg-gray-800/80 backdrop-blur-sm shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center group">
              <Logo size="md" animated={true} />
              <ArrowLeft
                size={20}
                className="ml-4 text-gray-400 group-hover:text-white transition-colors"
              />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Idea Forge
              </h1>
              <p className="text-sm text-gray-400">Craft Your Next Big Thing</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                <span className="font-bold">
                  {session?.user?.name?.[0] || session?.user?.email?.[0]}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-gray-400 text-xs">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-1 bg-gray-700 mt-2">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel - Progress & Guidance */}
        <motion.div
          className="lg:col-span-3 space-y-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700/50">
            <h3 className="text-sm font-semibold text-emerald-400 mb-4">
              Creation Progress
            </h3>
            <div className="space-y-6">
              {formSections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    activeSection === index
                      ? "bg-gray-700/50 border border-emerald-500/30"
                      : "hover:bg-gray-700/30"
                  }`}
                  onClick={() => setActiveSection(index)}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      activeSection === index
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-gray-700/50 text-gray-400"
                    }`}
                  >
                    {section.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className="text-xs text-gray-400">
                      {formData[section.id as keyof StartupIdea]
                        ? "Completed"
                        : "Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700/50">
            <h3 className="text-sm font-semibold text-cyan-400 mb-4">
              Pro Tips
            </h3>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-gray-300 space-y-2"
              >
                {
                  [
                    "Make it catchy and memorable! Imagine how it would look on a startup billboard.",
                    "Focus on the core pain point. What keeps your target audience up at night?",
                    "Highlight what makes your solution unique. Why is it better than existing alternatives?",
                    "Be specific! 'Everyone' is not a target market. Think demographics and psychographics.",
                    "Consider multiple revenue streams. Subscription? Freemium? Licensing?",
                  ][activeSection]
                }
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Form Area */}
        <motion.div
          className="lg:col-span-6 bg-gray-800/50 p-8 rounded-xl shadow-xl border border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {formSections.map((section, index) => (
              <motion.div
                key={section.id}
                className={`space-y-4 ${
                  index !== activeSection ? "hidden" : ""
                }`}
                animate={{ opacity: index === activeSection ? 1 : 0 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold">{section.label}</h2>
                </div>

                {index === 0 ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Your groundbreaking startup name..."
                      className="w-full bg-gray-700/50 border-2 border-gray-600 rounded-xl px-6 py-4 text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <p className="text-sm text-gray-400 text-right">
                      {formData.title.length}/60 characters
                    </p>
                  </div>
                ) : (
                  <textarea
                    name={section.id}
                    value={formData[section.id as keyof StartupIdea]}
                    onChange={handleChange}
                    rows={4}
                    placeholder={`Describe your ${section.label.toLowerCase()}...`}
                    className="w-full bg-gray-700/50 border-2 border-gray-600 rounded-xl px-6 py-4 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 resize-none"
                  />
                )}
              </motion.div>
            ))}

            {/* Navigation Controls */}
            <div className="flex justify-between pt-8 border-t border-gray-700/50">
              <button
                type="button"
                onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                disabled={activeSection === 0}
                className="px-6 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {activeSection === formSections.length - 1 ? (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-xl font-semibold hover:scale-105 transition-transform flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader size="sm" color="white" />
                  ) : (
                    <>
                      <Rocket size={18} />
                      <span>Launch Analysis</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      Math.min(formSections.length - 1, activeSection + 1)
                    )
                  }
                  disabled={
                    !formData[
                      formSections[activeSection].id as keyof StartupIdea
                    ]?.trim()
                  }
                  className="px-6 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Right Panel - Preview */}
        <motion.div
          className="lg:col-span-3 bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700/50 h-fit sticky top-32"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-sm font-semibold text-cyan-400 mb-4">
            Concept Preview
          </h3>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-inner">
              <h4 className="font-bold text-lg mb-2">
                {formData.title || "Your Startup Name"}
              </h4>
              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <p className="text-xs text-emerald-400">PROBLEM</p>
                  <p className="line-clamp-3">
                    {formData.problem || "Problem statement..."}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-cyan-400">SOLUTION</p>
                  <p className="line-clamp-3">
                    {formData.solution || "Proposed solution..."}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-400">TARGET</p>
                  <p className="line-clamp-2">
                    {formData.audience || "Target audience..."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/20 p-4 rounded-lg">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Market Readiness</span>
                <span className="font-mono text-emerald-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="text-sm text-gray-400 space-y-2">
              <p className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>Real-time AI validation</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="text-cyan-400">✦</span>
                <span>Competitor analysis included</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="text-purple-400">➤</span>
                <span>Investor-ready report</span>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
