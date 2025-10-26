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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { CalendarIcon, Droplets, Plus, Settings, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface WaterEntry {
    id: string;
    amount: number;
    unit: string;
    timestamp: string;
}

interface WaterData {
    entries: WaterEntry[];
    total: number;
    unit: string;
    goal: number | null;
    progress: number;
}

interface WaterGoal {
    dailyGoal: number;
    unit: string;
}

const quickAddAmounts = {
    ml: [250, 500, 750, 1000],
    oz: [8, 16, 24, 32],
    cups: [1, 2, 3, 4],
};

const unitLabels = {
    ml: "ml",
    oz: "oz",
    cups: "cups",
};

export default function WaterPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [waterData, setWaterData] = useState<WaterData | null>(null);
    const [goal, setGoal] = useState<WaterGoal | null>(null);
    const [loading, setLoading] = useState(false);
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [showCelebration, setShowCelebration] = useState(false);

    // Goal form state
    const [newGoalAmount, setNewGoalAmount] = useState<string>("");
    const [newGoalUnit, setNewGoalUnit] = useState<string>("ml");

    useEffect(() => {
        fetchWaterGoal();
    }, []);

    useEffect(() => {
        if (goal) {
            fetchWaterData();
        }
    }, [date, goal]);

    const fetchWaterData = async () => {
        try {
            setLoading(true);
            const dateStr = format(date, "yyyy-MM-dd");
            const response = await fetch(`/api/water-entries?date=${dateStr}`);

            if (!response.ok) {
                throw new Error("Failed to fetch water entries");
            }

            const data = await response.json();
            setWaterData(data);

            // Check if goal was just completed
            if (data.progress >= 100 && data.total > 0 && goal) {
                checkForCelebration(data.total);
            }
        } catch (error) {
            console.error("Error fetching water entries:", error);
            toast.error("Failed to load water entries");
        } finally {
            setLoading(false);
        }
    };

    const fetchWaterGoal = async () => {
        try {
            const response = await fetch("/api/water-goal");

            if (!response.ok) {
                throw new Error("Failed to fetch water goal");
            }

            const data = await response.json();
            setGoal(data);
            setNewGoalAmount(data.dailyGoal.toString());
            setNewGoalUnit(data.unit);
        } catch (error) {
            console.error("Error fetching water goal:", error);
            // Fallback to defaults if fetching fails
            setGoal({ dailyGoal: 2000, unit: "ml" });
            setNewGoalAmount("2000");
            setNewGoalUnit("ml");
        }
    };

    const checkForCelebration = (newTotal: number) => {
        const prevTotal = waterData?.total || 0;
        const goalAmount = goal?.dailyGoal || 2000;
        if (prevTotal < goalAmount && newTotal >= goalAmount) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
        }
    };

    const handleQuickAdd = async (amount: number) => {
        if (!goal) return;

        try {
            const response = await fetch("/api/water-entries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount,
                    unit: goal.unit,
                    date: format(date, "yyyy-MM-dd"),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add water entry");
            }

            toast.success(`Added ${amount} ${unitLabels[goal.unit as keyof typeof unitLabels]}`);
            fetchWaterData();
        } catch (error) {
            console.error("Error adding water entry:", error);
            toast.error("Failed to add water");
        }
    };

    const handleCustomAdd = async () => {
        if (!goal) return;

        if (!customAmount || parseFloat(customAmount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            const response = await fetch("/api/water-entries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: parseFloat(customAmount),
                    unit: goal.unit,
                    date: format(date, "yyyy-MM-dd"),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add water entry");
            }

            toast.success(`Added ${customAmount} ${unitLabels[goal.unit as keyof typeof unitLabels]}`);
            setIsCustomDialogOpen(false);
            setCustomAmount("");
            fetchWaterData();
        } catch (error) {
            console.error("Error adding water entry:", error);
            toast.error("Failed to add water");
        }
    };

    const handleDeleteEntry = async (entryId: string) => {
        try {
            const response = await fetch(`/api/water-entries/${entryId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete entry");
            }

            toast.success("Entry deleted");
            fetchWaterData();
        } catch (error) {
            console.error("Error deleting entry:", error);
            toast.error("Failed to delete entry");
        }
    };

    const handleUpdateGoal = async () => {
        if (!newGoalAmount || parseFloat(newGoalAmount) <= 0) {
            toast.error("Please enter a valid goal amount");
            return;
        }

        try {
            const response = await fetch("/api/water-goal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dailyGoal: parseFloat(newGoalAmount),
                    unit: newGoalUnit,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update water goal");
            }

            toast.success("Water goal updated");
            setIsGoalDialogOpen(false);
            fetchWaterGoal();
            fetchWaterData();
        } catch (error) {
            console.error("Error updating water goal:", error);
            toast.error("Failed to update goal");
        }
    };

    // Show loading state while fetching initial goal
    if (!goal) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    const progressPercentage = Math.min(waterData?.progress || 0, 100);

    return (
        <div className="space-y-6">
            {/* Celebration Animation */}
            {showCelebration && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="bg-primary text-primary-foreground px-8 py-4 rounded-lg shadow-lg animate-bounce">
                        <div className="flex items-center gap-2 text-xl font-bold">
                            <Sparkles className="h-6 w-6" />
                            Goal Achieved! 🎉
                            <Sparkles className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Water Tracking</h1>
                    <p className="text-muted-foreground">Track your daily water intake</p>
                </div>
                <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Settings className="mr-2 h-4 w-4" />
                            Set Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Set Daily Water Goal</DialogTitle>
                            <DialogDescription>
                                Set your daily water intake goal
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Goal Amount</Label>
                                <Input
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={newGoalAmount}
                                    onChange={(e) => setNewGoalAmount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Select value={newGoalUnit} onValueChange={setNewGoalUnit}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ml">Milliliters (ml)</SelectItem>
                                        <SelectItem value="oz">Ounces (oz)</SelectItem>
                                        <SelectItem value="cups">Cups</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpdateGoal}>Save Goal</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Date Selector */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                        <Label>Date:</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(date, "PPP")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(newDate) => newDate && setDate(newDate)}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        Daily Progress
                    </CardTitle>
                    <CardDescription>
                        {waterData?.total || 0} / {goal.dailyGoal} {unitLabels[goal.unit as keyof typeof unitLabels]}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>{progressPercentage.toFixed(0)}%</span>
                            <span className="text-muted-foreground">
                                {Math.max(0, goal.dailyGoal - (waterData?.total || 0))}{" "}
                                {unitLabels[goal.unit as keyof typeof unitLabels]} remaining
                            </span>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Quick Add Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Add</CardTitle>
                    <CardDescription>Tap to log common amounts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {quickAddAmounts[goal.unit as keyof typeof quickAddAmounts].map((amount) => (
                            <Button
                                key={amount}
                                onClick={() => handleQuickAdd(amount)}
                                variant="outline"
                                className="h-20 flex flex-col"
                            >
                                <Droplets className="h-6 w-6 mb-1 text-blue-500" />
                                <span className="font-semibold">{amount}</span>
                                <span className="text-xs text-muted-foreground">
                                    {unitLabels[goal.unit as keyof typeof unitLabels]}
                                </span>
                            </Button>
                        ))}
                    </div>

                    {/* Custom Amount Dialog */}
                    <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full mt-3">
                                <Plus className="mr-2 h-4 w-4" />
                                Custom Amount
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Custom Amount</DialogTitle>
                                <DialogDescription>
                                    Enter a custom amount to log
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Amount ({unitLabels[goal.unit as keyof typeof unitLabels]})</Label>
                                    <Input
                                        type="number"
                                        step="1"
                                        min="1"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder="Enter amount..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCustomDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCustomAdd}>Add</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Entry History */}
            <Card>
                <CardHeader>
                    <CardTitle>Today&apos;s Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : waterData && waterData.entries.length > 0 ? (
                        <div className="space-y-2">
                            {waterData.entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {entry.amount} {unitLabels[entry.unit as keyof typeof unitLabels]}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(entry.timestamp), "h:mm a")}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteEntry(entry.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No water logged today. Start tracking your hydration!
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}