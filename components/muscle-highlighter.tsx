"use client";

import { useEffect, useState } from "react";
import Model from 'react-body-highlighter';

interface MuscleHighlighterProps {
    muscles: string[];
    side?: "anterior" | "posterior" | "dual";
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

    // If dual mode, render both anterior and posterior side-by-side
    if (side === "dual") {
        return (
            <div className={`flex gap-2 items-center justify-center ${className}`}>
                {/* Front View */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="w-full max-h-full overflow-hidden">
                        <Model
                            data={data}
                            style={{
                                width: "100%",
                                height: "100%",
                                padding: "0",
                            }}
                            type="anterior"
                            highlightedColors={["#ef4444"]}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Front</p>
                </div>

                {/* Back View */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="w-full max-h-full overflow-hidden">
                        <Model
                            data={data}
                            style={{
                                width: "100%",
                                height: "100%",
                                padding: "0",
                            }}
                            type="posterior"
                            highlightedColors={["#ef4444"]}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Back</p>
                </div>
            </div>
        );
    }

    // Single view mode
    return (
        <div className={`overflow-hidden ${className}`}>
            <Model
                data={data}
                style={{
                    width: "100%",
                    height: "100%",
                    padding: "0",
                }}
                type={side}
                highlightedColors={["#ef4444"]}
            />
        </div>
    );
}