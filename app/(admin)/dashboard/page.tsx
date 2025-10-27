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
   Play,
} from "lucide-react";
import Link from "next/link";
import WeightChart from "@/components/weight-chart";
import NutritionChart from "@/components/nutrition-chart";
import RecentActivity from "@/components/recent-activity";
import { Skeleton } from "@/components/ui/skeleton";
import router from "next/router";

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
   todayProtein: number;
   todayCarbs: number;
   todayFat: number;
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
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
               <p className="text-muted-foreground">
                  Welcome back! Here&apos;s your fitness overview
               </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {[1, 2, 3].map((i) => (
                  <Card key={i}>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                     </CardHeader>
                     <CardContent>
                        <Skeleton className="h-7 w-16" />
                        <Skeleton className="h-3 w-28 mt-1" />
                     </CardContent>
                  </Card>
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
               Welcome back! Here&apos;s your fitness overview
            </p>
         </div>

         {/* Stats Cards */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Weight Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weight</CardTitle>
                  <Scale className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {data?.todayWeight
                        ? `${data.todayWeight.weight} ${data.todayWeight.unit}`
                        : data?.latestWeight
                           ? `${data.latestWeight.weight} ${data.latestWeight.unit}`
                           : "—"}
                  </div>
                  {trend && (
                     <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                              <Minus className="h-3 w-3" />
                              <span>Stable</span>
                           </>
                        )}
                     </div>
                  )}
                  {!data?.todayWeight && data?.latestWeight && (
                     <p className="text-xs text-muted-foreground">Last entry</p>
                  )}
               </CardContent>
            </Card>

            {/* Calories Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calories</CardTitle>
                  <Utensils className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{data?.todayCalories.toFixed(0) || 0}</div>
                  <p className="text-xs text-muted-foreground">Today</p>
               </CardContent>
            </Card>

            {/* Water Card */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Water</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     {data?.todayWater.toFixed(0) || 0}{" "}
                     <span className="text-sm font-normal text-muted-foreground">
                        {data?.waterUnit || "oz"}
                     </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Today</p>
               </CardContent>
            </Card>

         </div>

         {/* Quick Actions */}
         <Card>
            <CardHeader className="pb-3">
               <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/weight">
                        <Scale className="h-6 w-6" />
                        <span className="text-sm font-medium">Log Weight</span>
                     </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                     <Link href="/dashboard/workouts">
                        <Calendar className="h-6 w-6" />
                        <span className="text-sm font-medium">Workout</span>
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

         {/* Today's Workouts */}
         {data?.todaysWorkouts && data.todaysWorkouts.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle>Today&apos;s Workouts</CardTitle>
                  <CardDescription>Scheduled for today</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">

                  {data.todaysWorkouts.map((workout) => {
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
                                       {workout.totalSets} set{workout.totalSets !== 1 ? 's' : ''}
                                    </p>
                                 </div>
                                 {workout.status === "in-progress" && (
                                    <Badge variant="secondary">
                                       {workout.completedSets}/{workout.totalSets} done
                                    </Badge>
                                 )}
                              </div>
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
                              </div>
                           </div>
                        </div>
                     );
                  })}
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

            {/* Nutrition Chart */}
            <Card>
               <CardHeader>
                  <CardTitle>Today&apos;s Nutrition</CardTitle>
                  <CardDescription>Macro breakdown</CardDescription>
               </CardHeader>
               <CardContent>
                  <NutritionChart
                     data={{
                        protein: data?.todayProtein || 0,
                        carbs: data?.todayCarbs || 0,
                        fat: data?.todayFat || 0,
                     }}
                  />
               </CardContent>
            </Card>

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
      </div>
   );
}