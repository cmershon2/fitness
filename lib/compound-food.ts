// types/compound-food.ts
// Type definitions for Compound Food feature

export interface Food {
  id: string;
  name: string;
  brand?: string | null;
  barcode?: string | null;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  servingSize?: string | null;
  servingUnit?: string | null;
  source: string;
  isCompound: boolean;
  compoundFoodId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompoundFoodIngredient {
  id: string;
  compoundFoodId: string;
  ingredientFoodId: string;
  ingredientFood: Food;
  quantity: number;
  createdAt: Date;
}

export interface CompoundFood {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  servings: number;
  food?: Food | null;
  ingredients: CompoundFoodIngredient[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompoundFoodInput {
  name: string;
  description?: string;
  servings: number;
  ingredients: Array<{
    foodId: string;
    quantity: number;
  }>;
}

export interface UpdateCompoundFoodInput {
  name?: string;
  description?: string;
  servings?: number;
  ingredients?: Array<{
    foodId: string;
    quantity: number;
  }>;
}

export interface CalculatedMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
