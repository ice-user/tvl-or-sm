import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { useRepCounter } from '@/hooks/useRepCounter';
import { saveWorkout } from '@/utils/localStorage';
import { EXERCISES } from '@/types/workout';
import { ArrowLeft, Play, Square, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkoutSessionProps {
  exerciseId: string;
  onBack: () => void;
  onComplete: () => void;
}

export const WorkoutSession = ({ exerciseId, onBack, onComplete }: WorkoutSessionProps) => {
  const { toast } = useToast();
  const exercise = EXERCISES.find(e => e.id === exerciseId)!;
  
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isPoseReady, setIsPoseReady] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIdRef = useRef<number>();
  const audioTimeoutRef = useRef<number>();
  
  const { detectPose, isLoading, error } = usePoseDetection();
  const { reps, postureNotes, processLandmarks, reset } = useRepCounter(exerciseId);
  const previousRepsRef = useRef(0);

  const playAudioFeedback = useCallback((message: string) => {
    if (!audioEnabled) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.5;
    utterance.volume = 1.0;
    utterance.pitch = 1.2;
    speechSynthesis.speak(utterance);
  }, [audioEnabled]);
  
  useEffect(() => {
    if (reps > previousRepsRef.current && isWorkoutActive) {
      // Clear any pending audio
      if (audioTimeoutRef.current) {
        window.clearTimeout(audioTimeoutRef.current);
      }
      
      // Play immediately but update ref after a short delay
      playAudioFeedback(`${reps}`);
      audioTimeoutRef.current = window.setTimeout(() => {
        previousRepsRef.current = reps;
      }, 500);
    }
    
    return () => {
      if (audioTimeoutRef.current) {
        window.clearTimeout(audioTimeoutRef.current);
      }
    };
  }, [reps, isWorkoutActive, playAudioFeedback]);

  // Manage pose detection loop
  useEffect(() => {
    let frameId: number | undefined;

    const runDetectionLoop = () => {
      if (!isWorkoutActive) return;

      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      
      if (video?.readyState === 4 && canvas) {
        const landmarks = detectPose(video, canvas);
        if (landmarks) {
          if (!isPoseReady) {
            setIsPoseReady(true);
            playAudioFeedback('Pose detected. You can start now.');
          }
          processLandmarks(landmarks);
        }
      }
      
      frameId = requestAnimationFrame(runDetectionLoop);
    };

    if (isWorkoutActive) {
      runDetectionLoop();
    } else {
      setIsPoseReady(false);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = undefined;
      }
    };
  }, [isWorkoutActive, isPoseReady, detectPose, processLandmarks, playAudioFeedback]);

  const handleStartWorkout = () => {
    console.log('🏋️ Starting workout for:', exerciseId);
    setIsWorkoutActive(true);
    setStartTime(Date.now());
    reset();
    previousRepsRef.current = 0;
    playAudioFeedback('Workout started');
  };

  const handleStopWorkout = () => {
    // First stop the detection loop
    setIsWorkoutActive(false);
    setIsPoseReady(false);
    
    // Cancel any pending animation frames
    if (frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = undefined;
    }
    
    const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    const postureScore = Math.max(70, 100 - postureNotes.length * 5);
    
    saveWorkout({
      id: Date.now().toString(),
      exerciseType: exerciseId,
      reps,
      duration,
      timestamp: new Date(),
      postureScore,
      postureNotes: [...new Set(postureNotes)]
    });

    toast({
      title: 'Workout Complete!',
      description: `${reps} reps in ${duration}s. Posture score: ${postureScore}%`
    });

    playAudioFeedback(`Workout complete. ${reps} reps`);
    onComplete();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <p className="text-destructive">Error: {error}</p>
            <Button onClick={onBack} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            disabled={isWorkoutActive}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="audio"
                checked={audioEnabled}
                onCheckedChange={setAudioEnabled}
                disabled={isWorkoutActive}
              />
              <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer">
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Audio Feedback
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className={`bg-card border-border ${isWorkoutActive ? 'workout-active' : ''}`}>
              <CardContent className="p-6">
                <div className="relative">
                  <Webcam
                    ref={webcamRef}
                    className="w-full rounded-lg"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: 'user'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    width={640}
                    height={480}
                  />
                </div>
                
                <div className="mt-4 flex justify-center">
                  {!isWorkoutActive ? (
                    <Button
                      size="lg"
                      onClick={handleStartWorkout}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      {isLoading ? 'Loading...' : 'Start Workout'}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleStopWorkout}
                      variant="destructive"
                    >
                      <Square className="mr-2 h-5 w-5" />
                      Stop Workout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{exercise.name}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Setup:</p>
                    <p className="text-sm text-foreground">{exercise.standingGuide}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Status:</p>
                    <p className="text-sm text-foreground">
                      {!isWorkoutActive && !isPoseReady && 'Position yourself...'}
                      {!isWorkoutActive && isPoseReady && 'Ready to start!'}
                      {isWorkoutActive && 'Workout in progress'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Live Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Reps</p>
                    <p className="text-4xl font-bold text-primary">{reps}</p>
                  </div>
                  
                  {postureNotes.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Posture Tips:</p>
                      <ul className="space-y-1">
                        {[...new Set(postureNotes)].map((note, i) => (
                          <li key={i} className="text-sm text-secondary">• {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
