import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, FileText } from 'lucide-react';

interface WordCountProps {
  text?: string;
  className?: string;
}

export function WordCount({ text, className = "" }: WordCountProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const extractPageText = () => {
    if (text) return text;
    
    // Get main content from the current page
    const content = document.querySelector('main, article, .content, #content') || document.body;
    const clone = content.cloneNode(true) as Element;
    
    // Remove unwanted elements
    const unwanted = clone.querySelectorAll('nav, header, footer, aside, script, style, .ad');
    unwanted.forEach(el => el.remove());
    
    return clone.textContent?.trim() || '';
  };

  const calculateStats = (content: string) => {
    if (!content) return { words: 0, chars: 0, reading: 0 };

    // Count words (split by whitespace and filter empty strings)
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    
    // Count characters (excluding whitespace)
    const chars = content.replace(/\s/g, '').length;
    
    // Calculate reading time (average 200-250 WPM, using 225)
    const reading = Math.ceil(words / 225);

    return { words, chars, reading };
  };

  useEffect(() => {
    const updateStats = () => {
      const content = extractPageText();
      const stats = calculateStats(content);
      
      setWordCount(stats.words);
      setCharCount(stats.chars);
      setReadingTime(stats.reading);
    };

    // Initial calculation
    updateStats();

    // Update when page content changes (debounced)
    let timeout: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(updateStats, 500);
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      characterData: true 
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [text]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <Card className={`p-2 bg-card/80 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between space-x-2 text-xs">
        <div className="flex items-center space-x-1">
          <FileText className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Words:</span>
          <span className="font-medium tabular-nums">{formatNumber(wordCount)}</span>
        </div>

        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Read:</span>
          <span className="font-medium tabular-nums">
            {readingTime < 1 ? '<1' : readingTime}min
          </span>
        </div>

        <div className="text-xs text-muted-foreground tabular-nums">
          {formatNumber(charCount)}c
        </div>
      </div>
    </Card>
  );
}

// Status bar component for integration into browser chrome
export function ReadingStats() {
  return (
    <div className="fixed bottom-4 left-4 z-30">
      <WordCount className="shadow-lg" />
    </div>
  );
}