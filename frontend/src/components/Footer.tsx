import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-white/10 py-6 px-6 bg-white/50 dark:bg-navy-950/50 text-slate-500 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            BusinessGuard AI — Your business's first responder
          </span>
        </div>

        <div className="text-[11px] leading-relaxed max-w-xl text-slate-500">
          General guidance, not legal or professional advice. Demo uses mock data. Alexa+ experience is simulated for hackathon evaluation.
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
            v1.0-hackathon
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
            Local MCP Live
          </span>
        </div>
      </div>
    </footer>
  );
};
