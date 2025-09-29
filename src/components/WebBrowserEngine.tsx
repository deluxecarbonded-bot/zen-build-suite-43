import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Image, FileText, Code, Search } from 'lucide-react';
import { toast } from 'sonner';

interface WebBrowserEngineProps {
  url: string;
  className?: string;
  onLoad?: () => void;
  onNavigation?: (url: string) => void;
}

export function WebBrowserEngine({ url, className, onLoad, onNavigation }: WebBrowserEngineProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderType, setRenderType] = useState<'screenshot' | 'content'>('screenshot');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const renderPage = async (type: 'screenshot' | 'content' | 'scrape' = 'screenshot') => {
    if (!url) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('browserless-render', {
        body: {
          url: url,
          type: type,
          options: {
            screenshot: {
              fullPage: true,
              type: 'jpeg',
              quality: 85
            },
            waitFor: 2000
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (type === 'screenshot') {
        // Convert binary data to blob URL for display
        const blob = new Blob([data], { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        setScreenshot(imageUrl);
        setRenderType('screenshot');
      } else {
        setContent(data);
        setRenderType('content');
      }

      onLoad?.();
      toast.success('Page rendered successfully');
    } catch (err: any) {
      console.error('Failed to render page:', err);
      setError(err.message || 'Failed to render page');
      toast.error('Failed to render page: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const scrapeContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('browserless-render', {
        body: {
          url: url,
          type: 'scrape',
          options: {
            elements: [
              { selector: 'title' },
              { selector: 'h1, h2, h3' },
              { selector: 'p' },
              { selector: 'a' }
            ]
          }
        }
      });

      if (error) throw new Error(error.message);
      
      setContent(data);
      setRenderType('content');
      toast.success('Content scraped successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to scrape content: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-render on URL change
  useEffect(() => {
    if (url) {
      renderPage('screenshot');
    }
  }, [url]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (screenshot) {
        URL.revokeObjectURL(screenshot);
      }
    };
  }, [screenshot]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Web Browser Controls */}
      <div className="flex items-center gap-2 p-3 bg-muted/20 border-b border-border/10">
        <div className="flex items-center gap-1">
          <Button
            variant={renderType === 'screenshot' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => renderPage('screenshot')}
            disabled={isLoading}
            className="h-8 px-3"
          >
            <Image className="w-4 h-4 mr-1" />
            Screenshot
          </Button>
          
          <Button
            variant={renderType === 'content' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => renderPage('content')}
            disabled={isLoading}
            className="h-8 px-3"
          >
            <Code className="w-4 h-4 mr-1" />
            HTML
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={scrapeContent}
            disabled={isLoading}
            className="h-8 px-3"
          >
            <Search className="w-4 h-4 mr-1" />
            Scrape
          </Button>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => renderPage(renderType)}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="h-8 w-8 p-0"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-background">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">Rendering page...</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Rendering Failed</h3>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <Button onClick={() => renderPage('screenshot')} size="sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : renderType === 'screenshot' && screenshot ? (
          <div className="h-full overflow-auto">
            <img
              src={screenshot}
              alt="Page screenshot"
              className="w-full h-auto max-w-none"
              style={{ minHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        ) : renderType === 'content' && content ? (
          <div className="h-full overflow-auto p-4">
            <div className="max-w-4xl mx-auto">
              {content.data && content.data.length > 0 ? (
                <div className="space-y-4">
                  {content.data.map((item: any, index: number) => (
                    <div key={index} className="border border-border/20 rounded-lg p-4 bg-muted/10">
                      <div className="text-sm text-muted-foreground mb-2">
                        Selector: <code className="bg-muted px-1 rounded">{item.selector}</code>
                      </div>
                      <div className="text-sm">
                        {item.results?.map((result: any, resultIndex: number) => (
                          <div key={resultIndex} className="mb-2 last:mb-0">
                            {typeof result === 'string' 
                              ? result 
                              : result.text || result.href || result.html || JSON.stringify(result, null, 2)
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(content, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Web Browser Engine</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Powered by Browserless API with Microsoft Edge WebView2 engine
              </p>
              <p className="text-xs text-muted-foreground/70 mb-4">
                This renders web pages using cloud-based browsers without requiring desktop installation
              </p>
              <Button onClick={() => renderPage('screenshot')} size="sm">
                Render Page
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}