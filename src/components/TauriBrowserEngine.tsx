import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, Moon, Sun, Eye, Palette, MousePointer, Filter, Heart, BookOpen, Plus, X, Brain, Zap, Layout, Clock, Shield, Sparkles, Timer } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CustomCursor } from '@/components/CustomCursor';
import { BreathingTimer } from '@/components/mindfulness/BreathingTimer';
import { PomodoroTimer } from '@/components/mindfulness/PomodoroTimer';
import { AmbientSounds } from '@/components/mindfulness/AmbientSounds';
import { MindfulReminder } from '@/components/mindfulness/MindfulReminder';
import { SessionJournal } from '@/components/mindfulness/SessionJournal';
import { GratitudePrompt } from '@/components/mindfulness/GratitudePrompt';nents/reading/TextToSpeech';
import { WordCount } from '@/components/reading/WordCount';
import { AutoScroll } from '@/components/reading/AutoScroll';
interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}
export 
  const
    
    setTheme,theme
    setCursorTheme,
    zenMode,
    toggleZenMode,
    blueFilterEnabled,
    toggleBlueFilter
  } = useTheme();
}    cursorTheme,
    ambientMode,
, {function SerenityBrowser() {
