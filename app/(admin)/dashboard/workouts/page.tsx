"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { ScheduleWorkoutDialog } from "@/components/schedule-workout-dialog";
import { toast } from "sonner";
import {
    Calendar as CalendarIcon,
    Dumbbell,
    Loader2,
    Play,
    CheckCircle2,
    Clock
} from "lucide-react";
import { format } from "date-fns";

interface WorkoutTemplate {
    id: string;
    name: string;
    description?: string;
}

interface WorkoutInstance {
    id: string;
    name: string;
    description?: string;
    scheduledDate: string;
    completedDate?: string;
    status: string;
    notes?: string;
    exercises: {
        id: string;
        exerciseName: string;
        sets: { id: string; completed: boolean }[];
    }[];
}

export default function WorkoutsPage() {
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [workoutInstances, setWorkoutInstances] = useState<WorkoutInstance[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("scheduled");
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch templates
            const templatesRes = await fetch("/api/templates");
            if (templatesRes.ok) {
                const templatesData = await templatesRes.json();
                setTemplates(templatesData);
            }

            // Fetch workout instances
            const instancesRes = await fetch("/api/workout-instances");
            if (instancesRes.ok) {
                const instancesData = await instancesRes.json();
                setWorkoutInstances(instancesData);
            }
        } catch (error) {
            toast.error("Failed to load workouts");
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteWorkout = async (id: string) => {
        if (!confirm("Are you sure you want to delete this workout?")) return;

        try {
            const response = await fetch(`/api/workout-instances/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete workout");

            toast.success("Workout deleted successfully");

            fetchData();
        } catch (error) {
            toast.error("Failed to delete workout");
            console.log(error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge variant="default">Completed</Badge>;
            case "in-progress":
                return <Badge variant="secondary">In Progress</Badge>;
            case "scheduled":
                return <Badge variant="outline">Scheduled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case "in-progress":
                return <Play className="h-5 w-5 text-blue-600" />;
            case "scheduled":
                return <Clock className="h-5 w-5 text-muted-foreground" />;
            default:
                return <Dumbbell className="h-5 w-5" />;
        }
    };

    const scheduledWorkouts = workoutInstances.filter((w) => w.status === "scheduled");
    const inProgressWorkouts = workoutInstances.filter((w) => w.status === "in-progress");
    const completedWorkouts = workoutInstances.filter((w) => w.status === "completed");

    const workoutsForSelectedDate = workoutInstances.filter((w) => {
        const workoutDate = new Date(w.scheduledDate);
        return (
            workoutDate.toDateString() === selectedDate.toDateString()
        );
    });

    // Get dates that have workouts for calendar highlighting
    const datesWithWorkouts = workoutInstances.map((w) => new Date(w.scheduledDate));

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
                    <p className="text-muted-foreground">
                        Schedule and track your workout sessions
                    </p>
                </div>
                <ScheduleWorkoutDialog templates={templates} onWorkoutScheduled={fetchData} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="scheduled">
                        Scheduled ({scheduledWorkouts.length})
                    </TabsTrigger>
                    <TabsTrigger value="in-progress">
                        In Progress ({inProgressWorkouts.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed ({completedWorkouts.length})
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Calendar
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="scheduled" className="space-y-4">
                    {scheduledWorkouts.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Dumbbell className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground mb-4">No scheduled workouts</p>
                                <ScheduleWorkoutDialog templates={templates} onWorkoutScheduled={fetchData} />
                            </CardContent>
                        </Card>
                    ) : (
                        scheduledWorkouts.map((workout) => (
                            <WorkoutCard
                                key={workout.id}
                                workout={workout}
                                onDelete={handleDeleteWorkout}
                                onStart={() => router.push(`/dashboard/workouts/${workout.id}`)}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="in-progress" className="space-y-4">
                    {inProgressWorkouts.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Play className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">No workouts in progress</p>
                            </CardContent>
                        </Card>
                    ) : (
                        inProgressWorkouts.map((workout) => (
                            <WorkoutCard
                                key={workout.id}
                                workout={workout}
                                onDelete={handleDeleteWorkout}
                                onStart={() => router.push(`/dashboard/workouts/${workout.id}`)}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {completedWorkouts.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">No completed workouts yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        completedWorkouts.map((workout) => (
                            <WorkoutCard
                                key={workout.id}
                                workout={workout}
                                onDelete={handleDeleteWorkout}
                                onStart={() => router.push(`/dashboard/workouts/${workout.id}`)}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="calendar">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Workout Calendar</CardTitle>
                                <CardDescription>Select a date to view workouts</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    modifiers={{
                                        hasWorkout: datesWithWorkouts,
                                    }}
                                    modifiersStyles={{
                                        hasWorkout: {
                                            fontWeight: "bold",
                                            textDecoration: "underline",
                                        },
                                    }}
                                    className="rounded-md border"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{format(selectedDate, "MMMM d, yyyy")}</CardTitle>
                                <CardDescription>
                                    {workoutsForSelectedDate.length === 0
                                        ? "No workouts scheduled"
                                        : `${workoutsForSelectedDate.length} workout(s)`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {workoutsForSelectedDate.map((workout) => (
                                    <div
                                        key={workout.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(workout.status)}
                                            <div>
                                                <p className="font-medium">{workout.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {workout.exercises.length} exercises
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(workout.status)}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push(`/dashboard/workouts/${workout.id}`)}
                                            >
                                                {workout.status === "completed" ? "View" : "Start"}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface WorkoutCardProps {
    workout: WorkoutInstance;
    onDelete: (id: string) => void;
    onStart: () => void;
}

function WorkoutCard({ workout, onDelete, onStart }: WorkoutCardProps) {
    const completedSets = workout.exercises.reduce(
        (total, ex) => total + ex.sets.filter((s) => s.completed).length,
        0
    );
    const totalSets = workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            {workout.name}
                            {workout.status === "completed" ? (
                                <Badge variant="default">Completed</Badge>
                            ) : workout.status === "in-progress" ? (
                                <Badge variant="secondary">In Progress</Badge>
                            ) : (
                                <Badge variant="outline">Scheduled</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {format(new Date(workout.scheduledDate), "PPP")}
                            {workout.completedDate &&
                                ` • Completed ${format(new Date(workout.completedDate), "PPP")}`}
                        </CardDescription>
                    </div>
                </div>
                {workout.description && (
                    <p className="text-sm text-muted-foreground">{workout.description}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {workout.exercises.length} exercises • {totalSets} sets
                        </span>
                        {workout.status === "in-progress" && (
                            <span className="text-sm font-medium">
                                {completedSets}/{totalSets} sets completed
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={onStart} className="flex-1">
                            {workout.status === "completed" ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    View
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    {workout.status === "in-progress" ? "Continue" : "Start"}
                                </>
                            )}
                        </Button>
                        {workout.status !== "completed" && (
                            <Button variant="outline" onClick={() => onDelete(workout.id)}>
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}