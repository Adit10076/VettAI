import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// POST /api/startup-ideas - Create a new startup idea entry
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to save a startup idea" },
        { status: 401 }
      );
    }
    
    // Get the user ID
    const userId = session.user.id as string;
    
    // Parse the request body
    let data;
    try {
      data = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const { idea, analysis } = data;
    
    if (!idea || !analysis) {
      console.error("Missing required fields:", { idea: !!idea, analysis: !!analysis });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate required fields in idea and analysis
    const requiredIdeaFields = ['title', 'problem', 'solution', 'audience', 'businessModel'];
    const missingIdeaFields = requiredIdeaFields.filter(field => !idea[field]);
    
    const requiredAnalysisFields = ['score', 'swotAnalysis', 'mvpSuggestions', 'businessModelIdeas', 'risks'];
    const missingAnalysisFields = requiredAnalysisFields.filter(field => !analysis[field]);
    
    if (missingIdeaFields.length > 0 || missingAnalysisFields.length > 0) {
      console.error("Validation failed:", { 
        missingIdeaFields, 
        missingAnalysisFields,
        idea: JSON.stringify(idea),
        analysis: JSON.stringify(analysis)
      });
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: { missingIdeaFields, missingAnalysisFields } 
        },
        { status: 400 }
      );
    }
    
    // Create a new startup idea in the database
    try {
      const startupIdea = await prisma.startupIdea.create({
        data: {
          title: idea.title,
          problem: idea.problem,
          solution: idea.solution,
          audience: idea.audience,
          businessModel: idea.businessModel,
          
          // Analysis results
          overallScore: analysis.score.overall,
          marketPotentialScore: analysis.score.marketPotential,
          technicalFeasibilityScore: analysis.score.technicalFeasibility,
          
          // Store complex objects as JSON
          swotAnalysis: analysis.swotAnalysis,
          mvpSuggestions: analysis.mvpSuggestions,
          businessModelIdeas: analysis.businessModelIdeas,
          risks: analysis.risks || {},
          
          // Link to user
          userId: userId,
        },
      });
      
      return NextResponse.json({ success: true, id: startupIdea.id }, { status: 201 });
    } catch (dbError: any) {
      console.error("Database error saving startup idea:", dbError);
      return NextResponse.json(
        { 
          error: "Database error saving startup idea", 
          details: dbError.message 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error saving startup idea:", error);
    return NextResponse.json(
      { 
        error: "Failed to save startup idea",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET /api/startup-ideas - Get all startup ideas for current user
export async function GET() {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view startup ideas" },
        { status: 401 }
      );
    }
    
    // Get the user ID
    const userId = session.user.id as string;
    
    // Fetch all startup ideas for this user
    const startupIdeas = await prisma.startupIdea.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(startupIdeas);
  } catch (error: any) {
    console.error("Error fetching startup ideas:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch startup ideas",
        details: error.message
      },
      { status: 500 }
    );
  }
} 