"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { BarcodeScannerComponent } from "./barcode-scanner";

interface FoodData {
    name: string;
    brand?: string;
    barcode?: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    servingSize?: string;
    servingUnit?: string;
}

interface AddFoodFormProps {
    onFoodAdded?: () => void;
}

export function AddFoodForm({ onFoodAdded }: AddFoodFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<FoodData>({
        name: "",
        brand: "",
        barcode: "",
        calories: 0,
        protein: undefined,
        carbs: undefined,
        fat: undefined,
        servingSize: "",
        servingUnit: "",
    });

    const handleBarcodeDetected = (foodData: FoodData) => {
        setFormData({
            ...formData,
            ...foodData,
        });
        setOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || formData.calories === undefined) {
            toast.error("Name and calories are required");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/foods", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    source: formData.barcode ? "barcode" : "manual",
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to add food");
            }

            toast.success("Food added successfully!");

            // Reset form
            setFormData({
                name: "",
                brand: "",
                barcode: "",
                calories: 0,
                protein: undefined,
                carbs: undefined,
                fat: undefined,
                servingSize: "",
                servingUnit: "",
            });
            setOpen(false);

            // Notify parent component
            if (onFoodAdded) {
                onFoodAdded();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add food");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof FoodData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <>
            <div className="flex gap-2">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Food Manually
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add Food</DialogTitle>
                            <DialogDescription>
                                Enter food details manually or scan a barcode to auto-fill
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder="e.g., Chicken Breast"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="brand">Brand (Optional)</Label>
                                    <Input
                                        id="brand"
                                        value={formData.brand}
                                        onChange={(e) => handleInputChange("brand", e.target.value)}
                                        placeholder="e.g., Tyson"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="barcode">Barcode (Optional)</Label>
                                    <Input
                                        id="barcode"
                                        value={formData.barcode}
                                        onChange={(e) => handleInputChange("barcode", e.target.value)}
                                        placeholder="e.g., 1234567890123"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="calories">Calories *</Label>
                                        <Input
                                            id="calories"
                                            type="number"
                                            value={formData.calories}
                                            onChange={(e) =>
                                                handleInputChange("calories", parseInt(e.target.value) || 0)
                                            }
                                            placeholder="0"
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="protein">Protein (g)</Label>
                                        <Input
                                            id="protein"
                                            type="number"
                                            step="0.1"
                                            value={formData.protein || ""}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "protein",
                                                    e.target.value ? parseFloat(e.target.value) : "unknown"
                                                )
                                            }
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="carbs">Carbs (g)</Label>
                                        <Input
                                            id="carbs"
                                            type="number"
                                            step="0.1"
                                            value={formData.carbs || ""}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "carbs",
                                                    e.target.value ? parseFloat(e.target.value) : "unknown"
                                                )
                                            }
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="fat">Fat (g)</Label>
                                        <Input
                                            id="fat"
                                            type="number"
                                            step="0.1"
                                            value={formData.fat || ""}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "fat",
                                                    e.target.value ? parseFloat(e.target.value) : "unknown"
                                                )
                                            }
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="servingSize">Serving Size</Label>
                                        <Input
                                            id="servingSize"
                                            value={formData.servingSize}
                                            onChange={(e) => handleInputChange("servingSize", e.target.value)}
                                            placeholder="100"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="servingUnit">Unit</Label>
                                        <Input
                                            id="servingUnit"
                                            value={formData.servingUnit}
                                            onChange={(e) => handleInputChange("servingUnit", e.target.value)}
                                            placeholder="g"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Food
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <BarcodeScannerComponent onFoodDetected={handleBarcodeDetected} />
            </div>
        </>
    );
}