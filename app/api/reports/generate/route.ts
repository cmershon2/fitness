// app/api/reports/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

interface ReportOptions {
  includeWeight: boolean;
  includeWorkouts: boolean;
  includeDiet: boolean;
  includeWater: boolean;
}

interface ReportData {
  date: Date;
  user: { name: string | null; email: string };
  weight?: {
    weight: number;
    unit: string;
    notes?: string | null;
  };
  workouts: Array<{
    name: string;
    status: string;
    completedDate: Date | null;
    exercises: Array<{
      exerciseName: string;
      sets: Array<{
        setNumber: number;
        targetReps: number;
        actualReps: number | null;
        weight: number | null;
        unit: string;
        completed: boolean;
      }>;
    }>;
  }>;
  diet: {
    breakfast: Array<{ foodName: string; servings: number; calories: number }>;
    lunch: Array<{ foodName: string; servings: number; calories: number }>;
    snack: Array<{ foodName: string; servings: number; calories: number }>;
    dinner: Array<{ foodName: string; servings: number; calories: number }>;
    totalCalories: number;
  };
  water?: {
    total: number;
    unit: string;
    goal?: number;
    progress?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, options } = body as {
      date: string; // YYYY-MM-DD format
      options: ReportOptions;
    };

    // Parse the date string as local date (YYYY-MM-DD)
    // This avoids timezone conversion issues
    const [year, month, day] = date.split("-").map(Number);
    const reportDate = new Date(year, month - 1, day);

    // Create a date-only string for database comparison (YYYY-MM-DD)
    const dateString = format(reportDate, "yyyy-MM-dd");

    // Create start and end of day for date range queries
    // Using local time to avoid timezone shifts
    const dayStart = new Date(`${dateString}T00:00:00.000`);
    const dayEnd = new Date(`${dateString}T23:59:59.999`);

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reportData: ReportData = {
      date: reportDate,
      user,
      workouts: [],
      diet: {
        breakfast: [],
        lunch: [],
        snack: [],
        dinner: [],
        totalCalories: 0,
      },
    };

