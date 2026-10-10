import React from 'react';
import { X, Wrench, ChevronRight, CheckCircle2, Clock, Code2 } from 'lucide-react';

interface McpToolCallRecord {
  id?: string;
  name: string;
  arguments: any;
  result?: any;
  timestamp?: string;
  error?: string;
}

interface McpToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  toolCalls: McpToolCallRecord[];
}

export const McpToolsPanel: React.FC<McpToolsPanelProps> = ({
  isOpen,
  onClose,
  toolCalls,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col transition-all">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">MCP Tool Inspector</h3>
            <p className="text-xs text-slate-500">Live Model Context Protocol Invocation Stream</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-navy-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Protocol Badge */}
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-300">
        <span className="flex items-center">
          <Code2 className="w-3.5 h-3.5 mr-1 text-blue-500" />
          Transport: Streamable HTTP / FastMCP
        </span>
        <span className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
          {toolCalls.length} Call{toolCalls.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Calls Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {toolCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">No MCP tool invocations in this session yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Trigger a voice rescue, chat analysis, or health audit to see live tool executions.
            </p>
          </div>
        ) : (
          toolCalls.map((call, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-navy-950/50 p-3 text-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center">
                  <ChevronRight className="w-3.5 h-3.5 mr-0.5" />
                  {call.name}()
                </span>
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  SUCCESS
                </span>
              </div>

              {/* Arguments */}
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                  Input Arguments
                </div>
                <pre className="p-2 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-200 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(call.arguments, null, 2)}
                </pre>
              </div>

              {/* Result */}
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                  Tool Output Result
                </div>
                <pre className="p-2 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(call.result || call.error, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
