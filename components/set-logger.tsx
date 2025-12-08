import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SetLoggerProps {
    setNumber: number
    targetReps: number
    onSaveSet: (setData: {
        actualReps: number
        weight: number
        rpe?: number
        notes?: string
    }) => Promise<void>
}

export function SetLogger({ setNumber, targetReps, onSaveSet }: SetLoggerProps) {
    const [actualReps, setActualReps] = useState<string>('')
    const [weight, setWeight] = useState<string>('')
    const [rpe, setRpe] = useState<number[]>([5]) // Default RPE of 5
    const [notes, setNotes] = useState<string>('')
    const [showNotes, setShowNotes] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        if (!actualReps || !weight) {
            alert('Please enter reps and weight')
            return
        }

        setIsSaving(true)
        try {
            await onSaveSet({
                actualReps: parseInt(actualReps),
                weight: parseFloat(weight),
                rpe: rpe[0],
                notes: notes.trim() || undefined
            })

            // Reset form
            setActualReps('')
            setWeight('')
            setRpe([5])
            setNotes('')
            setShowNotes(false)
        } catch (error) {
            console.error('Error saving set:', error)
            alert('Failed to save set')
        } finally {
            setIsSaving(false)
        }
    }

    const getRpeLabel = (value: number) => {
        if (value <= 2) return 'Very Easy'
        if (value <= 4) return 'Easy'
        if (value <= 6) return 'Moderate'
        if (value <= 8) return 'Hard'
        return 'Maximum Effort'
    }

    const getRpeColor = (value: number) => {
        if (value <= 4) return 'bg-green-500'
        if (value <= 6) return 'bg-yellow-500'
        if (value <= 8) return 'bg-orange-500'
        return 'bg-red-500'
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Set {setNumber}</span>
                    <Badge variant="outline">Target: {targetReps} reps</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Reps and Weight */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor={`reps-${setNumber}`}>Actual Reps</Label>
                        <Input
                            id={`reps-${setNumber}`}
                            type="number"
                            min="0"
                            value={actualReps}
                            onChange={(e) => setActualReps(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`weight-${setNumber}`}>Weight (kg)</Label>
                        <Input
                            id={`weight-${setNumber}`}
                            type="number"
                            min="0"
                            step="0.5"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* RPE Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>RPE (Rate of Perceived Exertion)</Label>
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full ${getRpeColor(rpe[0])} flex items-center justify-center text-white font-bold`}>
                                {rpe[0]}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {getRpeLabel(rpe[0])}
                            </span>
                        </div>
                    </div>
                    <Slider
                        min={1}
                        max={10}
                        step={0.5}
                        value={rpe}
                        onValueChange={setRpe}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Very Easy</span>
                        <span>Moderate</span>
                        <span>Max Effort</span>
                    </div>
                </div>

                {/* Notes Toggle and Input */}
                <div className="space-y-2">
                    {!showNotes ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNotes(true)}
                            className="w-full"
                        >
                            + Add Note
                        </Button>
                    ) : (
                        <>
                            <Label htmlFor={`notes-${setNumber}`}>Notes (Optional)</Label>
                            <Textarea
                                id={`notes-${setNumber}`}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g., Form felt good, slight lower back tightness"
                                rows={3}
                            />
                        </>
                    )}
                </div>

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !actualReps || !weight}
                    className="w-full"
                >
                    {isSaving ? 'Saving...' : `Complete Set ${setNumber}`}
                </Button>
            </CardContent>
        </Card>
    )
}