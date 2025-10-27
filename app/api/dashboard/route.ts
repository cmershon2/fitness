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

    const dayStart = new Date();
    const dayEnd = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayEnd.setHours(23, 59, 59, 999);

    // Get today's weight
    const todayWeight = await prisma.weight.findFirst({
      where: {
        userId: session.user.id,
        date: dayStart,
      },
    });

    // Get latest weight if no weight today
    const latestWeight = !todayWeight
      ? await prisma.weight.findFirst({
          where: { userId: session.user.id },
          orderBy: { date: "desc" },
        })
      : null;

    // Get recent weights for chart (last 10 entries)
    const recentWeights = await prisma.weight.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 10,
    });

    // Get today's workouts
    const todaysWorkouts = await prisma.workoutInstance.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: {
          gte: dayStart,
          lte: dayEnd,
        },
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
        (sum, ex) => sum + ex.sets.length,
        0
      );
      const completedSets = workout.exercises.reduce(
        (sum, ex) => sum + ex.sets.filter((set) => set.completed).length,
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

    // Get today's diet entries and calculate total calories and macros
    const todaysDietEntries = await prisma.dietEntry.findMany({
      where: {
        userId: session.user.id,
        date: dayStart,
      },
      include: {
        food: true,
      },
    });

    const todayCalories = todaysDietEntries.reduce(
      (sum, entry) => sum + entry.food.calories * entry.servings,
      0
    );

    // Calculate macros
    const todayProtein = todaysDietEntries.reduce(
      (sum, entry) => sum + (entry.food.protein || 0) * entry.servings,
      0
    );

    const todayCarbs = todaysDietEntries.reduce(
      (sum, entry) => sum + (entry.food.carbs || 0) * entry.servings,
      0
    );

    const todayFat = todaysDietEntries.reduce(
      (sum, entry) => sum + (entry.food.fat || 0) * entry.servings,
      0
    );

    // Get today's water intake
    const todaysWaterEntries = await prisma.waterEntry.findMany({
      where: {
        userId: session.user.id,
        date: dayStart,
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

    // Get recent activities (last 3 weight entries + last 2 workouts)
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
      todayCalories,
      todayProtein,
      todayCarbs,
      todayFat,
      todayWater,
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
