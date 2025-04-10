"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Download, 
  ArrowUpRight, 
  Info, 
  BarChart, 
  Layout, 
  Zap, 
  Users, 
  Shield, 
  BookOpen,
  ClipboardList,
  TrendingUp,
  Crosshair
} from "lucide-react";
import Logo from "../../components/Logo";
import Loader from "../../components/Loader";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ScoreInterpretation from "../../components/ScoreInterpretation";
import PitchDeckGenerator from "../../components/PitchDeckGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Score {
  overall: number;
  marketPotential: number;
  technicalFeasibility: number;
}

interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface StartupEvaluation {
  score: Score;
  swotAnalysis: SwotAnalysis;
  mvpSuggestions: string[];
  businessModelIdeas: string[];
}

interface StartupIdea {
  title: string;
  problem: string;
  solution: string;
  audience: string;
  businessModel: string;
}

export default function Results() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ideaId = searchParams.get('id');
  
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<StartupEvaluation | null>(null);
  const [idea, setIdea] = useState<StartupIdea | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('scores');
  const [swotView, setSwotView] = useState('grid');

  const sectionNavigation = [
    { id: 'scores', label: 'Key Metrics', icon: <BarChart size={18} /> },
    { id: 'swot', label: 'SWOT Analysis', icon: <Layout size={18} /> },
    { id: 'mvp', label: 'MVP Plan', icon: <Zap size={18} /> },
    { id: 'business', label: 'Biz Models', icon: <Users size={18} /> },
    { id: 'report', label: 'Full Report', icon: <BookOpen size={18} /> },
  ];

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    async function loadData() {
      try {
        if (ideaId) {
          const response = await fetch(`/api/startup-ideas/${ideaId}`);
          if (!response.ok) throw new Error(response.statusText);
          
          const data = await response.json();
          setIdea({
            title: data.title,
            problem: data.problem,
            solution: data.solution,
            audience: data.audience,
            businessModel: data.businessModel
          });
          
          setResults({
            score: {
              overall: data.overallScore,
              marketPotential: data.marketPotentialScore,
              technicalFeasibility: data.technicalFeasibilityScore
            },
            swotAnalysis: data.swotAnalysis,
            mvpSuggestions: data.mvpSuggestions,
            businessModelIdeas: data.businessModelIdeas
          });
        } else {
          const storedResults = sessionStorage.getItem("startupAnalysis");
          const storedIdea = sessionStorage.getItem("startupIdea");
          
          if (!storedResults && !storedIdea) {
            setLoadError("No analysis results found. Please submit a startup idea first.");
          } else {
            setResults(storedResults ? JSON.parse(storedResults) : null);
            setIdea(storedIdea ? JSON.parse(storedIdea) : null);
          }
        }
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Error loading data");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [status, router, ideaId]);

  const generatePDF = () => {
    if (!results || !idea) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("Startup Idea Analysis Report", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text(`${idea.title}`, pageWidth / 2, 30, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Problem:", 14, 40);
    
    const problemLines = doc.splitTextToSize(idea.problem, pageWidth - 28);
    doc.text(problemLines, 14, 45);
    
    let yPos = 45 + (problemLines.length * 5);
    
    doc.text("Solution:", 14, yPos);
    const solutionLines = doc.splitTextToSize(idea.solution, pageWidth - 28);
    doc.text(solutionLines, 14, yPos + 5);
    
    yPos = yPos + 5 + (solutionLines.length * 5);
    
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("Analysis Scores", 14, yPos);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [["Score Type", "Value", "Interpretation"]],
      body: [
        ["Overall Score", results.score.overall.toString(), getScoreInterpretation(results.score.overall, "overall")],
        ["Market Potential", results.score.marketPotential.toString(), getScoreInterpretation(results.score.marketPotential, "marketPotential")],
        ["Technical Feasibility", results.score.technicalFeasibility.toString(), getScoreInterpretation(results.score.technicalFeasibility, "technicalFeasibility")],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 20, halign: 'center' }, 2: { cellWidth: 'auto' } },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("Score Scale", 14, yPos);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      body: [
        ["0-20", "Critical Concerns", "Major issues that need immediate attention"],
        ["21-40", "Needs Substantial Work", "Significant improvements required"],
        ["41-60", "Promising But Challenging", "Good foundation with important hurdles"],
        ["61-80", "Strong Potential", "Well-positioned with minor refinements needed"],
        ["81-100", "Exceptional Opportunity", "Excellent market-fit with high chances of success"]
      ],
      theme: "grid",
      styles: { fontSize: 8 },
      columnStyles: { 0: { cellWidth: 20, fillColor: [231, 76, 60], textColor: [255, 255, 255], halign: 'center' }, 1: { cellWidth: 45, fontStyle: 'bold' }, 2: { cellWidth: 'auto' } },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("SWOT Analysis", 14, yPos);
    
    yPos += 5;
    
    autoTable(doc, { startY: yPos, head: [["Strengths"]], body: results.swotAnalysis.strengths.map(item => [item]), theme: "grid", headStyles: { fillColor: [39, 174, 96] } });
    yPos = (doc as any).lastAutoTable.finalY + 5;
    autoTable(doc, { startY: yPos, head: [["Weaknesses"]], body: results.swotAnalysis.weaknesses.map(item => [item]), theme: "grid", headStyles: { fillColor: [231, 76, 60] } });
    yPos = (doc as any).lastAutoTable.finalY + 5;
    
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    
    autoTable(doc, { startY: yPos, head: [["Opportunities"]], body: results.swotAnalysis.opportunities.map(item => [item]), theme: "grid", headStyles: { fillColor: [52, 152, 219] } });
    yPos = (doc as any).lastAutoTable.finalY + 5;
    autoTable(doc, { startY: yPos, head: [["Threats"]], body: results.swotAnalysis.threats.map(item => [item]), theme: "grid", headStyles: { fillColor: [243, 156, 18] } });
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("MVP Suggestions", 14, yPos);
    
    yPos += 5;
    autoTable(doc, { startY: yPos, head: [["Minimum Viable Product Recommendations"]], body: results.mvpSuggestions.map(item => [item]), theme: "grid", headStyles: { fillColor: [142, 68, 173] } });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("Business Model Ideas", 14, yPos);
    
    yPos += 5;
    autoTable(doc, { startY: yPos, head: [["Recommended Business Models"]], body: results.businessModelIdeas.map(item => [item]), theme: "grid", headStyles: { fillColor: [22, 160, 133] } });
    
    const totalPages = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`VettAI Startup Analysis Report - Page ${i} of ${totalPages}`, pageWidth / 2, 285, { align: "center" });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 290, { align: "center" });
    }
    
    doc.save(`startup-analysis-${idea.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const getScoreInterpretation = (score: number, type: 'overall' | 'marketPotential' | 'technicalFeasibility') => {
    const interpretData = interpretations[type].find(item => score >= item.range[0] && score <= item.range[1]);
    return interpretData ? interpretData.label : "";
  };

  const interpretations = {
    overall: [
      { range: [0, 20], label: "Critical Concerns" },
      { range: [21, 40], label: "Needs Substantial Work" },
      { range: [41, 60], label: "Promising But Challenging" },
      { range: [61, 80], label: "Strong Potential" },
      { range: [81, 100], label: "Exceptional Opportunity" }
    ],
    marketPotential: [
      { range: [0, 20], label: "Limited Market" },
      { range: [21, 40], label: "Challenging Market Fit" },
      { range: [41, 60], label: "Moderate Market Opportunity" },
      { range: [61, 80], label: "Strong Market Potential" },
      { range: [81, 100], label: "Exceptional Market Opportunity" }
    ],
    technicalFeasibility: [
      { range: [0, 20], label: "Major Technical Hurdles" },
      { range: [21, 40], label: "Significant Technical Challenges" },
      { range: [41, 60], label: "Moderate Technical Complexity" },
      { range: [61, 80], label: "Technically Sound" },
      { range: [81, 100], label: "Highly Feasible" }
    ]
  };

  if (isLoading || status === "loading") {
    return <Loader fullPage text="Loading analysis results..." />;
  }

  if (status !== "authenticated") return null;

  if (!results || loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white">
        <header className="bg-gray-900/80 backdrop-blur-lg shadow-2xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center group">
                <Logo size="md" animated={true} />
                <ArrowLeft size={20} className="ml-4 text-gray-400 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              {loadError || "Analysis Unavailable"}
            </h2>
            <Link 
              href="/submit-idea" 
              className="inline-flex items-center bg-emerald-600/50 hover:bg-emerald-500/50 px-6 py-3 rounded-lg border border-emerald-500/30 transition-colors"
            >
              <Crosshair size={16} className="mr-2" />
              Submit New Idea
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-lg shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center group">
              <Logo size="md" animated={true} />
              <ArrowLeft size={20} className="ml-4 text-gray-400 group-hover:text-white transition-colors" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Idea Analytics
              </h1>
              <p className="text-sm text-gray-400">Deep Dive Analysis</p>
            </div>
          </div>
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <motion.div 
          className="lg:col-span-3 space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700/50">
            <nav className="space-y-1">
              {sectionNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id 
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30' 
                      : 'hover:bg-gray-700/30'
                  }`}
                >
                  <span className={activeSection === item.id ? 'text-emerald-400' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-6 space-y-2">
              <button 
                onClick={generatePDF}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600/50 hover:bg-emerald-500/50 px-4 py-3 rounded-lg border border-emerald-500/30 transition-colors"
              >
                <Download size={16} />
                <span>Export Report</span>
              </button>
              {idea && results && (
                <PitchDeckGenerator 
                  idea={idea}
                  analysis={results}
                  className="w-full hover:bg-blue-500/50 border-blue-500/30" 
                />
              )}
              <Link 
                href="/submit-idea"
                className="w-full flex items-center justify-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-3 rounded-lg border border-gray-600/30 transition-colors"
              >
                <ArrowUpRight size={16} />
                <span>New Analysis</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-8">
          {/* Idea Summary */}
          {idea && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                    {idea.title}
                  </h2>
                  <p className="text-gray-400 mt-2 text-sm max-w-3xl">{idea.solution}</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                  {idea.audience}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 bg-gray-700/20 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Problem Space</div>
                  <div className="text-sm text-gray-300 line-clamp-3">{idea.problem}</div>
                </div>
                <div className="p-4 bg-gray-700/20 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Revenue Model</div>
                  <div className="text-sm text-gray-300">{idea.businessModel}</div>
                </div>
                <div className="p-4 bg-gray-700/20 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Analysis Date</div>
                  <div className="text-sm text-gray-300">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="p-4 bg-gray-700/20 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Report ID</div>
                  <div className="text-sm text-gray-300 font-mono">{ideaId || 'LOCAL'}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dynamic Sections */}
          <AnimatePresence mode="wait">
            {/* Key Metrics Section */}
            {activeSection === 'scores' && (
              <motion.div
                key="scores"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['overall', 'marketPotential', 'technicalFeasibility'].map((type) => (
                    <div 
                      key={type} 
                      className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 relative overflow-hidden hover:-translate-y-1 transition-transform"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                            {type.replace(/([A-Z])/g, ' $1')}
                          </h3>
                          <ScoreInterpretation 
                            score={results.score[type as keyof Score]} 
                            type={type as keyof Score} 
                          />
                        </div>
                        <div className="flex justify-center">
                          <div className="w-32 h-32">
                            <CircularProgressbar
                              value={results.score[type as keyof Score]}
                              text={`${results.score[type as keyof Score]}`}
                              styles={buildStyles({
                                pathColor: `rgba(16, 185, 129, ${results.score[type as keyof Score] / 100})`,
                                textColor: '#fff',
                                trailColor: 'rgba(255, 255, 255, 0.1)',
                                textSize: '32px',
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-4">Score Matrix</h3>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[20, 40, 60, 80, 100].map((threshold) => (
                      <div 
                        key={threshold} 
                        className="p-2 rounded-lg bg-gradient-to-br from-gray-700/50 to-gray-800/50"
                      >
                        <div className="text-xs text-gray-400 mb-1">{threshold - 20}-{threshold}</div>
                        <div className="text-xs font-medium text-emerald-400">
                          {interpretations.overall.find(i => threshold >= i.range[0] && threshold <= i.range[1])?.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SWOT Analysis Section */}
            {activeSection === 'swot' && (
              <motion.div
                key="swot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">SWOT Breakdown</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSwotView('grid')}
                      className={`px-3 py-1 rounded-lg ${swotView === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:bg-gray-700/30'}`}
                    >
                      Grid View
                    </button>
                    <button
                      onClick={() => setSwotView('list')}
                      className={`px-3 py-1 rounded-lg ${swotView === 'list' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:bg-gray-700/30'}`}
                    >
                      List View
                    </button>
                  </div>
                </div>
                {swotView === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(results.swotAnalysis).map(([category, items]) => (
                      <div 
                        key={category}
                        className={`p-6 rounded-xl border hover:-translate-y-1 transition-transform ${
                          category === 'strengths' ? 'border-emerald-500/30' :
                          category === 'weaknesses' ? 'border-red-500/30' :
                          category === 'opportunities' ? 'border-blue-500/30' :
                          'border-yellow-500/30'
                        }`}
                      >
                        <h4 className={`text-sm font-semibold mb-4 ${
                          category === 'strengths' ? 'text-emerald-400' :
                          category === 'weaknesses' ? 'text-red-400' :
                          category === 'opportunities' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </h4>
                        <ul className="space-y-3">
                          {items.map((item: string, index: number) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start">
                              <span className="text-emerald-400 mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 space-y-6">
                    {Object.entries(results.swotAnalysis).map(([category, items]) => (
                      <div key={category}>
                        <h4 className={`text-sm font-semibold mb-2 ${
                          category === 'strengths' ? 'text-emerald-400' :
                          category === 'weaknesses' ? 'text-red-400' :
                          category === 'opportunities' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </h4>
                        <ul className="space-y-2">
                          {items.map((item: string, index: number) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start">
                              <span className="text-emerald-400 mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* MVP Suggestions Section */}
            {activeSection === 'mvp' && (
              <motion.div
                key="mvp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">MVP Recommendations</h3>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:-translate-y-1 transition-transform">
                  <ul className="space-y-4">
                    {results.mvpSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Zap size={18} className="text-emerald-400 mt-1" />
                        <span className="text-gray-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Business Models Section */}
            {activeSection === 'business' && (
              <motion.div
                key="business"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Business Model Suggestions</h3>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:-translate-y-1 transition-transform">
                  <div className="flex flex-wrap gap-3">
                    {results.businessModelIdeas.map((model, index) => (
                      <span 
                        key={index} 
                        className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-full text-sm border border-emerald-500/30"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Full Report Section */}
            {activeSection === 'report' && (
              <motion.div
                key="report"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-6">Comprehensive Analysis Report</h3>
                  {/* Scores */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium mb-4">Key Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['overall', 'marketPotential', 'technicalFeasibility'].map((type) => (
                        <div key={type} className="p-4 bg-gray-700/20 rounded-lg">
                          <div className="text-sm text-gray-400 mb-1">{type.replace(/([A-Z])/g, ' $1')}</div>
                          <div className="text-2xl font-bold text-emerald-400">{results.score[type as keyof Score]}</div>
                          <ScoreInterpretation score={results.score[type as keyof Score]} type={type as keyof Score} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* SWOT */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium mb-4">SWOT Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(results.swotAnalysis).map(([category, items]) => (
                        <div key={category} className="p-4 bg-gray-700/20 rounded-lg">
                          <h5 className={`text-sm font-semibold mb-2 ${
                            category === 'strengths' ? 'text-emerald-400' :
                            category === 'weaknesses' ? 'text-red-400' :
                            category === 'opportunities' ? 'text-blue-400' :
                            'text-yellow-400'
                          }`}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </h5>
                          <ul className="space-y-1">
                            {items.map((item: string, index: number) => (
                              <li key={index} className="text-gray-300 text-sm">{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* MVP */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium mb-4">MVP Suggestions</h4>
                    <ul className="space-y-2">
                      {results.mvpSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-gray-300 flex items-start space-x-2">
                          <span className="text-emerald-400">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Business Models */}
                  <div>
                    <h4 className="text-lg font-medium mb-4">Business Model Ideas</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.businessModelIdeas.map((model, index) => (
                        <span key={index} className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm">
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}