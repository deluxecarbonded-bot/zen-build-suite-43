import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  ArrowDown 
} from 'lucide-react';

interface AutoScrollProps {
  compact?: boolean;
  className?: string;
}

export function AutoScroll({ compact = false, className = "" }: AutoScrollProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState(2); // pixels per frame
  const [showSettings, setShowSettings] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedScrollTopRef = useRef<number>(0);

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) return; // Already scrolling

    setIsScrolling(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();

    const scroll = () => {
      if (window.scrollY >= document.documentElement.scrollHeight - window.innerHeight) {
        // Reached bottom
        stopAutoScroll();
        return;
      }

      window.scrollBy(0, speed);
      intervalRef.current = requestAnimationFrame(scroll);
    };

    intervalRef.current = requestAnimationFrame(scroll);
  }, [speed]);

  const pauseAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
      intervalRef.current = null;
    }
    pausedScrollTopRef.current = window.scrollY;
    setIsPaused(true);
  }, []);

  const resumeAutoScroll = useCallback(() => {
    setIsPaused(false);
    startAutoScroll();
  }, [startAutoScroll]);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScrolling(false);
    setIsPaused(false);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space bar to toggle auto-scroll (only if not in input/textarea)
      if (e.code === 'Space' && 
          !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        
        if (!isScrolling) {
          startAutoScroll();
        } else if (isPaused) {
          resumeAutoScroll();
        } else {
          pauseAutoScroll();
        }
      }
      
      // Escape to stop
      if (e.key === 'Escape' && isScrolling) {
        stopAutoScroll();
      }

      // Arrow keys to adjust speed while scrolling
      if (isScrolling && !isPaused) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSpeed(prev => Math.min(10, prev + 0.5));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSpeed(prev => Math.max(0.5, prev - 0.5));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isScrolling, isPaused, startAutoScroll, pauseAutoScroll, resumeAutoScroll, stopAutoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
      }
    };
  }, []);

  // Calculate estimated time to finish
  const getEstimatedTime = () => {
    const remainingHeight = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    const timeInSeconds = remainingHeight / (speed * 60); // assuming 60fps
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium flex items-center">
            <ArrowDown className="w-3 h-3 mr-1" />
            Auto-Scroll
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="h-6 w-6 p-0"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>

        {/* Compact Controls */}
        <div className="flex items-center space-x-1">
          {!isScrolling ? (
            <Button onClick={startAutoScroll} size="sm" className="h-7 text-xs flex-1">
              <Play className="w-3 h-3 mr-1" />
              Start
            </Button>
          ) : isPaused ? (
            <Button onClick={resumeAutoScroll} size="sm" className="h-7 text-xs flex-1">
              <Play className="w-3 h-3 mr-1" />
              Resume
            </Button>
          ) : (
            <Button onClick={pauseAutoScroll} variant="outline" size="sm" className="h-7 text-xs flex-1">
              <Pause className="w-3 h-3 mr-1" />
              Pause
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={stopAutoScroll}
            disabled={!isScrolling && !isPaused}
            className="h-7 w-7 p-0"
          >
            <Square className="w-3 h-3" />
          </Button>
        </div>

        {/* Compact Speed Control */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs">Speed</label>
            <span className="text-xs text-muted-foreground">{speed.toFixed(1)}x</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={([value]) => setSpeed(value)}
            min={0.5}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Compact Settings */}
        {showSettings && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/20">
            <p><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Space</kbd> Toggle</p>
            <p><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑/↓</kbd> Speed</p>
            <p><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Stop</p>
          </div>
        )}

        {/* Compact Status */}
        {isScrolling && (
          <div className="text-xs text-muted-foreground text-center">
            <div>{isPaused ? 'Paused' : 'Auto-scrolling...'}</div>
            {!isPaused && (
              <div className="text-[10px]">Est: {getEstimatedTime()}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="fixed bottom-8 left-8 p-4 w-72 bg-card/95 backdrop-blur-sm shadow-2xl z-40">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center">
            <ArrowDown className="w-4 h-4 mr-2" />
            Auto-Scroll
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="btn-zen"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-2">
          {!isScrolling ? (
            <Button onClick={startAutoScroll} className="btn-zen flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : isPaused ? (
            <Button onClick={resumeAutoScroll} className="btn-zen flex-1">
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          ) : (
            <Button onClick={pauseAutoScroll} variant="outline" className="btn-zen flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={stopAutoScroll}
            disabled={!isScrolling && !isPaused}
            className="btn-zen"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>

        {/* Speed Control (always visible) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium">Speed</label>
            <span className="text-xs text-muted-foreground">{speed.toFixed(1)}x</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={([value]) => setSpeed(value)}
            min={0.5}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-3 pt-3 border-t border-border/30">
            <div className="text-xs text-muted-foreground space-y-1">
              <p><kbd className="px-1 py-0.5 bg-muted rounded">Space</kbd> Toggle auto-scroll</p>
              <p><kbd className="px-1 py-0.5 bg-muted rounded">↑/↓</kbd> Adjust speed while scrolling</p>
              <p><kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> Stop scrolling</p>
            </div>
          </div>
        )}

        {/* Status */}
        {isScrolling && (
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div>{isPaused ? 'Paused' : 'Auto-scrolling...'}</div>
            {!isPaused && (
              <div>Est. time remaining: {getEstimatedTime()}</div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}