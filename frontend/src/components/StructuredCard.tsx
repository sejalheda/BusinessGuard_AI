import React from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, Lightbulb, ArrowRight } from 'lucide-react';
import { StructuredCard as StructuredCardType } from '../types';
import { ReasoningPanel } from './ReasoningPanel';

interface StructuredCardProps {
  card: StructuredCardType;
  onOpenRecoveryPlan?: () => void;
}

export const StructuredCard: React.FC<StructuredCardProps> = ({ card, onOpenRecoveryPlan }) => {
  const isCritical = card.risk_level.toLowerCase().includes('critical');
  const isHigh = card.risk_level.toLowerCase().includes('high');

  return (
    <div
      className={`mt-4 rounded-2xl border p-5 shadow-lg transition-all ${
        isCritical
          ? 'bg-red-500/5 border-red-500/30 dark:bg-red-950/20 dark:border-red-500/40'
          : isHigh
          ? 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-500/40'
          : 'bg-blue-500/5 border-blue-500/30 dark:bg-blue-950/20 dark:border-blue-500/40'
      }`}
    >
      {/* Header & Risk Level Badge */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white uppercase">
            Rescue Assessment
          </h4>
        </div>

        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
            isCritical
              ? 'bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse'
              : isHigh
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'bg-emerald-500 text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
          {card.risk_level}
        </span>
      </div>

      {/* Situation Analysis */}
      {card.situation_analysis && (
        <div className="mb-4">
          <h5 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
            Situation Analysis
          </h5>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {card.situation_analysis}
          </p>
        </div>
      )}

      {/* Recommended Actions */}
      {card.recommended_actions && card.recommended_actions.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
            Recommended Immediate Actions
          </h5>
          <div className="space-y-2">
            {card.recommended_actions.map((act, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-navy-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{act}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prevention Tips */}
      {card.prevention_tips && card.prevention_tips.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center">
            <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Prevention & Hardening
          </h5>
          <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
            {card.prevention_tips.map((tip, idx) => (
              <li key={idx} className="leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reasoning Panel */}
      {card.reasoning && card.reasoning.length > 0 && (
        <ReasoningPanel reasoning={card.reasoning} defaultExpanded={false} />
      )}

      {onOpenRecoveryPlan && (
        <button
          onClick={onOpenRecoveryPlan}
          className="mt-4 w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors"
        >
          <span>View Full 24-Hour Recovery Dossier</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
