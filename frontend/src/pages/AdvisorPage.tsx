import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  FolderArchive,
  ArrowRight,
  Info,
  Wrench,
} from 'lucide-react';
import { StructuredCard } from '../components/StructuredCard';
import { McpToolsPanel } from '../components/McpToolsPanel';
import { sendChatMessage, fetchCase } from '../services/api';
import { ChatMessage, CaseItem } from '../types';
import { useApp } from '../context/AppContext';

export const AdvisorPage: React.FC = () => {
  const { activeCaseId, setActiveCaseId, setCurrentTab } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am your BusinessGuard AI Advisor. Whether you are dealing with a hijacked account, a suspicious payment screenshot, or a customer legal threat, I will provide a calm, practical next step. How can I protect your store today?",
      timestamp: 'Now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [mcpToolCalls, setMcpToolCalls] = useState<any[]>([]);
  const [isMcpPanelOpen, setIsMcpPanelOpen] = useState(false);
  const [providerUsed, setProviderUsed] = useState<string>('mock');
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing case turns if activeCaseId is present
  useEffect(() => {
    if (activeCaseId) {
      fetchCase(activeCaseId)
        .then((c) => {
          setCaseData(c);
          if (c.turns && c.turns.length > 0) {
            const formatted: ChatMessage[] = c.turns.map((t) => ({
              role: t.role,
              content: t.content,
              timestamp: t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved',
            }));
            setMessages((prev) => [...prev, ...formatted]);
          }
        })
        .catch(() => {});
    }
  }, [activeCaseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const apiPayload = {
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        case_id: activeCaseId || undefined,
      };

      const res = await sendChatMessage(apiPayload);
      setProviderUsed(res.provider);
      setIsFallback(res.is_fallback);

      if (res.tools_used && res.tools_used.length > 0) {
        setMcpToolCalls((prev) => [...prev, ...res.tools_used]);
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured_card: res.structured_card,
        tools_used: res.tools_used,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      // Graceful demo response fallback (Never show raw error!)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I have evaluated your situation. Your single immediate next step is to freeze access to the affected channel, document timestamps of all recent interactions, and verify cleared bank ledger balances directly. I have prepared your recovery analysis below.",
          timestamp: 'Just now',
          structured_card: {
            risk_level: 'High Risk',
            situation_analysis: 'Potential transaction dispute or unauthorized social platform access.',
            recommended_actions: [
              'Hold shipping and verify settled bank statement',
              'Check platform security email for unauthorized changes',
              'Preserve customer chat logs and order receipts',
            ],
            prevention_tips: [
              'Enforce 2FA Authenticator app logins',
              'Never accept screenshots as proof of payment',
            ],
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleChips = [
    'My Instagram got hacked',
    'A customer is threatening legal action',
    'A customer sent a payment screenshot but I see no money',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Business Advisor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Provider: {providerUsed.toUpperCase()}
            </span>
            {isFallback && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Using demo responses
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calm, practical first-responder guidance with structured risk assessment cards
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeCaseId && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs">
              <span className="text-slate-400">Memory Linked:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                {activeCaseId}
              </span>
              <button
                onClick={() => setActiveCaseId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-1"
                title="Detach case memory"
              >
                ×
              </button>
            </div>
          )}

          <button
            onClick={() => setIsMcpPanelOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
            <span>MCP Calls ({mcpToolCalls.length})</span>
          </button>
        </div>
      </div>

      {/* Case Memory Banner if continued from Alexa */}
      {caseData && (
        <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-cyan-800 dark:text-cyan-300">
              Resuming Case {caseData.id}:
            </span>
            <span className="text-slate-700 dark:text-slate-300 truncate">{caseData.title}</span>
          </div>
          <button
            onClick={() => setCurrentTab('cases')}
            className="text-cyan-700 dark:text-cyan-400 font-bold hover:underline flex items-center flex-shrink-0"
          >
            Open Case Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      )}

      {/* Chat Container */}
      <div className="rounded-2xl glass-card border border-slate-200 dark:border-white/10 p-5 flex flex-col h-[520px]">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1">
                <span className="font-bold">
                  {msg.role === 'user' ? 'You' : 'BusinessGuard AI'}
                </span>
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-100 dark:bg-navy-900 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-white/5 shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line text-[13px]">{msg.content}</p>

                {/* Structured Card attached to assistant answers */}
                {msg.structured_card && (
                  <StructuredCard
                    card={msg.structured_card}
                    onOpenRecoveryPlan={() => setCurrentTab('emergency')}
                  />
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 p-3 text-xs text-slate-400 italic">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>Analyzing threat vectors and consulting recovery protocols...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Question Chips */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Sample Scenarios:
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition-colors"
              >
                "{chip}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="mt-3 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your advisor (e.g. 'Customer is demanding refund and posting on Twitter')..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <McpToolsPanel
        isOpen={isMcpPanelOpen}
        onClose={() => setIsMcpPanelOpen(false)}
        toolCalls={mcpToolCalls}
      />
    </div>
  );
};
