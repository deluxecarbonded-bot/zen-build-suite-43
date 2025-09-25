import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PomodoroPhase = 'focus' | 'short-break' | 'long-break';

const PHASE_DURATIONS = {
  focus: 25 * 60 * 1000, // 25 minutes
  'short-break': 5 * 60 * 1000, // 5 minutes
  'long-break': 15 * 60 * 1000, // 15 minutes
};

const PHASE_LABELS = {
  focus: 'Focus Time',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

export function PomodoroTimer() {
  const [phase, setPhase] = useState<PomodoroPhase>('focus');
  const [timeLeft, setTimeLeft] = useState(PHASE_DURATIONS.focus);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const { toast } = useToast();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = ((PHASE_DURATIONS[phase] - timeLeft) / PHASE_DURATIONS[phase]) * 100;

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }, []);

  const startTimer = useCallback(() => {
    setIsActive(true);
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(PHASE_DURATIONS[phase]);
  }, [phase]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setPhase('focus');
    setTimeLeft(PHASE_DURATIONS.focus);
    setCompletedSessions(0);
  }, []);

  const switchPhase = useCallback((newPhase: PomodoroPhase) => {
    setPhase(newPhase);
    setTimeLeft(PHASE_DURATIONS[newPhase]);
    setIsActive(false);
  }, []);

  const completePhase = useCallback(() => {
    setIsActive(false);
    
    if (phase === 'focus') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      showNotification(
        'Focus session completed!', 
        `Great job! You completed ${newCompletedSessions} focus session${newCompletedSessions !== 1 ? 's' : ''}.`
      );
      
      toast({
        title: "Focus Session Complete!",
        description: `Time for a ${newCompletedSessions % 4 === 0 ? 'long' : 'short'} break.`,
      });

      // Auto-switch to break
      const nextPhase = newCompletedSessions % 4 === 0 ? 'long-break' : 'short-break';
      setTimeout(() => switchPhase(nextPhase), 1000);
    } else {
      showNotification(
        'Break time over!', 
        'Ready to focus again?'
      );
      
      toast({
        title: "Break Complete!",
        description: "Ready for another focus session?",
      });

      // Auto-switch to focus
      setTimeout(() => switchPhase('focus'), 1000);
    }
  }, [phase, completedSessions, showNotification, toast, switchPhase]);

  // Timer effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          completePhase();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, completePhase]);

  return (
    <Card className="p-6 w-full max-w-sm">
      <div className="text-center space-y-6">
        {/* Phase Selector */}
        <div className="flex space-x-1 bg-muted/30 rounded-lg p-1">
          {Object.entries(PHASE_LABELS).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={phase === key ? "default" : "ghost"}
              onClick={() => switchPhase(key as PomodoroPhase)}
              className="flex-1 text-xs btn-zen"
              disabled={isActive}
            >
              {label.split(' ')[0]}
            </Button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-zen-primary">
            {PHASE_LABELS[phase]}
          </h3>
          
          <motion.div 
            className="text-4xl font-mono font-bold tabular-nums"
            key={timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {formatTime(timeLeft)}
          </motion.div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-2">
          {!isActive ? (
            <Button onClick={startTimer} className="btn-zen">
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="outline" className="btn-zen">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button onClick={stopTimer} variant="outline" size="sm" className="btn-zen">
            <Square className="w-4 h-4" />
          </Button>
          
          <Button onClick={resetTimer} variant="ghost" size="sm" className="btn-zen">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          Sessions completed: {completedSessions}
        </div>
      </div>
    </Card>
  );
}