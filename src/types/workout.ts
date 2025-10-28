export interface WorkoutSession {
  id: string;
  exerciseType: string;
  reps: number;
  duration: number;
  timestamp: Date;
  postureScore: number;
  postureNotes: string[];
}

export interface ExerciseConfig {
  id: string;
  name: string;
  description: string;
  standingGuide: string;
  targetLandmarks: string[];
  repDetectionLogic: string;
}

export const EXERCISES: ExerciseConfig[] = [
  {
    id: 'squats',
    name: 'Squats',
    description: 'Lower body strength exercise',
    standingGuide: 'Stand facing the camera with feet shoulder-width apart',
    targetLandmarks: ['hips', 'knees', 'ankles'],
    repDetectionLogic: 'knee_angle'
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    description: 'Upper body and core strength',
    standingGuide: 'Position yourself sideways to the camera in plank position',
    targetLandmarks: ['shoulders', 'elbows', 'wrists'],
    repDetectionLogic: 'elbow_angle'
  },
  {
    id: 'bicep_curls',
    name: 'Bicep Curls',
    description: 'Arm strength exercise',
    standingGuide: 'Stand sideways to the camera with arms at your sides',
    targetLandmarks: ['shoulders', 'elbows', 'wrists'],
    repDetectionLogic: 'elbow_angle'
  }
];
