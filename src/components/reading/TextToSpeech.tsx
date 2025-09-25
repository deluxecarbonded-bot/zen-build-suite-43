import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  SkipForward, 
  SkipBack,
  Settings
} from 'lucide-react';

interface TextToSpeechProps {
  text?: string;
  isVisible?: boolean;
  compact?: boolean;
  className?: string;
}

export function TextToSpeech({ text, isVisible = false, compact = false, className = "" }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [showSettings, setShowSettings] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentTextRef = useRef<string>('');

  // Check if Speech Synthesis is supported
  useEffect(() => {
    const checkSupport = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setIsSupported(true);
      } else {
        setIsSupported(false);
        console.warn('Speech Synthesis not supported in this browser');
      }
    };
    
    checkSupport();
  }, []);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;
    
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select a good default voice (prefer English, neural voices)
      const preferredVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Neural') || voice.name.includes('Premium'))
      ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
      
      setSelectedVoice(preferredVoice);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  // Extract text from current page if none provided
  const extractPageText = useCallback(() => {
    if (text) return text;
    
    // Get main content, excluding navigation and other UI elements
    const content = document.querySelector('main, article, .content, #content') || document.body;
    const clone = content.cloneNode(true) as Element;
    
    // Remove unwanted elements
    const unwanted = clone.querySelectorAll('nav, header, footer, aside, script, style, .ad');
    unwanted.forEach(el => el.remove());
    
    return clone.textContent?.trim() || '';
  }, [text]);

  const speak = useCallback(() => {
    if (!isSupported || !selectedVoice) return;

    const textToSpeak = extractPageText();
    if (!textToSpeak) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    currentTextRef.current = textToSpeak;
    
    speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, rate, pitch, volume, extractPageText]);

  const pause = useCallback(() => {
    if (!isSupported || !speechSynthesis.speaking) return;
    speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported || !speechSynthesis.paused) return;
    speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  const skip = useCallback((direction: 'forward' | 'back') => {
    if (!isSupported) return;
    // Simple skip implementation - in a real app, you'd track sentence positions
    if (isPlaying) {
      stop();
      // Here you would implement actual sentence/paragraph skipping
      setTimeout(() => speak(), 100);
    }
  }, [isSupported, isPlaying, stop, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  if (!compact && !isVisible && !isPlaying) return null;

  // Show not supported message if speech synthesis is not available
  if (!isSupported) {
    if (compact) {
      return (
        <div className={`text-center text-muted-foreground ${className}`}>
          <Volume2 className="w-4 h-4 mx-auto mb-1 opacity-50" />
          <p className="text-xs">TTS not supported</p>
        </div>
      );
    }
    return (
      <Card className="fixed bottom-8 right-8 p-4 w-80 bg-card/95 backdrop-blur-sm shadow-2xl z-40">
        <div className="text-center text-muted-foreground">
          <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Text-to-speech is not supported in this browser.</p>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium flex items-center">
            <Volume2 className="w-3 h-3 mr-1" />
            Text to Speech
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip('back')}
            disabled={!isPlaying}
            className="h-7 w-7 p-0"
          >
            <SkipBack className="w-3 h-3" />
          </Button>

          {!isPlaying ? (
            <Button onClick={speak} size="sm" className="h-7 text-xs flex-1">
              <Play className="w-3 h-3 mr-1" />
              Speak
            </Button>
          ) : isPaused ? (
            <Button onClick={resume} size="sm" className="h-7 text-xs flex-1">
              <Play className="w-3 h-3 mr-1" />
              Resume
            </Button>
          ) : (
            <Button onClick={pause} variant="outline" size="sm" className="h-7 text-xs flex-1">
              <Pause className="w-3 h-3 mr-1" />
              Pause
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={stop}
            disabled={!isPlaying && !isPaused}
            className="h-7 w-7 p-0"
          >
            <Square className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip('forward')}
            disabled={!isPlaying}
            className="h-7 w-7 p-0"
          >
            <SkipForward className="w-3 h-3" />
          </Button>
        </div>

        {/* Compact Settings */}
        {showSettings && (
          <div className="space-y-2 pt-2 border-t border-border/20">
            {/* Voice Selection */}
            <div>
              <label className="text-xs mb-1 block">Voice</label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="w-full text-xs bg-background border border-border/30 rounded px-2 py-1"
              >
                {voices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Speed */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs">Speed</label>
                <span className="text-xs text-muted-foreground">{rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[rate]}
                onValueChange={([value]) => setRate(value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Volume */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs">Volume</label>
                <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={([value]) => setVolume(value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Status */}
        {isPlaying && (
          <div className="text-xs text-muted-foreground text-center">
            {isPaused ? 'Paused' : 'Speaking...'}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="fixed bottom-8 right-8 p-4 w-80 bg-card/95 backdrop-blur-sm shadow-2xl z-40">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center">
            <Volume2 className="w-4 h-4 mr-2" />
            Text to Speech
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip('back')}
            disabled={!isPlaying}
            className="btn-zen"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          {!isPlaying ? (
            <Button onClick={speak} className="btn-zen">
              <Play className="w-4 h-4 mr-2" />
              Speak
            </Button>
          ) : isPaused ? (
            <Button onClick={resume} className="btn-zen">
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          ) : (
            <Button onClick={pause} variant="outline" className="btn-zen">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={stop}
            disabled={!isPlaying && !isPaused}
            className="btn-zen"
          >
            <Square className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip('forward')}
            disabled={!isPlaying}
            className="btn-zen"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-3 pt-3 border-t border-border/30">
            {/* Voice Selection */}
            <div>
              <label className="text-xs font-medium mb-1 block">Voice</label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="w-full text-xs bg-background border border-border/30 rounded px-2 py-1"
              >
                {voices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Rate */}
            <div>
              <label className="text-xs font-medium mb-1 block">
                Speed: {rate.toFixed(1)}x
              </label>
              <Slider
                value={[rate]}
                onValueChange={([value]) => setRate(value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Pitch */}
            <div>
              <label className="text-xs font-medium mb-1 block">
                Pitch: {pitch.toFixed(1)}
              </label>
              <Slider
                value={[pitch]}
                onValueChange={([value]) => setPitch(value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Volume */}
            <div>
              <label className="text-xs font-medium mb-1 block">
                Volume: {Math.round(volume * 100)}%
              </label>
              <Slider
                value={[volume]}
                onValueChange={([value]) => setVolume(value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Status */}
        {isPlaying && (
          <div className="text-xs text-muted-foreground text-center">
            {isPaused ? 'Paused' : 'Speaking...'}
          </div>
        )}
      </div>
    </Card>
  );
}