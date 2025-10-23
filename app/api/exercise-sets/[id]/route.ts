// app/api/exercise-sets/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// PATCH update an exercise set (log actual reps and weight)
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
    const { actualReps, weight, unit, completed } = body;

    // Verify ownership through the chain: set -> instance exercise -> workout instance -> user
    const existingSet = await prisma.exerciseSet.findUnique({
      where: { id: (await params).id },
      include: {
        instanceExercise: {
          include: {
            workoutInstance: true,
          },
        },
      },
    });

    if (!existingSet) {
      return NextResponse.json(
        { error: "Exercise set not found" },
        { status: 404 }
      );
    }

    if (
      existingSet.instanceExercise.workoutInstance.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateData: any = {};

    if (actualReps !== undefined) updateData.actualReps = actualReps;
    if (weight !== undefined) updateData.weight = weight;
    if (unit !== undefined) updateData.unit = unit;
    if (completed !== undefined) updateData.completed = completed;

    const updated = await prisma.exerciseSet.update({
      where: { id: (await params).id },
      data: updateData,
    });

    // If this is a completion, also update the workout instance status to "in-progress" if it's still "scheduled"
    if (
      completed &&
      existingSet.instanceExercise.workoutInstance.status === "scheduled"
    ) {
      await prisma.workoutInstance.update({
        where: { id: existingSet.instanceExercise.workoutInstance.id },
        data: { status: "in-progress" },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating exercise set:", error);
    return NextResponse.json(
      { error: "Failed to update exercise set" },
      { status: 500 }
    );
  }
}
