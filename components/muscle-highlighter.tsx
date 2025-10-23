"use client";

import { useEffect, useState } from "react";
import Model from 'react-body-highlighter';

interface MuscleHighlighterProps {
    muscles: string[];
    side?: "anterior" | "posterior";
    className?: string;
}

export default function MuscleHighlighter({
    muscles,
    side = "anterior",
    className = "",
}: MuscleHighlighterProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
                <p className="text-sm text-muted-foreground">Loading model...</p>
            </div>
        );
    }

    // Create data array for the highlighter
    const data = muscles.map((muscle) => ({
        name: muscle,
        muscles: [muscle],
    }));

    return (
        <div className={className}>
            <Model
                data={data}
                style={{ width: "100%", padding: "0" }}
                type={side}
                highlightedColors={["#ef4444"]} // Red color for highlighted muscles
            />
        </div>
    );
}