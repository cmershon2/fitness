"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MUSCLE_GROUPS, getMuscleGroupLabel } from "@/lib/constants";

interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    description?: string;
}

interface ExerciseSelectorProps {
    onSelect: (exercise: Exercise) => void;
}

export default function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [search, setSearch] = useState("");
    const [muscleGroupFilter, setMuscleGroupFilter] = useState("all");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            fetchExercises();
        }
    }, [open, search, muscleGroupFilter]);

    const fetchExercises = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (muscleGroupFilter !== "all")
                params.append("muscleGroup", muscleGroupFilter);

            const response = await fetch(`/api/exercises?${params}`);
            if (response.ok) {
                const data = await response.json();
                setExercises(data);
            }
        } catch (error) {
            console.error("Error fetching exercises:", error);
        }
    };

    const handleSelect = (exercise: Exercise) => {
        onSelect(exercise);
        setOpen(false);
        setSearch("");
        setMuscleGroupFilter("all");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Exercise
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Select Exercise</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search exercises..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select
                            value={muscleGroupFilter}
                            onValueChange={setMuscleGroupFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                {MUSCLE_GROUPS.map((group) => (
                                    <SelectItem key={group.value} value={group.value}>
                                        {group.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Exercise List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {exercises.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No exercises found. Try adjusting your search.
                            </p>
                        ) : (
                            exercises.map((exercise) => (
                                <Button
                                    key={exercise.id}
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start h-auto p-3"
                                    onClick={() => handleSelect(exercise)}
                                >
                                    <div className="flex flex-col items-start gap-1 w-full">
                                        <div className="font-medium">{exercise.name}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {exercise.muscleGroup.split(",").map((muscle) => (
                                                <Badge key={muscle.trim()} variant="secondary" className="text-xs">
                                                    {getMuscleGroupLabel(muscle.trim())}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </Button>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}