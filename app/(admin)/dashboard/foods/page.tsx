// app/(admin)/dashboard/foods/page.tsx - UPDATED VERSION (Mobile-Responsive)
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AddFoodForm } from "@/components/add-food-form";
import { CompoundFoodDialog } from "@/components/compound-food-dialog";
import { toast } from "sonner";
import {
    Search,
    Loader2,
    Edit,
    Trash2,
    Utensils,
    Package,
    ChefHat,
} from "lucide-react";

interface Food {
    id: string;
    name: string;
    brand?: string;
    barcode?: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    servingSize?: string;
    servingUnit?: string;
    source: string;
    isCompound?: boolean;
}

interface CompoundFood {
    id: string;
    name: string;
    description?: string;
    servings: number;
    food?: Food;
    ingredients: Array<{
        id: string;
        ingredientFoodId: string;
        quantity: number;
        ingredientFood: Food;
    }>;
    createdAt: string;
}

export default function FoodsPage() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [compoundFoods, setCompoundFoods] = useState<CompoundFood[]>([]);
    const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
    const [filteredCompoundFoods, setFilteredCompoundFoods] = useState<CompoundFood[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingFood, setEditingFood] = useState<Food | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"regular" | "compound">("regular");

    useEffect(() => {
        fetchAllFoods();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredFoods(foods);
            setFilteredCompoundFoods(compoundFoods);
        } else {
            const query = searchQuery.toLowerCase();

            // Filter regular foods
            const filtered = foods.filter(
                (food) =>
                    food.name.toLowerCase().includes(query) ||
                    food.brand?.toLowerCase().includes(query) ||
                    food.barcode?.includes(query)
            );
            setFilteredFoods(filtered);

            // Filter compound foods
            const filteredCompound = compoundFoods.filter(
                (cf) =>
                    cf.name.toLowerCase().includes(query) ||
                    cf.description?.toLowerCase().includes(query)
            );
            setFilteredCompoundFoods(filteredCompound);
        }
    }, [searchQuery, foods, compoundFoods]);

    const fetchAllFoods = async () => {
        setIsLoading(true);
        try {
            // Fetch regular foods
            const foodsResponse = await fetch("/api/foods");
            if (!foodsResponse.ok) throw new Error("Failed to fetch foods");
            const foodsData = await foodsResponse.json();

            // Separate regular and compound foods
            const regularFoods = foodsData.filter((f: Food) => !f.isCompound);
            setFoods(regularFoods);
            setFilteredFoods(regularFoods);

            // Fetch compound foods
            const compoundResponse = await fetch("/api/compound-foods");
            if (compoundResponse.ok) {
                const compoundData = await compoundResponse.json();
                setCompoundFoods(compoundData);
                setFilteredCompoundFoods(compoundData);
            }
        } catch (error) {
            toast.error("Failed to load foods");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this food item?"))
            return;

        try {
            const response = await fetch(`/api/foods/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete food");

            toast.success("Food deleted successfully");
            fetchAllFoods();
        } catch (error) {
            toast.error("Failed to delete food");
            console.log(error);
        }
    };

    const handleDeleteCompound = async (id: string) => {
        if (!confirm("Are you sure you want to delete this recipe? This will also remove it from your food library."))
            return;

        try {
            const response = await fetch(`/api/compound-foods/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete compound food");

            toast.success("Recipe deleted successfully");
            fetchAllFoods();
        } catch (error) {
            toast.error("Failed to delete recipe");
            console.log(error);
        }
    };

    const handleEdit = (food: Food) => {
        setEditingFood(food);
        setIsEditDialogOpen(true);
    };

    const handleUpdateFood = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFood) return;

        try {
            const response = await fetch(`/api/foods/${editingFood.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editingFood),
            });

            if (!response.ok) throw new Error("Failed to update food");

            toast.success("Food updated successfully");

            setIsEditDialogOpen(false);
            setEditingFood(null);
            fetchAllFoods();
        } catch (error) {
            toast.error("Failed to update food");
            console.log(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const regularFoodsCount = filteredFoods.length;
    const compoundFoodsCount = filteredCompoundFoods.length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Food Library</h1>
                    <p className="text-muted-foreground">
                        Manage your food database and recipes for diet tracking
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search foods and recipes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Badge variant="secondary">
                    {regularFoodsCount + compoundFoodsCount} total
                </Badge>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "regular" | "compound")}>
                {/* Mobile-responsive layout: Stack tabs and buttons on mobile, side-by-side on larger screens */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <TabsList>
                        <TabsTrigger value="regular" className="gap-2">
                            <Utensils className="h-4 w-4" />
                            <span className="hidden sm:inline">Regular Foods</span>
                            <span className="sm:hidden">Foods</span>
                            <Badge variant="secondary" className="ml-1">
                                {regularFoodsCount}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="compound" className="gap-2">
                            <ChefHat className="h-4 w-4" />
                            <span>Recipes</span>
                            <Badge variant="secondary" className="ml-1">
                                {compoundFoodsCount}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === "regular" ? (
                        <AddFoodForm onFoodAdded={fetchAllFoods} />
                    ) : (
                        <CompoundFoodDialog onSuccess={fetchAllFoods} />
                    )}
                </div>

                {/* Regular Foods Tab */}
                <TabsContent value="regular" className="space-y-4">
                    {filteredFoods.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                {searchQuery ? (
                                    <>
                                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-sm text-muted-foreground">
                                            No foods found matching &quot;{searchQuery}&quot;
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-sm text-muted-foreground mb-4">
                                            No foods in your library yet
                                        </p>
                                        <AddFoodForm onFoodAdded={fetchAllFoods} />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredFoods.map((food) => (
                                <Card key={food.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg truncate">
                                                    {food.name}
                                                </CardTitle>
                                                {food.brand && (
                                                    <CardDescription className="truncate">
                                                        {food.brand}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="ml-2">
                                                {food.source}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Macros */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Calories</p>
                                                <p className="text-xl font-bold">{food.calories}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Protein</p>
                                                <p className="text-xl font-bold">
                                                    {food.protein?.toFixed(1) || 0}g
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Carbs</p>
                                                <p className="text-xl font-bold">
                                                    {food.carbs?.toFixed(1) || 0}g
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">Fat</p>
                                                <p className="text-xl font-bold">
                                                    {food.fat?.toFixed(1) || 0}g
                                                </p>
                                            </div>
                                        </div>

                                        {/* Serving Size */}
                                        {food.servingSize && (
                                            <p className="text-xs text-muted-foreground">
                                                Serving: {food.servingSize}{" "}
                                                {food.servingUnit}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleEdit(food)}
                                            >
                                                <Edit className="mr-2 h-3 w-3" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(food.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Compound Foods Tab */}
                <TabsContent value="compound" className="space-y-4">
                    {filteredCompoundFoods.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                {searchQuery ? (
                                    <>
                                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-sm text-muted-foreground">
                                            No recipes found matching &quot;{searchQuery}&quot;
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-lg font-semibold mb-2">No recipes yet</p>
                                        <p className="text-sm text-muted-foreground mb-4 text-center">
                                            Create your first recipe by combining multiple ingredients
                                        </p>
                                        <CompoundFoodDialog onSuccess={fetchAllFoods} />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCompoundFoods.map((compoundFood) => (
                                <Card key={compoundFood.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg truncate">
                                                    {compoundFood.name}
                                                </CardTitle>
                                                {compoundFood.description && (
                                                    <CardDescription className="line-clamp-2 mt-1">
                                                        {compoundFood.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <Badge variant="secondary" className="ml-2 shrink-0">
                                                {compoundFood.servings} srv
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Macros per serving */}
                                        {compoundFood.food && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        Calories/srv
                                                    </p>
                                                    <p className="text-xl font-bold">
                                                        {compoundFood.food.calories}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        Protein/srv
                                                    </p>
                                                    <p className="text-xl font-bold">
                                                        {compoundFood.food.protein?.toFixed(1) || 0}g
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        Carbs/srv
                                                    </p>
                                                    <p className="text-xl font-bold">
                                                        {compoundFood.food.carbs?.toFixed(1) || 0}g
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        Fat/srv
                                                    </p>
                                                    <p className="text-xl font-bold">
                                                        {compoundFood.food.fat?.toFixed(1) || 0}g
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Ingredients preview */}
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                Ingredients ({compoundFood.ingredients.length})
                                            </p>
                                            <div className="space-y-1">
                                                {compoundFood.ingredients.slice(0, 3).map((ing) => (
                                                    <p key={ing.id} className="text-xs truncate">
                                                        • {ing.quantity}× {ing.ingredientFood.name}
                                                    </p>
                                                ))}
                                                {compoundFood.ingredients.length > 3 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        +{compoundFood.ingredients.length - 3} more
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <CompoundFoodDialog
                                                trigger={
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <Edit className="mr-2 h-3 w-3" />
                                                        Edit
                                                    </Button>
                                                }
                                                editMode
                                                compoundFoodId={compoundFood.id}
                                                initialData={{
                                                    name: compoundFood.name,
                                                    description: compoundFood.description,
                                                    servings: compoundFood.servings,
                                                    ingredients: compoundFood.ingredients,
                                                }}
                                                onSuccess={fetchAllFoods}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteCompound(compoundFood.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Edit Dialog for Regular Foods */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Food</DialogTitle>
                        <DialogDescription>
                            Update the information for this food item
                        </DialogDescription>
                    </DialogHeader>
                    {editingFood && (
                        <form onSubmit={handleUpdateFood} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingFood.name}
                                    onChange={(e) =>
                                        setEditingFood({ ...editingFood, name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-brand">Brand (Optional)</Label>
                                <Input
                                    id="edit-brand"
                                    value={editingFood.brand || ""}
                                    onChange={(e) =>
                                        setEditingFood({ ...editingFood, brand: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-calories">Calories</Label>
                                    <Input
                                        id="edit-calories"
                                        type="number"
                                        value={editingFood.calories}
                                        onChange={(e) =>
                                            setEditingFood({
                                                ...editingFood,
                                                calories: parseInt(e.target.value),
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-protein">Protein (g)</Label>
                                    <Input
                                        id="edit-protein"
                                        type="number"
                                        step="0.1"
                                        value={editingFood.protein || ""}
                                        onChange={(e) =>
                                            setEditingFood({
                                                ...editingFood,
                                                protein: parseFloat(e.target.value) || undefined,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-carbs">Carbs (g)</Label>
                                    <Input
                                        id="edit-carbs"
                                        type="number"
                                        step="0.1"
                                        value={editingFood.carbs || ""}
                                        onChange={(e) =>
                                            setEditingFood({
                                                ...editingFood,
                                                carbs: parseFloat(e.target.value) || undefined,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-fat">Fat (g)</Label>
                                    <Input
                                        id="edit-fat"
                                        type="number"
                                        step="0.1"
                                        value={editingFood.fat || ""}
                                        onChange={(e) =>
                                            setEditingFood({
                                                ...editingFood,
                                                fat: parseFloat(e.target.value) || undefined,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}