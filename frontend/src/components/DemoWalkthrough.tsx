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
  Scan,
  Activity,
  QrCode,
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
      title: "1. Meet Priya & Risk Radar",
      description:
        "Priya runs 'Saree Haven' on Instagram (28k followers). On the dashboard, she monitors the Risk Radar widget showing real-time Cyber, Fraud, Legal, and Brand threat levels synthesized from recent cases and audits.",
      icon: Activity,
      actionText: "Simulate Alexa Voice Call",
      onAdvance: () => {
        setCurrentTab('alexa');
        setDemoStep(2);
      },
    },
    {
      step: 2,
      title: "2. Alexa Call & QR Code Handoff",
      description:
        "When hacked, Priya speaks: 'Alexa, ask BusinessGuard, my Instagram was hacked.' Alexa asks 3 rapid questions, generates Case BG-2026-005, and renders a scannable QR Code and 'Copy link' button for phone handoff.",
      icon: QrCode,
      actionText: "Open Case & Reasoning",
      onAdvance: () => {
        setActiveCaseId('BG-2026-005');
        setCurrentTab('cases');
        setEmergencyActive(true);
        setDemoStep(3);
      },
    },
    {
      step: 3,
      title: "3. Visible Reasoning Panel",
      description:
        "Priya resumes Case BG-2026-005 with the 'Continued from Alexa' banner. The collapsible 'Why this verdict' Visible Reasoning Panel lists evidence checks (IP from foreign host, no reset request) with confidence chips and MCP tool attribution.",
      icon: ShieldAlert,
      actionText: "Emergency Recovery Timeline",
      onAdvance: () => {
        setCurrentTab('emergency');
        setEmergencyActive(true);
        setDemoStep(4);
      },
    },
    {
      step: 4,
      title: "4. Recovery Timeline with Live Ticks",
      description:
        "In Emergency Mode, Priya follows the 3-phase milestones (First hour, First 24 hours, First week). Ticking each step animates the circular progress ring, persists in SQLite, and triggers a floating '+2 Protection Score' boost!",
      icon: CheckCircle2,
      actionText: "Test Payment Checker",
      onAdvance: () => {
        setCurrentTab('payment');
        setEmergencyActive(false);
        setDemoStep(5);
      },
    },
    {
      step: 5,
      title: "5. Fake Payment Screenshot Checker",
      description:
        "Priya uploads a suspicious UPI receipt screenshot. The scanner inspects typography and timestamp disparities, lists visual warning signs, provides a bank verification checklist, and enables 1-click case creation.",
      icon: Scan,
      actionText: "View Protection Score",
      onAdvance: () => {
        setCurrentTab('score');
        setDemoStep(6);
      },
    },
    {
      step: 6,
      title: "6. Business Protection Score",
      description:
        "Priya views her overall Protection Score boosted by completed recovery milestones, interactive gauges across all 4 defense pillars, trend history, and high-impact resilience recommendations.",
      icon: Award,
      actionText: "Complete Demo Tour",
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
