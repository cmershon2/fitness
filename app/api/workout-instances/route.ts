// app/api/workout-instances/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET all workout instances for the current user
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const where: any = {
      userId: session.user.id,
    };

    if (date) {
      // FIX: Parse date string as local date without timezone conversion
      const [year, month, day] = date.split("-").map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

      where.scheduledDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (status) {
      where.status = status;
    }

    const instances = await prisma.workoutInstance.findMany({
      where,
      include: {
        exercises: {
          include: {
            sets: true,
          },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { scheduledDate: "desc" },
    });

    return NextResponse.json(instances);
  } catch (error) {
    console.error("Error fetching workout instances:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout instances" },
      { status: 500 }
    );
  }
}

// POST create a new workout instance from a template
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, scheduledDate, notes } = body;

    if (!templateId || !scheduledDate) {
      return NextResponse.json(
        { error: "Template ID and scheduled date are required" },
        { status: 400 }
      );
    }

    // Fetch the template with all exercises
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: templateId, userId: session.user.id },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Create workout instance with snapshot of template data
    const instance = await prisma.workoutInstance.create({
      data: {
        userId: session.user.id,
        templateId: template.id,
        name: template.name,
        description: template.description,
        scheduledDate: new Date(scheduledDate),
        status: "scheduled",
        notes: notes || null,
        exercises: {
          create: template.exercises.map((te) => ({
            exerciseId: te.exerciseId,
            exerciseName: te.exercise.name,
            muscleGroup: te.exercise.muscleGroup,
            orderIndex: te.orderIndex,
            notes: te.notes,
            sets: {
              create: Array.from({ length: te.sets }, (_, i) => ({
                setNumber: i + 1,
                targetReps: te.reps,
                actualReps: null,
                weight: null,
                completed: false,
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    console.error("Error creating workout instance:", error);
    return NextResponse.json(
      { error: "Failed to create workout instance" },
      { status: 500 }
    );
  }
}
