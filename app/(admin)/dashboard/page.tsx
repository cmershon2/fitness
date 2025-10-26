"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Scale,
   Plus,
   TrendingUp,
   TrendingDown,
   Minus,
   Calendar,
   Utensils,
   Droplets,
} from "lucide-react";
import Link from "next/link";
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
   todayCalories: number;
   todayWater: number;
   waterUnit: string;
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
               Welcome back! Here&apos;s your fitness overview for today.
            </p>
         </div>

         {/* Top Stats Cards */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Today's Weight Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today&apos;s Weight</CardTitle>
                  <Scale className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  {data?.todayWeight ? (
                     <div>
                        <div className="text-2xl font-bold">
                           {data.todayWeight.weight} {data.todayWeight.unit}
                        </div>
                        {trend && (
                           <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              {trend.type === "up" && (
                                 <>
                                    <TrendingUp className="h-3 w-3 text-red-500" />
                                    <span>+{trend.diff.toFixed(1)} from last entry</span>
                                 </>
                              )}
                              {trend.type === "down" && (
                                 <>
                                    <TrendingDown className="h-3 w-3 text-green-500" />
                                    <span>-{trend.diff.toFixed(1)} from last entry</span>
                                 </>
                              )}
                              {trend.type === "stable" && (
                                 <>
                                    <Minus className="h-3 w-3" />
                                    <span>No change from last entry</span>
                                 </>
                              )}
                           </div>
                        )}
                     </div>
                  ) : data?.latestWeight ? (
                     <div>
                        <div className="text-2xl font-bold">
                           {data.latestWeight.weight} {data.latestWeight.unit}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                           Last recorded weight
                        </p>
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

            {/* Today's Calories Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today&apos;s Calories</CardTitle>
                  <Utensils className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{data?.todayCalories || 0} cal</div>
                  <p className="text-xs text-muted-foreground mt-1">
                     Total calories logged today
                  </p>
               </CardContent>
            </Card>

            {/* Today's Water Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today&apos;s Water</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {data?.todayWater || 0} {data?.waterUnit || "oz"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                     Water intake today
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Quick Actions */}
         <Card>
            <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
               <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/weight">
                        <Scale className="h-6 w-6" />
                        <span className="text-sm font-medium">Log Weight</span>
                     </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/workouts">
                        <Calendar className="h-6 w-6" />
                        <span className="text-sm font-medium">Schedule Workout</span>
                     </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/diet">
                        <Utensils className="h-6 w-6" />
                        <span className="text-sm font-medium">Add Diet</span>
                     </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/water">
                        <Droplets className="h-6 w-6" />
                        <span className="text-sm font-medium">Drink Water</span>
                     </Link>
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* Today's Workouts */}
         {data?.todaysWorkouts && data.todaysWorkouts.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle>Today&apos;s Workouts</CardTitle>
                  <CardDescription>Scheduled for today</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  {data.todaysWorkouts.map((workout) => (
                     <div
                        key={workout.id}
                        className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
                     >
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <h4 className="font-medium">{workout.name}</h4>
                              <Badge
                                 variant={
                                    workout.status === "completed"
                                       ? "default"
                                       : workout.status === "in-progress"
                                          ? "secondary"
                                          : "outline"
                                 }
                              >
                                 {workout.status}
                              </Badge>
                           </div>
                           <p className="text-sm text-muted-foreground">
                              {workout.exercises.length} exercises • {workout.completedSets}/
                              {workout.totalSets} sets completed ({workout.progressPercentage}%)
                           </p>
                        </div>
                        <Button
                           asChild
                           size="sm"
                           variant={workout.status === "completed" ? "outline" : "default"}
                        >
                           <Link href={`/dashboard/workouts/${workout.id}`}>
                              {workout.status === "completed" ? "View" : "Continue"}
                           </Link>
                        </Button>
                     </div>
                  ))}
               </CardContent>
            </Card>
         )}

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