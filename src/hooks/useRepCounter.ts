import { useState, useRef, useCallback } from 'react';
import { PoseLandmark } from './usePoseDetection';

const calculateAngle = (a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
};

export const useRepCounter = (exerciseType: string) => {
  const [reps, setReps] = useState(0);
  const [postureNotes, setPostureNotes] = useState<string[]>([]);
  const inRepRef = useRef(false);

  const processLandmarks = useCallback((landmarks: PoseLandmark[]) => {
    if (exerciseType === 'squats') {
      const leftHip = landmarks[23];
      const leftKnee = landmarks[25];
      const leftAnkle = landmarks[27];
      
      const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
      console.log('🦵 Squat knee angle:', Math.round(angle), '°', inRepRef.current ? '(in rep)' : '(waiting)');
      
      if (angle < 120 && !inRepRef.current) {
        inRepRef.current = true;
        console.log('⬇️ Starting rep (going down)');
      } else if (angle > 150 && inRepRef.current) {
        inRepRef.current = false;
        setReps(prev => {
          const newCount = prev + 1;
          console.log('⬆️ Rep completed! Total:', newCount);
          return newCount;
        });
      }
      
      if (angle < 100 && leftKnee.x > leftAnkle.x + 0.05) {
        setPostureNotes(prev => {
          const note = 'Keep knees aligned with toes';
          if (!prev.includes(note)) return [...prev, note];
          return prev;
        });
      }
    } else if (exerciseType === 'pushups' || exerciseType === 'bicep_curls') {
      const leftShoulder = landmarks[11];
      const leftElbow = landmarks[13];
      const leftWrist = landmarks[15];
      
      const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      console.log(`💪 ${exerciseType} elbow angle:`, Math.round(angle), '°', inRepRef.current ? '(in rep)' : '(waiting)');
      
      if (angle < 110 && !inRepRef.current) {
        inRepRef.current = true;
        console.log('⬇️ Starting rep (flexing)');
      } else if (angle > 150 && inRepRef.current) {
        inRepRef.current = false;
        setReps(prev => {
          const newCount = prev + 1;
          console.log('⬆️ Rep completed! Total:', newCount);
          return newCount;
        });
      }
    }
  }, [exerciseType]);

  const reset = useCallback(() => {
    setReps(0);
    setPostureNotes([]);
    inRepRef.current = false;
  }, []);

  return { reps, postureNotes, processLandmarks, reset };
};
