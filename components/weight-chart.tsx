"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface WeightData {
    weight: number;
    date: string;
}

interface WeightChartProps {
    data: WeightData[];
}

export default function WeightChart({ data }: WeightChartProps) {
    const [colors, setColors] = useState({
        primary: "#f97316",
        foreground: "#ffffff",
        muted: "rgba(255, 255, 255, 0.5)",
        border: "rgba(255, 255, 255, 0.2)",
    });

    useEffect(() => {
        // Get CSS variables from the document
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);

        // Try to get the primary color from CSS variables
        const primaryHsl = computedStyle.getPropertyValue('--primary').trim();

        if (primaryHsl) {
            // Convert HSL to usable format or use the orange as fallback
            setColors({
                primary: "#f97316",
                foreground: computedStyle.getPropertyValue('--foreground')
                    ? `hsl(${computedStyle.getPropertyValue('--foreground')})`
                    : "#ffffff",
                muted: "rgba(255, 255, 255, 0.5)",
                border: "rgba(255, 255, 255, 0.2)",
            });
        }
    }, []);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-sm text-muted-foreground">
                    Not enough data to display chart
                </p>
            </div>
        );
    }

    // Sort data by date and format for Recharts
    const chartData = [...data]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((entry) => ({
            date: format(new Date(entry.date), "MMM d"),
            weight: entry.weight,
            fullDate: format(new Date(entry.date), "PPP"),
        }));

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={colors.border}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        stroke={colors.muted}
                        tick={{ fill: colors.muted, fontSize: 12 }}
                        tickLine={{ stroke: colors.border }}
                    />
                    <YAxis
                        stroke={colors.muted}
                        tick={{ fill: colors.muted, fontSize: 12 }}
                        tickLine={{ stroke: colors.border }}
                        domain={["dataMin - 5", "dataMax + 5"]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.9)",
                            border: `1px solid ${colors.border}`,
                            borderRadius: "8px",
                            color: colors.foreground,
                        }}
                        labelStyle={{ color: colors.foreground, fontWeight: 600 }}
                        itemStyle={{ color: colors.primary }}
                        formatter={(value: number) => [`${value} lbs`, "Weight"]}
                        labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                                return payload[0].payload.fullDate;
                            }
                            return label;
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke={colors.primary}
                        strokeWidth={3}
                        dot={{
                            fill: colors.primary,
                            strokeWidth: 2,
                            stroke: colors.foreground,
                            r: 5
                        }}
                        activeDot={{
                            r: 7,
                            fill: colors.primary,
                            stroke: colors.foreground,
                            strokeWidth: 2
                        }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}