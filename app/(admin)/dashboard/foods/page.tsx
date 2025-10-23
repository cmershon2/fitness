"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import {
    Search,
    Loader2,
    Edit,
    Trash2,
    Utensils,
    Package
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
}

export default function FoodsPage() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingFood, setEditingFood] = useState<Food | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        fetchFoods();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredFoods(foods);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = foods.filter(
                (food) =>
                    food.name.toLowerCase().includes(query) ||
                    food.brand?.toLowerCase().includes(query) ||
                    food.barcode?.includes(query)
            );
            setFilteredFoods(filtered);
        }
    }, [searchQuery, foods]);

    const fetchFoods = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/foods");
            if (!response.ok) throw new Error("Failed to fetch foods");
            const data = await response.json();
            setFoods(data);
            setFilteredFoods(data);
        } catch (error) {
            toast.error("Failed to load foods");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this food item?")) return;

        try {
            const response = await fetch(`/api/foods/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete food");

            toast.success("Food deleted successfully");

            fetchFoods();
        } catch (error) {
            toast.error("Failed to delete food")
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

            toast.success("Food updated successfully")

            setIsEditDialogOpen(false);
            setEditingFood(null);
            fetchFoods();
        } catch (error) {
            toast.error("Failed to update food");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Food Library</h1>
                    <p className="text-muted-foreground">
                        Manage your food database for diet tracking
                    </p>
                </div>
                <AddFoodForm onFoodAdded={fetchFoods} />
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search foods by name, brand, or barcode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Badge variant="secondary">{filteredFoods.length} foods</Badge>
            </div>

            {filteredFoods.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        {searchQuery ? (
                            <>
                                <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground mb-2">No foods found</p>
                                <p className="text-sm text-muted-foreground">
                                    Try adjusting your search query
                                </p>
                            </>
                        ) : (
                            <>
                                <Utensils className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground mb-4">No foods in your library</p>
                                <AddFoodForm onFoodAdded={fetchFoods} />
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredFoods.map((food) => (
                        <Card key={food.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{food.name}</CardTitle>
                                        {food.brand && (
                                            <CardDescription>{food.brand}</CardDescription>
                                        )}
                                    </div>
                                    {food.source === "barcode" || food.source === "api" ? (
                                        <Badge variant="outline">
                                            <Package className="mr-1 h-3 w-3" />
                                            Scanned
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Manual</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold">{food.calories}</span>
                                        <span className="text-sm text-muted-foreground">calories</span>
                                    </div>
                                    {(food.servingSize || food.servingUnit) && (
                                        <p className="text-sm text-muted-foreground">
                                            per {food.servingSize} {food.servingUnit}
                                        </p>
                                    )}
                                </div>

                                {(food.protein || food.carbs || food.fat) && (
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        {food.protein !== null && food.protein !== undefined && (
                                            <div>
                                                <p className="font-medium">{food.protein}g</p>
                                                <p className="text-muted-foreground">Protein</p>
                                            </div>
                                        )}
                                        {food.carbs !== null && food.carbs !== undefined && (
                                            <div>
                                                <p className="font-medium">{food.carbs}g</p>
                                                <p className="text-muted-foreground">Carbs</p>
                                            </div>
                                        )}
                                        {food.fat !== null && food.fat !== undefined && (
                                            <div>
                                                <p className="font-medium">{food.fat}g</p>
                                                <p className="text-muted-foreground">Fat</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {food.barcode && (
                                    <p className="text-xs text-muted-foreground">
                                        Barcode: {food.barcode}
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(food)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(food.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Food</DialogTitle>
                        <DialogDescription>
                            Update the food information
                        </DialogDescription>
                    </DialogHeader>
                    {editingFood && (
                        <form onSubmit={handleUpdateFood}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Name *</Label>
                                    <Input
                                        id="edit-name"
                                        value={editingFood.name}
                                        onChange={(e) =>
                                            setEditingFood({ ...editingFood, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-brand">Brand</Label>
                                    <Input
                                        id="edit-brand"
                                        value={editingFood.brand || ""}
                                        onChange={(e) =>
                                            setEditingFood({ ...editingFood, brand: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-calories">Calories *</Label>
                                    <Input
                                        id="edit-calories"
                                        type="number"
                                        value={editingFood.calories}
                                        onChange={(e) =>
                                            setEditingFood({
                                                ...editingFood,
                                                calories: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-protein">Protein (g)</Label>
                                        <Input
                                            id="edit-protein"
                                            type="number"
                                            step="0.1"
                                            value={editingFood.protein || ""}
                                            onChange={(e) =>
                                                setEditingFood({
                                                    ...editingFood,
                                                    protein: e.target.value
                                                        ? parseFloat(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-carbs">Carbs (g)</Label>
                                        <Input
                                            id="edit-carbs"
                                            type="number"
                                            step="0.1"
                                            value={editingFood.carbs || ""}
                                            onChange={(e) =>
                                                setEditingFood({
                                                    ...editingFood,
                                                    carbs: e.target.value
                                                        ? parseFloat(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-fat">Fat (g)</Label>
                                        <Input
                                            id="edit-fat"
                                            type="number"
                                            step="0.1"
                                            value={editingFood.fat || ""}
                                            onChange={(e) =>
                                                setEditingFood({
                                                    ...editingFood,
                                                    fat: e.target.value
                                                        ? parseFloat(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-servingSize">Serving Size</Label>
                                        <Input
                                            id="edit-servingSize"
                                            value={editingFood.servingSize || ""}
                                            onChange={(e) =>
                                                setEditingFood({
                                                    ...editingFood,
                                                    servingSize: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-servingUnit">Unit</Label>
                                        <Input
                                            id="edit-servingUnit"
                                            value={editingFood.servingUnit || ""}
                                            onChange={(e) =>
                                                setEditingFood({
                                                    ...editingFood,
                                                    servingUnit: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setEditingFood(null);
                                    }}
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