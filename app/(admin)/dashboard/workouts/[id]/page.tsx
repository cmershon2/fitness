import { WorkoutExecution } from "@/components/workout-execution";

export default function WorkoutPage({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto py-6">
            <WorkoutExecution workoutId={params.id} />
        </div>
    );
}