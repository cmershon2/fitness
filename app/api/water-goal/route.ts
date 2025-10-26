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
      // Fetch user preferences to get default water unit
      let defaultWaterUnit = "ml"; // fallback default
      let defaultGoalAmount = 2000; // fallback default in ml

      try {
        const preferences = await prisma.userPreferences.findUnique({
          where: { userId: session.user.id },
        });

        if (preferences && preferences.defaultWaterUnit) {
          defaultWaterUnit = preferences.defaultWaterUnit;

          // Adjust default goal amount based on unit
          if (defaultWaterUnit === "oz") {
            defaultGoalAmount = 64; // ~1.9L in oz
          } else if (defaultWaterUnit === "cups") {
            defaultGoalAmount = 8; // ~1.9L in cups
          }
        }
      } catch (error) {
        // If UserPreferences table doesn't exist or there's an error, use defaults
        console.log(
          "Could not fetch user preferences, using default unit:",
          error
        );
      }

      // Return default goal with user's preferred unit
      return NextResponse.json({
        dailyGoal: defaultGoalAmount,
        unit: defaultWaterUnit,
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