    // Fetch weight entry if requested
    if (options.includeWeight) {
      const weightEntry = await prisma.weight.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        orderBy: { date: "desc" },
      });

      if (weightEntry) {
        reportData.weight = {
          weight: weightEntry.weight,
          unit: weightEntry.unit,
          notes: weightEntry.notes,
        };
      }
    }

    // Fetch workouts if requested
    if (options.includeWorkouts) {
      const workouts = await prisma.workoutInstance.findMany({
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
              sets: {
                orderBy: { setNumber: "asc" },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
      });

      reportData.workouts = workouts.map((workout) => ({
        name: workout.name,
        status: workout.status,
        completedDate: workout.completedDate,
        exercises: workout.exercises.map((exercise) => ({
          exerciseName: exercise.exerciseName,
          sets: exercise.sets.map((set) => ({
            setNumber: set.setNumber,
            targetReps: set.targetReps,
            actualReps: set.actualReps,
            weight: set.weight,
            unit: set.unit,
            completed: set.completed,
          })),
        })),
      }));
    }

    // Fetch diet entries if requested
    if (options.includeDiet) {
      const dietEntries = await prisma.dietEntry.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        include: {
          food: true,
        },
        orderBy: { createdAt: "asc" },
      });

      let totalCalories = 0;

      dietEntries.forEach((entry) => {
        const calories = Math.round(entry.food.calories * entry.servings);
        totalCalories += calories;

        const item = {
          foodName: entry.food.name,
          servings: entry.servings,
          calories,
        };

        switch (entry.mealCategory.toLowerCase()) {
          case "breakfast":
            reportData.diet.breakfast.push(item);
            break;
          case "lunch":
            reportData.diet.lunch.push(item);
            break;
          case "snack":
            reportData.diet.snack.push(item);
            break;
          case "dinner":
            reportData.diet.dinner.push(item);
            break;
        }
      });

      reportData.diet.totalCalories = totalCalories;
    }

    // Fetch water intake if requested
    if (options.includeWater) {
      const waterEntries = await prisma.waterEntry.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      const waterGoal = await prisma.userWaterGoal.findUnique({
        where: { userId: session.user.id },
      });

      if (waterEntries.length > 0) {
        const total = waterEntries.reduce(
          (sum, entry) => sum + entry.amount,
          0
        );
        const unit = waterEntries[0]?.unit || "ml";

        reportData.water = {
          total: Math.round(total),
          unit,
          goal: waterGoal?.dailyGoal,
          progress: waterGoal
            ? Math.round((total / waterGoal.dailyGoal) * 100)
            : undefined,
        };
      }
    }

    // Generate markdown
    const markdown = generateMarkdown(reportData, options);
    const filename = `fitness-report-${dateString}.md`;

    return NextResponse.json({
      markdown,
      filename,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

function generateMarkdown(data: ReportData, options: ReportOptions): string {
  const lines: string[] = [];

  // Header
  lines.push(`# Fitness Report - ${format(data.date, "MMMM d, yyyy")}`);
  lines.push("");
  lines.push(`**Generated for:** ${data.user.name || data.user.email}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Weight Section
  if (options.includeWeight) {
    lines.push("## 📊 Weight");
    lines.push("");
    if (data.weight) {
      lines.push(`- **Weight:** ${data.weight.weight} ${data.weight.unit}`);
      if (data.weight.notes) {
        lines.push(`- **Notes:** ${data.weight.notes}`);
      }
    } else {
      lines.push("*No weight entry recorded for this day.*");
    }
    lines.push("");
  }

  // Workouts Section
  if (options.includeWorkouts) {
    lines.push("## 💪 Workouts");
    lines.push("");
    if (data.workouts.length > 0) {
      data.workouts.forEach((workout) => {
        lines.push(`### ${workout.name}`);
        lines.push("");
        lines.push(
          `- **Status:** ${
            workout.status.charAt(0).toUpperCase() + workout.status.slice(1)
          }`
        );
        if (workout.completedDate) {
          lines.push(
            `- **Completed:** ${format(workout.completedDate, "h:mm a")}`
          );
        }
        lines.push("");

        workout.exercises.forEach((exercise) => {
          lines.push(`#### ${exercise.exerciseName}`);
          lines.push("");
          if (exercise.sets.length > 0) {
            exercise.sets.forEach((set) => {
              const actualReps = set.actualReps ?? "—";
              const weight = set.weight ? `@ ${set.weight} ${set.unit}` : "";
              const status = set.completed ? "✓" : "○";
              lines.push(
                `- ${status} Set ${set.setNumber}: ${actualReps} reps ${weight} (Target: ${set.targetReps})`
              );
            });
          } else {
            lines.push("*No sets logged*");
          }
          lines.push("");
        });
      });
    } else {
      lines.push("*No workouts scheduled for this day.*");
      lines.push("");
    }
  }

  // Nutrition Section
  if (options.includeDiet) {
    lines.push("## 🍎 Nutrition");
    lines.push("");
    lines.push(`**Total Calories:** ${data.diet.totalCalories} cal`);
    lines.push("");

    const hasDietData =
      data.diet.breakfast.length > 0 ||
      data.diet.lunch.length > 0 ||
      data.diet.snack.length > 0 ||
      data.diet.dinner.length > 0;

    if (hasDietData) {
      if (data.diet.breakfast.length > 0) {
        lines.push("### Breakfast");
        lines.push("");
        data.diet.breakfast.forEach((item) => {
          lines.push(
            `- ${item.foodName}: ${item.servings} serving(s) — ${item.calories} cal`
          );
        });
        lines.push("");
      }

      if (data.diet.lunch.length > 0) {
        lines.push("### Lunch");
        lines.push("");
        data.diet.lunch.forEach((item) => {
          lines.push(
            `- ${item.foodName}: ${item.servings} serving(s) — ${item.calories} cal`
          );
        });
        lines.push("");
      }

      if (data.diet.snack.length > 0) {
        lines.push("### Snacks");
        lines.push("");
        data.diet.snack.forEach((item) => {
          lines.push(
            `- ${item.foodName}: ${item.servings} serving(s) — ${item.calories} cal`
          );
        });
        lines.push("");
      }

      if (data.diet.dinner.length > 0) {
        lines.push("### Dinner");
        lines.push("");
        data.diet.dinner.forEach((item) => {
          lines.push(
            `- ${item.foodName}: ${item.servings} serving(s) — ${item.calories} cal`
          );
        });
        lines.push("");
      }
    } else {
      lines.push("*No food entries recorded for this day.*");
      lines.push("");
    }
  }

  // Hydration Section
  if (options.includeWater) {
    lines.push("## 💧 Hydration");
    lines.push("");
    if (data.water) {
      lines.push(`- **Total Water:** ${data.water.total} ${data.water.unit}`);
      if (data.water.goal) {
        lines.push(`- **Daily Goal:** ${data.water.goal} ${data.water.unit}`);
        lines.push(`- **Progress:** ${data.water.progress}%`);
      }
    } else {
      lines.push("*No water intake recorded for this day.*");
    }
    lines.push("");
  }

  // Footer
  lines.push("---");
  lines.push("");
  lines.push(`*Report generated on ${format(new Date(), "PPpp")}*`);

  return lines.join("\n");
}
