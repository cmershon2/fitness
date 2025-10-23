"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
   Scale,
   Dumbbell,
   ClipboardList,
   Plus,
   TrendingUp,
   TrendingDown,
   Minus,
   Calendar,
} from "lucide-react";
import Link from "next/link";
import WeightChart from "@/components/weight-chart";
import RecentActivity from "@/components/recent-activity";
import { Skeleton } from "@/components/ui/skeleton";

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
      weight: number;
      date: string;
   }>;
   stats: {
      exercises: number;
      templates: number;
      weightEntries: number;
   };
   recentActivities: Array<{
      id: string;
      weight: number;
      unit: string;
      date: string;
      createdAt: string;
   }>;
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
            const dashboardData = await response.json();
            setData(dashboardData);
         }
      } catch (error) {
         console.error("Error fetching dashboard:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const getWeightTrend = () => {
      if (!data?.recentWeights || data.recentWeights.length < 2) return null;

      const latest = data.recentWeights[0].weight;
      const previous = data.recentWeights[1].weight;
      const diff = latest - previous;

      if (Math.abs(diff) < 0.1) return { type: "stable", diff: 0 };
      if (diff > 0) return { type: "up", diff };
      return { type: "down", diff: Math.abs(diff) };
   };

   const trend = getWeightTrend();

   const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
   });

   if (isLoading) {
      return (
         <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               <Skeleton className="h-32" />
               <Skeleton className="h-32" />
               <Skeleton className="h-32" />
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">{today}</p>
         </div>

         {/* Quick Stats */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Today's Weight */}
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
                              {new Date(data.latestWeight.date).toLocaleDateString()}
                           </p>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">No weight logged yet</p>
                        <Button size="sm" asChild>
                           <Link href="/dashboard/weight">
                              <Plus className="mr-1 h-3 w-3" />
                              Add Weight
                           </Link>
                        </Button>
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Exercises */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exercises</CardTitle>
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{data?.stats.exercises || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                     Total exercises in library
                  </p>
               </CardContent>
            </Card>

            {/* Templates */}
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Templates</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{data?.stats.templates || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                     Workout templates created
                  </p>
               </CardContent>
            </Card>

            {/* Coming Soon: Workouts */}
            <Card className="border-dashed">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workouts</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground">--</div>
                  <p className="text-xs text-muted-foreground mt-1">Coming in Sprint 3</p>
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
                     <Link href="/dashboard/templates">
                        <ClipboardList className="h-6 w-6" />
                        <span className="font-medium">Create Template</span>
                     </Link>
                  </Button>
                  <Button
                     variant="outline"
                     className="h-auto flex-col gap-2 p-4 cursor-not-allowed opacity-50"
                     disabled
                  >
                     <Calendar className="h-6 w-6" />
                     <span className="font-medium">Schedule Workout</span>
                     <span className="text-xs text-muted-foreground">(Sprint 3)</span>
                  </Button>
               </div>
            </CardContent>
         </Card>

         {/* Main Content Grid */}
         <div className="grid gap-6 lg:grid-cols-2">
            {/* Weight Chart */}
            {data?.recentWeights && data.recentWeights.length > 0 && (
               <Card className="lg:col-span-1">
                  <CardHeader>
                     <CardTitle>Weight Trend (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <WeightChart data={data.recentWeights} />
                  </CardContent>
               </Card>
            )}

            {/* Recent Activity */}
            <Card className="lg:col-span-1">
               <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
               </CardHeader>
               <CardContent>
                  <RecentActivity activities={data?.recentActivities || []} />
               </CardContent>
            </Card>
         </div>

         {/* Coming Soon Cards */}
         <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-dashed">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <span>Diet Tracking</span>
                     <span className="text-sm font-normal text-muted-foreground">
                        (Coming in Sprint 4)
                     </span>
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-sm text-muted-foreground">
                     Track your daily meals, calories, and nutrition goals
                  </p>
               </CardContent>
            </Card>

            <Card className="border-dashed">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <span>Water Intake</span>
                     <span className="text-sm font-normal text-muted-foreground">
                        (Coming in Sprint 4)
                     </span>
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-sm text-muted-foreground">
                     Monitor your daily hydration and reach your water goals
                  </p>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}