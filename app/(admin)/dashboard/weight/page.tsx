"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import WeightEntryForm from "@/components/weight-entry-form";
import WeightList from "@/components/weight-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WeightPage() {
    const [weights, setWeights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchWeights();
    }, []);

    const fetchWeights = async () => {
        try {
            const response = await fetch("/api/weights");
            if (response.ok) {
                const data = await response.json();
                setWeights(data);
            }
        } catch (error) {
            console.error("Error fetching weights:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWeightAdded = () => {
        fetchWeights();
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Weight Tracking</h1>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Weight
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Weight Entry</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <WeightEntryForm
                            onSuccess={handleWeightAdded}
                            onCancel={() => setShowForm(false)}
                        />
                    </CardContent>
                </Card>
            )}

            <WeightList
                weights={weights}
                isLoading={isLoading}
                onUpdate={fetchWeights}
            />
        </div>
    );
}