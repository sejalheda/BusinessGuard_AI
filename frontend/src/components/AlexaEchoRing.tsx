import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';

export type EchoState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AlexaEchoRingProps {
  state: EchoState;
  onTap: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  isRecognizing: boolean;
}

export const AlexaEchoRing: React.FC<AlexaEchoRingProps> = ({
  state,
  onTap,
  voiceEnabled,
  onToggleVoice,
  isRecognizing,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ambient halos */}
        <div
          className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
            state === 'listening'
              ? 'w-72 h-72 bg-cyan-400/30 blur-2xl animate-pulse'
              : state === 'thinking'
              ? 'w-64 h-64 bg-blue-500/25 blur-xl animate-spin'
              : state === 'speaking'
              ? 'w-80 h-80 bg-emerald-400/25 blur-2xl animate-pulse'
              : 'w-56 h-56 bg-cyan-500/10 blur-xl'
          }`}
        />

        {/* Secondary wave ring */}
        {(state === 'listening' || state === 'speaking') && (
          <div className="absolute w-56 h-56 rounded-full border border-cyan-400/40 animate-ping pointer-events-none" />
        )}

        {/* Main Echo Cylinder / Ring Button */}
        <button
          onClick={onTap}
          type="button"
          aria-label="Tap to speak with Alexa"
          className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 shadow-2xl focus:outline-none ${
            state === 'listening'
              ? 'bg-gradient-to-b from-navy-900 via-cyan-950 to-navy-900 border-4 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.8)] scale-105'
              : state === 'thinking'
              ? 'bg-gradient-to-b from-navy-900 via-blue-950 to-navy-900 border-4 border-blue-400 shadow-[0_0_35px_rgba(29,78,216,0.7)]'
              : state === 'speaking'
              ? 'bg-gradient-to-b from-navy-900 via-emerald-950 to-navy-900 border-4 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.7)] scale-102'
              : 'bg-navy-900 border-4 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:border-cyan-400 hover:scale-102'
          }`}
        >
          {/* Cyan LED Ring effect */}
          <div
            className={`absolute inset-0 rounded-full border-2 transition-opacity duration-300 pointer-events-none ${
              state === 'idle'
                ? 'border-cyan-400/30'
                : state === 'listening'
                ? 'border-cyan-300 animate-pulse'
                : state === 'thinking'
                ? 'border-blue-400 border-dashed animate-spin'
                : 'border-emerald-300'
            }`}
          />

          {/* Center Graphic */}
          <div className="flex flex-col items-center space-y-2 text-cyan-300">
            {state === 'listening' ? (
              <Mic className="w-10 h-10 text-cyan-300 animate-bounce" />
            ) : state === 'thinking' ? (
              <Sparkles className="w-10 h-10 text-blue-300 animate-spin" />
            ) : state === 'speaking' ? (
              <Volume2 className="w-10 h-10 text-emerald-300 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10 text-cyan-400/80" />
            )}

            <span className="text-xs font-bold uppercase tracking-widest text-slate-200">
              {state === 'listening'
                ? 'Listening...'
                : state === 'thinking'
                ? 'Thinking...'
                : state === 'speaking'
                ? 'Alexa Speaking'
                : 'Tap to Speak'}
            </span>
          </div>
        </button>
      </div>

      {/* Voice controls & status indicator */}
      <div className="mt-5 flex items-center space-x-4 text-xs">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium ${
            state === 'listening'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : state === 'speaking'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : state === 'thinking'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <span className="w-2 h-2 rounded-full mr-1.5 animate-pulse bg-current" />
          Status: {state.toUpperCase()}
        </span>

        <button
          onClick={onToggleVoice}
          type="button"
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 transition-colors"
          title="Toggle text-to-speech audio playback"
        >
          {voiceEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Speech Audio ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Speech Audio MUTED</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
