// app/api/foods/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET all foods for the current user
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = {
      userId: session.user.id,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const foods = await prisma.food.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    return NextResponse.json(
      { error: "Failed to fetch foods" },
      { status: 500 }
    );
  }
}

// POST create a new food entry
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      brand,
      barcode,
      calories,
      protein,
      carbs,
      fat,
      servingSize,
      servingUnit,
      source,
    } = body;

    if (!name || calories === undefined) {
      return NextResponse.json(
        { error: "Name and calories are required" },
        { status: 400 }
      );
    }

    // Check if barcode already exists for this user
    if (barcode) {
      const existing = await prisma.food.findFirst({
        where: {
          userId: session.user.id,
          barcode,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Food with this barcode already exists" },
          { status: 409 }
        );
      }
    }

    const food = await prisma.food.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        brand: brand?.trim() || null,
        barcode: barcode || null,
        calories: parseInt(calories),
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        servingSize: servingSize?.trim() || null,
        servingUnit: servingUnit?.trim() || null,
        source: source || "manual",
      },
    });

    return NextResponse.json(food, { status: 201 });
  } catch (error) {
    console.error("Error creating food:", error);
    return NextResponse.json(
      { error: "Failed to create food" },
      { status: 500 }
    );
  }
}
