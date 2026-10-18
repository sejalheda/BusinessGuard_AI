import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ClipboardCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ScoreGauge } from '../components/ScoreGauge';
import { fetchLatestAudit } from '../services/api';
import { AuditResult } from '../types';
import { useApp } from '../context/AppContext';

export const ProtectionScorePage: React.FC = () => {
  const { setCurrentTab, scoreBonus } = useApp();
  const [auditData, setAuditData] = useState<AuditResult | null>(null);

  useEffect(() => {
    fetchLatestAudit()
      .then((data) => setAuditData(data))
      .catch(() => {});
  }, []);

  const overall = Math.min(99, (auditData?.overall_score || 68) + scoreBonus);
  const categories = auditData?.category_scores || {
    legal: 65,
    security: 60,
    operations: 75,
    brand: 70,
  };

  const topFixes = auditData?.top_fixes || [
    { title: 'Enable MFA on Meta & Google Admin', impact_points: 18, effort: '15 mins', category: 'Security' },
    { title: 'Enforce settled funds check before dispatch', impact_points: 14, effort: 'Immediate', category: 'Brand' },
    { title: 'Adopt a dedicated Password Manager', impact_points: 12, effort: '30 mins', category: 'Security' },
  ];

  // 6-week trend line chart data (labeled Sample data)
  const trendData = [
    { week: 'Week 1', score: Math.max(30, overall - 18) },
    { week: 'Week 2', score: Math.max(35, overall - 14) },
    { week: 'Week 3', score: Math.max(42, overall - 9) },
    { week: 'Week 4', score: Math.max(48, overall - 5) },
    { week: 'Week 5', score: Math.max(52, overall - 2) },
    { week: 'Current (W6)', score: overall },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Business Protection Score Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Holistic risk defense posture synthesized across your active security policies
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('audit')}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Retake Health Audit</span>
        </button>
      </div>

      {/* Main Score Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Score Dial */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 glass-card border border-blue-500/30 shadow-xl flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 mb-2">
            Overall Resilience Benchmark
          </span>
          <ScoreGauge
            score={overall}
            label="Total Business Protection"
            subtitle={`Maturity Level: ${auditData?.maturity_level || 'Building'}`}
            size={180}
            strokeWidth={14}
          />
          <p className="text-xs text-slate-500 mt-4 max-w-xs leading-relaxed">
            {overall >= 80
              ? 'Your store exhibits resilient defense against account hijacking and social engineering.'
              : overall >= 60
              ? 'Moderate defense. Accounts are shielded, but credential stuffing and payment fraud vectors remain open.'
              : 'High vulnerability detected. Follow the top fixes below to lock down your business.'}
          </p>
        </div>

        {/* Right: 4 Category Pillars Gauges */}
        <div className="lg:col-span-7 rounded-3xl p-6 glass-card border border-slate-200 dark:border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 dark:border-white/10 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Core Defense Pillars
            </h3>
            <span className="text-[11px] text-slate-400">Automated Audit Breakdown</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ScoreGauge score={categories.legal} label="Legal" subtitle="Registration & TM" size={120} />
            <ScoreGauge score={categories.security} label="Security" subtitle="MFA & Passwords" size={120} />
            <ScoreGauge score={categories.operations} label="Operations" subtitle="Invoices & Backups" size={120} />
            <ScoreGauge score={categories.brand} label="Brand" subtitle="Payments & Anti-Scam" size={120} />
          </div>
        </div>
      </div>

      {/* Grid: 6-Week Trend Line Chart & Top 3 Fixes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 6-Week Trend Chart (Sample Data) */}
        <div className="lg:col-span-7 rounded-3xl p-6 glass-card border border-slate-200 dark:border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  6-Week Protection Trend
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
                Sample data
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Track how remediating vulnerabilities increases your store's defense baseline over time.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1B3A',
                      borderColor: '#1D4ED8',
                      borderRadius: '0.75rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs text-slate-500">
            <span>Baseline improvement: +{overall - (trendData[0]?.score || 30)} points</span>
            <span className="font-semibold text-emerald-500">Target Resilience: 85+</span>
          </div>
        </div>

        {/* Top 3 Fixes that Raise Score Most */}
        <div className="lg:col-span-5 rounded-3xl p-6 glass-card border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Top 3 Fixes That Raise Score Most
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            High-leverage remediations ranked by risk reduction impact:
          </p>

          <div className="space-y-3">
            {topFixes.map((fix, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-navy-900/70 border border-slate-200 dark:border-white/5 space-y-2 hover:border-blue-400/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                    Fix #{idx + 1} • {fix.category}
                  </span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    +{fix.impact_points} Points
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {fix.title}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/40 dark:border-white/5">
                  <span>Effort required: {fix.effort}</span>
                  <span className="text-blue-600 dark:text-cyan-400 font-semibold cursor-pointer hover:underline">
                    View guide →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
