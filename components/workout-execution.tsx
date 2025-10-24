"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Check, Loader2, Cloud } from "lucide-react";
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
    const [savingSetIds, setSavingSetIds] = useState<Set<string>>(new Set());
    const [isCompleting, setIsCompleting] = useState(false);

    const pendingUpdates = useRef<Map<string, NodeJS.Timeout>>(new Map());

    useEffect(() => {
        fetchWorkout();

        return () => {
            pendingUpdates.current.forEach(timer => clearTimeout(timer));
            pendingUpdates.current.clear();
        };
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

    const updateSetOptimistically = useCallback((setId: string, data: Partial<ExerciseSet>) => {
        setWorkout(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                exercises: prev.exercises.map(exercise => ({
                    ...exercise,
                    sets: exercise.sets.map(set =>
                        set.id === setId
                            ? { ...set, ...data }
                            : set
                    )
                }))
            };
        });
    }, []);

    const updateSetDebounced = useCallback((setId: string, data: Partial<ExerciseSet>) => {
        const existingTimer = pendingUpdates.current.get(setId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timer = setTimeout(async () => {
            setSavingSetIds(prev => new Set(prev).add(setId));

            try {
                const response = await fetch(`/api/exercise-sets/${setId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error("Failed to update set");
                }

                const updatedSet = await response.json();

                setWorkout(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        exercises: prev.exercises.map(exercise => ({
                            ...exercise,
                            sets: exercise.sets.map(set =>
                                set.id === setId
                                    ? updatedSet
                                    : set
                            )
                        }))
                    };
                });

            } catch (error) {
                toast.error("Failed to save changes");
                console.error(error);
                await fetchWorkout();
            } finally {
                setSavingSetIds(prev => {
                    const next = new Set(prev);
                    next.delete(setId);
                    return next;
                });
                pendingUpdates.current.delete(setId);
            }
        }, 1500);

        pendingUpdates.current.set(setId, timer);
    }, []);

    const updateSetImmediate = async (setId: string, data: Partial<ExerciseSet>) => {
        updateSetOptimistically(setId, data);

        const existingTimer = pendingUpdates.current.get(setId);
        if (existingTimer) {
            clearTimeout(existingTimer);
            pendingUpdates.current.delete(setId);
        }

        setSavingSetIds(prev => new Set(prev).add(setId));

        try {
            const response = await fetch(`/api/exercise-sets/${setId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to update set");

            const updatedSet = await response.json();

            setWorkout(prev => {
                if (!prev) return prev;

                return {
                    ...prev,
                    exercises: prev.exercises.map(exercise => ({
                        ...exercise,
                        sets: exercise.sets.map(set =>
                            set.id === setId
                                ? updatedSet
                                : set
                        )
                    }))
                };
            });

        } catch (error) {
            toast.error("Failed to save changes");
            console.error(error);
            await fetchWorkout();
        } finally {
            setSavingSetIds(prev => {
                const next = new Set(prev);
                next.delete(setId);
                return next;
            });
        }
    };

    const completeWorkout = async () => {
        const pendingTimers = Array.from(pendingUpdates.current.keys());
        if (pendingTimers.length > 0) {
            toast.info("Saving changes...");
            pendingUpdates.current.forEach(timer => clearTimeout(timer));
            pendingUpdates.current.clear();
            await new Promise(resolve => setTimeout(resolve, 500));
        }

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
        <div className="space-y-4 pb-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{workout.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        {new Date(workout.scheduledDate).toLocaleDateString()}
                    </p>
                    <p>{workout.description}</p>
                </div>
                <Badge
                    variant={
                        workout.status === "completed"
                            ? "default"
                            : workout.status === "in-progress"
                                ? "secondary"
                                : "outline"
                    }
                    className="w-fit"
                >
                    {workout.status}
                </Badge>
            </div>

            {workout.exercises.map((exercise, exIndex) => (
                <Card key={exercise.id}>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-lg sm:text-xl">
                                {exIndex + 1}. {exercise.exerciseName}
                            </CardTitle>
                            {exercise.muscleGroup && (
                                <div className="flex flex-wrap gap-1.5">
                                    {exercise.muscleGroup.split(',').map((muscle, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {muscle.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        {exercise.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{exercise.notes}</p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                        {exercise.sets.map((set) => (
                            <SetRow
                                key={set.id}
                                set={set}
                                isSaving={savingSetIds.has(set.id)}
                                onChangeOptimistic={(data) => updateSetOptimistically(set.id, data)}
                                onChangeDebounced={(data) => updateSetDebounced(set.id, data)}
                                onChangeImmediate={(data) => updateSetImmediate(set.id, data)}
                                disabled={workout.status === "completed"}
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
    isSaving: boolean;
    onChangeOptimistic: (data: Partial<ExerciseSet>) => void;
    onChangeDebounced: (data: Partial<ExerciseSet>) => void;
    onChangeImmediate: (data: Partial<ExerciseSet>) => void;
    disabled: boolean;
}

function SetRow({
    set,
    isSaving,
    onChangeOptimistic,
    onChangeDebounced,
    onChangeImmediate,
    disabled
}: SetRowProps) {
    const [actualReps, setActualReps] = useState(set.actualReps?.toString() || "");
    const [weight, setWeight] = useState(set.weight?.toString() || "");

    useEffect(() => {
        setActualReps(set.actualReps?.toString() || "");
        setWeight(set.weight?.toString() || "");
    }, [set.actualReps, set.weight]);

    const handleRepsChange = (value: string) => {
        setActualReps(value);
        const reps = value ? parseInt(value) : null;
        onChangeOptimistic({ actualReps: reps });
        onChangeDebounced({ actualReps: reps });
    };

    const handleWeightChange = (value: string) => {
        setWeight(value);
        const weightValue = value ? parseFloat(value) : null;
        onChangeOptimistic({ weight: weightValue });
        onChangeDebounced({ weight: weightValue });
    };

    const handleCompletedChange = (checked: boolean) => {
        onChangeImmediate({ completed: checked });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-lg border bg-muted/50">
            {/* Mobile: Checkbox + Set number + Saving indicator in a row */}
            <div className="flex items-center gap-2 sm:min-w-[70px]">
                <Checkbox
                    checked={set.completed}
                    onCheckedChange={handleCompletedChange}
                    disabled={disabled}
                    className="h-5 w-5"
                />
                <Label className="font-semibold text-sm">
                    Set {set.setNumber}
                </Label>
                {isSaving && (
                    <Cloud className="h-3.5 w-3.5 text-muted-foreground animate-pulse ml-auto sm:ml-0" />
                )}
            </div>

            {/* Mobile: Full width inputs in a grid */}
            <div className="flex-1 grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground block">
                        Reps
                        <span className="text-[10px] ml-1">(Target: {set.targetReps})</span>
                    </Label>
                    <Input
                        type="number"
                        inputMode="numeric"
                        value={actualReps}
                        onChange={(e) => handleRepsChange(e.target.value)}
                        placeholder={set.targetReps.toString()}
                        disabled={disabled}
                        className="h-11 text-base sm:h-10"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground block">
                        Weight
                        <span className="text-[10px] ml-1">({set.unit})</span>
                    </Label>
                    <Input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        value={weight}
                        onChange={(e) => handleWeightChange(e.target.value)}
                        placeholder="0"
                        disabled={disabled}
                        className="h-11 text-base sm:h-10"
                    />
                </div>
            </div>
        </div>
    );
}