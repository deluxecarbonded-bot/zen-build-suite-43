import React, { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface TauriWebViewProps {
  src: string;
  className?: string;
  onLoad?: () => void;
  onNavigation?: (url: string) => void;
}

export function TauriWebView({ src, className, onLoad, onNavigation }: TauriWebViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(src);

  useEffect(() => {
    const loadWebView = async () => {
      try {
        // Check if we're in a Tauri environment
        if (window.__TAURI__) {
          // Create a new webview window for browsing
          const webviewId = await invoke('create_webview', {
            url: src,
            title: 'Serenity Browser',
            width: 1200,
            height: 800,
            resizable: true,
            center: true,
            decorations: false,
            alwaysOnTop: false,
            skipTaskbar: false,
            webSecurity: false,
            additionalBrowserArgs: [
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor',
              '--enable-webgl',
              '--enable-gpu',
              '--enable-accelerated-2d-canvas',
              '--enable-accelerated-video-decode',
              '--enable-gpu-compositing',
              '--enable-hardware-overlays',
              '--enable-zero-copy',
              '--enable-native-gpu-memory-buffers',
              '--enable-gpu-rasterization',
              '--enable-oop-rasterization',
              '--enable-checker-imaging',
              '--enable-gpu-service-logging',
              '--enable-logging',
              '--v=1',
              '--enable-features=VaapiVideoDecoder',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding',
              '--disable-field-trial-config',
              '--disable-back-forward-cache',
              '--disable-ipc-flooding-protection',
              '--enable-webgl2-compute-context',
              '--enable-gpu-service'
            ]
          });
          
          // Store webview ID for navigation
          (containerRef.current as any).webviewId = webviewId;
          
          setIsLoading(false);
          onLoad?.();
        } else {
          // Fallback for development - use iframe
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.error('Failed to create webview:', error);
        setIsLoading(false);
      }
    };

    loadWebView();
  }, [src, onLoad]);

  const navigateTo = async (url: string) => {
    try {
      if (window.__TAURI__) {
        const webviewId = (containerRef.current as any)?.webviewId;
        if (webviewId) {
          await invoke('navigate_webview', { webviewId, url });
          setCurrentUrl(url);
          onNavigation?.(url);
        }
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
    }
  };

  const goBack = async () => {
    try {
      if (window.__TAURI__) {
        const webviewId = (containerRef.current as any)?.webviewId;
        if (webviewId) {
          await invoke('webview_go_back', { webviewId });
        }
      }
    } catch (error) {
      console.error('Failed to go back:', error);
    }
  };

  const goForward = async () => {
    try {
      if (window.__TAURI__) {
        const webviewId = (containerRef.current as any)?.webviewId;
        if (webviewId) {
          await invoke('webview_go_forward', { webviewId });
        }
      }
    } catch (error) {
      console.error('Failed to go forward:', error);
    }
  };

  const refresh = async () => {
    try {
      if (window.__TAURI__) {
        const webviewId = (containerRef.current as any)?.webviewId;
        if (webviewId) {
          await invoke('webview_reload', { webviewId });
        }
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  };

  // Store navigation methods on container ref for access
  if (containerRef.current) {
    (containerRef.current as any).navigateTo = navigateTo;
    (containerRef.current as any).goBack = goBack;
    (containerRef.current as any).goForward = goForward;
    (containerRef.current as any).refresh = refresh;
    (containerRef.current as any).currentUrl = currentUrl;
  }

  return (
    <div ref={containerRef} className={className}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading browser...</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
          {window.__TAURI__ ? (
            // Tauri webview placeholder - the actual webview is created as a separate window
            <div className="flex items-center justify-center h-full bg-muted/20">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Browser Window Opened</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  The webview has been opened in a separate window with full Chrome/Chromium engine support.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  URL: {currentUrl}
                </p>
              </div>
            </div>
          ) : (
            // Development fallback - iframe
            <iframe
              src={src}
              className="w-full h-full border-0"
              title="Browser Content"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
              onLoad={() => {
                setIsLoading(false);
                onLoad?.();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
