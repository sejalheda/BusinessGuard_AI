import React from 'react';
import {
  Home,
  Mic,
  MessageSquare,
  AlertTriangle,
  ClipboardCheck,
  FolderArchive,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Scan,
  Wrench,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { currentTab, setCurrentTab, isEmergencyActive } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'alexa', label: 'Alexa Simulator', icon: Mic, badge: 'Voice Handoff' },
    { id: 'payment', label: 'Payment Checker', icon: Scan, badge: 'Scanner' },
    { id: 'advisor', label: 'AI Advisor', icon: MessageSquare },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle, isEmergency: true },
    { id: 'audit', label: 'Health Audit', icon: ClipboardCheck },
    { id: 'score', label: 'Protection Score', icon: ShieldCheck },
    { id: 'cases', label: 'Cases Ledger', icon: FolderArchive },
    { id: 'mcp', label: 'MCP Tools', icon: Wrench },
  ];

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-navy-950 border-r border-slate-200/80 dark:border-white/10 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-colors ${
                  isEmergencyActive
                    ? 'bg-red-600 shadow-red-600/30'
                    : 'bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 shadow-blue-500/20'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
                  BusinessGuard
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400 tracking-wider">
                  AI Responder
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? item.isEmergency
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : item.isEmergency
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && !isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Small seller card footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-navy-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-navy-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
              P
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                Priya's Boutique
              </div>
              <div className="text-[10px] text-slate-500 truncate">Saree Haven • Instagram</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
