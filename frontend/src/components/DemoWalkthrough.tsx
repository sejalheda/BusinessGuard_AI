import React from 'react';
import {
  Sparkles,
  ArrowRight,
  X,
  Mic,
  ShieldAlert,
  ClipboardCheck,
  Award,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DemoWalkthrough: React.FC = () => {
  const {
    isDemoActive,
    stopDemo,
    demoStep,
    setDemoStep,
    setCurrentTab,
    setActiveCaseId,
    setEmergencyActive,
  } = useApp();

  if (!isDemoActive) return null;

  const steps = [
    {
      step: 1,
      title: "1. Meet Priya — Saree Haven",
      description:
        "Priya runs 'Saree Haven', a beloved Instagram boutique with 28,000 followers. This morning, she clicked a copyright warning link and lost account access. The hacker is messaging buyers for crypto.",
      icon: Sparkles,
      actionText: "Simulate Alexa Voice Call",
      onAdvance: () => {
        setCurrentTab('alexa');
        setDemoStep(2);
      },
    },
    {
      step: 2,
      title: "2. Alexa First Responder Call",
      description:
        "Priya asks: 'Alexa, ask BusinessGuard, my Instagram was hacked.' Alexa asks 3 rapid follow-up questions, gives immediate steps, speaks Case ID BG-2026-005, and saves it to SQLite.",
      icon: Mic,
      actionText: "Handoff to Web App",
      onAdvance: () => {
        setActiveCaseId('BG-2026-005');
        setCurrentTab('cases');
        setEmergencyActive(true);
        setDemoStep(3);
      },
    },
    {
      step: 3,
      title: "3. Seamless Web App Handoff",
      description:
        "Priya opens BusinessGuard on her laptop. The web app instantly picks up Case BG-2026-005 with a 'Continued from Alexa' banner, the complete voice conversation, and immediate next steps.",
      icon: ShieldAlert,
      actionText: "View Emergency Rescue Plan",
      onAdvance: () => {
        setCurrentTab('emergency');
        setEmergencyActive(true);
        setDemoStep(4);
      },
    },
    {
      step: 4,
      title: "4. Emergency Mode & Recovery Plan",
      description:
        "The app shifts to a dramatic red emergency theme. Priya receives a 24-hour containment plan, Meta identity verification instructions, and an evidence checklist for cyber cell reporting.",
      icon: ShieldAlert,
      actionText: "Take Business Health Audit",
      onAdvance: () => {
        setCurrentTab('audit');
        setEmergencyActive(false);
        setDemoStep(5);
      },
    },
    {
      step: 5,
      title: "5. Guided Health Audit",
      description:
        "Once the emergency is stabilized, Priya takes the 12-question audit. The MCP score engine analyzes her security posture and spots missing 2FA and manual payment verification.",
      icon: ClipboardCheck,
      actionText: "See Final Protection Score",
      onAdvance: () => {
        setCurrentTab('score');
        setDemoStep(6);
      },
    },
    {
      step: 6,
      title: "6. Business Protection Score",
      description:
        "Priya sees her overall Protection Score, gauge breakdowns for Legal, Security, Operations, and Brand, plus the top 3 high-impact fixes to make her store resilient.",
      icon: Award,
      actionText: "Complete Demo",
      onAdvance: () => {
        stopDemo();
      },
    },
  ];

  const current = steps.find((s) => s.step === demoStep) || steps[0];
  const Icon = current.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-navy-900 border-2 border-blue-500/50 dark:border-blue-500/60 shadow-2xl rounded-2xl p-5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              Demo Tour • Step {demoStep} of 6
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              {current.title}
            </h4>
          </div>
        </div>

        <button
          onClick={stopDemo}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title="Exit Demo Mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
        {current.description}
      </p>

      {/* Progress dots */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-1.5">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => {
                setDemoStep(s.step);
                s.onAdvance();
              }}
              className={`h-1.5 rounded-full transition-all ${
                s.step === demoStep
                  ? 'w-6 bg-blue-600 dark:bg-cyan-400'
                  : s.step < demoStep
                  ? 'w-3 bg-emerald-500'
                  : 'w-2 bg-slate-300 dark:bg-navy-800'
              }`}
            />
          ))}
        </div>

        <button
          onClick={current.onAdvance}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all"
        >
          <span>{current.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
