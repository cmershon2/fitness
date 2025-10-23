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

    // Get total counts
    const [exerciseCount, templateCount, weightEntryCount] = await Promise.all([
      prisma.exercise.count({
        where: { userId: session.user.id },
      }),
      prisma.workoutTemplate.count({
        where: { userId: session.user.id },
      }),
      prisma.weight.count({
        where: { userId: session.user.id },
      }),
    ]);

    // Get recent activities (last 5 weight entries)
    const recentActivities = await prisma.weight.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      todayWeight,
      latestWeight,
      recentWeights,
      stats: {
        exercises: exerciseCount,
        templates: templateCount,
        weightEntries: weightEntryCount,
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
