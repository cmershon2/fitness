// API Route: /api/user/preferences
// GET - Fetch user preferences
// PUT - Update user preferences

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Note: You'll need to add UserPreferences model to your Prisma schema
// See implementation guide for schema details

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if UserPreferences model exists in your schema
    // If not, return default preferences
    try {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: session.user.id },
      });

      if (preferences) {
        return NextResponse.json({
          defaultWeightUnit: preferences.defaultWeightUnit,
          defaultWaterUnit: preferences.defaultWaterUnit,
        });
      }
    } catch (error) {
      // UserPreferences table doesn't exist yet - return defaults
      console.log("UserPreferences table not found, returning defaults");
    }

    // Return default preferences if no record exists or table doesn't exist
    return NextResponse.json({
      defaultWeightUnit: "kg",
      defaultWaterUnit: "ml",
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { defaultWeightUnit, defaultWaterUnit } = body;

    // Validate units
    const validWeightUnits = ["kg", "lbs"];
    const validWaterUnits = ["ml", "oz", "cups"];

    if (!validWeightUnits.includes(defaultWeightUnit)) {
      return NextResponse.json(
        { error: "Invalid weight unit" },
        { status: 400 }
      );
    }

    if (!validWaterUnits.includes(defaultWaterUnit)) {
      return NextResponse.json(
        { error: "Invalid water unit" },
        { status: 400 }
      );
    }

    try {
      // Try to upsert preferences
      const updatedPreferences = await prisma.userPreferences.upsert({
        where: { userId: session.user.id },
        update: {
          defaultWeightUnit,
          defaultWaterUnit,
        },
        create: {
          userId: session.user.id,
          defaultWeightUnit,
          defaultWaterUnit,
        },
      });

      return NextResponse.json({
        defaultWeightUnit: updatedPreferences.defaultWeightUnit,
        defaultWaterUnit: updatedPreferences.defaultWaterUnit,
      });
    } catch (error) {
      // UserPreferences table doesn't exist yet
      console.error("UserPreferences table not found:", error);
      return NextResponse.json(
        {
          error:
            "Preferences table not set up yet. Please run: npx prisma migrate dev",
          defaultWeightUnit,
          defaultWaterUnit,
        },
        { status: 200 } // Return 200 with the values they tried to save
      );
    }
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
