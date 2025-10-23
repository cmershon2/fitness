"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MUSCLE_GROUPS_BY_CATEGORY, getMuscleGroupLabel } from "@/lib/constants";
import MuscleHighlighter from "./muscle-highlighter";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface Exercise {
    id?: string;
    name: string;
    muscleGroup: string;
    description?: string;
}

interface ExerciseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exercise?: Exercise;
    onSuccess: () => void;
}

export default function ExerciseDialog({
    open,
    onOpenChange,
    exercise,
    onSuccess,
}: ExerciseDialogProps) {
    const [name, setName] = useState("");
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewSide, setViewSide] = useState<"anterior" | "posterior">("anterior");

    useEffect(() => {
        if (exercise) {
            setName(exercise.name);
            // Parse muscle groups (they might be stored as comma-separated string)
            const muscles = exercise.muscleGroup.split(",").map(m => m.trim());
            setSelectedMuscles(muscles);
            setDescription(exercise.description || "");
        } else {
            setName("");
            setSelectedMuscles([]);
            setDescription("");
        }
    }, [exercise, open]);

    const handleMuscleToggle = (muscleValue: string) => {
        setSelectedMuscles((prev) =>
            prev.includes(muscleValue)
                ? prev.filter((m) => m !== muscleValue)
                : [...prev, muscleValue]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedMuscles.length === 0) {
            toast.error("Please select at least one muscle group");
            return;
        }

        setIsSubmitting(true);

        try {
            const url = exercise?.id
                ? `/api/exercises/${exercise.id}`
                : "/api/exercises";
            const method = exercise?.id ? "PUT" : "POST";

            // Store muscles as comma-separated string
            const muscleGroup = selectedMuscles.join(", ");

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, muscleGroup, description }),
            });

            if (response.ok) {
                toast.success(
                    exercise?.id
                        ? "Exercise updated successfully"
                        : "Exercise created successfully"
                );
                onSuccess();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to save exercise");
            }
        } catch (error) {
            console.error("Error saving exercise:", error);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {exercise?.id ? "Edit Exercise" : "Add New Exercise"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Exercise Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Bench Press, Squats"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Muscle Groups * (Select one or more)</Label>

                        {/* Selected muscles badges */}
                        {selectedMuscles.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md">
                                {selectedMuscles.map((muscle) => (
                                    <Badge key={muscle} variant="default" className="gap-1">
                                        {getMuscleGroupLabel(muscle)}
                                        <button
                                            type="button"
                                            onClick={() => handleMuscleToggle(muscle)}
                                            className="ml-1 hover:bg-destructive rounded-full"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <Tabs defaultValue="visual" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="visual">Visual Selection</TabsTrigger>
                                <TabsTrigger value="list">List Selection</TabsTrigger>
                            </TabsList>

                            {/* Visual Tab */}
                            <TabsContent value="visual" className="space-y-4">
                                <div className="flex justify-center gap-2 mb-4">
                                    <Button
                                        type="button"
                                        variant={viewSide === "anterior" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewSide("anterior")}
                                    >
                                        Front View
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={viewSide === "posterior" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewSide("posterior")}
                                    >
                                        Back View
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Body Model */}
                                    <div className="flex justify-center">
                                        <MuscleHighlighter
                                            muscles={selectedMuscles}
                                            side={viewSide}
                                            className="w-full max-w-sm"
                                        />
                                    </div>

                                    {/* Muscle Selection Buttons */}
                                    <div className="space-y-4">
                                        {Object.entries(MUSCLE_GROUPS_BY_CATEGORY).map(
                                            ([category, muscles]) => (
                                                <div key={category}>
                                                    <h4 className="font-semibold text-sm mb-2">
                                                        {category}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {muscles.map((muscle) => (
                                                            <Button
                                                                key={muscle.value}
                                                                type="button"
                                                                variant={
                                                                    selectedMuscles.includes(muscle.value)
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                size="sm"
                                                                onClick={() => handleMuscleToggle(muscle.value)}
                                                            >
                                                                {muscle.label}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* List Tab */}
                            <TabsContent value="list" className="space-y-4">
                                {Object.entries(MUSCLE_GROUPS_BY_CATEGORY).map(
                                    ([category, muscles]) => (
                                        <div key={category} className="space-y-2">
                                            <h4 className="font-semibold text-sm">{category}</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {muscles.map((muscle) => (
                                                    <Button
                                                        key={muscle.value}
                                                        type="button"
                                                        variant={
                                                            selectedMuscles.includes(muscle.value)
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        className="justify-start"
                                                        onClick={() => handleMuscleToggle(muscle.value)}
                                                    >
                                                        {muscle.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add notes about form, tips, or variations..."
                            rows={4}
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Saving..."
                                : exercise?.id
                                    ? "Update"
                                    : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}