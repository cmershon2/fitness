// app/api/weights/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET all weight entries for the current user
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const weights = await prisma.weight.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json(weights);
  } catch (error) {
    console.error("Error fetching weights:", error);
    return NextResponse.json(
      { error: "Failed to fetch weights" },
      { status: 500 }
    );
  }
}

// POST create a new weight entry
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weight, unit, date, notes } = body;

    if (!weight || !unit) {
      return NextResponse.json(
        { error: "Weight and unit are required" },
        { status: 400 }
      );
    }

    // FIX: Parse date correctly to avoid timezone issues
    let entryDate: Date;
    if (date) {
      // Parse YYYY-MM-DD as local date (not UTC)
      const [year, month, day] = date.split("-").map(Number);
      entryDate = new Date(year, month - 1, day);
    } else {
      // Use current local date
      entryDate = new Date();
    }

    const weightEntry = await prisma.weight.create({
      data: {
        userId: session.user.id,
        weight: parseFloat(weight),
        unit,
        date: entryDate,
        notes: notes || null,
      },
    });

    return NextResponse.json(weightEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating weight:", error);
    return NextResponse.json(
      { error: "Failed to create weight entry" },
      { status: 500 }
    );
  }
}
