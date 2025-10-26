// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date at midnight (local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's weight entry
    const todayWeight = await prisma.weight.findFirst({
      where: {
        userId: session.user.id,
        date: today,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get latest weight (if no weight today)
    const latestWeight = todayWeight
      ? null
      : await prisma.weight.findFirst({
          where: { userId: session.user.id },
          orderBy: { date: "desc" },
        });

    // Get recent weights for chart (last 7 entries)
    const recentWeights = await prisma.weight.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 7,
    });

    // Get today's workouts
    const todaysWorkouts = await prisma.workoutInstance.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: today,
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate workout progress
    const workoutsWithProgress = todaysWorkouts.map((workout) => {
      const totalSets = workout.exercises.reduce(
        (sum, exercise) => sum + exercise.sets.length,
        0
      );
      const completedSets = workout.exercises.reduce(
        (sum, exercise) =>
          sum + exercise.sets.filter((set) => set.completed).length,
        0
      );
      const progressPercentage =
        totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

      return {
        ...workout,
        totalSets,
        completedSets,
        progressPercentage,
      };
    });

    // Get today's diet entries and calculate total calories
    const todaysDietEntries = await prisma.dietEntry.findMany({
      where: {
        userId: session.user.id,
        date: today,
      },
      include: {
        food: true,
      },
    });

    const todayCalories = todaysDietEntries.reduce(
      (sum, entry) => sum + entry.food.calories * entry.servings,
      0
    );

    // Get today's water intake
    const todaysWaterEntries = await prisma.waterEntry.findMany({
      where: {
        userId: session.user.id,
        date: today,
      },
    });

    const todayWater = todaysWaterEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const waterUnit = todaysWaterEntries[0]?.unit || "oz";

    // Get total counts
    const [exerciseCount, templateCount, weightEntryCount, foodCount] =
      await Promise.all([
        prisma.exercise.count({
          where: { userId: session.user.id },
        }),
        prisma.workoutTemplate.count({
          where: { userId: session.user.id },
        }),
        prisma.weight.count({
          where: { userId: session.user.id },
        }),
        prisma.food.count({
          where: { userId: session.user.id },
        }),
      ]);

    // Get recent activities (last 5 weight entries + recent workouts)
    const recentWeightActivities = await prisma.weight.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const recentWorkoutActivities = await prisma.workoutInstance.findMany({
      where: {
        userId: session.user.id,
        status: "completed",
      },
      orderBy: { completedDate: "desc" },
      take: 2,
    });

    // Combine and sort activities by date
    const recentActivities = [
      ...recentWeightActivities.map((w) => ({
        type: "weight" as const,
        date: w.createdAt,
        data: w,
      })),
      ...recentWorkoutActivities.map((w) => ({
        type: "workout" as const,
        date: w.completedDate || w.createdAt,
        data: w,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json({
      todayWeight,
      latestWeight,
      recentWeights,
      todaysWorkouts: workoutsWithProgress,
      todayCalories: Math.round(todayCalories),
      todayWater: Math.round(todayWater),
      waterUnit,
      stats: {
        exercises: exerciseCount,
        templates: templateCount,
        weightEntries: weightEntryCount,
        foods: foodCount,
      },
      recentActivities,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
