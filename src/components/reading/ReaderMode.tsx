import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  BookOpen, 
  X, 
  Type, 
  Minus, 
  Plus, 
  AlignLeft, 
  AlignCenter, 
  Sun,
  Moon
} from 'lucide-react';

interface ReaderModeProps {
  isOpen: boolean;
  onClose: () => void;
  content?: string;
  url?: string;
}

export function ReaderMode({ isOpen, onClose, content, url }: ReaderModeProps) {
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [maxWidth, setMaxWidth] = useState(700);
  const [fontFamily, setFontFamily] = useState('serif');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'justify'>('left');
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>('light');

  const fontFamilies = [
    { id: 'serif', name: 'Serif', class: 'font-serif' },
    { id: 'sans', name: 'Sans-serif', class: 'font-sans' },
    { id: 'mono', name: 'Monospace', class: 'font-mono' },
  ];

  const themes = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      secondary: 'text-gray-600'
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      secondary: 'text-gray-300'
    },
    sepia: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      secondary: 'text-amber-700'
    }
  };

  const extractReadableContent = (htmlContent: string) => {
    // Simple content extraction - in real app, use Readability.js
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove scripts, styles, nav, header, footer
    const unwanted = doc.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement');
    unwanted.forEach(el => el.remove());
    
    // Find main content area
    const mainContent = doc.querySelector('main, article, .content, .post, #content') || doc.body;
    
    return mainContent?.innerHTML || htmlContent;
  };

  const currentTheme = themes[readerTheme];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 ${currentTheme.bg} transition-colors duration-300`}
      >
        {/* Reader Controls */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30"
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="btn-zen"
              >
                <X className="w-4 h-4 mr-2" />
                Exit Reader
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {url && new URL(url).hostname}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReaderTheme(prev => 
                  prev === 'light' ? 'dark' : prev === 'dark' ? 'sepia' : 'light'
                )}
                className="btn-zen"
              >
                {readerTheme === 'light' && <Sun className="w-4 h-4" />}
                {readerTheme === 'dark' && <Moon className="w-4 h-4" />}
                {readerTheme === 'sepia' && <BookOpen className="w-4 h-4" />}
              </Button>

              {/* Font Size */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                  className="btn-zen w-8 h-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-xs w-8 text-center">{fontSize}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                  className="btn-zen w-8 h-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              {/* Font Family */}
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="text-xs bg-transparent border border-border/30 rounded px-2 py-1"
              >
                {fontFamilies.map(font => (
                  <option key={font.id} value={font.id}>{font.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Reader Content */}
        <div className="pt-16 pb-8 px-8 h-full overflow-y-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto"
            style={{ maxWidth: `${maxWidth}px` }}
          >
            <article
              className={`
                ${currentTheme.text} 
                ${fontFamilies.find(f => f.id === fontFamily)?.class}
                ${alignment === 'center' ? 'text-center' : alignment === 'justify' ? 'text-justify' : 'text-left'}
              `}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
              }}
              dangerouslySetInnerHTML={{
                __html: content ? extractReadableContent(content) : '<p>No content available for reader mode.</p>'
              }}
            />
          </motion.div>
        </div>

        {/* Reading Progress Bar */}
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-border/30">
          <div 
            className="h-full bg-zen-primary transition-all duration-300"
            style={{ width: '20%' }} // This would be calculated based on scroll position
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for reading progress
export function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', calculateProgress);
    return () => window.removeEventListener('scroll', calculateProgress);
  }, []);

  return progress;
}