import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Code2,
  Play,
  CheckCircle2,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronRight,
  Server,
} from 'lucide-react';
import { fetchMcpTools, executeMcpTool } from '../services/api';
import { McpTool } from '../types';

export const McpToolsPage: React.FC = () => {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [testArgs, setTestArgs] = useState<string>('{}');
  const [testResult, setTestResult] = useState<any>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const loadTools = () => {
    setLoading(true);
    fetchMcpTools()
      .then((data) => {
        setTools(data.tools);
        if (data.tools.length > 0 && !selectedTool) {
          setSelectedTool(data.tools[0]);
          setDefaultArgs(data.tools[0].name);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTools();
  }, []);

  const setDefaultArgs = (name: string) => {
    if (name === 'create_case') {
      setTestArgs(
        JSON.stringify(
          { incident_type: 'instagram_hacked', details: 'Hacker changed 2FA and phone number on Instagram account' },
          null,
          2
        )
      );
    } else if (name === 'get_case') {
      setTestArgs(JSON.stringify({ case_id: 'BG-2026-001' }, null, 2));
    } else if (name === 'analyze_incident') {
      setTestArgs(JSON.stringify({ case_id: 'BG-2026-001' }, null, 2));
    } else if (name === 'generate_recovery_plan') {
      setTestArgs(
        JSON.stringify({ incident_type: 'fake_payment_fraud', severity: 'high' }, null, 2)
      );
    } else if (name === 'score_business') {
      setTestArgs(
        JSON.stringify(
          {
            audit_answers: {
              registration: true,
              gst: true,
              mfa: false,
              invoices: true,
              vendor_contracts: false,
              trademark: false,
              backups: true,
              password_manager: false,
              staff_access: false,
              cyber_insurance: false,
              payment_verification: false,
              incident_plan: false,
            },
          },
          null,
          2
        )
      );
    } else {
      setTestArgs(JSON.stringify({ case_id: 'BG-2026-001', patch: { status: 'in_progress' } }, null, 2));
    }
  };

  const handleSelectTool = (tool: McpTool) => {
    setSelectedTool(tool);
    setDefaultArgs(tool.name);
    setTestResult(null);
  };

  const handleExecute = async () => {
    if (!selectedTool) return;
    setExecuting(true);
    try {
      const parsed = JSON.parse(testArgs);
      const res = await executeMcpTool(selectedTool.name, parsed);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ error: e.message || 'JSON parse or execution failed' });
    } finally {
      setExecuting(false);
    }
  };

  const copySchema = () => {
    if (selectedTool) {
      navigator.clipboard.writeText(JSON.stringify(selectedTool.inputSchema, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              MCP Tools Registry & Schemas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300">
              Official MCP SDK
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Model Context Protocol server running streamable HTTP tool calling endpoint for LLM orchestration
          </p>
        </div>

        <button
          onClick={loadTools}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Tools</span>
        </button>
      </div>

      {/* Protocol Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/60 via-navy-900 to-indigo-950 text-white border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <Server className="w-5 h-5 text-cyan-400" />
          <div>
            <span className="font-bold">MCP Streamable HTTP Server Endpoint:</span>
            <span className="font-mono text-cyan-300 ml-2">GET /mcp/tools & POST /call</span>
          </div>
        </div>
        <span className="text-slate-300">JSON-RPC 2.0 / FastMCP Compliant</span>
      </div>

      {/* Tools List & Execution Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tool List */}
        <div className="lg:col-span-4 rounded-2xl glass-card border border-slate-200 dark:border-white/10 p-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Registered Agent Tools ({tools.length})
          </div>

          {tools.map((t) => (
            <button
              key={t.name}
              onClick={() => handleSelectTool(t)}
              className={`w-full text-left p-3 rounded-xl transition-all flex flex-col space-y-1 ${
                selectedTool?.name === t.name
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'hover:bg-slate-100 dark:hover:bg-navy-900 text-slate-700 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs">{t.name}()</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </div>
              <p
                className={`text-[11px] leading-tight line-clamp-2 ${
                  selectedTool?.name === t.name ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.description}
              </p>
            </button>
          ))}
        </div>

        {/* Right Column: Schema Details & Sandbox Console */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTool ? (
            <>
              {/* Tool Detail Card */}
              <div className="rounded-2xl glass-card border border-slate-200 dark:border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                  <div>
                    <h3 className="font-mono font-bold text-base text-blue-600 dark:text-cyan-400">
                      {selectedTool.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedTool.description}</p>
                  </div>

                  <button
                    onClick={copySchema}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy Schema'}</span>
                  </button>
                </div>

                {/* Input Schema JSON */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center">
                    <Code2 className="w-3.5 h-3.5 mr-1" />
                    Input JSON Schema
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-slate-200 font-mono text-xs overflow-x-auto max-h-48 border border-slate-200 dark:border-white/5">
                    {JSON.stringify(selectedTool.inputSchema, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Interactive Execution Sandbox */}
              <div className="rounded-2xl glass-card border border-blue-500/30 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Live Tool Execution Sandbox
                    </h4>
                  </div>
                  <button
                    onClick={handleExecute}
                    disabled={executing}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{executing ? 'Executing...' : 'Run Tool'}</span>
                  </button>
                </div>

                {/* Arguments Editor */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Call Arguments (JSON):
                  </label>
                  <textarea
                    rows={6}
                    value={testArgs}
                    onChange={(e) => setTestArgs(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-navy-950 font-mono text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Execution Results */}
                {testResult && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Execution Response Output:
                    </label>
                    <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-60 border border-emerald-500/30">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select an MCP tool on the left to inspect its schema and run test calls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
