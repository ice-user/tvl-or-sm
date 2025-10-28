import { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { ExerciseSelection } from '@/components/ExerciseSelection';
import { WorkoutSession } from '@/components/WorkoutSession';

type View = 'dashboard' | 'exercise-selection' | 'workout';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const handleStartWorkout = () => {
    setCurrentView('exercise-selection');
  };

  const handleSelectExercise = (exerciseId: string) => {
    setSelectedExercise(exerciseId);
    setCurrentView('workout');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedExercise(null);
  };

  const handleWorkoutComplete = () => {
    setCurrentView('dashboard');
    setSelectedExercise(null);
  };

  if (currentView === 'dashboard') {
    return <Dashboard onStartWorkout={handleStartWorkout} />;
  }

  if (currentView === 'exercise-selection') {
    return (
      <ExerciseSelection
        onSelectExercise={handleSelectExercise}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'workout' && selectedExercise) {
    return (
      <WorkoutSession
        exerciseId={selectedExercise}
        onBack={handleBackToDashboard}
        onComplete={handleWorkoutComplete}
      />
    );
  }

  return null;
};

export default Index;
