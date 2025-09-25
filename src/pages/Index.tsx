import { SerenityBrowser } from '@/components/SerenityBrowser';
import { TauriBrowserEngine } from '@/components/TauriBrowserEngine';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, Sparkles } from 'lucide-react';

const Index = () => {
  const [showBrowserEngine, setShowBrowserEngine] = useState(false);

  if (showBrowserEngine) {
    return <TauriBrowserEngine />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <Card className="p-8 max-w-2xl w-full text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <div className="mb-6">
          <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Zen Build Suite
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Choose your browsing experience
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => setShowBrowserEngine(true)}
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          >
            <Globe className="w-5 h-5 mr-2" />
            Chrome/Chromium Engine Demo
          </Button>
          
          <Button 
            onClick={() => setShowBrowserEngine(false)}
            variant="outline"
            className="w-full h-12 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Serenity Browser Experience
          </Button>
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-6">
          The Chrome/Chromium engine demo showcases real browser rendering capabilities with Tauri integration
        </p>
      </Card>
    </div>
  );
};

export default Index;
