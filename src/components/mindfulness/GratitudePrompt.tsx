import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Save, X } from 'lucide-react';

const GRATITUDE_PROMPTS = [
  "What are you grateful for today?",
  "What moment made you smile today?",
  "Who or what brought you joy today?",
  "What small thing are you thankful for?",
  "What challenged you in a good way today?",
  "What did you learn about yourself today?",
];

export function GratitudePrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [gratitude, setGratitude] = useState('');
  const [prompt, setPrompt] = useState('');

  const showGratitudePrompt = useCallback(() => {
    const randomPrompt = GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)];
    setPrompt(randomPrompt);
    setGratitude('');
    setIsVisible(true);
  }, []);

  // Listen for beforeunload to show gratitude prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if we should show gratitude (not on every close, maybe 30% chance)
      if (Math.random() < 0.3) {
        showGratitudePrompt();
        
        // Prevent the browser from closing immediately
        e.preventDefault();
        e.returnValue = '';
        
        // Remove the listener after showing
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showGratitudePrompt]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
      
      // Ctrl/Cmd + G to show gratitude prompt
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !isVisible) {
        e.preventDefault();
        showGratitudePrompt();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, showGratitudePrompt]);

  const saveGratitude = () => {
    if (!gratitude.trim()) return;
    
    // Save to localStorage with timestamp
    const today = new Date().toISOString().split('T')[0];
    const existingGratitudes = JSON.parse(localStorage.getItem('gratitudeEntries') || '[]');
    
    const newEntry = {
      date: today,
      text: gratitude.trim(),
      timestamp: Date.now()
    };
    
    existingGratitudes.unshift(newEntry);
    
    // Keep only last 30 entries
    if (existingGratitudes.length > 30) {
      existingGratitudes.splice(30);
    }
    
    localStorage.setItem('gratitudeEntries', JSON.stringify(existingGratitudes));
    setIsVisible(false);
  };

  const skipGratitude = () => {
    setIsVisible(false);
  };

  return (
    <>
      {/* Manual trigger button (can be integrated into settings) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={showGratitudePrompt}
        className="btn-zen"
        title="Gratitude Journal (Ctrl+G)"
      >
        <Heart className="w-4 h-4" />
      </Button>

      {/* Gratitude Modal */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setIsVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-6 bg-card/95 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <h3 className="font-medium">Moment of Gratitude</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <motion.p 
                    className="text-sm text-muted-foreground leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {prompt}
                  </motion.p>

                  <Textarea
                    value={gratitude}
                    onChange={(e) => setGratitude(e.target.value)}
                    placeholder="Take a moment to reflect..."
                    className="min-h-[120px] resize-none border-zen-primary/20 focus:border-zen-primary/40"
                    autoFocus
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipGratitude}
                      className="btn-zen"
                    >
                      Maybe later
                    </Button>
                    <Button
                      onClick={saveGratitude}
                      disabled={!gratitude.trim()}
                      className="btn-zen bg-gradient-to-r from-red-400/20 to-pink-400/20 hover:from-red-400/30 hover:to-pink-400/30"
                      size="sm"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>

                <motion.p
                  className="text-xs text-muted-foreground text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+G</kbd> anytime to open
                </motion.p>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
