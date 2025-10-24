"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import FoodSelector from "./food-selector";
import { X } from "lucide-react";

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

interface AddFoodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mealCategory: string;
    date: Date;
    onSuccess: () => void;
}

export default function AddFoodDialog({
    open,
    onOpenChange,
    mealCategory,
    date,
    onSuccess,
}: AddFoodDialogProps) {
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [servings, setServings] = useState("1");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setSelectedFood(null);
            setServings("1");
            setNotes("");
        }
    }, [open]);

    const handleFoodSelect = (food: Food) => {
        setSelectedFood(food);
    };

    const handleRemoveFood = () => {
        setSelectedFood(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFood) {
            toast.error("Please select a food");
            return;
        }

        const servingsNum = parseFloat(servings);
        if (isNaN(servingsNum) || servingsNum <= 0) {
            toast.error("Please enter a valid number of servings");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/diet-entries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    foodId: selectedFood.id,
                    date: date.toISOString().split("T")[0],
                    mealCategory,
                    servings: servingsNum,
                    notes: notes.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add food");
            }

            toast.success("Food added successfully");
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error("Error adding food:", error);
            toast.error("Failed to add food");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalCalories = selectedFood
        ? Math.round(selectedFood.calories * parseFloat(servings || "1"))
        : 0;

    const mealCategoryLabels: Record<string, string> = {
        breakfast: "Breakfast",
        lunch: "Lunch",
        snack: "Snack",
        dinner: "Dinner",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add to {mealCategoryLabels[mealCategory]}</DialogTitle>
                    <DialogDescription>
                        Select a food from your library and specify the serving amount
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Selected Food Display */}
                    <div className="space-y-2">
                        <Label>Selected Food *</Label>
                        {selectedFood ? (
                            <div className="p-3 rounded-lg border bg-muted/50">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium">{selectedFood.name}</p>
                                        {selectedFood.brand && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedFood.brand}
                                            </p>
                                        )}
                                        {selectedFood.servingSize && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Serving: {selectedFood.servingSize}{" "}
                                                {selectedFood.servingUnit}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {selectedFood.calories} cal per serving
                                            </Badge>
                                            {selectedFood.protein !== null &&
                                                selectedFood.protein !== undefined && (
                                                    <Badge variant="outline" className="text-xs">
                                                        P: {selectedFood.protein}g
                                                    </Badge>
                                                )}
                                            {selectedFood.carbs !== null &&
                                                selectedFood.carbs !== undefined && (
                                                    <Badge variant="outline" className="text-xs">
                                                        C: {selectedFood.carbs}g
                                                    </Badge>
                                                )}
                                            {selectedFood.fat !== null &&
                                                selectedFood.fat !== undefined && (
                                                    <Badge variant="outline" className="text-xs">
                                                        F: {selectedFood.fat}g
                                                    </Badge>
                                                )}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleRemoveFood}
                                        className="shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <FoodSelector
                                onSelect={handleFoodSelect}
                                triggerButton={
                                    <Button variant="outline" type="button" className="w-full">
                                        Select Food
                                    </Button>
                                }
                            />
                        )}
                    </div>

                    {/* Servings Input */}
                    <div className="space-y-2">
                        <Label htmlFor="servings">Servings *</Label>
                        <Input
                            id="servings"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            placeholder="1"
                            required
                        />
                        {selectedFood && (
                            <p className="text-sm text-muted-foreground">
                                Total: <span className="font-medium">{totalCalories} calories</span>
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes..."
                            rows={2}
                        />
                    </div>

                    {/* Actions */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !selectedFood}>
                            {isSubmitting ? "Adding..." : "Add Food"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}