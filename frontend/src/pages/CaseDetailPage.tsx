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
import { CaseItem } from '../types';
import { McpToolsPanel } from '../components/McpToolsPanel';
import { useApp } from '../context/AppContext';

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseId, onBack }) => {
  const { setCurrentTab } = useApp();

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
      </div>

      {/* Main Grid: Conversation Transcript Timeline & Recovery Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Conversation Timeline */}
        <div className="lg:col-span-5 rounded-2xl p-5 glass-card border border-slate-200 dark:border-white/10 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-2">
            <span>Conversation & Intake Log</span>
            <span>{turns.length} Turns</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 text-xs">
            {turns.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No recorded turns for this incident.</p>
            ) : (
              turns.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    t.role === 'user'
                      ? 'bg-blue-50/50 dark:bg-navy-900/60 border-blue-200/50 dark:border-blue-900/30'
                      : 'bg-slate-100/60 dark:bg-navy-950/70 border-slate-200/60 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                      {t.role === 'user' ? 'Merchant (Owner)' : 'BusinessGuard Responder'}
                    </span>
                    <span className="font-mono">{t.source || 'Session'}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{t.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Full Recovery Plan & Evidence Checklist */}
        <div className="lg:col-span-7 space-y-4">
          {plan ? (
            <div className="space-y-4">
              {/* Immediate Actions */}
              <div className="rounded-2xl p-5 glass-card border border-red-500/30 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Immediate Recovery Actions
                </h4>
                <div className="space-y-2">
                  {plan.immediate_actions.map((act, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-red-500/5 dark:bg-red-950/20 text-xs text-slate-800 dark:text-slate-200 border border-red-500/20 font-medium"
                    >
                      {i + 1}. {act}
                    </div>
                  ))}
                </div>
              </div>

              {/* 24-Hour Plan */}
              <div className="rounded-2xl p-5 glass-card border border-amber-500/30 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  24-Hour Containment Milestones
                </h4>
                <div className="space-y-2">
                  {plan.plan_24h.map((p, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 text-xs text-slate-800 dark:text-slate-200 border border-amber-500/20 font-medium"
                    >
                      • {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Checklist */}
              <div className="rounded-2xl p-5 glass-card border border-blue-500/30 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5" />
                  Official Evidence Checklist for Meta Appeals & Cyber Crime
                </h4>
                <div className="space-y-2">
                  {plan.evidence_checklist.map((e, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 text-xs text-slate-800 dark:text-slate-200 border border-blue-500/20 font-medium"
                    >
                      ☑ {e}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
