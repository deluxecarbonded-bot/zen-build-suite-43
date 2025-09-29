import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Globe, Settings } from 'lucide-react';
import { TauriWebView } from './TauriWebView';
import { WebBrowserEngine } from './WebBrowserEngine';
import { FullScreenWebView } from './FullScreenWebView';

interface UniversalBrowserProps {
  url: string;
  className?: string;
  onLoad?: () => void;
  onNavigation?: (url: string) => void;
}

type BrowserMode = 'web' | 'desktop' | 'fullscreen';

export const UniversalBrowser = React.forwardRef<any, UniversalBrowserProps>(({ url, className, onLoad, onNavigation }, ref) => {
  const [browserMode, setBrowserMode] = useState<BrowserMode>(() => {
    // Default to web mode for compatibility, desktop if Tauri is available
    return window.__TAURI__ ? 'desktop' : 'web';
  });
  
  const webviewRef = useRef<any>(null);

  const handleModeSwitch = (mode: BrowserMode) => {
    setBrowserMode(mode);
  };

  // Expose navigation methods for parent component
  React.useImperativeHandle(ref, () => ({
    navigateTo: (newUrl: string) => {
      if (browserMode === 'desktop' && webviewRef.current) {
        return webviewRef.current.navigateTo(newUrl);
      }
      // For web mode, navigation is handled by re-rendering with new URL
    },
    goBack: () => {
      if (browserMode === 'desktop' && webviewRef.current) {
        return webviewRef.current.goBack();
      }
    },
    goForward: () => {
      if (browserMode === 'desktop' && webviewRef.current) {
        return webviewRef.current.goForward();
      }
    },
    refresh: () => {
      if (browserMode === 'desktop' && webviewRef.current) {
        return webviewRef.current.refresh();
      }
    }
  }));

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Browser Mode Selector */}
      <div className="flex items-center justify-between p-2 bg-muted/10 border-b border-border/10">
        <div className="flex items-center gap-1">
          <Button
            variant={browserMode === 'web' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeSwitch('web')}
            className="h-8 px-3 text-xs"
          >
            <Globe className="w-3 h-3 mr-1" />
            Web Engine
          </Button>
          
          {window.__TAURI__ && (
            <Button
              variant={browserMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleModeSwitch('desktop')}
              className="h-8 px-3 text-xs"
            >
              <Monitor className="w-3 h-3 mr-1" />
              Desktop
            </Button>
          )}
          
          <Button
            variant={browserMode === 'fullscreen' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeSwitch('fullscreen')}
            className="h-8 px-3 text-xs"
          >
            <Settings className="w-3 h-3 mr-1" />
            Fullscreen
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          {browserMode === 'web' && 'Cloud-based rendering with Browserless API'}
          {browserMode === 'desktop' && 'Native Edge WebView2 engine'}
          {browserMode === 'fullscreen' && 'Fullscreen web preview'}
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative">
        {browserMode === 'web' && (
          <WebBrowserEngine
            url={url}
            className="h-full"
            onLoad={onLoad}
            onNavigation={onNavigation}
          />
        )}
        
        {browserMode === 'desktop' && window.__TAURI__ && (
          <TauriWebView
            src={url}
            className="h-full"
            onLoad={onLoad}
            onNavigation={onNavigation}
          />
        )}
        
        {browserMode === 'fullscreen' && (
          <FullScreenWebView
            src={url}
            className="h-full"
            onLoad={onLoad}
            onNavigation={onNavigation}
          />
        )}

        {/* Fallback if desktop mode selected but Tauri not available */}
        {browserMode === 'desktop' && !window.__TAURI__ && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <Monitor className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Desktop Mode Unavailable</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Desktop mode requires the Tauri application. Please use the desktop app or switch to Web Engine mode.
              </p>
              <Button onClick={() => handleModeSwitch('web')} size="sm">
                Switch to Web Engine
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});