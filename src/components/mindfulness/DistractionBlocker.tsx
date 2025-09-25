import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Plus, 
  X, 
  Timer, 
  Play, 
  Square,
  AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlockedSite {
  domain: string;
  reason?: string;
}

const DEFAULT_BLOCKED_SITES = [
  { domain: 'facebook.com', reason: 'Social Media' },
  { domain: 'twitter.com', reason: 'Social Media' },
  { domain: 'instagram.com', reason: 'Social Media' },
  { domain: 'youtube.com', reason: 'Video Platform' },
  { domain: 'reddit.com', reason: 'Social News' },
  { domain: 'tiktok.com', reason: 'Social Media' },
];

export function DistractionBlocker() {
  const [isActive, setIsActive] = useState(false);
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [newSite, setNewSite] = useState('');
  const [sessionDuration, setSessionDuration] = useState(25); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showAddSite, setShowAddSite] = useState(false);
  const { toast } = useToast();

  // Load blocked sites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('blockedSites');
    if (saved) {
      setBlockedSites(JSON.parse(saved));
    } else {
      setBlockedSites(DEFAULT_BLOCKED_SITES);
    }
  }, []);

  // Save blocked sites to localStorage
  useEffect(() => {
    localStorage.setItem('blockedSites', JSON.stringify(blockedSites));
  }, [blockedSites]);

  // Timer logic
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          setIsActive(false);
          toast({
            title: "Focus Session Complete!",
            description: "Great job staying focused. Time for a well-deserved break.",
          });
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, toast]);

  // Check if current URL should be blocked
  const checkCurrentUrl = useCallback(() => {
    if (!isActive) return false;

    const currentDomain = window.location.hostname.replace('www.', '');
    const isBlocked = blockedSites.some(site => 
      currentDomain.includes(site.domain) || site.domain.includes(currentDomain)
    );

    return isBlocked;
  }, [isActive, blockedSites]);

  // Monitor navigation
  useEffect(() => {
    const checkNavigation = () => {
      if (checkCurrentUrl()) {
        // Show blocking overlay
        showBlockingOverlay();
      }
    };

    // Check on URL changes (for SPAs)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setTimeout(checkNavigation, 0);
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(checkNavigation, 0);
    };

    window.addEventListener('popstate', checkNavigation);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', checkNavigation);
    };
  }, [checkCurrentUrl]);

  const showBlockingOverlay = () => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: system-ui;
    `;

    overlay.innerHTML = `
      <div style="text-align: center; max-width: 400px; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🚫</div>
        <h2 style="font-size: 24px; margin-bottom: 10px;">Site Blocked</h2>
        <p style="margin-bottom: 20px; opacity: 0.8;">
          This site is blocked during your focus session. 
          Stay focused on your intention.
        </p>
        <p style="font-size: 14px; opacity: 0.6;">
          Time remaining: ${Math.ceil(timeRemaining / 60000)} minutes
        </p>
        <button 
          onclick="window.history.back()" 
          style="
            margin-top: 20px;
            padding: 10px 20px;
            background: #444;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          "
        >
          Go Back
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Remove overlay after 5 seconds or on click
    setTimeout(() => overlay.remove(), 5000);
    overlay.onclick = () => overlay.remove();
  };

  const startFocusSession = () => {
    setTimeRemaining(sessionDuration * 60 * 1000);
    setIsActive(true);
    
    toast({
      title: "Focus Session Started",
      description: `Blocked sites are now restricted for ${sessionDuration} minutes.`,
    });
  };

  const stopFocusSession = () => {
    setIsActive(false);
    setTimeRemaining(0);
    
    toast({
      title: "Focus Session Ended",
      description: "All sites are now accessible again.",
    });
  };

  const addSite = () => {
    if (!newSite.trim()) return;

    const domain = newSite.replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    if (blockedSites.some(site => site.domain === domain)) {
      toast({
        title: "Already Blocked",
        description: "This site is already in your blocked list.",
        variant: "destructive"
      });
      return;
    }

    setBlockedSites(prev => [...prev, { domain, reason: 'Custom' }]);
    setNewSite('');
    setShowAddSite(false);
    
    toast({
      title: "Site Added",
      description: `${domain} will be blocked during focus sessions.`,
    });
  };

  const removeSite = (domain: string) => {
    setBlockedSites(prev => prev.filter(site => site.domain !== domain));
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isCurrentSiteBlocked = checkCurrentUrl();

  return (
    <>
      <Card className="p-6 w-full max-w-md">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Focus Mode
            </h3>
            {isActive && (
              <Badge variant="destructive" className="animate-pulse">
                Active
              </Badge>
            )}
          </div>

          {/* Current Status */}
          {isCurrentSiteBlocked && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Current site is blocked
                </span>
              </div>
            </div>
          )}

          {/* Session Controls */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                min="5"
                max="120"
                disabled={isActive}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>

            {!isActive ? (
              <Button onClick={startFocusSession} className="btn-zen w-full">
                <Play className="w-4 h-4 mr-2" />
                Start Focus Session
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-muted-foreground">remaining</div>
                </div>
                <Button onClick={stopFocusSession} variant="outline" className="btn-zen w-full">
                  <Square className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </div>
            )}
          </div>

          {/* Blocked Sites Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Blocked Sites</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddSite(!showAddSite)}
                className="btn-zen h-6"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            {showAddSite && (
              <div className="flex space-x-2">
                <Input
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  placeholder="example.com"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addSite()}
                />
                <Button size="sm" onClick={addSite} className="btn-zen">
                  Add
                </Button>
              </div>
            )}

            <div className="max-h-32 overflow-y-auto space-y-1">
              {blockedSites.map(site => (
                <div key={site.domain} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div>
                    <div className="text-sm font-medium">{site.domain}</div>
                    {site.reason && (
                      <div className="text-xs text-muted-foreground">{site.reason}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSite(site.domain)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Blocked sites will show a blocking overlay during focus sessions
          </p>
        </div>
      </Card>
    </>
  );
}