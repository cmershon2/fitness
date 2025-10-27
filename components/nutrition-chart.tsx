"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";

interface NutritionData {
    protein: number;
    carbs: number;
    fat: number;
}

interface NutritionChartProps {
    data: NutritionData;
}

const COLORS = {
    protein: "#3b82f6", // blue
    carbs: "#22c55e",   // green
    fat: "#f59e0b",     // amber
};

export default function NutritionChart({ data }: NutritionChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const total = data.protein + data.carbs + data.fat;

    // If no nutrition data, show empty state
    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-sm text-muted-foreground">
                    No nutrition data logged today
                </p>
            </div>
        );
    }

    const chartData = [
        { name: "Protein", value: data.protein, grams: data.protein },
        { name: "Carbs", value: data.carbs, grams: data.carbs },
        { name: "Fat", value: data.fat, grams: data.fat },
    ].filter(item => item.value > 0); // Only show macros with values

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold" style={{ color: data.payload.fill }}>
                        {data.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {data.value.toFixed(1)}g ({((data.value / total) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }: any) => {
        return (
            <div className="flex justify-center gap-4 mt-4">
                {payload.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium">
                            {entry.value}: {entry.payload.grams.toFixed(1)}g
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    entry.name === "Protein"
                                        ? COLORS.protein
                                        : entry.name === "Carbs"
                                            ? COLORS.carbs
                                            : COLORS.fat
                                }
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}