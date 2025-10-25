"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    source: string;
    isCompound?: boolean;
}

interface FoodSelectorProps {
    onSelect: (food: Food) => void;
    triggerButton?: React.ReactNode;
    excludeCompoundFoods?: boolean; // New prop to filter out compound foods
}

export default function FoodSelector({
    onSelect,
    triggerButton,
    excludeCompoundFoods = false
}: FoodSelectorProps) {
    const [foods, setFoods] = useState<Food[]>([]);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchFoods();
        }
    }, [open, search]);

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append("search", search);

            const response = await fetch(`/api/foods?${params}`);
            if (response.ok) {
                let data = await response.json();

                // Filter out compound foods if requested
                if (excludeCompoundFoods) {
                    data = data.filter((food: Food) => !food.isCompound);
                }

                setFoods(data);
            }
        } catch (error) {
            console.error("Error fetching foods:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (food: Food) => {
        onSelect(food);
        setOpen(false);
        setSearch("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button variant="outline" type="button">
                        Select Food
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Select Food</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search foods by name or brand..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Food List */}
                    <ScrollArea className="h-[400px] pr-4">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading foods...
                            </div>
                        ) : foods.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {search ? "No foods found matching your search." : "No foods in your library yet."}
                                <p className="text-sm mt-2">
                                    Go to the Foods page to add items to your library.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {foods.map((food) => (
                                    <button
                                        key={food.id}
                                        onClick={() => handleSelect(food)}
                                        className="w-full text-left p-4 rounded-lg border hover:bg-accent hover:border-primary transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{food.name}</p>
                                                {food.brand && (
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {food.brand}
                                                    </p>
                                                )}
                                                {food.servingSize && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Serving: {food.servingSize} {food.servingUnit}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {food.calories} cal
                                                    </Badge>
                                                    {food.protein !== null && food.protein !== undefined && (
                                                        <Badge variant="outline" className="text-xs">
                                                            P: {food.protein}g
                                                        </Badge>
                                                    )}
                                                    {food.carbs !== null && food.carbs !== undefined && (
                                                        <Badge variant="outline" className="text-xs">
                                                            C: {food.carbs}g
                                                        </Badge>
                                                    )}
                                                    {food.fat !== null && food.fat !== undefined && (
                                                        <Badge variant="outline" className="text-xs">
                                                            F: {food.fat}g
                                                        </Badge>
                                                    )}
                                                    {food.source === "barcode" && (
                                                        <Badge variant="default" className="text-xs">
                                                            Scanned
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}