import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, ShieldCheck, Wrench, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReasoningCheck } from '../types';

interface ReasoningPanelProps {
  reasoning: ReasoningCheck[];
  title?: string;
  defaultExpanded?: boolean;
}

export const ReasoningPanel: React.FC<ReasoningPanelProps> = ({
  reasoning,
  title = "Why this verdict (Agent Reasoning)",
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  if (!reasoning || reasoning.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-blue-500/30 dark:border-blue-500/40 bg-blue-50/40 dark:bg-navy-900/60 overflow-hidden shadow-md transition-all">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
        className="w-full px-4 py-3 flex items-center justify-between bg-blue-500/10 hover:bg-blue-500/15 transition-colors cursor-pointer text-left focus:outline-none"
      >
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            {title}
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300">
            {reasoning.length} Checks Ran
          </span>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Animated Collapsible List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 space-y-3 border-t border-blue-500/20"
          >
            {reasoning.map((item, idx) => {
              const isHigh = item.confidence?.toLowerCase() === 'high';
              const isMed = item.confidence?.toLowerCase() === 'medium';

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.12, duration: 0.3 }}
                  className="p-3 rounded-xl bg-white/80 dark:bg-navy-950/80 border border-slate-200/80 dark:border-white/5 space-y-1.5 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mr-1.5 flex-shrink-0" />
                      {item.check}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {/* Confidence Chip */}
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          isHigh
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                            : isMed
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Confidence: {item.confidence}
                      </span>

                      {/* Tool Chip */}
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 flex items-center">
                        <Wrench className="w-2.5 h-2.5 mr-1" />
                        {item.tool}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pl-5 font-normal">
                    {item.evidence}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
