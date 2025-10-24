"use client";

import { Scale, Dumbbell, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WeightActivity {
    id: string;
    weight: number;
    unit: string;
    date: string;
    createdAt: string;
    updatedAt: string;
    notes?: string | null;
}

interface WorkoutActivity {
    id: string;
    name: string;
    scheduledDate: string;
    completedDate: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Activity {
    type: "weight" | "workout";
    date: string;
    data: WeightActivity | WorkoutActivity;
}

interface RecentActivityProps {
    activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-sm text-muted-foreground">
                    No recent activity to display
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => {
                // Guard against invalid date values
                const activityDate = activity.date ? new Date(activity.date) : null;
                const isValidDate = activityDate && !isNaN(activityDate.getTime());

                if (activity.type === "weight") {
                    const weightData = activity.data as WeightActivity;
                    return (
                        <div
                            key={weightData.id}
                            className="flex items-start gap-3 pb-3 border-b last:border-0"
                        >
                            <div className="p-2 rounded-full bg-primary/10">
                                <Scale className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">
                                    Weight logged: {weightData.weight} {weightData.unit}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isValidDate
                                        ? formatDistanceToNow(activityDate, {
                                            addSuffix: true,
                                        })
                                        : "Recently"}
                                </p>
                            </div>
                        </div>
                    );
                }

                if (activity.type === "workout") {
                    const workoutData = activity.data as WorkoutActivity;
                    return (
                        <div
                            key={workoutData.id}
                            className="flex items-start gap-3 pb-3 border-b last:border-0"
                        >
                            <div className="p-2 rounded-full bg-green-500/10">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">
                                    Workout completed: {workoutData.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isValidDate
                                        ? formatDistanceToNow(activityDate, {
                                            addSuffix: true,
                                        })
                                        : "Recently"}
                                </p>
                            </div>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}