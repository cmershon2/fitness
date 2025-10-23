"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface WorkoutTemplate {
    id: string;
    name: string;
    description?: string;
}

interface ScheduleWorkoutDialogProps {
    templates: WorkoutTemplate[];
    onWorkoutScheduled?: () => void;
}

export function ScheduleWorkoutDialog({
    templates,
    onWorkoutScheduled,
}: ScheduleWorkoutDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSchedule = async () => {
        if (!selectedTemplateId) {
            toast.error("Please select a workout template");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/workout-instances", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    templateId: selectedTemplateId,
                    scheduledDate: selectedDate.toISOString(),
                    notes: notes.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to schedule workout");
            }

            toast.success("Workout scheduled successfully!");

            // Reset form
            setSelectedTemplateId("");
            setSelectedDate(new Date());
            setNotes("");
            setOpen(false);

            // Notify parent component
            if (onWorkoutScheduled) {
                onWorkoutScheduled();
            }
        } catch (error) {
            toast.error("Failed to schedule workout. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Schedule Workout
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Schedule Workout</DialogTitle>
                    <DialogDescription>
                        Choose a workout template and date to schedule your workout.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="template">Workout Template</Label>
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                            <SelectTrigger id="template">
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Date</Label>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            className="rounded-md border"
                        />
                        <p className="text-sm text-muted-foreground">
                            Selected: {format(selectedDate, "PPP")}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any notes for this workout..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSchedule} disabled={isLoading || !selectedTemplateId}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Schedule
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}