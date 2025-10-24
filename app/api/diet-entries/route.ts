// app/api/diet-entries/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET all diet entries for a specific date
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

    const date = new Date(dateParam);
    date.setHours(0, 0, 0, 0);

    const entries = await prisma.dietEntry.findMany({
      where: {
        userId: session.user.id,
        date: date,
      },
      include: {
        food: true,
      },
      orderBy: [{ mealCategory: "asc" }, { createdAt: "asc" }],
    });

    // Group by meal category and calculate totals
    const grouped = {
      breakfast: entries.filter((e) => e.mealCategory === "breakfast"),
      lunch: entries.filter((e) => e.mealCategory === "lunch"),
      snack: entries.filter((e) => e.mealCategory === "snack"),
      dinner: entries.filter((e) => e.mealCategory === "dinner"),
    };

    const totals = {
      breakfast: grouped.breakfast.reduce(
        (sum, e) => sum + e.food.calories * e.servings,
        0
      ),
      lunch: grouped.lunch.reduce(
        (sum, e) => sum + e.food.calories * e.servings,
        0
      ),
      snack: grouped.snack.reduce(
        (sum, e) => sum + e.food.calories * e.servings,
        0
      ),
      dinner: grouped.dinner.reduce(
        (sum, e) => sum + e.food.calories * e.servings,
        0
      ),
    };

    const dailyTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);

    return NextResponse.json({
      entries: grouped,
      totals,
      dailyTotal: Math.round(dailyTotal),
    });
  } catch (error) {
    console.error("Error fetching diet entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch diet entries" },
      { status: 500 }
    );
  }
}

// POST create a new diet entry
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { foodId, date, mealCategory, servings, notes } = body;

    if (!foodId || !date || !mealCategory) {
      return NextResponse.json(
        { error: "foodId, date, and mealCategory are required" },
        { status: 400 }
      );
    }

    // Validate meal category
    const validCategories = ["breakfast", "lunch", "snack", "dinner"];
    if (!validCategories.includes(mealCategory)) {
      return NextResponse.json(
        { error: "Invalid meal category" },
        { status: 400 }
      );
    }

    // Verify food exists and belongs to user
    const food = await prisma.food.findFirst({
      where: {
        id: foodId,
        userId: session.user.id,
      },
    });

    if (!food) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    const entry = await prisma.dietEntry.create({
      data: {
        userId: session.user.id,
        foodId,
        date: entryDate,
        mealCategory,
        servings: servings || 1,
        notes: notes?.trim() || null,
      },
      include: {
        food: true,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating diet entry:", error);
    return NextResponse.json(
      { error: "Failed to create diet entry" },
      { status: 500 }
    );
  }
}
