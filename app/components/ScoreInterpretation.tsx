import React from 'react';
import { AlertTriangle, CheckCircle, Trophy, Zap, AlertCircle, HelpCircle } from 'lucide-react';

interface ScoreInterpretationProps {
  score: number;
  type: 'overall' | 'marketPotential' | 'technicalFeasibility';
}

// Score range interpretations
const interpretations = {
  overall: [
    { range: [0, 20], label: "Critical Concerns", description: "Your idea faces significant challenges across multiple fronts. Consider pivoting or reimagining core aspects.", icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-900/20" },
    { range: [21, 40], label: "Needs Substantial Work", description: "Your concept has potential but requires major improvements in multiple areas to be viable.", icon: AlertCircle, color: "text-orange-500", bgColor: "bg-orange-900/20" },
    { range: [41, 60], label: "Promising But Challenging", description: "Your idea shows promise but faces significant hurdles that need addressing.", icon: HelpCircle, color: "text-yellow-500", bgColor: "bg-yellow-900/20" },
    { range: [61, 80], label: "Strong Potential", description: "Your startup idea is solid with good market fit. Focus on refining specific aspects to excel.", icon: Zap, color: "text-blue-400", bgColor: "bg-blue-900/20" },
    { range: [81, 100], label: "Exceptional Opportunity", description: "Your idea shows excellent potential for success. Focus on execution and rapid market entry.", icon: Trophy, color: "text-emerald-400", bgColor: "bg-emerald-900/20" }
  ],
  marketPotential: [
    { range: [0, 20], label: "Limited Market", description: "The target market appears too small or saturated to support this business model.", icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-900/20" },
    { range: [21, 40], label: "Challenging Market Fit", description: "Your solution may struggle to find sufficient market demand in its current form.", icon: AlertCircle, color: "text-orange-500", bgColor: "bg-orange-900/20" },
    { range: [41, 60], label: "Moderate Market Opportunity", description: "There's a market for your solution, but you'll need to carve out your niche carefully.", icon: HelpCircle, color: "text-yellow-500", bgColor: "bg-yellow-900/20" },
    { range: [61, 80], label: "Strong Market Potential", description: "Your idea addresses a clear market need with good growth potential.", icon: Zap, color: "text-blue-400", bgColor: "bg-blue-900/20" },
    { range: [81, 100], label: "Exceptional Market Opportunity", description: "Your solution targets a growing market with strong demand and limited competition.", icon: Trophy, color: "text-emerald-400", bgColor: "bg-emerald-900/20" }
  ],
  technicalFeasibility: [
    { range: [0, 20], label: "Major Technical Hurdles", description: "Implementation faces severe technical challenges that may be prohibitive.", icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-900/20" },
    { range: [21, 40], label: "Significant Technical Challenges", description: "Your solution requires complex technical work with uncertain outcomes.", icon: AlertCircle, color: "text-orange-500", bgColor: "bg-orange-900/20" },
    { range: [41, 60], label: "Moderate Technical Complexity", description: "Implementation is feasible but will require careful planning and expertise.", icon: HelpCircle, color: "text-yellow-500", bgColor: "bg-yellow-900/20" },
    { range: [61, 80], label: "Technically Sound", description: "Your solution can be built with established technologies and reasonable resources.", icon: Zap, color: "text-blue-400", bgColor: "bg-blue-900/20" },
    { range: [81, 100], label: "Highly Feasible", description: "Implementation is straightforward with minimal technical risk or complexity.", icon: CheckCircle, color: "text-emerald-400", bgColor: "bg-emerald-900/20" }
  ]
};

export default function ScoreInterpretation({ score, type }: ScoreInterpretationProps) {
  // Find the appropriate interpretation based on score range
  const interpretation = interpretations[type].find(
    item => score >= item.range[0] && score <= item.range[1]
  );

  if (!interpretation) return null;

  const Icon = interpretation.icon;

  return (
    <div className={`${interpretation.bgColor} rounded-md p-3 mt-2`}>
      <div className="flex items-start">
        <Icon className={`${interpretation.color} mr-2 h-5 w-5 mt-0.5 flex-shrink-0`} />
        <div>
          <h4 className={`${interpretation.color} font-medium text-sm`}>
            {interpretation.label}
          </h4>
          <p className="text-gray-300 text-xs mt-1">
            {interpretation.description}
          </p>
        </div>
      </div>
    </div>
  );
} 