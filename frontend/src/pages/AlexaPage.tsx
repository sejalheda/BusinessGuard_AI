import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  ExternalLink,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AlexaEchoRing, EchoState } from '../components/AlexaEchoRing';
import { McpToolsPanel } from '../components/McpToolsPanel';
import { alexaInteract } from '../services/api';
import { useApp } from '../context/AppContext';

export const AlexaPage: React.FC = () => {
  const { setActiveCaseId, setCurrentTab, setEmergencyActive } = useApp();

  const [echoState, setEchoState] = useState<EchoState>('idle');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [typedInput, setTypedInput] = useState<string>('');
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [immediateActions, setImmediateActions] = useState<string[]>([]);
  const [conversation, setConversation] = useState<
    Array<{ role: 'user' | 'alexa'; text: string; timestamp: string }>
  >([
    {
      role: 'alexa',
      text: "Say or type: 'Alexa, ask BusinessGuard, my Instagram was hacked' to begin your emergency rescue.",
      timestamp: 'Ready',
    },
  ]);
  const [rawToolCalls, setRawToolCalls] = useState<any[]>([]);
  const [isMcpPanelOpen, setIsMcpPanelOpen] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechSynthesis and SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecognizing(true);
          setEchoState('listening');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleSend(transcript);
        };

        recognition.onerror = (e: any) => {
          setIsRecognizing(false);
          setEchoState('idle');
          if (e.error !== 'no-speech') {
            setErrorStatus(`Microphone notice: ${e.error}. You can also type or use quick chips.`);
          }
        };

        recognition.onend = () => {
          setIsRecognizing(false);
          if (echoState === 'listening') {
            setEchoState('idle');
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization error', err);
      }
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.name.includes('Samantha') || v.name.includes('Natural') || v.lang.startsWith('en')
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setEchoState('speaking');
      utterance.onend = () => setEchoState('idle');
      utterance.onerror = () => setEchoState('idle');

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error', err);
      setEchoState('idle');
    }
  };

  const handleTapEchoRing = () => {
    if (echoState === 'speaking') {
      window.speechSynthesis?.cancel();
      setEchoState('idle');
      return;
    }

    if (recognitionRef.current) {
      if (isRecognizing) {
        recognitionRef.current.stop();
        setIsRecognizing(false);
        setEchoState('idle');
      } else {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // If already started or blocked
          setErrorStatus('Microphone active. Say: "Alexa, ask BusinessGuard, my Instagram was hacked."');
        }
      }
    } else {
      setErrorStatus('Speech recognition not supported in this browser. Please use typed input.');
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setErrorStatus(null);
    setEchoState('thinking');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user turn
    setConversation((prev) => [
      ...prev,
      { role: 'user', text: textToSend, timestamp },
    ]);
    setTypedInput('');

    try {
      const res = await alexaInteract({
        transcript: textToSend,
        case_id: createdCaseId || undefined,
        turn_index: turnIndex,
        previous_answers: answers,
      });

      // Update state
      setTurnIndex(res.turn_index);
      if (res.case_id) {
        setCreatedCaseId(res.case_id);
        setActiveCaseId(res.case_id);
        setEmergencyActive(true);
      }
      if (res.immediate_actions?.length > 0) {
        setImmediateActions(res.immediate_actions);
      }
      if (res.tools_used?.length > 0) {
        setRawToolCalls((prev) => [...prev, ...res.tools_used]);
      }

      // Append Alexa turn
      setConversation((prev) => [
        ...prev,
        { role: 'alexa', text: res.display_text, timestamp },
      ]);

      // Speak response aloud
      speakText(res.spoken_response);
    } catch (err) {
      setEchoState('idle');
      setErrorStatus('Communication error with rescue agent. Please try again.');
    }
  };

  const resetSimulator = () => {
    window.speechSynthesis?.cancel();
    setEchoState('idle');
    setTurnIndex(0);
    setAnswers({});
    setCreatedCaseId(null);
    setImmediateActions([]);
    setConversation([
      {
        role: 'alexa',
        text: "Say or type: 'Alexa, ask BusinessGuard, my Instagram was hacked' to begin your emergency rescue.",
        timestamp: 'Ready',
      },
    ]);
  };

  // Preset script chips for Priya's demo
  const sampleSuggestions = [
    { label: 'Wake Phrase', text: 'Alexa, ask BusinessGuard, my Instagram was hacked.' },
    { label: 'Follow-up 1', text: 'No, I cannot log in. The password was changed.' },
    { label: 'Follow-up 2', text: 'Yes, I got an email saying my email was changed to something else.' },
    { label: 'Follow-up 3', text: 'Yes, they are messaging my followers for money right now!' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Alexa+ Voice Simulator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
              Simulated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Voice-first emergency intake with speech recognition, text-to-speech, and automatic web handoff
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMcpPanelOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
            <span>MCP Tool Calls ({rawToolCalls.length})</span>
          </button>

          <button
            onClick={resetSimulator}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Simulator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Alexa Echo Ring & Interactive Controls */}
        <div className="lg:col-span-5 rounded-3xl p-6 glass-card border border-cyan-500/30 flex flex-col items-center justify-between min-h-[460px]">
          <div className="w-full text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Amazon Echo+ Hardware Simulator
            </span>
          </div>

          {/* Glowing Ring */}
          <AlexaEchoRing
            state={echoState}
            onTap={handleTapEchoRing}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
            isRecognizing={isRecognizing}
          />

          {/* Quick Script Chips for Easy Demo */}
          <div className="w-full mt-4 pt-4 border-t border-slate-200/60 dark:border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Prompt Chips (Priya's Script):</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sampleSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.text)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition-all text-left truncate max-w-full"
                >
                  <span className="text-blue-500 font-bold mr-1">{s.label}:</span>
                  "{s.text}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Conversation Transcript & Case Handoff Banner */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Case Banner when created */}
          {createdCaseId && (
            <div className="rounded-2xl p-4 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border-2 border-red-500/40 shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
                    <AlertOctagon className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Case Registered: {createdCaseId}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white uppercase">
                        Critical
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Spoken aloud by Alexa. Saved to local SQLite database.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveCaseId(createdCaseId);
                    setCurrentTab('cases');
                  }}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex-shrink-0"
                >
                  <span>Continue on Web App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* QR Code Handoff Card */}
              <div className="mt-4 p-5 rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
                  <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md flex-shrink-0">
                    <QRCodeSVG
                      value={`${window.location.origin}/cases/${createdCaseId}`}
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 block">
                      QR Code Handoff
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Scan to continue on your phone
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Open camera on your smartphone to instantly resume this case without typing your Case ID.
                    </p>
                    <p className="text-[11px] text-blue-600 dark:text-cyan-400 font-mono font-semibold pt-1">
                      {window.location.origin}/cases/{createdCaseId}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/cases/${createdCaseId}`;
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 shadow-sm ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>

              {immediateActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    First 3 Immediate Actions Spoken by Alexa:
                  </div>
                  <div className="space-y-1.5">
                    {immediateActions.map((act, i) => (
                      <div
                        key={i}
                        className="flex items-start space-x-2 text-xs text-slate-800 dark:text-slate-200 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transcript Scroll Area */}
          <div className="rounded-2xl glass-card border border-slate-200 dark:border-white/10 p-5 flex flex-col h-[400px]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-2">
              <span>Live Dialogue Stream</span>
              <span>Turn {turnIndex} / 3</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1">
                    <span className="font-bold">
                      {msg.role === 'user' ? "Priya (Owner)" : "Alexa+"}
                    </span>
                    <span>• {msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-navy-900 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-white/5 font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Error notice if speech unavailable */}
            {errorStatus && (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300">
                {errorStatus}
              </div>
            )}

            {/* Typed Fallback Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(typedInput);
              }}
              className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center space-x-2"
            >
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder="Type your reply (e.g. 'Can't log in, password was changed')..."
                className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors"
                title="Send reply"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Side Panel for Raw MCP Tool Calls */}
      <McpToolsPanel
        isOpen={isMcpPanelOpen}
        onClose={() => setIsMcpPanelOpen(false)}
        toolCalls={rawToolCalls}
      />
    </div>
  );
};
