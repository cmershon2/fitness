// app/api/water-entries/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET all water entries for a specific date
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // FIX: Parse date string as local date without timezone conversion
    const [year, month, day] = dateParam.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const entries = await prisma.waterEntry.findMany({
      where: {
        userId: session.user.id,
        date: date,
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Get user's water goal
    const goal = await prisma.userWaterGoal.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Calculate total for the day in user's preferred unit
    const total = entries.reduce((sum, entry) => {
      // Convert to user's preferred unit if needed
      let amount = entry.amount;
      if (goal && entry.unit !== goal.unit) {
        amount = convertWaterUnit(entry.amount, entry.unit, goal.unit);
      }
      return sum + amount;
    }, 0);

    const response = {
      entries,
      total: Math.round(total),
      unit: goal?.unit || "ml",
      goal: goal?.dailyGoal || null,
      progress: goal ? Math.round((total / goal.dailyGoal) * 100) : 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching water entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch water entries" },
      { status: 500 }
    );
  }
}

// POST create a new water entry
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, unit, date } = body;

    if (!amount || !unit) {
      return NextResponse.json(
        { error: "amount and unit are required" },
        { status: 400 }
      );
    }

    // Validate unit
    const validUnits = ["ml", "oz", "cups"];
    if (!validUnits.includes(unit)) {
      return NextResponse.json({ error: "Invalid unit" }, { status: 400 });
    }

    // FIX: Parse date string correctly to avoid timezone issues
    let entryDate: Date;
    if (date) {
      // Parse YYYY-MM-DD as local date (not UTC)
      const [year, month, day] = date.split("-").map(Number);
      entryDate = new Date(year, month - 1, day);
    } else {
      // Use current local date
      entryDate = new Date();
      entryDate.setHours(0, 0, 0, 0);
    }

    const entry = await prisma.waterEntry.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(amount),
        unit,
        date: entryDate,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating water entry:", error);
    return NextResponse.json(
      { error: "Failed to create water entry" },
      { status: 500 }
    );
  }
}

// Helper function to convert between water units
function convertWaterUnit(
  amount: number,
  fromUnit: string,
  toUnit: string
): number {
  if (fromUnit === toUnit) return amount;

  // Convert to ml first
  let ml = amount;
  if (fromUnit === "oz") {
    ml = amount * 29.5735;
  } else if (fromUnit === "cups") {
    ml = amount * 240;
  }

  // Convert from ml to target unit
  if (toUnit === "oz") {
    return ml / 29.5735;
  } else if (toUnit === "cups") {
    return ml / 240;
  }

  return ml;
}
