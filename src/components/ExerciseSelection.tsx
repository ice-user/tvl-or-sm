import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EXERCISES } from '@/types/workout';
import { ArrowLeft } from 'lucide-react';

interface ExerciseSelectionProps {
  onSelectExercise: (exerciseId: string) => void;
  onBack: () => void;
}

export const ExerciseSelection = ({ onSelectExercise, onBack }: ExerciseSelectionProps) => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Choose Your Exercise
          </h1>
          <p className="text-muted-foreground mt-2">Select an exercise to begin your workout session</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXERCISES.map((exercise) => (
            <Card 
              key={exercise.id}
              className="bg-card border-border hover:border-primary transition-all cursor-pointer"
              onClick={() => onSelectExercise(exercise.id)}
            >
              <CardHeader>
                <CardTitle className="text-foreground">{exercise.name}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Setup Guide:</p>
                    <p className="text-sm text-foreground mt-1">{exercise.standingGuide}</p>
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Select Exercise
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
