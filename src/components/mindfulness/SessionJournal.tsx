import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Save, X } from 'lucide-react';

const INTENTION_PROMPTS = [
  "What is your main intention for this session?",
  "How do you want to feel after browsing today?",
  "What would make this session meaningful?",
  "What are you hoping to accomplish or learn?",
  "How can you stay mindful while browsing?",
];

export function SessionJournal() {
  const [isVisible, setIsVisible] = useState(false);
  const [intention, setIntention] = useState('');
  const [prompt, setPrompt] = useState('');
  const [hasShownToday, setHasShownToday] = useState(false);

  // Check if we should show the journal prompt on app start
  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('sessionJournalLastShown');
    const todaysIntention = localStorage.getItem(`sessionIntention_${today}`);
    
    // Show if not shown today or no intention set
    if (lastShown !== today && !todaysIntention && !hasShownToday) {
      const randomPrompt = INTENTION_PROMPTS[Math.floor(Math.random() * INTENTION_PROMPTS.length)];
      setPrompt(randomPrompt);
      setIsVisible(true);
      setHasShownToday(true);
    } else if (todaysIntention) {
      setIntention(todaysIntention);
    }
  }, [hasShownToday]);

  const saveIntention = () => {
    if (!intention.trim()) return;
    
    const today = new Date().toDateString();
    localStorage.setItem(`sessionIntention_${today}`, intention);
    localStorage.setItem('sessionJournalLastShown', today);
    setIsVisible(false);
  };

  const skipIntention = () => {
    const today = new Date().toDateString();
    localStorage.setItem('sessionJournalLastShown', today);
    setIsVisible(false);
  };

  const openJournal = () => {
    const today = new Date().toDateString();
    const savedIntention = localStorage.getItem(`sessionIntention_${today}`) || '';
    setIntention(savedIntention);
    
    if (!savedIntention) {
      const randomPrompt = INTENTION_PROMPTS[Math.floor(Math.random() * INTENTION_PROMPTS.length)];
      setPrompt(randomPrompt);
    }
    
    setIsVisible(true);
  };

  const getCurrentIntention = () => {
    const today = new Date().toDateString();
    return localStorage.getItem(`sessionIntention_${today}`) || null;
  };

  const currentIntention = getCurrentIntention();

  return (
    <>
      {/* Journal Button - shows current intention or prompts to set one */}
      <Button
        variant="ghost"
        size="sm"
        onClick={openJournal}
        className="btn-zen relative"
        title={currentIntention ? `Today's intention: ${currentIntention}` : "Set your intention"}
      >
        <BookOpen className="w-4 h-4" />
        {currentIntention && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-zen-primary rounded-full" />
        )}
      </Button>

      {/* Journal Modal */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setIsVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-6 bg-card/95 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-zen-primary" />
                    <h3 className="font-medium">Session Intention</h3>
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
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {prompt}
                  </motion.p>

                  <Textarea
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Write your intention for this session..."
                    className="min-h-[100px] resize-none"
                    autoFocus
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipIntention}
                      className="btn-zen"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={saveIntention}
                      disabled={!intention.trim()}
                      className="btn-zen"
                      size="sm"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>

                {currentIntention && currentIntention !== intention && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-border/30"
                  >
                    <p className="text-xs text-muted-foreground mb-2">Previous intention:</p>
                    <p className="text-sm bg-muted/30 rounded p-2">{currentIntention}</p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}