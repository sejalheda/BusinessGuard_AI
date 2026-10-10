import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  ClipboardCheck,
  Mic,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FolderArchive,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchCases, fetchLatestAudit } from '../services/api';
import { CaseItem, AuditResult } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';

export const HomePage: React.FC = () => {
  const { setCurrentTab, setActiveCaseId, startDemo } = useApp();
  const [recentCases, setRecentCases] = useState<CaseItem[]>([]);
  const [auditScore, setAuditScore] = useState<AuditResult | null>(null);

  useEffect(() => {
    fetchCases().then((res) => {
      setRecentCases(res.cases.slice(0, 3));
    }).catch(() => {});

    fetchLatestAudit().then((res) => {
      setAuditScore(res);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-blue-950 text-white p-8 sm:p-12 border border-blue-500/20 shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Your business's first responder</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Hacked, scammed or threatened?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-200">
              Get a calm, step-by-step rescue plan by voice or on screen.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
            Small sellers on Instagram and WhatsApp get hacked and targeted with fake payments every day, and they have no one to call. Start a rescue by voice on Alexa, receive an instant Case ID, and seamlessly continue on this web console with your full recovery dossier.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setCurrentTab('alexa')}
              type="button"
              className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold bg-cyan-400 hover:bg-cyan-300 text-navy-950 shadow-lg shadow-cyan-400/25 transition-all transform hover:-translate-y-0.5"
            >
              <Mic className="w-4 h-4" />
              <span>Start Voice Rescue (Alexa)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentTab('audit')}
              type="button"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Run Health Audit</span>
            </button>

            <button
              onClick={startDemo}
              type="button"
              className="flex items-center space-x-1.5 px-4 py-3.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Watch Priya's Walkthrough</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Rescue Scenarios */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Emergency Response Channels
            </h2>
            <p className="text-xs text-slate-500">
              Immediate stabilization workflows tailored for social commerce merchants
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('emergency')}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center"
          >
            Open Emergency Mode <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Instagram Hacked',
              desc: 'Account hijacked, email altered, fake crypto stories posted.',
              severity: 'Critical',
              color: 'border-red-500/30 bg-red-500/5',
              tag: 'Meta Recovery',
              tab: 'alexa',
            },
            {
              title: 'WhatsApp Compromised',
              desc: 'Carrier SIM swapped, customer catalog messaged for ransom.',
              severity: 'Critical',
              color: 'border-red-500/30 bg-red-500/5',
              tag: 'SIM Lock Protocol',
              tab: 'emergency',
            },
            {
              title: 'Fake Payment Fraud',
              desc: 'Manipulated UPI screenshot received, urgent dispatch demanded.',
              severity: 'High',
              color: 'border-amber-500/30 bg-amber-500/5',
              tag: 'Bank Verification',
              tab: 'emergency',
            },
            {
              title: 'Customer Legal Threat',
              desc: 'Defamation or consumer court intimidation over courier delay.',
              severity: 'Medium',
              color: 'border-blue-500/30 bg-blue-500/5',
              tag: 'Factual Mediation',
              tab: 'advisor',
            },
          ].map((sc, i) => (
            <div
              key={i}
              onClick={() => setCurrentTab(sc.tab)}
              className={`cursor-pointer rounded-2xl p-5 border ${sc.color} glass-card hover:scale-[1.02] transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                    {sc.tag}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      sc.severity === 'Critical'
                        ? 'bg-red-500 text-white animate-pulse'
                        : sc.severity === 'High'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {sc.severity}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                  {sc.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {sc.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-cyan-400">
                <span>Start Rescue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid: Protection Score Preview & Recent Cases */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protection Score Summary */}
        <div className="lg:col-span-1 rounded-2xl p-6 glass-card border border-slate-200 dark:border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Protection Score
                </h3>
                <span className="text-[11px] text-slate-500">Live Resilience Health</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {auditScore?.maturity_level || 'Building'}
              </span>
            </div>

            <ScoreGauge
              score={auditScore?.overall_score || 68}
              label="Overall Resilience"
              subtitle="Calculated across 4 defense pillars"
              size={150}
            />

            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900">
                <span className="text-slate-400 text-[10px] block">Security</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {auditScore?.category_scores?.security || 60}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900">
                <span className="text-slate-400 text-[10px] block">Operations</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {auditScore?.category_scores?.operations || 75}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('score')}
            className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
          >
            <span>View Full Score Breakdown</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Recent Cases */}
        <div className="lg:col-span-2 rounded-2xl p-6 glass-card border border-slate-200 dark:border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FolderArchive className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Recent Incident Cases
                </h3>
              </div>
              <button
                onClick={() => setCurrentTab('cases')}
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                View all cases
              </button>
            </div>

            <div className="space-y-3">
              {recentCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveCaseId(c.id);
                    setCurrentTab('cases');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-navy-900/60 hover:bg-slate-100 dark:hover:bg-navy-800/80 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-1 overflow-hidden pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-blue-600 dark:text-cyan-400">
                        {c.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          c.severity === 'critical'
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                            : c.severity === 'high'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {c.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        • {c.source === 'alexa' ? 'Alexa Voice' : 'Web App'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {c.title}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>Synchronized with single-file SQLite database</span>
            <span className="font-medium text-emerald-500">✓ Shared Alexa & Web Memory</span>
          </div>
        </div>
      </section>
    </div>
  );
};
