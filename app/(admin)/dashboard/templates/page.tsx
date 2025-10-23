"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TemplateCard from "@/components/template-card";
import TemplateDialog from "@/components/template-dialog";

// Define the Template-related interfaces
interface TemplateExercise {
    id: string;
    exerciseId: string;
    orderIndex: number;
    sets: number;
    reps: number;
    notes?: string;
    exercise: {
        id: string;
        name: string;
        muscleGroup: string;
    };
}

interface Template {
    id: string;
    name: string;
    description?: string;
    exercises: TemplateExercise[];
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch("/api/templates");
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Workout Templates</h1>
                <Button onClick={() => setShowDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                </Button>
            </div>

            {isLoading ? (
                <div>Loading templates...</div>
            ) : templates.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No workout templates yet. Create your first template to get started!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onUpdate={fetchTemplates}
                        />
                    ))}
                </div>
            )}

            <TemplateDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                onSuccess={() => {
                    fetchTemplates();
                    setShowDialog(false);
                }}
            />
        </div>
    );
}