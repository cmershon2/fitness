// app/api/compound-foods/[id]/route.ts
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

// GET a single compound food
export async function GET(
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

    const compoundFood = await prisma.compoundFood.findFirst({
      where: {
        id: (await params).id,
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
    });

    if (!compoundFood) {
      return NextResponse.json(
        { error: "Compound food not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(compoundFood);
  } catch (error) {
    console.error("Error fetching compound food:", error);
    return NextResponse.json(
      { error: "Failed to fetch compound food" },
      { status: 500 }
    );
  }
}

// PATCH update a compound food
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

    // Verify compound food exists and belongs to user
    const existing = await prisma.compoundFood.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
      include: {
        food: true,
        ingredients: {
          include: {
            ingredientFood: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Compound food not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, servings, ingredients } = body;

    // Use transaction to update everything
    const result = await prisma.$transaction(async (tx) => {
      // Update compound food basic info
      const updatedCompoundFood = await tx.compoundFood.update({
        where: { id: (await params).id },
        data: {
          ...(name && { name: name.trim() }),
          ...(description !== undefined && {
            description: description?.trim() || null,
          }),
          ...(servings !== undefined && { servings }),
        },
      });

      // If ingredients are provided, update them
      if (ingredients && Array.isArray(ingredients)) {
        // Delete existing ingredients
        await tx.compoundFoodIngredient.deleteMany({
          where: { compoundFoodId: (await params).id },
        });

        // Validate all ingredient foods exist
        const ingredientFoodIds = ingredients.map((i: any) => i.foodId);
        const foods = await tx.food.findMany({
          where: {
            id: { in: ingredientFoodIds },
            userId: session.user.id,
          },
        });

        if (foods.length !== ingredientFoodIds.length) {
          throw new Error("One or more ingredient foods not found");
        }

        // Create new ingredients
        await Promise.all(
          ingredients.map(async (ingredient: any) =>
            tx.compoundFoodIngredient.create({
              data: {
                compoundFoodId: (await params).id,
                ingredientFoodId: ingredient.foodId,
                quantity: ingredient.quantity || 1,
              },
            })
          )
        );
      }

      // Recalculate macros
      const ingredientRecords = await tx.compoundFoodIngredient.findMany({
        where: { compoundFoodId: (await params).id },
        include: {
          ingredientFood: true,
        },
      });

      const macros = calculateCompoundFoodMacros(ingredientRecords);
      const finalServings =
        servings !== undefined ? servings : existing.servings;

      // Update the associated Food entry
      if (existing.food) {
        await tx.food.update({
          where: { id: existing.food.id },
          data: {
            name: name?.trim() || existing.name,
            calories: Math.round(macros.calories / finalServings),
            protein: parseFloat((macros.protein / finalServings).toFixed(2)),
            carbs: parseFloat((macros.carbs / finalServings).toFixed(2)),
            fat: parseFloat((macros.fat / finalServings).toFixed(2)),
            servingSize: `${finalServings}`,
          },
        });
      }

      return updatedCompoundFood;
    });

    // Fetch updated compound food with all relations
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

    return NextResponse.json(completeCompoundFood);
  } catch (error) {
    console.error("Error updating compound food:", error);
    return NextResponse.json(
      { error: "Failed to update compound food" },
      { status: 500 }
    );
  }
}

// DELETE a compound food
export async function DELETE(
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

    // Verify compound food exists and belongs to user
    const compoundFood = await prisma.compoundFood.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
      include: {
        food: true,
      },
    });

    if (!compoundFood) {
      return NextResponse.json(
        { error: "Compound food not found" },
        { status: 404 }
      );
    }

    // Delete in transaction (cascade will handle ingredients)
    await prisma.$transaction(async (tx) => {
      // Delete the associated Food entry first (if it exists)
      if (compoundFood.food) {
        await tx.food.delete({
          where: { id: compoundFood.food.id },
        });
      }

      // Delete the compound food (cascade will delete ingredients)
      await tx.compoundFood.delete({
        where: { id: (await params).id },
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting compound food:", error);
    return NextResponse.json(
      { error: "Failed to delete compound food" },
      { status: 500 }
    );
  }
}
