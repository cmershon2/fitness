"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import WeightEntryForm from "./weight-entry-form";
import { toast } from "sonner";

interface Weight {
    id: string;
    weight: number;
    unit: string;
    date: string;
    notes?: string;
}

interface WeightListProps {
    weights: Weight[];
    isLoading: boolean;
    onUpdate: () => void;
}

export default function WeightList({
    weights,
    isLoading,
    onUpdate,
}: WeightListProps) {
    const [editingWeight, setEditingWeight] = useState<Weight | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/weights/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Weight deleted successfully");
                onUpdate();
            } else {
                toast.error("Failed to delete weight");
            }
        } catch (error) {
            console.error("Error deleting weight:", error);
            toast.error("An error occurred");
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (weights.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        No weight entries yet. Add your first entry to start tracking!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {weights.map((weight) => (
                    <Card key={weight.id}>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold">{weight.weight}</span>
                                        <span className="text-lg text-muted-foreground">
                                            {weight.unit}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {new Date(weight.date).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                    {weight.notes && (
                                        <p className="text-sm mt-2">{weight.notes}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingWeight(weight)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeletingId(weight.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingWeight} onOpenChange={() => setEditingWeight(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Weight Entry</DialogTitle>
                    </DialogHeader>
                    {editingWeight && (
                        <WeightEntryForm
                            initialData={editingWeight}
                            onSuccess={() => {
                                setEditingWeight(null);
                                onUpdate();
                            }}
                            onCancel={() => setEditingWeight(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Weight Entry</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this weight entry? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingId(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingId && handleDelete(deletingId)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}