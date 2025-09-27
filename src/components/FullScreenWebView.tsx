import React, { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface FullScreenWebViewProps {
  src: string;
  className?: string;
  onLoad?: () => void;
  onNavigation?: (url: string) => void;
  fullScreen?: boolean;
}

export function FullScreenWebView({ 
  src, 
  className, 
  onLoad, 
  onNavigation, 
  fullScreen = true 
}: FullScreenWebViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(src);
  const [windowId, setWindowId] = useState<string | null>(null);

  // Get screen dimensions for optimal sizing
  const getScreenDimensions = () => {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // Use maximum dimensions while leaving some margin for window controls
    return {
      width: Math.max(screenWidth - 50, 1600),
      height: Math.max(screenHeight - 100, 900)
    };
  };

  useEffect(() => {
    const loadWebView = async () => {
      try {
        // Check if we're in a Tauri environment
        if (window.__TAURI__) {
          const { width, height } = getScreenDimensions();
          
          // Create a new webview window for browsing with maximized size
          const webviewId = await invoke('create_webview', {
            url: src,
            title: 'Website Preview - Full Screen',
            width: width,
            height: height,
            resizable: true,
            center: true,
            decorations: false,
            alwaysOnTop: false,
            skipTaskbar: false,
            webSecurity: false,
            fullscreen: fullScreen,
            additionalBrowserArgs: [
              '--enable-webgl',
              '--enable-gpu-acceleration',
              '--enable-hardware-acceleration',
              '--enable-gpu-rasterization',
              '--enable-smooth-scrolling',
              '--enable-directwrite',
              '--disable-dev-tools',
              '--disable-extensions',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding',
              '--enable-threaded-compositing',
              '--enable-accelerated-2d-canvas',
              '--enable-accelerated-video-decode',
              '--disable-software-rasterizer',
              '--enable-webview2-features',
              '--enable-zero-copy',
              '--enable-native-gpu-memory-buffers',
              '--enable-oop-rasterization',
              '--enable-checker-imaging',
              '--disable-back-forward-cache',
              '--disable-ipc-flooding-protection',
              '--enable-webgl2-compute-context',
              '--enable-gpu-service',
              '--disable-background-mode',
              '--disable-gpu-sandbox',
              '--enable-hardware-overlays'
            ]
          });
          
          setWindowId(webviewId as string);
          (containerRef.current as any).webviewId = webviewId;
          
          setIsLoading(false);
          onLoad?.();
        } else {
          // Fallback for development mode
          setIsLoading(false);
          onLoad?.();
        }
      } catch (error) {
        console.error('Failed to create fullscreen webview:', error);
        setIsLoading(false);
      }
    };

    loadWebView();
  }, [src, onLoad, fullScreen]);

  const navigateTo = async (url: string) => {
    try {
      if (window.__TAURI__ && windowId) {
        await invoke('navigate_webview', { webviewId: windowId, url });
        setCurrentUrl(url);
        onNavigation?.(url);
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
    }
  };

  const goBack = async () => {
    try {
      if (window.__TAURI__ && windowId) {
        await invoke('webview_go_back', { webviewId: windowId });
      }
    } catch (error) {
      console.error('Failed to go back:', error);
    }
  };

  const goForward = async () => {
    try {
      if (window.__TAURI__ && windowId) {
        await invoke('webview_go_forward', { webviewId: windowId });
      }
    } catch (error) {
      console.error('Failed to go forward:', error);
    }
  };

  const refresh = async () => {
    try {
      if (window.__TAURI__ && windowId) {
        await invoke('webview_reload', { webviewId: windowId });
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  };

  // Store methods on container ref for access
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
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading full-screen preview...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Opening in a larger window for better viewing experience
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
          {window.__TAURI__ ? (
            // Tauri webview placeholder - the actual webview is created as a separate window
            <div className="flex items-center justify-center h-full bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <div className="text-center p-8 max-w-md">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Full-Screen Preview Window</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  The website has been opened in a separate full-screen window using the Edge WebView2 engine.
                </p>
                <p className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-1.5">
                  <strong>URL:</strong> {currentUrl}
                </p>
                {fullScreen && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Full-screen mode activated for optimal viewing
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Development fallback - iframe with enhanced sizing
            <div className="w-full h-full min-h-[600px]">
              <iframe
                src={src}
                className="w-full h-full border-0 rounded-lg"
                title="Full Screen Website Preview"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
                onLoad={() => {
                  setIsLoading(false);
                  onLoad?.();
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
