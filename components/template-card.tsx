"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import TemplateDialog from "./template-dialog";
import { toast } from "sonner";

interface TemplateExercise {
    id: string;
    exerciseId: string;
    orderIndex: number;
    sets: number;
    reps: number;
    notes?: string;
    exercise: {
        id: string;
        name: string;
        muscleGroup: string;
    };
}

interface Template {
    id: string;
    name: string;
    description?: string;
    exercises: TemplateExercise[];
}

interface TemplateCardProps {
    template: Template;
    onUpdate: () => void;
}

export default function TemplateCard({ template, onUpdate }: TemplateCardProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/templates/${template.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Template deleted successfully");
                onUpdate();
            } else {
                toast.error("Failed to delete template");
            }
        } catch (error) {
            console.error("Error deleting template:", error);
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
                        <div className="flex-1">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            {template.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {template.description}
                                </p>
                            )}
                        </div>
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
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Dumbbell className="h-4 w-4" />
                        <span>{template.exercises.length} exercises</span>
                    </div>

                    <div className="space-y-2">
                        {template.exercises.map((te, index) => (
                            <div
                                key={te.id}
                                className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                                        {index + 1}
                                    </Badge>
                                    <span className="font-medium">{te.exercise.name}</span>
                                </div>
                                <span className="text-muted-foreground">
                                    {te.sets} × {te.reps}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <TemplateDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                template={template}
                onSuccess={() => {
                    setShowEditDialog(false);
                    onUpdate();
                }}
            />

            {/* Delete Confirmation */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Template</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{template.name}"? This action
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