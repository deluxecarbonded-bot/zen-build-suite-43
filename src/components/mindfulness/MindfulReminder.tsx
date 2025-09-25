import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Heart, Pause } from 'lucide-react';
const REMINDERS = ["Breathe. Why are you here?", "Take a moment to center yourself.", "Notice your breath. Feel your body.", "What is your intention right now?", "Are you present in this moment?", "Pause. Check in with yourself.", "How are you feeling right now?", "Remember to be kind to yourself."];
interface MindfulReminderProps {
  intervalMinutes?: number;
}
export function MindfulReminder({
  intervalMinutes = 30
}: MindfulReminderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentReminder, setCurrentReminder] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [nextReminderTime, setNextReminderTime] = useState<Date | null>(null);
  const showReminder = useCallback(() => {
    if (!isEnabled) return;
    const randomReminder = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
    setCurrentReminder(randomReminder);
    setIsVisible(true);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 10000);
  }, [isEnabled]);
  const scheduleNextReminder = useCallback(() => {
    const nextTime = new Date(Date.now() + intervalMinutes * 60 * 1000);
    setNextReminderTime(nextTime);
  }, [intervalMinutes]);

  // Set up reminder interval
  useEffect(() => {
    if (!isEnabled) return;
    scheduleNextReminder();
    const interval = setInterval(() => {
      showReminder();
      scheduleNextReminder();
    }, intervalMinutes * 60 * 1000);
    return () => clearInterval(interval);
  }, [isEnabled, intervalMinutes, showReminder, scheduleNextReminder]);
  const dismissReminder = useCallback(() => {
    setIsVisible(false);
  }, []);
  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (!isEnabled) {
      scheduleNextReminder();
    } else {
      setNextReminderTime(null);
    }
  }, [isEnabled, scheduleNextReminder]);
  const formatNextReminderTime = (time: Date) => {
    const now = new Date();
    const diffMs = time.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };
  return <>
      {/* Reminder Popup */}
      <AnimatePresence>
        {isVisible && <motion.div initial={{
        opacity: 0,
        scale: 0.8,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.8,
        y: -20
      }} className="fixed top-8 right-8 z-50 max-w-sm">
            <Card className="p-6 bg-card/95 backdrop-blur-sm shadow-2xl border-zen-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Pause className="w-5 h-5 text-zen-primary" />
                  <h3 className="font-medium text-zen-primary">Mindful Moment</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={dismissReminder} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <motion.p className="text-sm mb-4 leading-relaxed" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.2
          }}>
                {currentReminder}
              </motion.p>
              
              <div className="flex justify-end space-x-2">
                <Button size="sm" onClick={dismissReminder} className="btn-zen">
                  <Heart className="w-3 h-3 mr-1" />
                  Thank you
                </Button>
              </div>
            </Card>
          </motion.div>}
      </AnimatePresence>

      {/* Control Settings (can be integrated into main settings) */}
      
    </>;
}