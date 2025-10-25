// app/api/weights/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// PUT update a weight entry
export async function PUT(
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

    const { id } = await params;
    const body = await request.json();
    const { weight, unit, date, notes } = body;

    // Verify ownership
    const existingWeight = await prisma.weight.findUnique({
      where: { id },
    });

    if (!existingWeight || existingWeight.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // FIX: Parse date correctly to avoid timezone issues
    let parsedDate: Date;
    if (date) {
      if (typeof date === "string" && date.includes("-")) {
        // Parse YYYY-MM-DD as local date
        const [year, month, day] = date.split("-").map(Number);
        parsedDate = new Date(year, month - 1, day);
      } else {
        // Fallback for other formats
        parsedDate = new Date(date);
      }
    } else {
      parsedDate = existingWeight.date;
    }

    const updatedWeight = await prisma.weight.update({
      where: { id },
      data: {
        weight: weight ? parseFloat(weight) : existingWeight.weight,
        unit: unit || existingWeight.unit,
        date: parsedDate,
        notes: notes !== undefined ? notes : existingWeight.notes,
      },
    });

    return NextResponse.json(updatedWeight);
  } catch (error) {
    console.error("Error updating weight:", error);
    return NextResponse.json(
      { error: "Failed to update weight" },
      { status: 500 }
    );
  }
}

// DELETE a weight entry
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

    const { id } = await params;

    // Verify ownership
    const existingWeight = await prisma.weight.findUnique({
      where: { id },
    });

    if (!existingWeight || existingWeight.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.weight.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Weight deleted successfully" });
  } catch (error) {
    console.error("Error deleting weight:", error);
    return NextResponse.json(
      { error: "Failed to delete weight" },
      { status: 500 }
    );
  }
}
