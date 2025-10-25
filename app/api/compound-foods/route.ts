// app/api/compound-foods/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// Helper function to calculate macros from ingredients
function calculateCompoundFoodMacros(ingredients: any[]) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const ingredient of ingredients) {
    const quantity = ingredient.quantity;
    totalCalories += ingredient.ingredientFood.calories * quantity;
    totalProtein += (ingredient.ingredientFood.protein || 0) * quantity;
    totalCarbs += (ingredient.ingredientFood.carbs || 0) * quantity;
    totalFat += (ingredient.ingredientFood.fat || 0) * quantity;
  }

  return {
    calories: Math.round(totalCalories),
    protein: parseFloat(totalProtein.toFixed(2)),
    carbs: parseFloat(totalCarbs.toFixed(2)),
    fat: parseFloat(totalFat.toFixed(2)),
  };
}

// GET all compound foods for the current user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const compoundFoods = await prisma.compoundFood.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        food: true,
        ingredients: {
          include: {
            ingredientFood: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(compoundFoods);
  } catch (error) {
    console.error("Error fetching compound foods:", error);
    return NextResponse.json(
      { error: "Failed to fetch compound foods" },
      { status: 500 }
    );
  }
}

// POST create a new compound food
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, servings, ingredients } = body;

    if (
      !name ||
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return NextResponse.json(
        { error: "Name and at least one ingredient are required" },
        { status: 400 }
      );
    }

    // Validate all ingredient foods exist and belong to user
    const ingredientFoodIds = ingredients.map((i: any) => i.foodId);
    const foods = await prisma.food.findMany({
      where: {
        id: { in: ingredientFoodIds },
        userId: session.user.id,
      },
    });

    if (foods.length !== ingredientFoodIds.length) {
      return NextResponse.json(
        { error: "One or more ingredient foods not found" },
        { status: 404 }
      );
    }

    // Create compound food with transaction
    const result = await prisma.$transaction(async (tx) => {
      // First, create the Food entry for this compound food
      const food = await tx.food.create({
        data: {
          userId: session.user.id,
          name: name.trim(),
          brand: "Recipe",
          calories: 0, // Will be updated after calculating
          protein: 0,
          carbs: 0,
          fat: 0,
          servingSize: `${servings || 1}`,
          servingUnit: "serving(s)",
          source: "compound",
          isCompound: true,
        },
      });

      // Create the compound food record linked to the food
      const compoundFood = await tx.compoundFood.create({
        data: {
          userId: session.user.id,
          foodId: food.id,
          name: name.trim(),
          description: description?.trim() || null,
          servings: servings || 1,
        },
      });

      // Create ingredient records
      const ingredientRecords = await Promise.all(
        ingredients.map((ingredient: any) =>
          tx.compoundFoodIngredient.create({
            data: {
              compoundFoodId: compoundFood.id,
              ingredientFoodId: ingredient.foodId,
              quantity: ingredient.quantity || 1,
            },
            include: {
              ingredientFood: true,
            },
          })
        )
      );

      // Calculate total macros
      const macros = calculateCompoundFoodMacros(ingredientRecords);

      // Update the Food entry with calculated macros (per serving)
      await tx.food.update({
        where: { id: food.id },
        data: {
          calories: Math.round(macros.calories / (servings || 1)),
          protein: parseFloat((macros.protein / (servings || 1)).toFixed(2)),
          carbs: parseFloat((macros.carbs / (servings || 1)).toFixed(2)),
          fat: parseFloat((macros.fat / (servings || 1)).toFixed(2)),
        },
      });

      return compoundFood;
    });

    // Fetch the complete compound food with all relations
    const completeCompoundFood = await prisma.compoundFood.findUnique({
      where: { id: result.id },
      include: {
        food: true,
        ingredients: {
          include: {
            ingredientFood: true,
          },
        },
      },
    });

    return NextResponse.json(completeCompoundFood, { status: 201 });
  } catch (error) {
    console.error("Error creating compound food:", error);
    return NextResponse.json(
      { error: "Failed to create compound food" },
      { status: 500 }
    );
  }
}
