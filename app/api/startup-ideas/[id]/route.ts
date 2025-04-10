import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET /api/startup-ideas/[id] - Get a specific startup idea by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const ideaId = params.id;
    
    // Fetch the specific startup idea
    const startupIdea = await prisma.startupIdea.findUnique({
      where: {
        id: ideaId,
      },
    });
    
    // Check if idea exists and belongs to the current user
    if (!startupIdea) {
      return NextResponse.json(
        { error: "Startup idea not found" },
        { status: 404 }
      );
    }
    
    if (startupIdea.userId !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to view this startup idea" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(startupIdea);
  } catch (error: any) {
    console.error("Error fetching startup idea:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch startup idea",
        details: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE /api/startup-ideas/[id] - Delete a specific startup idea
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete startup ideas" },
        { status: 401 }
      );
    }
    
    // Get the user ID
    const userId = session.user.id as string;
    const ideaId = params.id;
    
    // Check if the idea exists and belongs to the user
    const startupIdea = await prisma.startupIdea.findUnique({
      where: {
        id: ideaId,
      },
    });
    
    if (!startupIdea) {
      return NextResponse.json(
        { error: "Startup idea not found" },
        { status: 404 }
      );
    }
    
    if (startupIdea.userId !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to delete this startup idea" },
        { status: 403 }
      );
    }
    
    // Delete the startup idea
    await prisma.startupIdea.delete({
      where: {
        id: ideaId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting startup idea:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete startup idea",
        details: error.message 
      },
      { status: 500 }
    );
  }
} 