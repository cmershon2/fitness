// app/api/diet-entries/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET a single diet entry
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

    const entry = await prisma.dietEntry.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
      include: {
        food: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Diet entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching diet entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch diet entry" },
      { status: 500 }
    );
  }
}

// PATCH update a diet entry
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

    // Verify entry exists and belongs to user
    const existing = await prisma.dietEntry.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Diet entry not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { mealCategory, servings, notes } = body;

    // Validate meal category if provided
    if (mealCategory) {
      const validCategories = ["breakfast", "lunch", "snack", "dinner"];
      if (!validCategories.includes(mealCategory)) {
        return NextResponse.json(
          { error: "Invalid meal category" },
          { status: 400 }
        );
      }
    }

    const entry = await prisma.dietEntry.update({
      where: {
        id: (await params).id,
      },
      data: {
        ...(mealCategory && { mealCategory }),
        ...(servings !== undefined && { servings }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
      include: {
        food: true,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error updating diet entry:", error);
    return NextResponse.json(
      { error: "Failed to update diet entry" },
      { status: 500 }
    );
  }
}

// DELETE a diet entry
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

    // Verify entry exists and belongs to user
    const existing = await prisma.dietEntry.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Diet entry not found" },
        { status: 404 }
      );
    }

    await prisma.dietEntry.delete({
      where: {
        id: (await params).id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting diet entry:", error);
    return NextResponse.json(
      { error: "Failed to delete diet entry" },
      { status: 500 }
    );
  }
}
