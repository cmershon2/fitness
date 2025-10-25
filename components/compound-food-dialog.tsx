// components/compound-food-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import FoodSelector from "@/components/food-selector";

interface Food {
    id: string;
    name: string;
    brand?: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    servingSize?: string;
    servingUnit?: string;
}

interface Ingredient {
    foodId: string;
    quantity: number;
    food?: Food;
}

interface CompoundFoodDialogProps {
    trigger?: React.ReactNode;
    onSuccess?: () => void;
    editMode?: boolean;
    compoundFoodId?: string;
    initialData?: {
        name: string;
        description?: string;
        servings: number;
        ingredients: Array<{
            ingredientFoodId: string;
            quantity: number;
            ingredientFood: Food;
        }>;
    };
}

export function CompoundFoodDialog({
    trigger,
    onSuccess,
    editMode = false,
    compoundFoodId,
    initialData,
}: CompoundFoodDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [servings, setServings] = useState(initialData?.servings || 1);
    const [ingredients, setIngredients] = useState<Ingredient[]>(
        initialData?.ingredients.map((ing) => ({
            foodId: ing.ingredientFoodId,
            quantity: ing.quantity,
            food: ing.ingredientFood,
        })) || []
    );
    const [quantity, setQuantity] = useState<number>(1);

    const handleFoodSelect = (food: Food) => {
        // Check if ingredient already exists
        if (ingredients.some((ing) => ing.foodId === food.id)) {
            toast.error("This ingredient is already added. Remove it first to change the quantity.");
            return;
        }

        setIngredients([...ingredients, { foodId: food.id, quantity, food }]);
        setQuantity(1);
    };

    const removeIngredient = (foodId: string) => {
        setIngredients(ingredients.filter((ing) => ing.foodId !== foodId));
    };

    // Calculate total macros
    const calculateTotals = () => {
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        ingredients.forEach((ing) => {
            if (ing.food) {
                totalCalories += ing.food.calories * ing.quantity;
                totalProtein += (ing.food.protein || 0) * ing.quantity;
                totalCarbs += (ing.food.carbs || 0) * ing.quantity;
                totalFat += (ing.food.fat || 0) * ing.quantity;
            }
        });

        return {
            calories: Math.round(totalCalories),
            protein: totalProtein.toFixed(1),
            carbs: totalCarbs.toFixed(1),
            fat: totalFat.toFixed(1),
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        if (ingredients.length === 0) {
            toast.error("At least one ingredient is required");
            return;
        }

        setLoading(true);
        try {
            const url = editMode ? `/api/compound-foods/${compoundFoodId}` : "/api/compound-foods";
            const method = editMode ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    servings,
                    ingredients: ingredients.map((ing) => ({
                        foodId: ing.foodId,
                        quantity: ing.quantity,
                    })),
                }),
            });

            if (response.ok) {
                toast.success(`Recipe ${editMode ? "updated" : "created"} successfully`);
                setOpen(false);
                resetForm();
                onSuccess?.();
            } else {
                const data = await response.json();
                toast.error(data.error || `Failed to ${editMode ? "update" : "create"} recipe`);
            }
        } catch (error) {
            console.error("Error saving compound food:", error);
            toast.error(`Failed to ${editMode ? "update" : "create"} recipe`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        if (!editMode) {
            setName("");
            setDescription("");
            setServings(1);
            setIngredients([]);
            setQuantity(1);
        }
    };

    const totals = calculateTotals();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Compound Food
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editMode ? "Edit" : "Create"} Compound Food</DialogTitle>
                    <DialogDescription>
                        Create a meal or recipe by combining multiple foods. Macros will be calculated automatically.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Egg Sandwich, Protein Shake"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add notes about this recipe..."
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="servings">Number of Servings</Label>
                            <Input
                                id="servings"
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={servings}
                                onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
                                placeholder="1"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                How many servings does this recipe make?
                            </p>
                        </div>
                    </div>

                    {/* Add Ingredient Section */}
                    <div className="border rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold">Add Ingredients</h3>
                        <div className="flex gap-2">
                            <div className="w-28">
                                <Input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                                    placeholder="Qty"
                                />
                            </div>
                            <div className="flex-1">
                                <FoodSelector
                                    onSelect={handleFoodSelect}
                                    excludeCompoundFoods={true}
                                    triggerButton={
                                        <Button type="button" variant="outline" className="w-full justify-start">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Select Food
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Set quantity first, then select a food to add as an ingredient
                        </p>
                    </div>

                    {/* Ingredients List */}
                    {ingredients.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Ingredients ({ingredients.length})</h3>
                            <div className="space-y-2">
                                {ingredients.map((ing) => (
                                    <div
                                        key={ing.foodId}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {ing.food?.name} {ing.food?.brand && `(${ing.food.brand})`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {ing.quantity} × {ing.food?.calories} cal = {(ing.food?.calories || 0) * ing.quantity} cal
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeIngredient(ing.foodId)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Calculated Totals */}
                    {ingredients.length > 0 && (
                        <div className="border rounded-lg p-4 bg-muted/50">
                            <h3 className="font-semibold mb-3">Total Nutritional Info (per serving)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Calories</p>
                                    <p className="text-2xl font-bold">{Math.round(totals.calories / servings)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Protein</p>
                                    <p className="text-2xl font-bold">{(parseFloat(totals.protein) / servings).toFixed(1)}g</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Carbs</p>
                                    <p className="text-2xl font-bold">{(parseFloat(totals.carbs) / servings).toFixed(1)}g</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Fat</p>
                                    <p className="text-2xl font-bold">{(parseFloat(totals.fat) / servings).toFixed(1)}g</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                resetForm();
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || ingredients.length === 0}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editMode ? "Update" : "Create"} Compound Food
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}