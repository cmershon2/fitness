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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's weight
    const todayWeight = await prisma.weight.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { date: "desc" },
    });

    // Get latest weight if no weight today
    const latestWeight = !todayWeight
      ? await prisma.weight.findFirst({
          where: { userId: session.user.id },
          orderBy: { date: "desc" },
        })
      : null;

    // Get recent weight entries (last 7)
    const recentWeights = await prisma.weight.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 7,
    });

    // Get today's scheduled workouts (Sprint 3)
    const todaysWorkouts = await prisma.workoutInstance.findMany({
      where: {
        userId: session.user.id,
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ["scheduled", "in-progress"],
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
      orderBy: { scheduledDate: "asc" },
    });

    // Calculate workout progress for each workout
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
