import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET all exercises for the current user
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const muscleGroup = searchParams.get("muscleGroup");

    const where: any = {
      userId: session.user.id,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (muscleGroup && muscleGroup !== "all") {
      where.muscleGroup = muscleGroup;
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

// POST create a new exercise
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, muscleGroup, description } = body;

    if (!name || !muscleGroup) {
      return NextResponse.json(
        { error: "Name and muscle group are required" },
        { status: 400 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        muscleGroup,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
