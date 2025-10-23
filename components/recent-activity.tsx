"use client";

import { Scale } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
    id: string;
    weight: number;
    unit: string;
    date: string;
    createdAt: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    if (activities.length === 0) {
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
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                >
                    <div className="p-2 rounded-full bg-primary/10">
                        <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                            Weight logged: {activity.weight} {activity.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.createdAt), {
                                addSuffix: true,
                            })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}