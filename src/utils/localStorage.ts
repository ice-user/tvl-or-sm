import { WorkoutSession } from '@/types/workout';

const STORAGE_KEY = 'fitness_tracker_workouts';

export const saveWorkout = (workout: WorkoutSession): void => {
  const workouts = getWorkouts();
  workouts.push(workout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
};

export const getWorkouts = (): WorkoutSession[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    return parsed.map((w: any) => ({
      ...w,
      timestamp: new Date(w.timestamp)
    }));
  } catch {
    return [];
  }
};

export const getLatestWorkout = (): WorkoutSession | null => {
  const workouts = getWorkouts();
  return workouts.length > 0 ? workouts[workouts.length - 1] : null;
};

export const clearWorkouts = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
