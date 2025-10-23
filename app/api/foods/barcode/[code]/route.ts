// app/api/foods/barcode/[code]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET food data from Open Food Facts API by barcode
export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const barcode = params.code;

    if (!barcode || barcode.length < 8) {
      return NextResponse.json({ error: "Invalid barcode" }, { status: 400 });
    }

    // Call Open Food Facts API
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          "User-Agent": "FitnessTracker/1.0",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch product data" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.status === 0 || !data.product) {
      return NextResponse.json(
        { error: "Product not found", found: false },
        { status: 404 }
      );
    }

    const product = data.product;

    // Extract and normalize the data
    const foodData = {
      name: product.product_name || product.generic_name || "Unknown Product",
      brand: product.brands || null,
      barcode: barcode,
      calories: Math.round(product.nutriments?.["energy-kcal_100g"] || 0),
      protein: product.nutriments?.proteins_100g || null,
      carbs: product.nutriments?.carbohydrates_100g || null,
      fat: product.nutriments?.fat_100g || null,
      servingSize: product.serving_quantity || "100",
      servingUnit: product.serving_quantity_unit || "g",
      source: "api",
      imageUrl: product.image_url || null,
      found: true,
    };

    return NextResponse.json(foodData);
  } catch (error) {
    console.error("Error fetching barcode data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch barcode data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
