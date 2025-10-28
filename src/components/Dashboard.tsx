import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWorkouts, getLatestWorkout } from '@/utils/localStorage';
import { Activity, Clock, Award, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface DashboardProps {
  onStartWorkout: () => void;
}

export const Dashboard = ({ onStartWorkout }: DashboardProps) => {
  const workouts = getWorkouts();
  const latestWorkout = getLatestWorkout();
  
  const chartData = workouts.slice(-7).map(w => ({
    date: format(w.timestamp, 'MM/dd'),
    reps: w.reps,
    duration: Math.round(w.duration / 60)
  }));

  const totalReps = workouts.reduce((sum, w) => sum + w.reps, 0);
  const totalMinutes = Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / 60);
  const avgScore = workouts.length > 0 
    ? Math.round(workouts.reduce((sum, w) => sum + w.postureScore, 0) / workouts.length)
    : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Fitness Tracker
            </h1>
            <p className="text-muted-foreground mt-2">Track your progress with AI-powered pose detection</p>
          </div>
          <Button 
            size="lg"
            onClick={onStartWorkout}
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
          >
            Start Workout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reps</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalReps}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalMinutes} min</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Posture</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{avgScore}%</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{workouts.length}</div>
            </CardContent>
          </Card>
        </div>

        {latestWorkout && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Latest Workout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Exercise</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{latestWorkout.exerciseType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reps</p>
                  <p className="text-lg font-semibold text-primary">{latestWorkout.reps}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold text-secondary">{Math.round(latestWorkout.duration / 60)} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posture Score</p>
                  <p className="text-lg font-semibold text-accent">{latestWorkout.postureScore}%</p>
                </div>
              </div>
              {latestWorkout.postureNotes.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Posture Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {latestWorkout.postureNotes.map((note, i) => (
                      <li key={i} className="text-sm text-foreground">{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {chartData.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  reps: { label: 'Reps', color: 'hsl(var(--primary))' }
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="reps" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
