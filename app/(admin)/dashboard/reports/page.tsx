"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Eye, Calendar as CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportOptions {
    includeWeight: boolean;
    includeWorkouts: boolean;
    includeDiet: boolean;
    includeWater: boolean;
}

export default function ReportsPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportPreview, setReportPreview] = useState<string>("");
    const [reportOptions, setReportOptions] = useState<ReportOptions>({
        includeWeight: true,
        includeWorkouts: true,
        includeDiet: true,
        includeWater: true,
    });

    const generateReport = async (preview: boolean = false) => {
        setIsGenerating(true);
        try {
            // Send date as YYYY-MM-DD to avoid timezone issues
            const localDateString = format(selectedDate, "yyyy-MM-dd");

            const response = await fetch("/api/reports/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: localDateString,
                    options: reportOptions,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate report");
            }

            const data = await response.json();

            if (preview) {
                setReportPreview(data.markdown);
                toast.success("Report preview generated!");
            } else {
                // Download the report
                downloadMarkdown(data.markdown, data.filename);
                toast.success("Report downloaded successfully!");
            }
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Failed to generate report");
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadMarkdown = (content: string, filename: string) => {
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Daily Reports</h1>
                <p className="text-muted-foreground">
                    Generate comprehensive markdown reports of your fitness activities
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Configuration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Report Configuration
                        </CardTitle>
                        <CardDescription>
                            Select a date and customize your report content
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Date Selector */}
                        <div className="space-y-2">
                            <Label>Report Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        disabled={(date) => date > new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Section Options */}
                        <div className="space-y-4">
                            <Label>Include Sections</Label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="weight"
                                        checked={reportOptions.includeWeight}
                                        onCheckedChange={(checked) =>
                                            setReportOptions((prev) => ({
                                                ...prev,
                                                includeWeight: checked as boolean,
                                            }))
                                        }
                                    />
                                    <label
                                        htmlFor="weight"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Weight Entry
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="workouts"
                                        checked={reportOptions.includeWorkouts}
                                        onCheckedChange={(checked) =>
                                            setReportOptions((prev) => ({
                                                ...prev,
                                                includeWorkouts: checked as boolean,
                                            }))
                                        }
                                    />
                                    <label
                                        htmlFor="workouts"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Workouts
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="diet"
                                        checked={reportOptions.includeDiet}
                                        onCheckedChange={(checked) =>
                                            setReportOptions((prev) => ({
                                                ...prev,
                                                includeDiet: checked as boolean,
                                            }))
                                        }
                                    />
                                    <label
                                        htmlFor="diet"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Diet & Nutrition
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="water"
                                        checked={reportOptions.includeWater}
                                        onCheckedChange={(checked) =>
                                            setReportOptions((prev) => ({
                                                ...prev,
                                                includeWater: checked as boolean,
                                            }))
                                        }
                                    />
                                    <label
                                        htmlFor="water"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Water Intake
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => generateReport(true)}
                                disabled={isGenerating}
                                variant="outline"
                                className="flex-1"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                            <Button
                                onClick={() => generateReport(false)}
                                disabled={isGenerating}
                                className="flex-1"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Report Preview</CardTitle>
                        <CardDescription>
                            {reportPreview
                                ? "Preview of your generated report"
                                : "Generate a report to see the preview"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reportPreview ? (
                            <div className="rounded-lg border bg-muted p-4">
                                <pre className="text-sm whitespace-pre-wrap font-mono max-h-[600px] overflow-auto">
                                    {reportPreview}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                No preview available. Click &quot;Preview&quot; to generate.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}