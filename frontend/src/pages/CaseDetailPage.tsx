import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Mic,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Wrench,
  Check,
  Send,
  ExternalLink,
} from 'lucide-react';
import { fetchCase, updateCase } from '../services/api';
import { CaseItem, CaseTurn } from '../types';
import { McpToolsPanel } from '../components/McpToolsPanel';
import { ReasoningPanel } from '../components/ReasoningPanel';
import { RecoveryTimeline } from '../components/RecoveryTimeline';
import { useApp } from '../context/AppContext';

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseId, onBack }) => {
  const { setCurrentTab, addScoreBonus } = useApp();

  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMcpOpen, setIsMcpOpen] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetchCase(caseId)
      .then((data) => setCaseData(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'resolved') => {
    if (!caseData) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateCase(caseData.id, { status: newStatus });
      setCaseData(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleToggleRecoveryStep = async (stepText: string) => {
    if (!caseData) return;
    const currentCompleted = caseData.completed_steps || [];
    let updatedCompleted: string[] = [];

    if (currentCompleted.includes(stepText)) {
      updatedCompleted = currentCompleted.filter((s) => s !== stepText);
    } else {
      updatedCompleted = [...currentCompleted, stepText];
    }

    // Add entry to case turns timeline
    const nowIso = new Date().toISOString();
    const isNowDone = updatedCompleted.includes(stepText);
    if (isNowDone) {
      addScoreBonus(2);
    }
    const updatedTurns: CaseTurn[] = [
      ...caseData.turns,
      {
        role: 'assistant' as const,
        content: `[Recovery Milestone Update] Step "${stepText}" marked as ${isNowDone ? 'COMPLETED ✓ (+2 Protection Score)' : 'PENDING'}.`,
        timestamp: nowIso,
        source: 'timeline_tick',
      },
    ];

    // Optimistic UI update
    setCaseData((prev) =>
      prev
        ? {
            ...prev,
            completed_steps: updatedCompleted,
            turns: updatedTurns,
          }
        : null
    );

    // Persist to SQLite
    try {
      await updateCase(caseData.id, {
        completed_steps: updatedCompleted,
        turns: updatedTurns,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping inline-block mr-2" />
        Loading case dossier...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-500 font-bold text-sm">Case {caseId} could not be found.</div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white"
        >
          Return to Ledger
        </button>
      </div>
    );
  }

  const isFromAlexa = caseData.source === 'alexa';
  const plan = caseData.recovery_plan;
  const turns = caseData.turns || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cases Ledger</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Status Dropdown */}
          <select
            value={caseData.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            disabled={updatingStatus}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 capitalize focus:outline-none"
          >
            <option value="open">Status: Open</option>
            <option value="in_progress">Status: In Progress</option>
            <option value="resolved">Status: Resolved</option>
          </select>

          {/* MCP Inspector Toggle */}
          <button
            onClick={() => setIsMcpOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
            <span>MCP Tool Inspector</span>
          </button>
        </div>
      </div>

      {/* Signature Banner: Continued from Alexa */}
      {isFromAlexa && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent border-2 border-cyan-400/40 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-cyan-900 dark:text-cyan-200">
                  Continued from Alexa Voice Rescue
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                  Alexa+ Handoff Verified
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Created via voice at {new Date(caseData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Unified state seamlessly loaded from SQLite.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('advisor')}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow hover:bg-blue-700 transition-all"
          >
            <span>Ask AI Advisor</span>
          </button>
        </div>
      )}

      {/* Case Header Details */}
      <div className="rounded-2xl p-6 glass-card border border-slate-200 dark:border-white/10 space-y-3">
        <div className="flex items-center space-x-3">
          <span className="font-mono font-bold text-sm text-blue-600 dark:text-cyan-400">
            {caseData.id}
          </span>
          <span
            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
              caseData.severity === 'critical'
                ? 'bg-red-500 text-white animate-pulse'
                : caseData.severity === 'high'
                ? 'bg-amber-500 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {caseData.severity}
          </span>
          <span className="text-xs text-slate-400 capitalize">• Incident Type: {caseData.incident_type.replace('_', ' ')}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {caseData.title}
        </h2>

        {caseData.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {caseData.description}
          </p>
        )}

        {/* Visible Reasoning Panel ("Why this verdict") */}
        {caseData.reasoning && caseData.reasoning.length > 0 && (
          <ReasoningPanel reasoning={caseData.reasoning} defaultExpanded={true} />
        )}
      </div>

      {/* Main Grid: Conversation Transcript & Recovery Timeline with Ticks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Conversation Timeline */}
        <div className="lg:col-span-5 rounded-2xl p-5 glass-card border border-slate-200 dark:border-white/10 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-2">
            <span>Conversation & Timeline History</span>
            <span>{turns.length} Entries</span>
          </h3>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 text-xs">
            {turns.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No recorded turns for this incident.</p>
            ) : (
              turns.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    t.source === 'timeline_tick'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-bold'
                      : t.role === 'user'
                      ? 'bg-blue-50/50 dark:bg-navy-900/60 border-blue-200/50 dark:border-blue-900/30'
                      : 'bg-slate-100/60 dark:bg-navy-950/70 border-slate-200/60 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                      {t.source === 'timeline_tick'
                        ? 'Milestone Auto-Log'
                        : t.role === 'user'
                        ? 'Merchant (Owner)'
                        : 'BusinessGuard Responder'}
                    </span>
                    <span className="font-mono">{t.source || 'Session'}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{t.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recovery Timeline with Ticks */}
        <div className="lg:col-span-7 space-y-4">
          {plan ? (
            <RecoveryTimeline
              plan={plan}
              completedSteps={caseData.completed_steps || []}
              onToggleStep={handleToggleRecoveryStep}
              onResolveCase={() => handleStatusChange('resolved')}
              isResolved={caseData.status === 'resolved'}
            />
          ) : (
            <div className="p-8 rounded-2xl glass-card text-center text-slate-400 text-xs">
              No recovery plan generated yet for this incident.
            </div>
          )}
        </div>
      </div>

      {/* Side Panel for Raw MCP Tool Calls */}
      <McpToolsPanel
        isOpen={isMcpOpen}
        onClose={() => setIsMcpOpen(false)}
        toolCalls={caseData.metadata?.tool_calls || []}
      />
    </div>
  );
};
