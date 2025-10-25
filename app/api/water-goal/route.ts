// app/api/water-goal/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET user's water goal
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goal = await prisma.userWaterGoal.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!goal) {
      // Return default goal if not set
      return NextResponse.json({
        dailyGoal: 2000,
        unit: "ml",
      });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error fetching water goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch water goal" },
      { status: 500 }
    );
  }
}

// POST/PUT set or update water goal
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dailyGoal, unit } = body;

    if (!dailyGoal || !unit) {
      return NextResponse.json(
        { error: "dailyGoal and unit are required" },
        { status: 400 }
      );
    }

    // Validate unit
    const validUnits = ["ml", "oz", "cups"];
    if (!validUnits.includes(unit)) {
      return NextResponse.json({ error: "Invalid unit" }, { status: 400 });
    }

    const goal = await prisma.userWaterGoal.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        dailyGoal: parseFloat(dailyGoal),
        unit,
      },
      create: {
        userId: session.user.id,
        dailyGoal: parseFloat(dailyGoal),
        unit,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error setting water goal:", error);
    return NextResponse.json(
      { error: "Failed to set water goal" },
      { status: 500 }
    );
  }
}
