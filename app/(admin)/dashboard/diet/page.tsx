"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AddFoodDialog from "@/components/add-food-dialog";

interface Food {
    id: string;
    name: string;
    brand?: string;
    calories: number;
    servingSize?: string;
    servingUnit?: string;
}

interface DietEntry {
    id: string;
    foodId: string;
    mealCategory: string;
    servings: number;
    notes?: string;
    food: Food;
}

interface DietData {
    entries: {
        breakfast: DietEntry[];
        lunch: DietEntry[];
        snack: DietEntry[];
        dinner: DietEntry[];
    };
    totals: {
        breakfast: number;
        lunch: number;
        snack: number;
        dinner: number;
    };
    dailyTotal: number;
}

type MealCategory = "breakfast" | "lunch" | "snack" | "dinner";

const mealCategories: { value: MealCategory; label: string; icon: string }[] = [
    { value: "breakfast", label: "Breakfast", icon: "🌅" },
    { value: "lunch", label: "Lunch", icon: "🌞" },
    { value: "snack", label: "Snacks", icon: "🍎" },
    { value: "dinner", label: "Dinner", icon: "🌙" },
];

export default function DietPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [dietData, setDietData] = useState<DietData | null>(null);
    const [loading, setLoading] = useState(false);
    const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
    const [selectedMealCategory, setSelectedMealCategory] =
        useState<MealCategory>("breakfast");

    // Fetch diet entries for selected date
    useEffect(() => {
        fetchDietEntries();
    }, [date]);

    const fetchDietEntries = async () => {
        try {
            setLoading(true);
            const dateStr = format(date, "yyyy-MM-dd");
            const response = await fetch(`/api/diet-entries?date=${dateStr}`);

            if (!response.ok) {
                throw new Error("Failed to fetch diet entries");
            }

            const data = await response.json();
            setDietData(data);
        } catch (error) {
            console.error("Error fetching diet entries:", error);
            toast.error("Failed to load diet entries");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEntry = async (entryId: string) => {
        try {
            const response = await fetch(`/api/diet-entries/${entryId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete entry");
            }

            toast.success("Entry deleted");
            fetchDietEntries();
        } catch (error) {
            console.error("Error deleting entry:", error);
            toast.error("Failed to delete entry");
        }
    };

    const handleAddFood = (category: MealCategory) => {
        setSelectedMealCategory(category);
        setAddFoodDialogOpen(true);
    };

    const renderMealSection = (category: MealCategory) => {
        const mealInfo = mealCategories.find((m) => m.value === category);
        if (!mealInfo) return null;

        const entries = dietData?.entries[category] || [];
        const total = dietData?.totals[category] || 0;

        return (
            <Card key={category}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{mealInfo.icon}</span>
                            <CardTitle className="text-lg">{mealInfo.label}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-muted-foreground">
                                {Math.round(total)} cal
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAddFood(category)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {entries.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground mb-3">
                                No items logged yet
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddFood(category)}
                            >
                                <Plus className="mr-2 h-3 w-3" />
                                Add Food
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {entry.food.name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <p className="text-xs text-muted-foreground">
                                                {entry.servings} serving{entry.servings !== 1 && "s"}
                                            </p>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <p className="text-xs font-medium">
                                                {Math.round(entry.food.calories * entry.servings)} cal
                                            </p>
                                            {entry.food.brand && (
                                                <>
                                                    <span className="text-xs text-muted-foreground">
                                                        •
                                                    </span>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {entry.food.brand}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {entry.notes && (
                                            <p className="text-xs text-muted-foreground italic mt-1">
                                                {entry.notes}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0"
                                        onClick={() => handleDeleteEntry(entry.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Diet Tracking</h1>
                <p className="text-muted-foreground">
                    Log your daily food intake and track calories
                </p>
            </div>

            {/* Date Picker & Daily Total */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Date:</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(date, "PPP")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(newDate) => newDate && setDate(newDate)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="sm:ml-auto">
                            <div className="flex items-center justify-between sm:justify-end gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Daily Total:
                                </span>
                                <p className="text-2xl font-bold">
                                    {dietData?.dailyTotal || 0}{" "}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        cal
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Meal Sections */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {mealCategories.map((category) => renderMealSection(category.value))}
                </div>
            )}

            {/* Add Food Dialog */}
            <AddFoodDialog
                open={addFoodDialogOpen}
                onOpenChange={setAddFoodDialogOpen}
                mealCategory={selectedMealCategory}
                date={date}
                onSuccess={fetchDietEntries}
            />
        </div>
    );
}