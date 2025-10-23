"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ExerciseDialog from "./exercise-dialog";
import MuscleHighlighter from "./muscle-highlighter";
import { toast } from "sonner";
import { getMuscleGroupLabel } from "@/lib/constants";

interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    description?: string;
}

interface ExerciseCardProps {
    exercise: Exercise;
    onUpdate: () => void;
}

export default function ExerciseCard({ exercise, onUpdate }: ExerciseCardProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Parse muscles (comma-separated string)
    const muscles = exercise.muscleGroup.split(",").map(m => m.trim());

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/exercises/${exercise.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Exercise deleted successfully");
                onUpdate();
            } else {
                toast.error("Failed to delete exercise");
            }
        } catch (error) {
            console.error("Error deleting exercise:", error);
            toast.error("An error occurred");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowEditDialog(true)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Body Highlighter Preview */}
                    <div className="flex justify-center">
                        <MuscleHighlighter
                            muscles={muscles}
                            side="anterior"
                            className="h-48"
                        />
                    </div>

                    {/* Muscle Badges */}
                    <div className="flex flex-wrap gap-2">
                        {muscles.map((muscle) => (
                            <Badge key={muscle} variant="secondary">
                                {getMuscleGroupLabel(muscle)}
                            </Badge>
                        ))}
                    </div>

                    {/* Description */}
                    {exercise.description && (
                        <p className="text-sm text-muted-foreground">
                            {exercise.description}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <ExerciseDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                exercise={exercise}
                onSuccess={() => {
                    setShowEditDialog(false);
                    onUpdate();
                }}
            />

            {/* Delete Confirmation */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Exercise</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{exercise.name}"? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}