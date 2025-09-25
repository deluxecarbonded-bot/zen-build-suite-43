import React, { createContext, useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';

type Theme = 'light' | 'dark' | 'sepia' | 'auto';
type AmbientMode = 'dawn' | 'day' | 'dusk' | 'night';
type CursorTheme = 'default' | 'zen' | 'minimal' | 'calm';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  ambientMode: AmbientMode;
  cursorTheme: CursorTheme;
  setCursorTheme: (cursor: CursorTheme) => void;
  zenMode: boolean;
  toggleZenMode: () => void;
  blueFilterEnabled: boolean;
  toggleBlueFilter: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('auto');
  const [cursorTheme, setCursorTheme] = useState<CursorTheme>('default');
  const [zenMode, setZenMode] = useState(false);
  const [blueFilterEnabled, setBlueFilterEnabled] = useState(false);
  const [ambientMode, setAmbientMode] = useState<AmbientMode>('day');

  // Calculate ambient mode based on time of day
  useEffect(() => {
    const updateAmbientMode = () => {
      const hour = dayjs().hour();
      
      if (hour >= 5 && hour < 8) {
        setAmbientMode('dawn');
      } else if (hour >= 8 && hour < 17) {
        setAmbientMode('day');
      } else if (hour >= 17 && hour < 20) {
        setAmbientMode('dusk');
      } else {
        setAmbientMode('night');
      }
    };

    updateAmbientMode();
    const interval = setInterval(updateAmbientMode, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-dark', 'theme-sepia');
    
    // Apply new theme
    if (theme === 'dark') {
      root.classList.add('theme-dark');
    } else if (theme === 'sepia') {
      root.classList.add('theme-sepia');
    } else if (theme === 'auto') {
      // Use system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('theme-dark');
      }
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('theme-dark');
        } else {
          root.classList.remove('theme-dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Apply ambient background
  useEffect(() => {
    const body = document.body;
    
    // Remove existing ambient classes
    body.classList.remove('ambient-dawn', 'ambient-day', 'ambient-dusk', 'ambient-night');
    
    // Add current ambient class
    body.classList.add(`ambient-${ambientMode}`);
  }, [ambientMode]);

  // Apply cursor theme
  useEffect(() => {
    const body = document.body;
    
    // Remove existing cursor classes
    body.classList.remove('cursor-zen', 'cursor-minimal', 'cursor-calm');
    
    // Add current cursor class
    if (cursorTheme !== 'default') {
      body.classList.add(`cursor-${cursorTheme}`);
    }
  }, [cursorTheme]);

  // Apply zen mode
  useEffect(() => {
    const body = document.body;
    
    if (zenMode) {
      body.classList.add('zen-mode');
    } else {
      body.classList.remove('zen-mode');
    }
  }, [zenMode]);

  // Apply blue light filter
  useEffect(() => {
    const body = document.body;
    
    if (blueFilterEnabled) {
      body.classList.add('blue-filter');
    } else {
      body.classList.remove('blue-filter');
    }
  }, [blueFilterEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zen mode toggle (Ctrl/Cmd + Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        setZenMode(!zenMode);
      }
      
      // Blue filter toggle (Ctrl/Cmd + Shift + B)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        setBlueFilterEnabled(!blueFilterEnabled);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zenMode, blueFilterEnabled]);

  const toggleZenMode = () => setZenMode(!zenMode);
  const toggleBlueFilter = () => setBlueFilterEnabled(!blueFilterEnabled);

  const value = {
    theme,
    setTheme,
    ambientMode,
    cursorTheme,
    setCursorTheme,
    zenMode,
    toggleZenMode,
    blueFilterEnabled,
    toggleBlueFilter,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}