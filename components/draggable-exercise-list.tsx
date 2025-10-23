"use client";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMuscleGroupLabel } from "@/lib/constants";

interface TemplateExercise {
    exerciseId: string;
    orderIndex: number;
    sets: number;
    reps: number;
    notes?: string;
    exercise?: {
        id: string;
        name: string;
        muscleGroup: string;
    };
}

interface DraggableExerciseListProps {
    exercises: TemplateExercise[];
    onReorder: (exercises: TemplateExercise[]) => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, updates: Partial<TemplateExercise>) => void;
}

interface SortableItemProps {
    exercise: TemplateExercise;
    index: number;
    onRemove: () => void;
    onUpdate: (updates: Partial<TemplateExercise>) => void;
}

function SortableItem({ exercise, index, onRemove, onUpdate }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: exercise.exerciseId + index });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 p-3 bg-muted rounded-md"
        >
            <button
                type="button"
                className="cursor-grab active:cursor-grabbing touch-none"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                                {index + 1}
                            </Badge>
                            <span className="font-medium">{exercise.exercise?.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {exercise.exercise?.muscleGroup.split(",").map((muscle) => (
                                <Badge key={muscle.trim()} variant="secondary" className="text-xs">
                                    {getMuscleGroupLabel(muscle.trim())}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onRemove}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) =>
                                onUpdate({ sets: parseInt(e.target.value) || 1 })
                            }
                            className="w-16 h-8"
                            min="1"
                        />
                        <span className="text-sm text-muted-foreground">sets</span>
                    </div>
                    <span className="text-muted-foreground">×</span>
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) =>
                                onUpdate({ reps: parseInt(e.target.value) || 1 })
                            }
                            className="w-16 h-8"
                            min="1"
                        />
                        <span className="text-sm text-muted-foreground">reps</span>
                    </div>
                </div>

                <Input
                    type="text"
                    value={exercise.notes || ""}
                    onChange={(e) => onUpdate({ notes: e.target.value })}
                    placeholder="Add notes (optional)..."
                    className="text-sm"
                />
            </div>
        </div>
    );
}

export default function DraggableExerciseList({
    exercises,
    onReorder,
    onRemove,
    onUpdate,
}: DraggableExerciseListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = exercises.findIndex(
                (ex, i) => ex.exerciseId + i === active.id
            );
            const newIndex = exercises.findIndex(
                (ex, i) => ex.exerciseId + i === over.id
            );

            onReorder(arrayMove(exercises, oldIndex, newIndex));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={exercises.map((ex, i) => ex.exerciseId + i)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2">
                    {exercises.map((exercise, index) => (
                        <SortableItem
                            key={exercise.exerciseId + index}
                            exercise={exercise}
                            index={index}
                            onRemove={() => onRemove(index)}
                            onUpdate={(updates) => onUpdate(index, updates)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}