"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface WeightEntryFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: {
        id?: string;
        weight: number;
        unit: string;
        date: string;
        notes?: string;
    };
}

export default function WeightEntryForm({
    onSuccess,
    onCancel,
    initialData,
}: WeightEntryFormProps) {
    const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
    const [unit, setUnit] = useState(initialData?.unit || "kg");
    const [date, setDate] = useState(
        initialData?.date
            ? new Date(initialData.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
    );
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = initialData?.id
                ? `/api/weights/${initialData.id}`
                : "/api/weights";
            const method = initialData?.id ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ weight, unit, date, notes }),
            });

            if (response.ok) {
                toast.success(
                    initialData?.id
                        ? "Weight updated successfully"
                        : "Weight added successfully"
                );
                onSuccess();
            } else {
                toast.error("Failed to save weight");
            }
        } catch (error) {
            console.error("Error saving weight:", error);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="weight">Weight *</Label>
                    <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                        placeholder="Enter weight"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this entry..."
                    rows={3}
                />
            </div>

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : initialData?.id ? "Update" : "Add"}
                </Button>
            </div>
        </form>
    );
}