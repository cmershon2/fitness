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
import { toast } from "sonner";
import DraggableExerciseList from "./draggable-exercise-list";
import ExerciseSelector from "./exercise-selector";

interface TemplateExercise {
    id?: string;
    exerciseId: string;
    orderIndex: number;
    sets: number;
    reps: number;
    notes?: string;
    exercise?: {
        id: string;
        name: string;
        muscleGroup: string;
    };
}

interface Template {
    id?: string;
    name: string;
    description?: string;
    exercises: TemplateExercise[];
}

interface TemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template?: Template;
    onSuccess: () => void;
}

export default function TemplateDialog({
    open,
    onOpenChange,
    template,
    onSuccess,
}: TemplateDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [exercises, setExercises] = useState<TemplateExercise[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (template) {
            setName(template.name);
            setDescription(template.description || "");
            setExercises(template.exercises || []);
        } else {
            setName("");
            setDescription("");
            setExercises([]);
        }
    }, [template, open]);

    const handleAddExercise = (exerciseData: any) => {
        const newExercise: TemplateExercise = {
            exerciseId: exerciseData.id,
            orderIndex: exercises.length,
            sets: 3,
            reps: 10,
            exercise: exerciseData,
        };
        setExercises([...exercises, newExercise]);
    };

    const handleRemoveExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleUpdateExercise = (index: number, updates: Partial<TemplateExercise>) => {
        setExercises(
            exercises.map((ex, i) => (i === index ? { ...ex, ...updates } : ex))
        );
    };

    const handleReorderExercises = (newOrder: TemplateExercise[]) => {
        setExercises(newOrder.map((ex, index) => ({ ...ex, orderIndex: index })));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (exercises.length === 0) {
            toast.error("Please add at least one exercise");
            return;
        }

        setIsSubmitting(true);

        try {
            const url = template?.id
                ? `/api/templates/${template.id}`
                : "/api/templates";
            const method = template?.id ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    exercises: exercises.map((ex, index) => ({
                        exerciseId: ex.exerciseId,
                        orderIndex: index,
                        sets: ex.sets,
                        reps: ex.reps,
                        notes: ex.notes,
                    })),
                }),
            });

            if (response.ok) {
                toast.success(
                    template?.id
                        ? "Template updated successfully"
                        : "Template created successfully"
                );
                onSuccess();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to save template");
            }
        } catch (error) {
            console.error("Error saving template:", error);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {template?.id ? "Edit Template" : "Create Workout Template"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Template Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Push Day, Full Body Workout"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add notes about this workout template..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Exercises *</Label>

                        {exercises.length > 0 && (
                            <DraggableExerciseList
                                exercises={exercises}
                                onReorder={handleReorderExercises}
                                onRemove={handleRemoveExercise}
                                onUpdate={handleUpdateExercise}
                            />
                        )}

                        <ExerciseSelector onSelect={handleAddExercise} />
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
                                : template?.id
                                    ? "Update"
                                    : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}