import React, { useState, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  CloudRain, 
  Trees, 
  Coffee, 
  Waves, 
  Volume2, 
  VolumeX,
  Circle
} from 'lucide-react';

interface SoundConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  color: string;
}

const SOUNDS: SoundConfig[] = [
  {
    id: 'rain',
    name: 'Rain',
    icon: CloudRain,
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    color: 'text-blue-400'
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: Trees,
    url: 'https://cdn.pixabay.com/audio/2022/03/21/audio_c610232c18.mp3',
    color: 'text-green-400'
  },
  {
    id: 'cafe',
    name: 'Café',
    icon: Coffee,
    url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3',
    color: 'text-amber-400'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: Waves,
    url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_bb630f1540.mp3',
    color: 'text-cyan-400'
  },
  {
    id: 'bowls',
    name: 'Tibetan Bowls',
    icon: Circle,
    url: 'https://cdn.pixabay.com/audio/2022/11/27/audio_af1e47c7c6.mp3',
    color: 'text-purple-400'
  }
];

export function AmbientSounds() {
  const [sounds, setSounds] = useState<Map<string, Howl>>(new Map());
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [volumes, setVolumes] = useState<Map<string, number>>(new Map());
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize sounds
  useEffect(() => {
    const soundMap = new Map<string, Howl>();
    const volumeMap = new Map<string, number>();

    SOUNDS.forEach(sound => {
      const howl = new Howl({
        src: [sound.url],
        loop: true,
        volume: 0.5,
        preload: false
      });
      
      soundMap.set(sound.id, howl);
      volumeMap.set(sound.id, 0.5);
    });

    setSounds(soundMap);
    setVolumes(volumeMap);

    return () => {
      soundMap.forEach(howl => {
        howl.unload();
      });
    };
  }, []);

  const toggleSound = useCallback((soundId: string) => {
    const sound = sounds.get(soundId);
    if (!sound) return;

    setActiveSounds(prev => {
      const newActive = new Set(prev);
      
      if (newActive.has(soundId)) {
        sound.stop();
        newActive.delete(soundId);
      } else {
        sound.play();
        newActive.add(soundId);
      }
      
      return newActive;
    });
  }, [sounds]);

  const updateSoundVolume = useCallback((soundId: string, volume: number) => {
    const sound = sounds.get(soundId);
    if (!sound) return;

    const actualVolume = isMuted ? 0 : volume * masterVolume;
    sound.volume(actualVolume);
    
    setVolumes(prev => new Map(prev.set(soundId, volume)));
  }, [sounds, masterVolume, isMuted]);

  const updateMasterVolume = useCallback((volume: number) => {
    setMasterVolume(volume);
    
    // Update all active sounds
    sounds.forEach((howl, soundId) => {
      if (activeSounds.has(soundId)) {
        const soundVolume = volumes.get(soundId) || 0.5;
        howl.volume(isMuted ? 0 : soundVolume * volume);
      }
    });
  }, [sounds, activeSounds, volumes, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      
      sounds.forEach((howl, soundId) => {
        if (activeSounds.has(soundId)) {
          const soundVolume = volumes.get(soundId) || 0.5;
          howl.volume(newMuted ? 0 : soundVolume * masterVolume);
        }
      });
      
      return newMuted;
    });
  }, [sounds, activeSounds, volumes, masterVolume]);

  const stopAllSounds = useCallback(() => {
    sounds.forEach(howl => howl.stop());
    setActiveSounds(new Set());
  }, [sounds]);

  return (
    <Card className="p-6 w-full max-w-md">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Ambient Sounds</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="btn-zen"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            {activeSounds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopAllSounds}
                className="btn-zen text-xs"
              >
                Stop All
              </Button>
            )}
          </div>
        </div>

        {/* Master Volume */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Master Volume</label>
          <Slider
            value={[masterVolume]}
            onValueChange={([value]) => updateMasterVolume(value)}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Sound Controls */}
        <div className="space-y-4">
          {SOUNDS.map(sound => {
            const Icon = sound.icon;
            const isActive = activeSounds.has(sound.id);
            const volume = volumes.get(sound.id) || 0.5;

            return (
              <div key={sound.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSound(sound.id)}
                    className="btn-zen flex items-center space-x-2 flex-1 mr-2"
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-current' : sound.color}`} />
                    <span>{sound.name}</span>
                  </Button>
                </div>
                
                {isActive && (
                  <Slider
                    value={[volume]}
                    onValueChange={([value]) => updateSoundVolume(sound.id, value)}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Mix multiple sounds for your perfect ambiance
        </p>
      </div>
    </Card>
  );
}