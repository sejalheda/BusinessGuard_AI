import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { triggerEmergency } from '../services/api';
import { useApp } from '../context/AppContext';

export const EmergencyPage: React.FC = () => {
  const { setActiveCaseId, setCurrentTab, setEmergencyActive } = useApp();

  const [selectedType, setSelectedType] = useState<string>('instagram_hacked');
  const [loading, setLoading] = useState<boolean>(false);
  const [emergencyResult, setEmergencyResult] = useState<{
    case_id: string;
    severity: string;
    emergency_type: string;
    immediate_actions: string[];
    plan_24h: string[];
    evidence_checklist: string[];
    prevention_tips: string[];
  } | null>(null);

  const emergencyTypes = [
    {
      id: 'instagram_hacked',
      name: 'Instagram Hacked',
      severity: 'Critical',
      desc: 'Password/email changed, fake stories posted, 2FA blocked',
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'whatsapp_compromised',
      name: 'WhatsApp Compromised',
      severity: 'Critical',
      desc: 'SIM swap, lost cellular signal, scammers messaging buyers',
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'fake_payment_fraud',
      name: 'Fake Payment Fraud',
      severity: 'High',
      desc: 'Manipulated UPI screenshot, dispatch pressure, zero bank credit',
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'legal_threat',
      name: 'Customer Legal Threat',
      severity: 'Medium',
      desc: 'Consumer court threat, public defamation, shipment transit delay',
      badgeColor: 'bg-blue-600 text-white',
    },
  ];

  const handleTrigger = async (typeId: string) => {
    setSelectedType(typeId);
    setLoading(true);
    try {
      const res = await triggerEmergency({
        emergency_type: typeId,
        details: `Emergency rescue triggered from console for ${typeId}`,
      });
      setEmergencyResult(res);
      setActiveCaseId(res.case_id);
      setEmergencyActive(res.severity.toLowerCase() === 'critical');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Red Alert Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-red-600 via-rose-600 to-red-800 text-white shadow-2xl emergency-pulse relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold uppercase tracking-widest">
            <Flame className="w-4 h-4 animate-bounce" />
            <span>Emergency Protocol Activated</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Business First Responder Dispatch
          </h1>

          <p className="text-red-100 text-xs sm:text-sm leading-relaxed">
            Select your crisis category below. BusinessGuard will instantly isolate damage vectors, generate an immediate containment checklist, and register a priority incident case.
          </p>
        </div>
      </div>

      {/* 4 Crisis Type Trigger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {emergencyTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => handleTrigger(type.id)}
            className={`p-5 rounded-2xl border text-left transition-all glass-card flex flex-col justify-between ${
              selectedType === type.id
                ? 'border-red-500 shadow-lg shadow-red-500/20 bg-red-500/5 dark:bg-red-950/20 scale-[1.02]'
                : 'hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${type.badgeColor}`}>
                  {type.severity}
                </span>
                <AlertOctagon className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {type.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                {type.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
              <span>{loading && selectedType === type.id ? 'Generating...' : 'Deploy Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>

      {/* Emergency Output Sections */}
      {emergencyResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
          {/* Case Status Strip */}
          <div className="rounded-2xl p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-red-600 text-white font-bold text-xs">
                {emergencyResult.severity.toUpperCase()}
              </span>
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Active Emergency Case: {emergencyResult.case_id}
                </span>
                <span className="text-xs text-slate-500 block">
                  Logged in SQLite • Dramatic emergency accent active across dashboard
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveCaseId(emergencyResult.case_id);
                setCurrentTab('cases');
              }}
              className="flex items-center justify-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-navy-950 hover:opacity-90 transition-opacity"
            >
              <span>View Case Ledger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Emergency Output Quadrants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Immediate Actions */}
            <div className="rounded-2xl p-6 glass-card border border-red-500/30 dark:border-red-500/40 space-y-4">
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <Flame className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  Immediate Actions (0 - 60 Minutes)
                </h3>
              </div>

              <div className="space-y-2.5">
                {emergencyResult.immediate_actions.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 text-xs text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 24-Hour Plan */}
            <div className="rounded-2xl p-6 glass-card border border-amber-500/30 dark:border-amber-500/40 space-y-4">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <Clock className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  24-Hour Containment & Recovery Plan
                </h3>
              </div>

              <div className="space-y-2.5">
                {emergencyResult.plan_24h.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-xs text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Evidence Checklist */}
            <div className="rounded-2xl p-6 glass-card border border-blue-500/30 dark:border-blue-500/40 space-y-4">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  Evidence Checklist for Meta & Cyber Crime
                </h3>
              </div>

              <div className="space-y-2.5">
                {emergencyResult.evidence_checklist.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 text-xs text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Future Prevention */}
            <div className="rounded-2xl p-6 glass-card border border-emerald-500/30 dark:border-emerald-500/40 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <Lock className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">
                  Future Hardening & Prevention
                </h3>
              </div>

              <div className="space-y-2.5">
                {emergencyResult.prevention_tips.map((prev, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{prev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
