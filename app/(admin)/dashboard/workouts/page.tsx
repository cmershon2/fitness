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
    Clock,
    Trash2,
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

    // Helper to check if a date is today
    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Sort workouts by scheduled date (ascending)
    const sortByScheduledDate = (workouts: WorkoutInstance[]) => {
        return [...workouts].sort((a, b) =>
            new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        );
    };

    // Get today's workouts (scheduled or in-progress only)
    const todaysWorkouts = workoutInstances.filter((w) => {
        const workoutDate = new Date(w.scheduledDate);
        return isToday(workoutDate) && (w.status === "scheduled" || w.status === "in-progress");
    });

    // Filter and sort workouts by status
    const scheduledWorkouts = sortByScheduledDate(
        workoutInstances.filter((w) => w.status === "scheduled")
    );
    const inProgressWorkouts = sortByScheduledDate(
        workoutInstances.filter((w) => w.status === "in-progress")
    );
    const completedWorkouts = workoutInstances
        .filter((w) => w.status === "completed")
        .sort((a, b) => {
            // Sort completed workouts by completion date (most recent first)
            const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
            const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
            return dateB - dateA;
        });

    const workoutsForSelectedDate = workoutInstances.filter((w) => {
        const workoutDate = new Date(w.scheduledDate);
        return workoutDate.toDateString() === selectedDate.toDateString();
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
        <div className="space-y-4 pb-6">
            {/* Mobile-optimized header - stacks on small screens */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workouts</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Schedule and track your workout sessions
                    </p>
                </div>
                {/* Full button on desktop, icon-only option for mobile */}
                <div className="sm:hidden">
                    <ScheduleWorkoutDialog templates={templates} onWorkoutScheduled={fetchData} />
                </div>
                <div className="hidden sm:block">
                    <ScheduleWorkoutDialog templates={templates} onWorkoutScheduled={fetchData} />
                </div>
            </div>

            {/* Today's Workout Section - Prominent CTA */}
            {todaysWorkouts.length > 0 && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Today's Workout
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1">
                                    {format(new Date(), "EEEE, MMMM d, yyyy")}
                                </CardDescription>
                            </div>
                            <Badge variant="default" className="flex-shrink-0">
                                {todaysWorkouts.length} workout{todaysWorkouts.length > 1 ? 's' : ''}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {todaysWorkouts.map((workout) => {
                            const completedSets = workout.exercises.reduce(
                                (total, ex) => total + ex.sets.filter((s) => s.completed).length,
                                0
                            );
                            const totalSets = workout.exercises.reduce(
                                (total, ex) => total + ex.sets.length,
                                0
                            );

                            return (
                                <div
                                    key={workout.id}
                                    className="p-4 rounded-lg border bg-background shadow-sm"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-base sm:text-lg truncate">
                                                    {workout.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {workout.exercises.length} exercise
                                                    {workout.exercises.length !== 1 ? 's' : ''} •{' '}
                                                    {totalSets} set{totalSets !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            {workout.status === "in-progress" && (
                                                <Badge variant="secondary">
                                                    {completedSets}/{totalSets} done
                                                </Badge>
                                            )}
                                        </div>
                                        {workout.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {workout.description}
                                            </p>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => router.push(`/dashboard/workouts/${workout.id}`)}
                                                size="lg"
                                                className="flex-1"
                                            >
                                                <Play className="mr-2 h-5 w-5" />
                                                {workout.status === "in-progress"
                                                    ? "Continue Workout"
                                                    : "Start Today's Workout"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                onClick={() => handleDeleteWorkout(workout.id)}
                                                className="flex-shrink-0 px-3"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                {/* Scrollable tabs on mobile with shorter labels */}
                <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden flex-nowrap h-auto p-1">
                    <TabsTrigger value="scheduled" className="flex-shrink-0">
                        <Clock className="h-4 w-4 mr-1.5 sm:mr-2" />
                        <span className="hidden sm:inline">Scheduled</span>
                        <span className="sm:hidden">Scheduled</span>
                        <Badge variant="secondary" className="ml-1.5 sm:ml-2">
                            {scheduledWorkouts.filter(w => !isToday(new Date(w.scheduledDate))).length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="in-progress" className="flex-shrink-0">
                        <Play className="h-4 w-4 mr-1.5 sm:mr-2" />
                        <span className="hidden sm:inline">In Progress</span>
                        <span className="sm:hidden">Active</span>
                        <Badge variant="secondary" className="ml-1.5 sm:ml-2">
                            {inProgressWorkouts.filter(w => !isToday(new Date(w.scheduledDate))).length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 mr-1.5 sm:mr-2" />
                        <span className="hidden sm:inline">Completed</span>
                        <span className="sm:hidden">Done</span>
                        <Badge variant="secondary" className="ml-1.5 sm:ml-2">
                            {completedWorkouts.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex-shrink-0">
                        <CalendarIcon className="h-4 w-4 mr-1.5 sm:mr-2" />
                        Calendar
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="scheduled" className="space-y-3 mt-4">
                    {scheduledWorkouts.filter(w => !isToday(new Date(w.scheduledDate))).length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Dumbbell className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground mb-4">No upcoming workouts</p>
                                <ScheduleWorkoutDialog
                                    templates={templates}
                                    onWorkoutScheduled={fetchData}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        scheduledWorkouts
                            .filter(w => !isToday(new Date(w.scheduledDate)))
                            .map((workout) => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    onDelete={handleDeleteWorkout}
                                    onStart={() => router.push(`/dashboard/workouts/${workout.id}`)}
                                />
                            ))
                    )}
                </TabsContent>

                <TabsContent value="in-progress" className="space-y-3 mt-4">
                    {inProgressWorkouts.filter(w => !isToday(new Date(w.scheduledDate))).length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Play className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">No workouts in progress</p>
                            </CardContent>
                        </Card>
                    ) : (
                        inProgressWorkouts
                            .filter(w => !isToday(new Date(w.scheduledDate)))
                            .map((workout) => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    onDelete={handleDeleteWorkout}
                                    onStart={() => router.push(`/dashboard/workouts/${workout.id}`)}
                                />
                            ))
                    )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-3 mt-4">
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

                <TabsContent value="calendar" className="mt-4">
                    {/* Single column on mobile, two columns on large screens */}
                    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg sm:text-xl">Workout Calendar</CardTitle>
                                <CardDescription className="text-sm">
                                    Select a date to view workouts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center pb-4">
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
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg sm:text-xl">
                                    {format(selectedDate, "MMMM d, yyyy")}
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    {workoutsForSelectedDate.length === 0
                                        ? "No workouts scheduled"
                                        : `${workoutsForSelectedDate.length} workout${workoutsForSelectedDate.length > 1 ? "s" : ""
                                        } scheduled`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {workoutsForSelectedDate.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <CalendarIcon className="mb-3 h-10 w-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground mb-3">
                                            No workouts for this date
                                        </p>
                                        <ScheduleWorkoutDialog
                                            templates={templates}
                                            onWorkoutScheduled={fetchData}
                                        />
                                    </div>
                                ) : (
                                    workoutsForSelectedDate.map((workout) => (
                                        <div
                                            key={workout.id}
                                            className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm sm:text-base truncate">
                                                        {workout.name}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {workout.exercises.length} exercise
                                                        {workout.exercises.length !== 1 ? "s" : ""} •{" "}
                                                        {workout.exercises.reduce(
                                                            (total, ex) => total + ex.sets.length,
                                                            0
                                                        )}{" "}
                                                        sets
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        workout.status === "completed"
                                                            ? "default"
                                                            : workout.status === "in-progress"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                    className="flex-shrink-0"
                                                >
                                                    {workout.status === "completed"
                                                        ? "Done"
                                                        : workout.status === "in-progress"
                                                            ? "Active"
                                                            : "Scheduled"}
                                                </Badge>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    router.push(`/dashboard/workouts/${workout.id}`)
                                                }
                                                className="w-full"
                                            >
                                                {workout.status === "completed" ? (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        View
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="mr-2 h-4 w-4" />
                                                        Start
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    ))
                                )}
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

    // Calculate relative date
    const getRelativeDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow";
        } else if (diffDays > 0 && diffDays <= 7) {
            return `In ${diffDays} days`;
        } else if (diffDays < 0 && diffDays >= -7) {
            return `${Math.abs(diffDays)} days ago`;
        }
        return format(date, "MMM d, yyyy");
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg sm:text-xl truncate">
                                {workout.name}
                            </CardTitle>
                            <Badge
                                variant={
                                    workout.status === "completed"
                                        ? "default"
                                        : workout.status === "in-progress"
                                            ? "secondary"
                                            : "outline"
                                }
                                className="flex-shrink-0"
                            >
                                {workout.status === "completed"
                                    ? "Completed"
                                    : workout.status === "in-progress"
                                        ? "In Progress"
                                        : "Scheduled"}
                            </Badge>
                        </div>
                        <CardDescription className="text-xs sm:text-sm">
                            {workout.status === "scheduled" && (
                                <>
                                    <span className="font-medium text-foreground">
                                        {getRelativeDate(workout.scheduledDate)}
                                    </span>
                                    {" • "}
                                    {format(new Date(workout.scheduledDate), "PPP")}
                                </>
                            )}
                            {workout.status === "in-progress" && (
                                <>
                                    Started {format(new Date(workout.scheduledDate), "PPP")}
                                </>
                            )}
                            {workout.status === "completed" && (
                                <>
                                    {format(new Date(workout.scheduledDate), "PPP")}
                                    {workout.completedDate &&
                                        ` • Completed ${format(new Date(workout.completedDate), "PP")}`}
                                </>
                            )}
                        </CardDescription>
                    </div>
                </div>
                {workout.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {workout.description}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {workout.exercises.length} exercise
                            {workout.exercises.length !== 1 ? "s" : ""} • {totalSets} set
                            {totalSets !== 1 ? "s" : ""}
                        </span>
                        {workout.status === "in-progress" && (
                            <span className="text-sm font-medium">
                                {completedSets}/{totalSets} completed
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={onStart} className="flex-1" size="default">
                            {workout.status === "completed" ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    View
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDelete(workout.id)}
                            className="flex-shrink-0"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}