import React, { useEffect, useState } from 'react';
import {
  FolderArchive,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Mic,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { fetchCases } from '../services/api';
import { CaseItem } from '../types';
import { useApp } from '../context/AppContext';
import { CaseDetailPage } from './CaseDetailPage';

export const CasesPage: React.FC = () => {
  const { activeCaseId, setActiveCaseId } = useApp();

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const loadData = () => {
    setLoading(true);
    fetchCases({
      search: searchTerm || undefined,
      status: statusFilter,
      severity: severityFilter,
      source: sourceFilter,
    })
      .then((res) => {
        setCases(res.cases);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, severityFilter, sourceFilter]);

  // If a specific case is selected, render CaseDetailPage
  if (activeCaseId) {
    return <CaseDetailPage caseId={activeCaseId} onBack={() => setActiveCaseId(null)} />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Incident Cases Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {cases.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Persisted crisis log sharing unified state between voice Alexa sessions and web consoles
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Case ID, title, or keywords..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          {/* Source */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="alexa">Alexa Voice</option>
            <option value="web">Web App</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-2xl glass-card border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-navy-900/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Created Time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No cases match the selected filters.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setActiveCaseId(c.id)}
                    className="hover:bg-slate-50 dark:hover:bg-navy-900/60 cursor-pointer transition-colors"
                  >
                    {/* Case ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-cyan-400">
                      {c.id}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {c.title}
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.severity === 'critical'
                            ? 'bg-red-500 text-white animate-pulse'
                            : c.severity === 'high'
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {c.severity}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          c.status === 'resolved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : c.status === 'in_progress'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4">
                      <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 capitalize">
                        {c.source === 'alexa' ? (
                          <>
                            <Mic className="w-3.5 h-3.5 text-cyan-500" />
                            <span>Alexa</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                            <span>Web</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()} •{' '}
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-blue-600 dark:text-cyan-400 hover:underline font-bold inline-flex items-center">
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
