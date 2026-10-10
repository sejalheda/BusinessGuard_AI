import React, { useState } from 'react';
import { Search, Sun, Moon, AlertOctagon, Sparkles, Shield, Wrench, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopbarProps {
  onOpenMcpPanel?: () => void;
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMcpPanel, onToggleSidebar }) => {
  const {
    theme,
    toggleTheme,
    activeCaseId,
    setActiveCaseId,
    isEmergencyActive,
    startDemo,
    usingDemoBadge,
    setCurrentTab,
  } = useApp();

  const [inputCaseId, setInputCaseId] = useState('');

  const handleCaseSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCaseId.trim()) {
      const formatted = inputCaseId.trim().toUpperCase();
      setActiveCaseId(formatted);
      setCurrentTab('cases');
      setInputCaseId('');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Persistent Badges */}
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Small persistent badges */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Prototype
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/80">
            Alexa+ Simulator
          </span>
          {usingDemoBadge && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10">
              Using demo responses
            </span>
          )}
        </div>
      </div>

      {/* Center: "Enter Case ID" lookup */}
      <form onSubmit={handleCaseSearch} className="hidden md:flex items-center relative max-w-xs w-full mx-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={inputCaseId}
          onChange={(e) => setInputCaseId(e.target.value)}
          placeholder="Enter Case ID (e.g. BG-2026-001)"
          className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-navy-900/90 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
        />
      </form>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Demo Mode Button */}
        <button
          onClick={startDemo}
          type="button"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Priya's</span>
          <span>Demo Walkthrough</span>
        </button>

        {/* MCP Tools Inspector Button */}
        {onOpenMcpPanel && (
          <button
            onClick={onOpenMcpPanel}
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title="Open MCP Tool Inspector"
          >
            <Wrench className="w-4 h-4" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Red "Business Emergency" button */}
        <button
          onClick={() => setCurrentTab('emergency')}
          type="button"
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition-all ${
            isEmergencyActive
              ? 'bg-red-600 hover:bg-red-700 shadow-red-600/40 emergency-pulse'
              : 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
          }`}
        >
          <AlertOctagon className="w-4 h-4 animate-pulse" />
          <span>Emergency</span>
        </button>
      </div>
    </header>
  );
};
