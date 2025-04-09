"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, ArrowUpRight, Info } from "lucide-react";
import Logo from "../../components/Logo";
import Loader from "../../components/Loader";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ScoreInterpretation from "../../components/ScoreInterpretation";
import PitchDeckGenerator from "../../components/PitchDeckGenerator";

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

  // Load data either from API (if ID provided) or sessionStorage
  useEffect(() => {
    // Check authentication status
    if (status === "loading") {
      return; // Still loading, wait
    }
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    async function loadData() {
      try {
        // If we have an ID, load data from API
        if (ideaId) {
          const response = await fetch(`/api/startup-ideas/${ideaId}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Startup idea not found");
            } else {
              throw new Error(`Error loading data: ${response.status}`);
            }
          }
          
          const data = await response.json();
          
          // Format data for our components
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
          
          setLoadError(null);
        } else {
          // Otherwise load from sessionStorage
          try {
            const storedResults = sessionStorage.getItem("startupAnalysis");
            const storedIdea = sessionStorage.getItem("startupIdea");
            
            if (storedResults) {
              setResults(JSON.parse(storedResults));
            }
            
            if (storedIdea) {
              setIdea(JSON.parse(storedIdea));
            }
            
            // If neither stored nor ID provided, error
            if (!storedResults && !storedIdea) {
              setLoadError("No analysis results found. Please submit a startup idea first.");
            }
          } catch (error) {
            console.error("Error retrieving analysis results:", error);
            setLoadError("Error retrieving analysis results");
          }
        }
      } catch (error) {
        console.error("Error loading idea:", error);
        setLoadError(error instanceof Error ? error.message : "Error loading idea data");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [status, router, ideaId]);

  // Add the PDF export function
  const generatePDF = () => {
    if (!results || !idea) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185); // Blue color
    doc.text("Startup Idea Analysis Report", pageWidth / 2, 20, { align: "center" });
    
    // Add idea details
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80); // Dark blue-gray
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
    
    // Add scores
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("Analysis Scores", 14, yPos);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [["Score Type", "Value", "Interpretation"]],
      body: [
        [
          "Overall Score", 
          results.score.overall.toString(), 
          getScoreInterpretation(results.score.overall, "overall")
        ],
        [
          "Market Potential", 
          results.score.marketPotential.toString(), 
          getScoreInterpretation(results.score.marketPotential, "marketPotential")
        ],
        [
          "Technical Feasibility", 
          results.score.technicalFeasibility.toString(), 
          getScoreInterpretation(results.score.technicalFeasibility, "technicalFeasibility")
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 'auto' },
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Add Score Scale
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
      columnStyles: {
        0: { cellWidth: 20, fillColor: [231, 76, 60], textColor: [255, 255, 255], halign: 'center' },
        1: { cellWidth: 45, fontStyle: 'bold' },
        2: { cellWidth: 'auto' },
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Add SWOT Analysis
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("SWOT Analysis", 14, yPos);
    
    yPos += 5;
    
    // Create SWOT tables
    autoTable(doc, {
      startY: yPos,
      head: [["Strengths"]],
      body: results.swotAnalysis.strengths.map(item => [item]),
      theme: "grid",
      headStyles: { fillColor: [39, 174, 96] }, // Green
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Weaknesses"]],
      body: results.swotAnalysis.weaknesses.map(item => [item]),
      theme: "grid",
      headStyles: { fillColor: [231, 76, 60] }, // Red
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 5;
    
    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [["Opportunities"]],
      body: results.swotAnalysis.opportunities.map(item => [item]),
      theme: "grid",
      headStyles: { fillColor: [52, 152, 219] }, // Blue
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Threats"]],
      body: results.swotAnalysis.threats.map(item => [item]),
      theme: "grid",
      headStyles: { fillColor: [243, 156, 18] }, // Yellow
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add MVP Suggestions
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("MVP Suggestions", 14, yPos);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [["Minimum Viable Product Recommendations"]],
      body: results.mvpSuggestions.map(item => [item]),
      theme: "grid",
      headStyles: { fillColor: [142, 68, 173] }, // Purple
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Add Business Model Ideas
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("Business Model Ideas", 14, yPos);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [["Recommended Business Models"]],
      body: results.businessModelIdeas.map(item => [item]),
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] }, // Teal
    });
    
    // Add footer with page numbers
    // Get the total page count
    const totalPages = (doc as any).internal.pages.length - 1;
    
    // Loop through each page to add footer
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      
      // Add page number
      doc.text(
        `VettAI Startup Analysis Report - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        285,
        { align: "center" }
      );
      
      // Add date
      doc.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        290,
        { align: "center" }
      );
    }
    
    // Save the PDF with filename based on the startup name
    doc.save(`startup-analysis-${idea.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  // Helper function to get score interpretations for PDF
  const getScoreInterpretation = (score: number, type: 'overall' | 'marketPotential' | 'technicalFeasibility') => {
    // Get the appropriate interpretation from our defined ranges
    const interpretData = interpretations[type].find(
      item => score >= item.range[0] && score <= item.range[1]
    );
    
    return interpretData ? interpretData.label : "";
  };
  
  // Score range interpretations (same as in ScoreInterpretation component)
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

  // Check loading state
  if (isLoading || status === "loading") {
    return <Loader fullPage text="Loading analysis results..." />;
  }

  // Only render results if authenticated
  if (status !== "authenticated") {
    return null;
  }
  
  // If no results found or error, show a message and link back to submit
  if (!results || loadError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Logo size="md" animated={false} />
              </Link>
            </div>
            <Link href="/dashboard" className="flex items-center text-gray-300 hover:text-white">
              <ArrowLeft size={16} className="mr-1" />
              Dashboard
            </Link>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gray-800 rounded-xl p-8 shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4">
              {loadError || "No Analysis Results Found"}
            </h2>
            <p className="text-gray-300 mb-6">
              {loadError 
                ? "There was an error loading the analysis results." 
                : "You haven't submitted any startup ideas for analysis yet, or the results have expired."
              }
            </p>
            <Link 
              href="/submit-idea" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center"
            >
              Submit a Startup Idea
            </Link>
          </div>
        </main>
      </div>
    );
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
        {/* Idea Summary */}
        {idea && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">{idea.title}</h2>
            <div className="text-sm text-gray-400 mb-1">Problem</div>
            <p className="text-gray-300 mb-3 text-sm">{idea.problem}</p>
            <div className="text-sm text-gray-400 mb-1">Solution</div>
            <p className="text-gray-300 mb-3 text-sm">{idea.solution}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div>
                <div className="text-xs text-gray-400">Target Audience</div>
                <div className="text-sm text-gray-300">{idea.audience}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Business Model</div>
                <div className="text-sm text-gray-300">{idea.businessModel}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="text-center mb-3">
              <div className="text-4xl font-bold text-emerald-400 mb-2">{results.score.overall}</div>
              <div className="text-gray-300 text-sm">Overall Score</div>
            </div>
            <ScoreInterpretation score={results.score.overall} type="overall" />
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="text-center mb-3">
              <div className="text-4xl font-bold text-emerald-400 mb-2">{results.score.marketPotential}</div>
              <div className="text-gray-300 text-sm">Market Potential</div>
            </div>
            <ScoreInterpretation score={results.score.marketPotential} type="marketPotential" />
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="text-center mb-3">
              <div className="text-4xl font-bold text-emerald-400 mb-2">{results.score.technicalFeasibility}</div>
              <div className="text-gray-300 text-sm">Technical Feasibility</div>
            </div>
            <ScoreInterpretation score={results.score.technicalFeasibility} type="technicalFeasibility" />
          </div>
        </div>
        
        {/* Score Range Legend */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-md mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-blue-400" />
            <h3 className="text-lg font-semibold">Score Range Guide</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
            <div className="bg-red-900/20 p-2 rounded-md">
              <div className="font-bold text-red-500 mb-1">0-20</div>
              <div className="text-gray-300">Critical Concerns</div>
            </div>
            <div className="bg-orange-900/20 p-2 rounded-md">
              <div className="font-bold text-orange-500 mb-1">21-40</div>
              <div className="text-gray-300">Needs Work</div>
            </div>
            <div className="bg-yellow-900/20 p-2 rounded-md">
              <div className="font-bold text-yellow-500 mb-1">41-60</div>
              <div className="text-gray-300">Promising</div>
            </div>
            <div className="bg-blue-900/20 p-2 rounded-md">
              <div className="font-bold text-blue-400 mb-1">61-80</div>
              <div className="text-gray-300">Strong</div>
            </div>
            <div className="bg-emerald-900/20 p-2 rounded-md">
              <div className="font-bold text-emerald-400 mb-1">81-100</div>
              <div className="text-gray-300">Exceptional</div>
            </div>
          </div>
        </div>
        
        {/* SWOT Analysis */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">SWOT Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-emerald-400 font-semibold mb-4">Strengths</h3>
              <ul className="space-y-2">
                {results.swotAnalysis.strengths.map((item, index) => (
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
                {results.swotAnalysis.weaknesses.map((item, index) => (
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
                {results.swotAnalysis.opportunities.map((item, index) => (
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
                {results.swotAnalysis.threats.map((item, index) => (
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
              {results.mvpSuggestions.map((item, index) => (
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
              {results.businessModelIdeas.map((item, index) => (
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
        
        {/* Call to Action */}
        <div className="flex flex-col md:flex-row justify-center mt-12 gap-4">
          <button 
            onClick={generatePDF} 
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          >
            <Download size={16} className="mr-2" />
            Export Results
          </button>
          {results && idea && <PitchDeckGenerator idea={idea} analysis={results} />}
          <Link 
            href="/submit-idea" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          >
            <ArrowUpRight size={16} className="mr-2" />
            Submit Another Idea
          </Link>
        </div>
      </main>
    </div>
  );
} 