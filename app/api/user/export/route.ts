// app/api/user/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const [
      user,
      weights,
      exercises,
      workoutTemplates,
      workoutInstances,
      foods,
      dietEntries,
      waterEntries,
      waterGoal,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      }),
      prisma.weight.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
      }),
      prisma.exercise.findMany({
        where: { userId: session.user.id },
        orderBy: { name: "asc" },
      }),
      prisma.workoutTemplate.findMany({
        where: { userId: session.user.id },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
          },
        },
      }),
      prisma.workoutInstance.findMany({
        where: { userId: session.user.id },
        include: {
          exercises: {
            include: {
              sets: true,
            },
          },
        },
        orderBy: { scheduledDate: "desc" },
      }),
      prisma.food.findMany({
        where: { userId: session.user.id },
        orderBy: { name: "asc" },
      }),
      prisma.dietEntry.findMany({
        where: { userId: session.user.id },
        include: {
          food: true,
        },
        orderBy: { date: "desc" },
      }),
      prisma.waterEntry.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
      }),
      prisma.userWaterGoal.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user,
      statistics: {
        totalWeightEntries: weights.length,
        totalExercises: exercises.length,
        totalWorkoutTemplates: workoutTemplates.length,
        totalWorkoutInstances: workoutInstances.length,
        totalFoods: foods.length,
        totalDietEntries: dietEntries.length,
        totalWaterEntries: waterEntries.length,
      },
      data: {
        weights,
        exercises,
        workoutTemplates,
        workoutInstances,
        foods,
        dietEntries,
        waterEntries,
        waterGoal,
      },
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="fitness-data-export-${
          new Date().toISOString().split("T")[0]
        }.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
