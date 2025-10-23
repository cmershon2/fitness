"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExerciseSet {
    id: string;
    setNumber: number;
    targetReps: number;
    actualReps: number | null;
    weight: number | null;
    unit: string;
    completed: boolean;
}

interface InstanceExercise {
    id: string;
    exerciseName: string;
    muscleGroup: string | null;
    orderIndex: number;
    notes: string | null;
    sets: ExerciseSet[];
}

interface WorkoutInstance {
    id: string;
    name: string;
    description: string | null;
    scheduledDate: string;
    status: string;
    notes: string | null;
    exercises: InstanceExercise[];
}

interface WorkoutExecutionProps {
    workoutId: string;
}

export function WorkoutExecution({ workoutId }: WorkoutExecutionProps) {
    const [workout, setWorkout] = useState<WorkoutInstance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        fetchWorkout();
    }, [workoutId]);

    const fetchWorkout = async () => {
        try {
            const response = await fetch(`/api/workout-instances/${workoutId}`);
            if (!response.ok) throw new Error("Failed to fetch workout");
            const data = await response.json();
            setWorkout(data);
        } catch (error) {
            toast.error("Failed to load workout");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSet = async (setId: string, data: Partial<ExerciseSet>) => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/exercise-sets/${setId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to update set");

            // Refresh workout data
            await fetchWorkout();

        } catch (error) {
            toast.error("Failed to update set");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const completeWorkout = async () => {
        setIsCompleting(true);
        try {
            const response = await fetch(`/api/workout-instances/${workoutId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "completed",
                }),
            });

            if (!response.ok) throw new Error("Failed to complete workout");

            toast.success("Workout completed! Great job!");

            await fetchWorkout();
        } catch (error) {
            toast.error("Failed to complete workout");
            console.error(error);
        } finally {
            setIsCompleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!workout) {
        return <div>Workout not found</div>;
    }

    const allSetsCompleted = workout.exercises.every((ex) =>
        ex.sets.every((set) => set.completed)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{workout.name}</h1>
                    <p className="text-muted-foreground">
                        {new Date(workout.scheduledDate).toLocaleDateString()}
                    </p>
                </div>
                <Badge
                    variant={
                        workout.status === "completed"
                            ? "default"
                            : workout.status === "in-progress"
                                ? "secondary"
                                : "outline"
                    }
                >
                    {workout.status}
                </Badge>
            </div>

            {workout.exercises.map((exercise, exIndex) => (
                <Card key={exercise.id}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>
                                {exIndex + 1}. {exercise.exerciseName}
                            </span>
                            {exercise.muscleGroup && (
                                <Badge variant="outline">{exercise.muscleGroup}</Badge>
                            )}
                        </CardTitle>
                        {exercise.notes && (
                            <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {exercise.sets.map((set) => (
                            <SetRow
                                key={set.id}
                                set={set}
                                onUpdate={(data) => updateSet(set.id, data)}
                                disabled={workout.status === "completed" || isSaving}
                            />
                        ))}
                    </CardContent>
                </Card>
            ))}

            {workout.status !== "completed" && (
                <Button
                    onClick={completeWorkout}
                    disabled={!allSetsCompleted || isCompleting}
                    size="lg"
                    className="w-full"
                >
                    {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Check className="mr-2 h-5 w-5" />
                    Complete Workout
                </Button>
            )}
        </div>
    );
}

interface SetRowProps {
    set: ExerciseSet;
    onUpdate: (data: Partial<ExerciseSet>) => void;
    disabled: boolean;
}

function SetRow({ set, onUpdate, disabled }: SetRowProps) {
    const [actualReps, setActualReps] = useState(set.actualReps?.toString() || "");
    const [weight, setWeight] = useState(set.weight?.toString() || "");

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2 min-w-[80px]">
                <Checkbox
                    checked={set.completed}
                    onCheckedChange={(checked) =>
                        onUpdate({ completed: checked as boolean })
                    }
                    disabled={disabled}
                />
                <Label className="font-semibold">Set {set.setNumber}</Label>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-muted-foreground">
                        Reps (Target: {set.targetReps})
                    </Label>
                    <Input
                        type="number"
                        value={actualReps}
                        onChange={(e) => setActualReps(e.target.value)}
                        onBlur={() =>
                            onUpdate({ actualReps: actualReps ? parseInt(actualReps) : null })
                        }
                        placeholder={set.targetReps.toString()}
                        disabled={disabled}
                        className="h-9"
                    />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">
                        Weight ({set.unit})
                    </Label>
                    <Input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        onBlur={() =>
                            onUpdate({ weight: weight ? parseFloat(weight) : null })
                        }
                        placeholder="0"
                        disabled={disabled}
                        className="h-9"
                    />
                </div>
            </div>
        </div>
    );
}