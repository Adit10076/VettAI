import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, provider, providerAccountId } = body;

  if (!email || !provider || !providerAccountId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if account already exists
    const existingAccount = user.accounts.find(acc => 
      acc.provider === provider && acc.providerAccountId === providerAccountId
    );

    if (existingAccount) {
      return NextResponse.json({ 
        success: true, 
        message: "Account already linked" 
      });
    }

    // Link the account
    await prisma.account.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId,
        type: provider === "google" ? "oauth" : "credentials"
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Account linked successfully" 
    });
  } catch (error) {
    console.error("Error linking account:", error);
    return NextResponse.json(
      { error: "Failed to link account" },
      { status: 500 }
    );
  }
} 