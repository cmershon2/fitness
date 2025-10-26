import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Scale,
  Dumbbell,
  Apple,
  Droplets,
  TrendingUp,
  CheckCircle,
  Smartphone,
  BarChart,
  Calendar,
  FileText,
} from "lucide-react";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="px-4 py-1.5 text-sm font-medium">
            Track Your Fitness Journey
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Your Complete Fitness
            <span className="text-primary"> Companion</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your weight, workouts, nutrition, and hydration all in one place.
            Build healthy habits and achieve your fitness goals with powerful insights
            and easy-to-use tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg">
              <Link href="/sign-up">
                Start Free Today
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge className="px-4 py-1.5 text-sm font-medium">Features</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to make fitness tracking simple and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Weight Tracking</h3>
                <p className="text-muted-foreground">
                  Log and monitor your weight over time with visual charts and trend analysis.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Workout Management</h3>
                <p className="text-muted-foreground">
                  Create custom workouts, schedule them, and track your progress set by set.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Apple className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Nutrition Tracking</h3>
                <p className="text-muted-foreground">
                  Log your meals, track calories, and monitor your daily nutrition intake.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Hydration Goals</h3>
                <p className="text-muted-foreground">
                  Track your water intake and stay hydrated with daily goals and reminders.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Visual Analytics</h3>
                <p className="text-muted-foreground">
                  See your progress with beautiful charts and comprehensive activity reports.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">PWA Support</h3>
                <p className="text-muted-foreground">
                  Install on your phone for a native app experience. Works offline too!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="px-4 py-1.5 text-sm font-medium">Why FitTracker</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Build Lasting Fitness Habits
              </h2>
              <p className="text-lg text-muted-foreground">
                FitTracker makes it easy to stay consistent with your fitness goals.
                Track everything in one place and build habits that last.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">All-in-One Platform</h3>
                    <p className="text-muted-foreground">
                      No need for multiple apps. Track weight, workouts, diet, and hydration in one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Easy to Use</h3>
                    <p className="text-muted-foreground">
                      Simple, intuitive interface designed for quick logging without complexity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Progress Reports</h3>
                    <p className="text-muted-foreground">
                      Generate comprehensive markdown reports of your daily activities.
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="mt-4">
                <Link href="/sign-up">
                  Get Started Free
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-primary/20">
                <CardContent className="pt-6 space-y-2">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div className="text-3xl font-bold">Track</div>
                  <p className="text-sm text-muted-foreground">
                    Monitor your daily progress
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 mt-8">
                <CardContent className="pt-6 space-y-2">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div className="text-3xl font-bold">Plan</div>
                  <p className="text-sm text-muted-foreground">
                    Schedule your workouts
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6 space-y-2">
                  <BarChart className="h-8 w-8 text-primary" />
                  <div className="text-3xl font-bold">Analyze</div>
                  <p className="text-sm text-muted-foreground">
                    Review your trends
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 mt-8">
                <CardContent className="pt-6 space-y-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-3xl font-bold">Report</div>
                  <p className="text-sm text-muted-foreground">
                    Export your data
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join FitTracker today and take control of your health and fitness goals.
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/sign-up">
              Get Started Free
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}