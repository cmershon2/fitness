import { WorkoutExecution } from "@/components/workout-execution";

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <div className="container mx-auto py-6">
            <WorkoutExecution workoutId={(await params).id} />
        </div>
    );
}