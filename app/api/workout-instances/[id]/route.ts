// app/api/workout-instances/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET a specific workout instance
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

    const instance = await prisma.workoutInstance.findUnique({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
      include: {
        exercises: {
          include: {
            sets: {
              orderBy: { setNumber: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: "Workout instance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error("Error fetching workout instance:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout instance" },
      { status: 500 }
    );
  }
}

// PATCH update workout instance (e.g., mark as complete, change status)
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
    const { status, notes, completedDate } = body;

    // Verify ownership
    const existing = await prisma.workoutInstance.findUnique({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Workout instance not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // If marking as completed, set completedDate to now
    if (status === "completed" && !completedDate) {
      updateData.completedDate = new Date();
    } else if (completedDate) {
      updateData.completedDate = new Date(completedDate);
    }

    const updated = await prisma.workoutInstance.update({
      where: { id: (await params).id },
      data: updateData,
      include: {
        exercises: {
          include: {
            sets: {
              orderBy: { setNumber: "asc" },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating workout instance:", error);
    return NextResponse.json(
      { error: "Failed to update workout instance" },
      { status: 500 }
    );
  }
}

// DELETE a workout instance
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
    const existing = await prisma.workoutInstance.findUnique({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Workout instance not found" },
        { status: 404 }
      );
    }

    await prisma.workoutInstance.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({
      message: "Workout instance deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workout instance:", error);
    return NextResponse.json(
      { error: "Failed to delete workout instance" },
      { status: 500 }
    );
  }
}
