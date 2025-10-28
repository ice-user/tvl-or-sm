import { useState, useEffect, useRef } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export const usePoseDetection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastProcessedTimeRef = useRef(0);
  const frameRateInterval = 1000 / 15; // Limit to 15 FPS for better performance

  useEffect(() => {
    const initializePoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU' // Changed to CPU for better compatibility with Intel Iris Xe
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        poseLandmarkerRef.current = poseLandmarker;
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize pose detection');
        setIsLoading(false);
      }
    };

    // Initialize with retry mechanism
    const tryInitialize = async (retries = 3) => {
      try {
        await initializePoseLandmarker();
      } catch (err) {
        if (retries > 0) {
          console.log(`Retrying pose detection initialization... (${retries} attempts left)`);
          setTimeout(() => tryInitialize(retries - 1), 1000);
        } else {
          setError('Failed to initialize pose detection after multiple attempts');
          setIsLoading(false);
        }
      }
    };

    tryInitialize();

    return () => {
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
        poseLandmarkerRef.current = null;
      }
    };
  }, []);

  const detectPose = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!poseLandmarkerRef.current || video.readyState !== 4) {
      return null;
    }

    const currentTime = performance.now();
    if (currentTime - lastProcessedTimeRef.current < frameRateInterval) {
      return null; // Skip this frame if not enough time has passed
    }

    try {
      lastProcessedTimeRef.current = currentTime;
      const results = poseLandmarkerRef.current.detectForVideo(video, currentTime);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.landmarks && results.landmarks.length > 0) {
          const drawingUtils = new DrawingUtils(ctx);
          for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
              color: '#00d9ff',
              lineWidth: 4
            });
            drawingUtils.drawLandmarks(landmarks, {
              color: '#ff0364',
              lineWidth: 2
            });
          }
          return results.landmarks[0];
        }
      }
      return null;
    } catch (err) {
      console.error('Error in pose detection:', err);
      return null;
    }
  };

  return {
    detectPose,
    isLoading,
    error
  };
};
