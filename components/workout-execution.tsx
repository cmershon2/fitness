"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, Loader2, Cloud, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExerciseSet {
    id: string;
    setNumber: number;
    targetReps: number;
    actualReps: number | null;
    weight: number | null;
    unit: string;
    rpe: number | null;        // NEW
    notes: string | null;      // NEW
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

// Helper function to get RPE label
const getRpeLabel = (value: number) => {
    if (value <= 2) return "Very Easy";
    if (value <= 4) return "Easy";
    if (value <= 6) return "Moderate";
    if (value <= 8) return "Hard";
    return "Maximum Effort";
};

// Helper function to get RPE color
const getRpeColor = (value: number) => {
    if (value <= 4) return "bg-green-500";
    if (value <= 6) return "bg-yellow-500";
    if (value <= 8) return "bg-orange-500";
    return "bg-red-500";
};

export function WorkoutExecution({ workoutId }: WorkoutExecutionProps) {
    const [workout, setWorkout] = useState<WorkoutInstance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [savingSetIds, setSavingSetIds] = useState<Set<string>>(new Set());
    const [isCompleting, setIsCompleting] = useState(false);
    const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

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

    const toggleNotesField = (setId: string) => {
        setExpandedNotes(prev => {
            const next = new Set(prev);
            if (next.has(setId)) {
                next.delete(setId);
            } else {
                next.add(setId);
            }
            return next;
        });
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
                    {workout.description && <p className="text-muted-foreground">{workout.description}</p>}
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

            {workout.exercises.map((exercise) => (
                <Card key={exercise.id}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div>
                                <div>{exercise.exerciseName}</div>
                                {exercise.muscleGroup && (
                                    <div className="text-sm font-normal text-muted-foreground">
                                        {exercise.muscleGroup}
                                    </div>
                                )}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {exercise.sets.map((set) => {
                            const isSaving = savingSetIds.has(set.id);
                            const showNotes = expandedNotes.has(set.id);
                            const currentRpe = set.rpe ?? 5;

                            return (
                                <div
                                    key={set.id}
                                    className="space-y-3 rounded-lg border p-4"
                                >
                                    {/* Set Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={set.completed}
                                                onCheckedChange={(checked) => {
                                                    updateSetImmediate(set.id, {
                                                        completed: checked as boolean,
                                                    });
                                                }}
                                            />
                                            <Label className="text-base font-semibold">
                                                Set {set.setNumber}
                                            </Label>
                                            <Badge variant="outline" className="text-xs">
                                                Target: {set.targetReps} reps
                                            </Badge>
                                        </div>
                                        {isSaving && (
                                            <Cloud className="h-4 w-4 animate-pulse text-muted-foreground" />
                                        )}
                                    </div>

                                    {/* Reps and Weight */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor={`reps-${set.id}`}>
                                                Actual Reps
                                            </Label>
                                            <Input
                                                id={`reps-${set.id}`}
                                                type="number"
                                                min="0"
                                                value={set.actualReps ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                        ? parseInt(e.target.value)
                                                        : null;
                                                    updateSetOptimistically(set.id, {
                                                        actualReps: value,
                                                    });
                                                    updateSetDebounced(set.id, {
                                                        actualReps: value,
                                                    });
                                                }}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`weight-${set.id}`}>
                                                Weight ({set.unit})
                                            </Label>
                                            <Input
                                                id={`weight-${set.id}`}
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={set.weight ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                        ? parseFloat(e.target.value)
                                                        : null;
                                                    updateSetOptimistically(set.id, {
                                                        weight: value,
                                                    });
                                                    updateSetDebounced(set.id, {
                                                        weight: value,
                                                    });
                                                }}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {/* RPE Slider */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>RPE (Rate of Perceived Exertion)</Label>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-8 h-8 rounded-full ${getRpeColor(
                                                        currentRpe
                                                    )} flex items-center justify-center text-white text-sm font-bold`}
                                                >
                                                    {currentRpe}
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {getRpeLabel(currentRpe)}
                                                </span>
                                            </div>
                                        </div>
                                        <Slider
                                            min={1}
                                            max={10}
                                            step={0.5}
                                            value={[currentRpe]}
                                            onValueChange={([value]) => {
                                                updateSetOptimistically(set.id, { rpe: value });
                                                updateSetDebounced(set.id, { rpe: value });
                                            }}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Very Easy</span>
                                            <span>Moderate</span>
                                            <span>Max Effort</span>
                                        </div>
                                    </div>

                                    {/* Notes Section */}
                                    <div className="space-y-2">
                                        {!showNotes ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleNotesField(set.id)}
                                                className="w-full"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                {set.notes ? "Edit Note" : "Add Note"}
                                            </Button>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor={`notes-${set.id}`}>
                                                        Notes (Optional)
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleNotesField(set.id)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    id={`notes-${set.id}`}
                                                    value={set.notes ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value || null;
                                                        updateSetOptimistically(set.id, {
                                                            notes: value,
                                                        });
                                                        updateSetDebounced(set.id, {
                                                            notes: value,
                                                        });
                                                    }}
                                                    placeholder="e.g., Form felt good, slight lower back tightness"
                                                    rows={3}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            ))}

            <Button
                onClick={completeWorkout}
                disabled={!allSetsCompleted || isCompleting || workout.status === "completed"}
                className="w-full"
                size="lg"
            >
                {isCompleting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                    </>
                ) : (
                    <>
                        <Check className="mr-2 h-4 w-4" />
                        {workout.status === "completed"
                            ? "Workout Completed"
                            : allSetsCompleted
                                ? "Complete Workout"
                                : "Complete All Sets First"}
                    </>
                )}
            </Button>
        </div>
    );
}