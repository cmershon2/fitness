"use client";

import { useMemo } from "react";

interface WeightData {
    weight: number;
    date: string;
}

interface WeightChartProps {
    data: WeightData[];
}

export default function WeightChart({ data }: WeightChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return null;

        const sortedData = [...data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const weights = sortedData.map((d) => d.weight);
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const range = maxWeight - minWeight;
        const padding = range * 0.1 || 1;

        return {
            sortedData,
            minWeight: minWeight - padding,
            maxWeight: maxWeight + padding,
            range: range + padding * 2,
        };
    }, [data]);

    if (!chartData) {
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-sm text-muted-foreground">
                    Not enough data to display chart
                </p>
            </div>
        );
    }

    const { sortedData, minWeight, maxWeight, range } = chartData;

    return (
        <div className="w-full h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line
                    x1="0"
                    y1="25"
                    x2="100"
                    y2="25"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    className="text-muted-foreground/20"
                />
                <line
                    x1="0"
                    y1="50"
                    x2="100"
                    y2="50"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    className="text-muted-foreground/20"
                />
                <line
                    x1="0"
                    y1="75"
                    x2="100"
                    y2="75"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    className="text-muted-foreground/20"
                />

                {/* Line chart */}
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                    points={sortedData
                        .map((d, i) => {
                            const x = (i / (sortedData.length - 1)) * 100;
                            const y = 100 - ((d.weight - minWeight) / range) * 100;
                            return `${x},${y}`;
                        })
                        .join(" ")}
                />

                {/* Data points */}
                {sortedData.map((d, i) => {
                    const x = (i / (sortedData.length - 1)) * 100;
                    const y = 100 - ((d.weight - minWeight) / range) * 100;
                    return (
                        <g key={i}>
                            <circle
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill="currentColor"
                                className="text-primary"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Labels */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="relative w-full h-full flex items-end justify-between px-2 pb-1">
                    {sortedData.map((d, i) => (
                        <div key={i} className="text-xs text-center">
                            <div className="text-muted-foreground">
                                {new Date(d.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-muted-foreground">
                <span>{maxWeight.toFixed(1)}</span>
                <span>{((maxWeight + minWeight) / 2).toFixed(1)}</span>
                <span>{minWeight.toFixed(1)}</span>
            </div>
        </div>
    );
}