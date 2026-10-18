import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Award,
  Zap,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecoveryPlan } from '../types';

interface RecoveryTimelineProps {
  plan: RecoveryPlan;
  completedSteps: string[];
  onToggleStep: (stepText: string) => void;
  onResolveCase?: () => void;
  isResolved?: boolean;
}

export const RecoveryTimeline: React.FC<RecoveryTimelineProps> = ({
  plan,
  completedSteps = [],
  onToggleStep,
  onResolveCase,
  isResolved = false,
}) => {
  const [floatingScore, setFloatingScore] = useState<{ id: number; text: string } | null>(null);

  // Group steps into 3 phases
  const firstHourSteps = plan.first_hour?.length
    ? plan.first_hour
    : plan.immediate_actions || [];

  const first24hSteps = plan.first_24h?.length
    ? plan.first_24h
    : plan.plan_24h || [];

  const firstWeekSteps = plan.first_week?.length
    ? plan.first_week
    : plan.evidence_checklist || [];

  const totalSteps = firstHourSteps.length + first24hSteps.length + firstWeekSteps.length;
  const completedCount = completedSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isAllComplete = totalSteps > 0 && completedCount >= totalSteps;

  const handleTick = (stepText: string) => {
    const isCurrentlyDone = completedSteps.includes(stepText);
    onToggleStep(stepText);

    if (!isCurrentlyDone) {
      // Trigger floating +2 animation
      const animId = Date.now();
      setFloatingScore({ id: animId, text: '+2 Protection Score' });
      setTimeout(() => {
        setFloatingScore(null);
      }, 1500);
    }
  };

  const renderPhaseBlock = (title: string, subtitle: string, icon: any, steps: string[], phaseColor: string) => {
    const Icon = icon;
    return (
      <div className={`p-4 rounded-2xl border ${phaseColor} glass-card space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4" />
            <h4 className="font-extrabold text-xs uppercase tracking-wider">{title}</h4>
          </div>
          <span className="text-[10px] text-slate-400">{subtitle}</span>
        </div>

        <div className="space-y-2">
          {steps.map((step, idx) => {
            const isChecked = completedSteps.includes(step);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTick(step)}
                className={`w-full text-left p-3 rounded-xl border text-xs flex items-start space-x-3 transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through'
                    : 'bg-white/70 dark:bg-navy-950/70 border-slate-200/80 dark:border-white/5 text-slate-800 dark:text-slate-200 hover:border-blue-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-white/30'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="leading-relaxed flex-1">{step}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating +2 Score Booster Notification */}
      <AnimatePresence>
        {floatingScore && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -20, scale: 1.1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
            className="absolute top-2 right-4 z-20 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/30 flex items-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            <span>{floatingScore.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Dial & Overview */}
      <div className="p-4 rounded-2xl glass-card border border-blue-500/30 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              3-Phase Recovery Milestones
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300">
              {completedCount} / {totalSteps} Ticked
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tick completed steps to update the timeline, boost your Protection Score (+2), and persist recovery progress.
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="currentColor"
              strokeWidth="4"
              className="text-slate-200 dark:text-navy-800"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r="22"
              stroke="#10B981"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 22}
              strokeDashoffset={2 * Math.PI * 22 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute text-[11px] font-extrabold text-slate-900 dark:text-white">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* All Complete Celebration Banner */}
      {isAllComplete && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/20 text-white">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider">
                All Recovery Milestones Achieved!
              </h4>
              <p className="text-xs text-emerald-100">
                Your business has completed all 3 phases of incident containment.
              </p>
            </div>
          </div>

          {!isResolved && onResolveCase && (
            <button
              onClick={onResolveCase}
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold shadow transition-all"
            >
              Mark Case Resolved ✓
            </button>
          )}
        </div>
      )}

      {/* 3 Phase Checklist Blocks */}
      <div className="space-y-4">
        {renderPhaseBlock(
          "Phase 1: First Hour (0 - 60 Minutes)",
          "Immediate Containment",
          Clock,
          firstHourSteps,
          "border-red-500/30 text-red-600 dark:text-red-400"
        )}

        {renderPhaseBlock(
          "Phase 2: First 24 Hours",
          "Account & Financial Security",
          Clock,
          first24hSteps,
          "border-amber-500/30 text-amber-600 dark:text-amber-400"
        )}

        {renderPhaseBlock(
          "Phase 3: First Week",
          "Evidence & Long-Term Hardening",
          Calendar,
          firstWeekSteps,
          "border-blue-500/30 text-blue-600 dark:text-cyan-400"
        )}
      </div>
    </div>
  );
};
