import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface BreathingTimerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function BreathingTimer({ isVisible, onClose }: BreathingTimerProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  // 4-7-8 breathing pattern: Inhale 4s, Hold 7s, Exhale 8s
  const phaseDurations = {
    inhale: 4000,
    hold: 7000,
    exhale: 8000,
    rest: 1000
  };

  const phaseTexts = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    rest: 'Rest'
  };

  const startBreathing = useCallback(() => {
    setIsActive(true);
    setPhase('inhale');
    setProgress(0);
    setCycles(0);
  }, []);

  const stopBreathing = useCallback(() => {
    setIsActive(false);
    setPhase('inhale');
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const duration = phaseDurations[phase];
    const interval = 50; // Update every 50ms for smooth animation
    const increment = (100 * interval) / duration;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          // Move to next phase
          switch (phase) {
            case 'inhale':
              setPhase('hold');
              break;
            case 'hold':
              setPhase('exhale');
              break;
            case 'exhale':
              setPhase('rest');
              setCycles(c => c + 1);
              break;
            case 'rest':
              setPhase('inhale');
              break;
          }
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-card/80 backdrop-blur-md rounded-3xl p-12 shadow-2xl max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Breathing Circle */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <motion.div
              className="w-full h-full rounded-full bg-gradient-to-br from-zen-primary/20 to-zen-accent/20 border-2 border-zen-primary/30"
              animate={{
                scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1,
              }}
              transition={{ duration: phaseDurations[phase] / 1000, ease: "easeInOut" }}
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.h3 
                  className="text-2xl font-medium text-zen-primary mb-2"
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {phaseTexts[phase]}
                </motion.h3>
                <p className="text-sm text-muted-foreground">
                  {Math.ceil((100 - progress) * phaseDurations[phase] / 100 / 1000)}s
                </p>
              </div>
            </div>

            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${progress * 2.83} 283`}
                className="text-zen-primary transition-all duration-75"
              />
            </svg>
          </div>

          {/* Controls */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Cycles completed: {cycles}
            </p>
            
            <div className="flex justify-center space-x-4">
              {!isActive ? (
                <Button onClick={startBreathing} className="btn-zen">
                  Start Breathing
                </Button>
              ) : (
                <Button onClick={stopBreathing} variant="outline" className="btn-zen">
                  Stop
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}