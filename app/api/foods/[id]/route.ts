// app/api/foods/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET a specific food item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const food = await prisma.food.findUnique({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!food) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    return NextResponse.json(food);
  } catch (error) {
    console.error("Error fetching food:", error);
    return NextResponse.json(
      { error: "Failed to fetch food" },
      { status: 500 }
    );
  }
}

// PATCH update a food item
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    } = body;

    // Verify ownership
    const existing = await prisma.food.findUnique({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name) updateData.name = name.trim();
    if (brand !== undefined) updateData.brand = brand?.trim() || null;
    if (barcode !== undefined) updateData.barcode = barcode || null;
    if (calories !== undefined) updateData.calories = parseInt(calories);
    if (protein !== undefined)
      updateData.protein = protein ? parseFloat(protein) : null;
    if (carbs !== undefined)
      updateData.carbs = carbs ? parseFloat(carbs) : null;
    if (fat !== undefined) updateData.fat = fat ? parseFloat(fat) : null;
    if (servingSize !== undefined)
      updateData.servingSize = servingSize?.trim() || null;
    if (servingUnit !== undefined)
      updateData.servingUnit = servingUnit?.trim() || null;

    const updated = await prisma.food.update({
      where: { id: (await params).id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating food:", error);
    return NextResponse.json(
      { error: "Failed to update food" },
      { status: 500 }
    );
  }
}

// DELETE a food item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership before deleting
    const existing = await prisma.food.findUnique({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    await prisma.food.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("Error deleting food:", error);
    return NextResponse.json(
      { error: "Failed to delete food" },
      { status: 500 }
    );
  }
}
