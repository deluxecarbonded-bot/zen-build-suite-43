import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, Moon, Sun, Eye, Palette, MousePointer, Filter, Heart, BookOpen, Plus, X, Brain, Zap, Layout, Clock, Shield, Sparkles, Timer, RefreshCw, ArrowLeft, ArrowRight, Home, Globe } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CustomCursor } from '@/components/CustomCursor';
import { BreathingTimer } from '@/components/mindfulness/BreathingTimer';
import { PomodoroTimer } from '@/components/mindfulness/PomodoroTimer';
import { AmbientSounds } from '@/components/mindfulness/AmbientSounds';
import { MindfulReminder } from '@/components/mindfulness/MindfulReminder';
import { SessionJournal } from '@/components/mindfulness/SessionJournal';
import { GratitudePrompt } from '@/components/mindfulness/GratitudePrompt';
import { DistractionBlocker } from '@/components/mindfulness/DistractionBlocker';
import { TextToSpeech } from '@/components/reading/TextToSpeech';
import { WordCount } from '@/components/reading/WordCount';
import { AutoScroll } from '@/components/reading/AutoScroll';
import { TauriWebView } from '@/components/TauriWebView';
interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading?: boolean;
  canGoBack?: boolean;
  canGoForward?: boolean;
}
export function SerenityBrowser() {
  const {
    theme,
    setTheme,
    ambientMode,
    cursorTheme,
    setCursorTheme,
    zenMode,
    toggleZenMode,
    blueFilterEnabled,
    toggleBlueFilter
  } = useTheme();
  const [tabs, setTabs] = useState<Tab[]>([{
    id: '1',
    title: 'New Tab',
    url: 'https://www.google.com',
    isLoading: false,
    canGoBack: false,
    canGoForward: false
  }]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [showSettings, setShowSettings] = useState(false);
  const [addressBarValue, setAddressBarValue] = useState('https://www.google.com');
  const [showBreathingTimer, setShowBreathingTimer] = useState(false);
  const [showMindfulnessPanel, setShowMindfulnessPanel] = useState(false);
  const webviewRef = useRef<any>(null);
  
  // AI-Powered Features Settings
  const [contentMoodFilter, setContentMoodFilter] = useState(false);
  const [autoDeClutter, setAutoDeClutter] = useState(false);
  const [smartTabGrouping, setSmartTabGrouping] = useState(false);
  const [zenRecommendations, setZenRecommendations] = useState(false);
  
  // Tab & Session Management Settings
  const [invisibleTabs, setInvisibleTabs] = useState(false);
  const [autoSuspendTabs, setAutoSuspendTabs] = useState(false);
  const [oneTabMode, setOneTabMode] = useState(false);
  const [tabHibernation, setTabHibernation] = useState(false);
  const [zenTabNaming, setZenTabNaming] = useState(false);
  const [suspendTime, setSuspendTime] = useState(5); // minutes
  const [hibernationTime, setHibernationTime] = useState(24); // hours
  const addNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: 'https://www.google.com',
      isLoading: false,
      canGoBack: false,
      canGoForward: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const navigateToUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url, isLoading: true }
        : tab
    ));
    setAddressBarValue(url);
    
    // Use TauriWebView methods
    if (webviewRef.current) {
      webviewRef.current.navigateTo(url);
    }
  };

  const goBack = () => {
    if (webviewRef.current) {
      webviewRef.current.goBack();
    }
  };

  const goForward = () => {
    if (webviewRef.current) {
      webviewRef.current.goForward();
    }
  };

  const refresh = () => {
    if (webviewRef.current) {
      webviewRef.current.refresh();
    }
  };

  const goHome = () => {
    navigateToUrl('https://www.google.com');
  };

  // Add keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // New tab shortcut (Ctrl/Cmd + T)
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        addNewTab();
      }
      // Focus mode shortcut (Ctrl/Cmd + F)
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        toggleZenMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleZenMode]);
  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };
  const themes = [{
    id: 'light',
    name: 'Light',
    icon: Sun
  }, {
    id: 'dark',
    name: 'Dark',
    icon: Moon
  }, {
    id: 'sepia',
    name: 'Sepia',
    icon: Eye
  }, {
    id: 'auto',
    name: 'Auto',
    icon: Palette
  }];
  const cursorThemes = [{
    id: 'default',
    name: 'Default'
  }, {
    id: 'zen',
    name: 'Zen (Hidden)'
  }, {
    id: 'minimal',
    name: 'Minimal'
  }, {
    id: 'calm',
    name: 'Calm'
  }];
  return <div className="min-h-screen flex flex-col relative bg-background">
      {/* Ambient Background Overlay */}
      <div className={`ambient-overlay ambient-${ambientMode}`} />
      
      {/* Minimal Browser Chrome */}
      <motion.header className="relative z-10" initial={{
      opacity: 1
    }} animate={{
      opacity: zenMode ? 0 : 1
    }} transition={{
      duration: 0.6
    }}>
        {/* Simplified Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
          {/* Left Side - Minimal */}
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="text-sm font-medium text-muted-foreground">Serenity</span>
          </div>

          {/* Right Side - Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleZenMode} className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors" title="Toggle Focus Mode (Ctrl+F)">
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(true)} 
              className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
              title="Serenity Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-6 py-2 border-b border-border/5 bg-muted/20">
          {/* Tabs */}
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center group relative min-w-0 max-w-48 ${
                  activeTabId === tab.id
                    ? 'bg-background border border-border/20 shadow-sm'
                    : 'bg-transparent hover:bg-muted/30'
                } rounded-md transition-colors`}
              >
                <button
                  onClick={() => setActiveTabId(tab.id)}
                  className="flex items-center px-3 py-1.5 min-w-0 flex-1 text-left"
                >
                  <div className="w-3 h-3 rounded-sm bg-muted-foreground/30 mr-2 flex-shrink-0" />
                  <span className="text-xs text-foreground/80 truncate font-medium">
                    {tab.title}
                  </span>
                </button>
                {tabs.length > 1 && (
                  <button
                    onClick={() => closeTab(tab.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted/50 rounded-sm transition-opacity mr-1 flex-shrink-0"
                    title="Close tab"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* New Tab Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={addNewTab}
            className="h-7 w-7 p-0 hover:bg-muted/50 transition-colors ml-2 flex-shrink-0"
            title="New tab (Ctrl+T)"
          >
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* Navigation Bar */}
        <div className="px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              {/* Navigation Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goForward}
                  className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
                  title="Go forward"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goHome}
                  className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors"
                  title="Home"
                >
                  <Home className="w-4 h-4" />
                </Button>
              </div>

              {/* Address Bar */}
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={addressBarValue} 
                  onChange={e => setAddressBarValue(e.target.value)} 
                  placeholder="Search or enter address..." 
                  className="pl-10 pr-16 border-0 bg-muted/30 focus:bg-muted/50 transition-colors rounded-full h-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigateToUrl(addressBarValue);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => navigateToUrl(addressBarValue)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-3 rounded-full text-xs"
                  disabled={!addressBarValue.trim()}
                >
                  Go
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Always Visible Focus Mode Controls */}
      {/* Always visible floating Focus Mode button in zen mode */}
      <motion.div 
        className="fixed top-4 right-6 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: zenMode ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: zenMode ? 'auto' : 'none' }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleZenMode} 
          className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors bg-background/80 backdrop-blur-sm border border-border/20"
          title="Exit Focus Mode (Ctrl+F)"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Clean Settings Panel */}
      <AnimatePresence>
        {showSettings && <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: 10
      }} className="fixed right-6 top-20 z-50" transition={{
        duration: 0.2
      }}>
            <Card className="p-6 w-80 bg-background/95 backdrop-blur-sm border border-border/20 shadow-xl max-h-[80vh] overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thumb-border/30 hover:scrollbar-thumb-border/60 scrollbar-w-2">
              <h3 className="text-base font-medium mb-6">Settings</h3>
              
              {/* Custom Appearance Settings */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium">Custom Appearance</h4>
                
                {/* Theme Selection */}
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground mb-2 block">Color Theme</label>
                  <div className="grid grid-cols-2 gap-1">
                    {themes.map(themeOption => {
                  const Icon = themeOption.icon;
                  return <Button key={themeOption.id} variant={theme === themeOption.id ? "default" : "ghost"} size="sm" onClick={() => setTheme(themeOption.id as any)} className="justify-start h-8 text-xs">
                          <Icon className="w-3 h-3 mr-2" />
                          {themeOption.name}
                        </Button>;
                })}
                  </div>
                </div>

                {/* Cursor Theme Selection */}
                <div className="mb-4">
                  <label className="text-xs text-muted-foreground mb-2 block">Cursor Style</label>
                  <div className="grid grid-cols-2 gap-1">
                    {cursorThemes.map(cursorOption => (
                      <Button 
                        key={cursorOption.id} 
                        variant={cursorTheme === cursorOption.id ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setCursorTheme(cursorOption.id as any)} 
                        className="justify-start h-8 text-xs"
                      >
                        <MousePointer className="w-3 h-3 mr-2" />
                        {cursorOption.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Visual Filters */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Visual Filters</label>
                  <div className="space-y-1">
                    <Button 
                      variant={blueFilterEnabled ? "default" : "ghost"} 
                      size="sm" 
                      onClick={toggleBlueFilter} 
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Filter className="w-3 h-3 mr-2" />
                      Blue Light Filter
                    </Button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium">Features</h4>
                <div className="space-y-1">
                  <Button variant={zenMode ? "default" : "ghost"} size="sm" onClick={toggleZenMode} className="w-full justify-start h-8 text-xs">
                    <Eye className="w-3 h-3 mr-2" />
                    Focus Mode
                  </Button>
                  
                  <Button variant={blueFilterEnabled ? "default" : "ghost"} size="sm" onClick={toggleBlueFilter} className="w-full justify-start h-8 text-xs">
                    <Filter className="w-3 h-3 mr-2" />
                    Blue Light Filter
                  </Button>
                </div>
              </div>

              {/* Reading Tools */}
              <div className="mb-4">
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Reading Tools
                </h4>
                <div className="space-y-2">
                  <div className="p-2 bg-muted/30 rounded-md">
                    <TextToSpeech compact />
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <AutoScroll compact />
                  </div>
                  <div className="bg-muted/30 rounded-md">
                    <WordCount className="border-0 bg-transparent" />
                  </div>
                </div>
              </div>

              {/* Mindfulness Tools */}
              <div className="mb-4">
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium flex items-center">
                  <Heart className="w-3 h-3 mr-1" />
                  Mindfulness Tools
                </h4>
                <div className="space-y-2">
                  <div className="p-2 bg-muted/30 rounded-md">
                    <BreathingTimer isVisible={showBreathingTimer} onClose={() => setShowBreathingTimer(false)} />
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <PomodoroTimer />
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <AmbientSounds />
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <SessionJournal />
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <GratitudePrompt />
                  </div>
                  <div className="p-2 bg-muted/30 rounded-md">
                    <DistractionBlocker />
                  </div>
                </div>
              </div>

              {/* AI-Powered Features */}
              <div className="mb-4">
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium flex items-center">
                  <Brain className="w-3 h-3 mr-1" />
                  AI-Powered Features
                </h4>
                <div className="space-y-1">
                  <Button 
                    variant={contentMoodFilter ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setContentMoodFilter(!contentMoodFilter)} 
                    className="w-full justify-start h-8 text-xs"
                  >
                    <Shield className="w-3 h-3 mr-2" />
                    Content Mood Filter
                  </Button>
                  <Button 
                    variant={autoDeClutter ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setAutoDeClutter(!autoDeClutter)} 
                    className="w-full justify-start h-8 text-xs"
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    Auto Declutter
                  </Button>
                  <Button 
                    variant={smartTabGrouping ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setSmartTabGrouping(!smartTabGrouping)} 
                    className="w-full justify-start h-8 text-xs"
                  >
                    <Layout className="w-3 h-3 mr-2" />
                    Smart Tab Grouping
                  </Button>
                  <Button 
                    variant={zenRecommendations ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setZenRecommendations(!zenRecommendations)} 
                    className="w-full justify-start h-8 text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    Zen Recommendations
                  </Button>
                </div>
              </div>

              {/* Tab & Session Management */}
              <div className="mb-4">
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium flex items-center">
                  <Layout className="w-3 h-3 mr-1" />
                  Tab & Session Management
                </h4>
                <div className="space-y-1">
                  <Button 
                    variant={invisibleTabs ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setInvisibleTabs(!invisibleTabs)} 
                    className="w-full justify-start h-8 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-2" />
                    Invisible Tabs Mode
                  </Button>
                  <Button 
                    variant={oneTabMode ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setOneTabMode(!oneTabMode)} 
                    className="w-full justify-start h-8 text-xs"
                  >
                    <Filter className="w-3 h-3 mr-2" />
                    One-Tab Mode
                  </Button>
                  <div className="space-y-2">
                    <Button 
                      variant={autoSuspendTabs ? "default" : "ghost"} 
                      size="sm" 
                      onClick={() => setAutoSuspendTabs(!autoSuspendTabs)} 
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Timer className="w-3 h-3 mr-2" />
                      Auto-Suspend Tabs ({suspendTime}m)
                    </Button>
                    <Button 
                      variant={tabHibernation ? "default" : "ghost"} 
                      size="sm" 
                      onClick={() => setTabHibernation(!tabHibernation)} 
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Clock className="w-3 h-3 mr-2" />
                      Tab Hibernation ({hibernationTime}h)
                    </Button>
                    <Button 
                      variant={zenTabNaming ? "default" : "ghost"} 
                      size="sm" 
                      onClick={() => setZenTabNaming(!zenTabNaming)} 
                      className="w-full justify-start h-8 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-2" />
                      Zen Tab Naming
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status */}
              
            </Card>
          </motion.div>}
      </AnimatePresence>

      {/* Main Browser Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Webview Container */}
        <div className="flex-1 relative">
          {zenMode ? (
            // Focus mode - show minimal interface
            <div className="flex-1 flex items-center justify-center p-8">
              <motion.div className="text-center max-w-lg" initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} transition={{
                duration: 0.8,
                delay: 0.2
              }}>
                <motion.h1 className="text-5xl font-light mb-4 text-foreground/90 tracking-tight" initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.6,
                  delay: 0.4
                }}>
                  Serenity
                </motion.h1>
                
                <motion.p className="text-muted-foreground mb-8 text-sm leading-relaxed" initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  duration: 0.6,
                  delay: 0.6
                }}>
                  Focus mode active - distractions minimized
                </motion.p>

                <motion.div className="text-xs text-muted-foreground/70 space-y-2" initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  duration: 0.6,
                  delay: 0.8
                }}>
                  <p>
                    <kbd className="px-2 py-0.5 bg-muted/50 rounded text-[10px] font-mono">⌘F</kbd> 
                    <span className="ml-2">Exit Focus Mode</span>
                  </p>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            // Normal browsing mode - show webview
            <div className="w-full h-full">
              <TauriWebView
                src={tabs.find(tab => tab.id === activeTabId)?.url || 'https://www.google.com'}
                className="w-full h-full"
                onLoad={() => {
                  setTabs(tabs.map(tab => 
                    tab.id === activeTabId 
                      ? { ...tab, isLoading: false }
                      : tab
                  ));
                }}
                onNavigation={(url) => {
                  setAddressBarValue(url);
                  setTabs(tabs.map(tab => 
                    tab.id === activeTabId 
                      ? { ...tab, url }
                      : tab
                  ));
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Click overlay to close settings */}
      {showSettings && <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />}
      
      {/* Keep only essential ambient features */}
      <MindfulReminder />
      <CustomCursor />
    </div>;
}