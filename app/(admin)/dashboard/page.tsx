"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Scale,
   Dumbbell,
   ClipboardList,
   Plus,
   TrendingUp,
   TrendingDown,
   Minus,
   Calendar,
   Play,
   CheckCircle2,
   Apple,
   Utensils,
   Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WeightChart from "@/components/weight-chart";
import RecentActivity from "@/components/recent-activity";
import { Skeleton } from "@/components/ui/skeleton";

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

interface WorkoutInstance {
   id: string;
   name: string;
   status: string;
   scheduledDate: string;
   totalSets: number;
   completedSets: number;
   progressPercentage: number;
   exercises: {
      id: string;
      exerciseName: string;
   }[];
}

interface DashboardData {
   todayWeight?: {
      weight: number;
      unit: string;
      date: string;
   };
   latestWeight?: {
      weight: number;
      unit: string;
      date: string;
   };
   recentWeights: Array<{
      id: string;
      weight: number;
      unit: string;
      date: string;
   }>;
   todaysWorkouts: WorkoutInstance[];
   stats: {
      exercises: number;
      templates: number;
      weightEntries: number;
      foods: number;
   };
   recentActivities: Activity[];
}

export default function DashboardPage() {
   const [data, setData] = useState<DashboardData | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const router = useRouter();

   useEffect(() => {
      fetchDashboardData();
   }, []);

   const fetchDashboardData = async () => {
      try {
         const response = await fetch("/api/dashboard");
         if (response.ok) {
            const data = await response.json();
            setData(data);
         }
      } catch (error) {
         console.error("Error fetching dashboard data:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const calculateTrend = () => {
      if (!data?.recentWeights || data.recentWeights.length < 2) return null;

      const sorted = [...data.recentWeights].sort(
         (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const current = sorted[0].weight;
      const previous = sorted[1].weight;
      const diff = Math.abs(current - previous);

      if (diff < 0.1) return { type: "stable", diff: 0 };
      return current > previous
         ? { type: "up", diff }
         : { type: "down", diff };
   };

   const trend = calculateTrend();

   if (isLoading) {
      return (
         <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
               ))}
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
               Welcome back! Here's your fitness overview for today.
            </p>
         </div>

         {/* Today's Workouts - Sprint 3 Feature */}
         {data?.todaysWorkouts && data.todaysWorkouts.length > 0 && (
            <Card className="border-primary/50 bg-primary/5">
               <CardHeader>
                  <div className="flex items-center justify-between">
                     <div>
                        <CardTitle className="flex items-center gap-2">
                           <Clock className="h-5 w-5 text-primary" />
                           Today's Workouts
                        </CardTitle>
                        <CardDescription className="mt-1">
                           {data.todaysWorkouts.length} workout{data.todaysWorkouts.length > 1 ? "s" : ""} scheduled
                        </CardDescription>
                     </div>
                     <Badge variant="default" className="flex-shrink-0">
                        {data.todaysWorkouts.filter((w) => w.status === "scheduled").length} pending
                     </Badge>
                  </div>
               </CardHeader>
               <CardContent className="space-y-3">
                  {data.todaysWorkouts.map((workout) => (
                     <div
                        key={workout.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-background"
                     >
                        <div className="space-y-1 flex-1">
                           <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{workout.name}</h3>
                              <Badge
                                 variant={workout.status === "scheduled" ? "secondary" : "default"}
                                 className="text-xs"
                              >
                                 {workout.status === "scheduled" ? "Scheduled" : "In Progress"}
                              </Badge>
                           </div>
                           <p className="text-sm text-muted-foreground">
                              {workout.exercises.length} exercise{workout.exercises.length > 1 ? "s" : ""} • {workout.totalSets} total sets
                           </p>
                           {workout.status === "in-progress" && (
                              <div className="flex items-center gap-2 mt-2">
                                 <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                       className="h-full bg-primary transition-all"
                                       style={{ width: `${workout.progressPercentage}%` }}
                                    />
                                 </div>
                                 <span className="text-xs text-muted-foreground">
                                    {workout.progressPercentage}%
                                 </span>
                              </div>
                           )}
                        </div>
                        <Button
                           onClick={() => router.push(`/dashboard/workouts/${workout.id}`)}
                           size="sm"
                           className="w-full sm:w-auto"
                        >
                           <Play className="h-4 w-4 mr-2" />
                           {workout.status === "scheduled" ? "Start Workout" : "Continue"}
                        </Button>
                     </div>
                  ))}
                  <Button
                     asChild
                     variant="outline"
                     className="w-full"
                  >
                     <Link href="/dashboard/workouts">
                        <Calendar className="h-4 w-4 mr-2" />
                        View All Workouts
                     </Link>
                  </Button>
               </CardContent>
            </Card>
         )}

         {/* Stats Cards */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Weight Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                     {data?.todayWeight ? "Today's Weight" : "Latest Weight"}
                  </CardTitle>
                  <Scale className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  {data?.todayWeight || data?.latestWeight ? (
                     <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                           <div className="text-2xl font-bold">
                              {(data.todayWeight || data.latestWeight)?.weight}
                           </div>
                           <div className="text-sm text-muted-foreground">
                              {(data.todayWeight || data.latestWeight)?.unit}
                           </div>
                        </div>
                        {trend && (
                           <div className="flex items-center gap-1 text-xs">
                              {trend.type === "up" && (
                                 <>
                                    <TrendingUp className="h-3 w-3 text-red-500" />
                                    <span className="text-red-500">+{trend.diff.toFixed(1)}</span>
                                 </>
                              )}
                              {trend.type === "down" && (
                                 <>
                                    <TrendingDown className="h-3 w-3 text-green-500" />
                                    <span className="text-green-500">-{trend.diff.toFixed(1)}</span>
                                 </>
                              )}
                              {trend.type === "stable" && (
                                 <>
                                    <Minus className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">No change</span>
                                 </>
                              )}
                           </div>
                        )}
                        {!data?.todayWeight && data?.latestWeight && (
                           <p className="text-xs text-muted-foreground">
                              {new Date(data.latestWeight.date).toLocaleDateString("en-US", {
                                 timeZone: "UTC",
                              })}
                           </p>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">No weight entries yet</p>
                        <Button asChild size="sm" variant="outline">
                           <Link href="/dashboard/weight">
                              <Plus className="h-3 w-3 mr-1" />
                              Add Weight
                           </Link>
                        </Button>
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Exercises Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exercises</CardTitle>
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{data?.stats.exercises || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                     Total exercises created
                  </p>
               </CardContent>
            </Card>

            {/* Templates Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Templates</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{data?.stats.templates || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                     Workout templates
                  </p>
               </CardContent>
            </Card>

            {/* Foods Card - Sprint 3 Feature */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Foods</CardTitle>
                  <Apple className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{data?.stats.foods || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                     Food items in library
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Quick Actions */}
         <Card>
            <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/weight">
                        <Scale className="h-6 w-6" />
                        <span className="font-medium">Log Weight</span>
                     </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/exercises">
                        <Dumbbell className="h-6 w-6" />
                        <span className="font-medium">Add Exercise</span>
                     </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/workouts">
                        <Calendar className="h-6 w-6" />
                        <span className="font-medium">Schedule Workout</span>
                     </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/foods">
                        <Utensils className="h-6 w-6" />
                        <span className="font-medium">Add Food</span>
                     </Link>
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* Main Content Grid */}
         <div className="grid gap-6 lg:grid-cols-2">
            {/* Weight Chart */}
            {data?.recentWeights && data.recentWeights.length > 0 && (
               <Card>
                  <CardHeader>
                     <CardTitle>Weight Trend</CardTitle>
                     <CardDescription>Last 7 entries</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <WeightChart data={data.recentWeights} />
                  </CardContent>
               </Card>
            )}

            {/* Recent Activity */}
            {data?.recentActivities && data.recentActivities.length > 0 && (
               <Card>
                  <CardHeader>
                     <CardTitle>Recent Activity</CardTitle>
                     <CardDescription>Your latest updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <RecentActivity activities={data.recentActivities} />
                  </CardContent>
               </Card>
            )}
         </div>

         {/* Empty State for No Workouts Today */}
         {data?.todaysWorkouts && data.todaysWorkouts.length === 0 && (
            <Card>
               <CardContent className="flex flex-col items-center justify-center py-10">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Workouts Scheduled Today</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                     Start planning your fitness journey by scheduling a workout
                  </p>
                  <Button asChild>
                     <Link href="/dashboard/workouts">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Workout
                     </Link>
                  </Button>
               </CardContent>
            </Card>
         )}
      </div>
   );
}