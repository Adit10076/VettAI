import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

// GET /api/startup-ideas/[id]
export async function GET(req: NextRequest, context: any) {
  const ideaId = context.params.id;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view startup ideas" },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;

    const startupIdea = await prisma.startupIdea.findUnique({
      where: { id: ideaId },
    });

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
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/startup-ideas/[id]
export async function DELETE(req: NextRequest, context: any) {
  const ideaId = context.params.id;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete startup ideas" },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;

    const startupIdea = await prisma.startupIdea.findUnique({
      where: { id: ideaId },
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

    await prisma.startupIdea.delete({
      where: { id: ideaId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting startup idea:", error);
    return NextResponse.json(
      {
        error: "Failed to delete startup idea",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
