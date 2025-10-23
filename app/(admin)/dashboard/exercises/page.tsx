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
import ExerciseCard from "@/components/exercise-card";
import ExerciseDialog from "@/components/exercise-dialog";
import { MUSCLE_GROUPS } from "@/lib/constants";

// Define the Exercise interface
interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    description?: string;
}

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [search, setSearch] = useState("");
    const [muscleGroupFilter, setMuscleGroupFilter] = useState("all");

    useEffect(() => {
        fetchExercises();
    }, [search, muscleGroupFilter]);

    const fetchExercises = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (muscleGroupFilter !== "all") params.append("muscleGroup", muscleGroupFilter);

            const response = await fetch(`/api/exercises?${params}`);
            if (response.ok) {
                const data = await response.json();
                setExercises(data);
            }
        } catch (error) {
            console.error("Error fetching exercises:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Exercise Library</h1>
                <Button onClick={() => setShowDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Exercise
                </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 flex-col sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by muscle group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Muscle Groups</SelectItem>
                        {MUSCLE_GROUPS.map((group) => (
                            <SelectItem key={group.value} value={group.value}>
                                {group.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Exercise Grid */}
            {isLoading ? (
                <div>Loading exercises...</div>
            ) : exercises.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        {search || muscleGroupFilter !== "all"
                            ? "No exercises found matching your criteria."
                            : "No exercises yet. Add your first exercise to get started!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercises.map((exercise) => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onUpdate={fetchExercises}
                        />
                    ))}
                </div>
            )}

            <ExerciseDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                onSuccess={() => {
                    fetchExercises();
                    setShowDialog(false);
                }}
            />
        </div>
    );
}