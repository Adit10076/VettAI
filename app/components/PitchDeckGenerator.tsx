import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, PresentationIcon } from 'lucide-react';

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

interface PitchDeckGeneratorProps {
  idea: StartupIdea;
  analysis: StartupEvaluation;
  className?: string;
}

const PitchDeckGenerator = ({ idea, analysis, className }: PitchDeckGeneratorProps) => {
  // Generate a tagline based on the idea
  const generateTagline = () => {
    const taglines = [
      `Transforming how ${idea.audience} ${idea.problem.toLowerCase().includes('manage') ? 'manage' : 'approach'} ${idea.title.split(' ')[0]}`,
      `The future of ${idea.title.split(' ')[0]} for ${idea.audience}`,
      `${idea.solution.split(' ').slice(0, 3).join(' ')}... and beyond`,
      `Revolutionizing ${idea.title.split(' ')[0]} for the modern world`,
      `${idea.title.split(' ')[0]}: Simplified. Reimagined. Perfected.`
    ];
    return taglines[Math.floor(Math.random() * taglines.length)];
  };

  // Generate team members based on the idea
  const generateTeam = () => {
    const domains = idea.title.toLowerCase().split(' ');
    const techDomain = domains.find(word => 
      ['tech', 'software', 'app', 'platform', 'ai', 'digital', 'web', 'mobile'].includes(word)
    ) || 'technology';
    
    return [
      {
        name: "Alex Morgan",
        title: "CEO & Co-Founder",
        background: `15+ years experience in ${techDomain} and startup leadership. Former VP at InnovateCorp.`
      },
      {
        name: "Jamie Chen",
        title: "CTO & Co-Founder",
        background: `Engineering leader with expertise in scalable ${techDomain} solutions. Ex-Google, Stanford CS.`
      },
      {
        name: "Taylor Williams",
        title: "Head of Product",
        background: `Product strategist specializing in ${idea.audience}-focused solutions. Previously led product at StartupX.`
      },
      {
        name: "Jordan Smith",
        title: "Head of Marketing",
        background: `10+ years in ${techDomain} marketing with proven growth strategies for early-stage startups.`
      }
    ];
  };

  // Generate market size projections
  const generateMarketData = () => {
    const baseMarket = Math.floor(analysis.score.marketPotential * 100) * 10;
    const growth = (analysis.score.overall / 20) + 0.1;
    
    return {
      tam: baseMarket,
      sam: Math.floor(baseMarket * 0.3),
      som: Math.floor(baseMarket * 0.05),
      cagr: Math.floor(growth * 100) / 10
    };
  };

  // Generate financial projections
  const generateFinancials = () => {
    const market = generateMarketData();
    const initialRevenue = market.som * 0.01;
    const growthRate = 1 + (analysis.score.overall / 25);
    
    return {
      year1: {
        revenue: initialRevenue,
        costs: initialRevenue * 2,
        profit: -initialRevenue
      },
      year2: {
        revenue: initialRevenue * growthRate,
        costs: initialRevenue * growthRate * 1.2,
        profit: initialRevenue * growthRate * -0.2
      },
      year3: {
        revenue: initialRevenue * growthRate * growthRate,
        costs: initialRevenue * growthRate * growthRate * 0.7,
        profit: initialRevenue * growthRate * growthRate * 0.3
      }
    };
  };

  // Get competitors based on SWOT analysis
  const getCompetitors = () => {
    const threats = analysis.swotAnalysis.threats;
    const competitors = [];
    
    // Extract competitor mentions from threats
    for (const threat of threats) {
      if (threat.toLowerCase().includes('competitor') || 
          threat.toLowerCase().includes('competition') ||
          threat.toLowerCase().includes('market leader')) {
        competitors.push(threat);
      }
    }
    
    // If no specific competitors mentioned, create generic ones
    if (competitors.length === 0) {
      return [
        {
          name: "MarketLeader Inc.",
          strengths: "Established brand, large customer base",
          weaknesses: "Legacy technology, slow innovation cycle"
        },
        {
          name: "TechDisruptor",
          strengths: "Innovative features, modern UX",
          weaknesses: "Limited market reach, narrow feature set"
        },
        {
          name: "Enterprise Solution Co.",
          strengths: "Enterprise relationships, comprehensive offering",
          weaknesses: "Expensive, complex implementation"
        }
      ];
    }
    
    return competitors;
  };

  // Generate pitch deck PDF
  const generatePitchDeck = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = idea.title;
    const tagline = generateTagline();
    const team = generateTeam();
    const market = generateMarketData();
    const financials = generateFinancials();
    
    // Helper for centered text
    const centerText = (text: string, y: number, size = 24, color = [41, 128, 185]) => {
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, pageWidth / 2, y, { align: 'center' });
    };
    
    // Helper for section titles
    const sectionTitle = (text: string, y: number) => {
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.text(text, 14, y);
      doc.setLineWidth(0.5);
      doc.setDrawColor(41, 128, 185);
      doc.line(14, y + 2, pageWidth - 14, y + 2);
      return y + 10;
    };
    
    // Helper for normal text
    const normalText = (text: string, y: number, size = 12) => {
      doc.setFontSize(size);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(text, pageWidth - 28);
      doc.text(lines, 14, y);
      return y + (lines.length * (size * 0.35)) + 4;
    };
    
    // 1. TITLE SLIDE
    centerText(`${title}`, 90);
    centerText(tagline, 110, 16, [100, 100, 100]);
    centerText("Pitch Deck", 150, 14, [150, 150, 150]);
    doc.addPage();
    
    // 2. PROBLEM
    let y = sectionTitle("THE PROBLEM", 20);
    y = normalText(`${idea.problem}`, y);
    
    y += 10;
    y = normalText("Who experiences this problem:", y, 14);
    y = normalText(`${idea.audience}`, y);
    
    y += 10;
    y = normalText("Why it's critical to solve:", y, 14);
    const painPoints = analysis.swotAnalysis.opportunities.slice(0, 2);
    for (const point of painPoints) {
      y = normalText(`• ${point}`, y);
    }
    doc.addPage();
    
    // 3. SOLUTION
    y = sectionTitle("OUR SOLUTION", 20);
    y = normalText(`${idea.solution}`, y);
    
    y += 10;
    y = normalText("Key Strengths:", y, 14);
    for (const strength of analysis.swotAnalysis.strengths.slice(0, 3)) {
      y = normalText(`• ${strength}`, y);
    }
    doc.addPage();
    
    // 4. MARKET OPPORTUNITY
    y = sectionTitle("MARKET OPPORTUNITY", 20);
    
    // Market size visualization
    doc.setFillColor(52, 152, 219); // Blue
    doc.rect(20, y, 120, 60, 'F');
    doc.setFillColor(41, 128, 185); // Darker blue
    doc.rect(40, y + 10, 80, 40, 'F');
    doc.setFillColor(31, 97, 141); // Even darker blue
    doc.rect(60, y + 20, 40, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`TAM: $${market.tam}M`, 80, y + 15, { align: 'center' });
    doc.text(`SAM: $${market.sam}M`, 80, y + 30, { align: 'center' });
    doc.text(`SOM: $${market.som}M`, 80, y + 45, { align: 'center' });
    
    y += 70;
    y = normalText(`Market Growth: ${market.cagr}% CAGR expected over the next 5 years`, y);
    y = normalText(`Key Trend: ${analysis.swotAnalysis.opportunities[0]}`, y + 5);
    doc.addPage();
    
    // 5. PRODUCT OVERVIEW
    y = sectionTitle("PRODUCT OVERVIEW", 20);
    
    // MVP Features
    y = normalText("Core Features:", y, 14);
    for (const feature of analysis.mvpSuggestions) {
      y = normalText(`• ${feature}`, y);
    }
    
    y += 10;
    y = normalText("Technology Stack:", y, 14);
    y = normalText("• Modern cloud architecture with scalability built-in", y);
    y = normalText("• AI-powered analytics for personalized experiences", y);
    y = normalText("• Mobile-first responsive design", y);
    y = normalText("• Industry-standard security protocols", y);
    doc.addPage();
    
    // 6. BUSINESS MODEL
    y = sectionTitle("BUSINESS MODEL", 20);
    
    for (const model of analysis.businessModelIdeas.slice(0, 3)) {
      y = normalText(`• ${model}`, y);
    }
    
    y += 10;
    y = normalText("Revenue Streams:", y, 14);
    
    if (analysis.businessModelIdeas.some(m => m.toLowerCase().includes('subscription'))) {
      y = normalText("• Subscription Revenue: Tiered monthly/annual plans", y);
    }
    if (analysis.businessModelIdeas.some(m => m.toLowerCase().includes('freemium'))) {
      y = normalText("• Premium Features: Upgrades and add-ons", y);
    }
    if (analysis.businessModelIdeas.some(m => m.toLowerCase().includes('enterprise'))) {
      y = normalText("• Enterprise Contracts: Custom solutions for large clients", y);
    }
    
    y += 10;
    const monthlyPrice = Math.floor((analysis.score.marketPotential / 10) + 9.99);
    y = normalText(`Starting Price Point: $${monthlyPrice}/month per user`, y);
    doc.addPage();
    
    // 7. GO-TO-MARKET STRATEGY
    y = sectionTitle("GO-TO-MARKET STRATEGY", 20);
    
    // Marketing channels
    y = normalText("Customer Acquisition Channels:", y, 14);
    y = normalText("• Content Marketing & SEO: Establish thought leadership", y);
    y = normalText("• Targeted Social Media: Reach ideal customers directly", y);
    y = normalText("• Strategic Partnerships: Co-marketing with complementary solutions", y);
    y = normalText("• Referral Program: Incentivize customer advocacy", y);
    
    y += 10;
    y = normalText("Growth Phases:", y, 14);
    y = normalText("1. Alpha Launch: Private beta with key early adopters", y);
    y = normalText("2. Public Beta: Limited feature set, gather feedback", y);
    y = normalText("3. Full Launch: Complete MVP with core value proposition", y);
    y = normalText("4. Expansion: New features and market segments", y);
    doc.addPage();
    
    // 8. COMPETITIVE LANDSCAPE
    y = sectionTitle("COMPETITIVE LANDSCAPE", 20);
    
    const competitors = getCompetitors();
    
    // Competitive matrix
    autoTable(doc, {
      startY: y,
      head: [['Features', title, 'Competitor A', 'Competitor B']],
      body: [
        ['Core Solution', '✓✓✓', '✓✓', '✓'],
        ['User Experience', '✓✓✓', '✓', '✓✓'],
        ['Innovation', '✓✓✓', '✓', '✓'],
        ['Pricing', '✓✓', '✓', '✓✓✓'],
        ['Enterprise Ready', '✓✓', '✓✓✓', '✓'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    y = (doc as any).lastAutoTable.finalY + 15;
    
    y = normalText("Our Competitive Edge:", y, 14);
    for (const strength of analysis.swotAnalysis.strengths.slice(0, 2)) {
      y = normalText(`• ${strength}`, y);
    }
    doc.addPage();
    
    // 9. TRACTION
    y = sectionTitle("TRACTION & MILESTONES", 20);
    
    // Milestones table
    autoTable(doc, {
      startY: y,
      head: [['Timeline', 'Milestone']],
      body: [
        ['Q1', 'Product MVP development completed'],
        ['Q2', 'Alpha launch with 50 pilot customers'],
        ['Q3', 'Public beta with 500+ users'],
        ['Q4', 'Full launch and first paying customers'],
        ['Year 2 Q2', '$100K MRR milestone'],
        ['Year 3 Q1', 'International expansion begins'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    y = (doc as any).lastAutoTable.finalY + 15;
    
    // User metrics
    y = normalText("Projected User Growth:", y, 14);
    y = normalText("• Year 1: 5,000+ active users", y);
    y = normalText("• Year 2: 20,000+ active users", y);
    y = normalText("• Year 3: 75,000+ active users", y);
    doc.addPage();
    
    // 10. TEAM
    y = sectionTitle("THE TEAM", 20);
    
    for (const member of team) {
      y = normalText(`${member.name} - ${member.title}`, y, 14);
      y = normalText(member.background, y);
      y += 5;
    }
    
    y += 10;
    y = normalText("Advisors:", y, 14);
    y = normalText("• Dr. Sarah Johnson - Industry Expert in " + idea.title.split(' ')[0], y);
    y = normalText("• Michael Chen - Venture Partner at Innovation Capital", y);
    doc.addPage();
    
    // 11. FINANCIALS
    y = sectionTitle("FINANCIAL PROJECTIONS", 20);
    
    // Financial table
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Year 1', 'Year 2', 'Year 3']],
      body: [
        ['Revenue', `$${Math.round(financials.year1.revenue)}K`, `$${Math.round(financials.year2.revenue)}K`, `$${Math.round(financials.year3.revenue)}K`],
        ['Costs', `$${Math.round(financials.year1.costs)}K`, `$${Math.round(financials.year2.costs)}K`, `$${Math.round(financials.year3.costs)}K`],
        ['Profit', `$${Math.round(financials.year1.profit)}K`, `$${Math.round(financials.year2.profit)}K`, `$${Math.round(financials.year3.profit)}K`],
        ['Users', '5,000+', '20,000+', '75,000+'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    y = (doc as any).lastAutoTable.finalY + 15;
    
    y = normalText("Key Metrics:", y, 14);
    y = normalText(`• Customer Acquisition Cost (CAC): $${Math.floor(financials.year1.costs / 5000 * 0.4)}`, y);
    y = normalText(`• Lifetime Value (LTV): $${Math.floor((monthlyPrice * 12) * 2)}`, y);
    y = normalText(`• Break-even Point: ${financials.year3.profit > 0 ? 'Year 3' : 'Year 4'}`, y);
    doc.addPage();
    
    // 12. ASK
    y = sectionTitle("THE ASK", 20);
    
    // Funding needed based on score
    const fundingNeeded = Math.round((analysis.score.overall / 20) * 500) * 10;
    y = normalText(`We are raising $${fundingNeeded}K in seed funding to achieve our vision.`, y, 16);
    
    y += 15;
    y = normalText("Use of Funds:", y, 14);
    y = normalText(`• Product Development: ${Math.floor(fundingNeeded * 0.4)}K (40%)`, y);
    y = normalText(`• Marketing & Sales: ${Math.floor(fundingNeeded * 0.3)}K (30%)`, y);
    y = normalText(`• Operations: ${Math.floor(fundingNeeded * 0.2)}K (20%)`, y);
    y = normalText(`• Reserve: ${Math.floor(fundingNeeded * 0.1)}K (10%)`, y);
    
    y += 15;
    y = normalText("Our Roadmap Goals:", y, 14);
    for (const goal of analysis.mvpSuggestions.slice(0, 3)) {
      y = normalText(`• ${goal}`, y);
    }
    
    // Add footer with page numbers
    const totalPages = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      
      if (i > 1) { // Don't add page number to title slide
        doc.text(
          `${i} / ${totalPages}`,
          pageWidth - 20,
          doc.internal.pageSize.getHeight() - 10
        );
      }
      
      // Add company name to bottom left except on title slide
      if (i > 1) {
        doc.text(
          title,
          20,
          doc.internal.pageSize.getHeight() - 10
        );
      }
    }
    
    // Save PDF
    doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}-pitch-deck.pdf`);
  };

  return (
    <button
      onClick={generatePitchDeck}
      className={`bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center ${className || ''}`}
    >
      <PresentationIcon size={16} className="mr-2" />
      Download Pitch Deck
    </button>
  );
};

export default PitchDeckGenerator; 