import React, { useState } from 'react';
import {
  ShieldAlert,
  CreditCard,
  Scale,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { CaseItem, AuditResult } from '../types';

interface RiskRadarWidgetProps {
  auditData: AuditResult | null;
  cases: CaseItem[];
}

interface RiskRow {
  key: string;
  label: string;
  icon: any;
  level: 'High' | 'Medium' | 'Low';
  score: number; // 0 to 100 risk percentage (High = 85, Med = 50, Low = 15)
  reason: string;
}

export const RiskRadarWidget: React.FC<RiskRadarWidgetProps> = ({ auditData, cases }) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const isSample = !auditData || auditData.is_default;

  // Compute ratings dynamically
  const openCases = cases.filter((c) => c.status !== 'resolved');

  // 1. Cyber
  let cyberLevel: 'High' | 'Medium' | 'Low' = 'Low';
  let cyberReason = 'Multi-Factor Authentication and password vault active on admin accounts.';
  const openCyberCase = openCases.find((c) =>
    ['instagram_hacked', 'whatsapp_compromised'].includes(c.incident_type)
  );
  if (openCyberCase) {
    cyberLevel = 'High';
    cyberReason = `Active critical compromise case (${openCyberCase.id}) open on ${openCyberCase.incident_type.replace('_', ' ')}.`;
  } else if (auditData && (!auditData.category_scores || auditData.category_scores.security < 60)) {
    cyberLevel = 'Medium';
    cyberReason = 'Multi-factor authentication disabled on core Meta/Google accounts.';
  }

  // 2. Fraud
  let fraudLevel: 'High' | 'Medium' | 'Low' = 'Low';
  let fraudReason = 'Settled bank ledger credit verification enforced prior to order dispatch.';
  const openFraudCase = openCases.find((c) => c.incident_type === 'fake_payment_fraud');
  if (openFraudCase) {
    fraudLevel = 'High';
    fraudReason = `Active unverified payment screenshot dispute pending bank settlement (${openFraudCase.id}).`;
  } else if (auditData && auditData.category_scores?.brand < 60) {
    fraudLevel = 'Medium';
    fraudReason = 'Store relies on manual buyer screenshot proof rather than soundbox/bank credit.';
  }

  // 3. Legal
  let legalLevel: 'High' | 'Medium' | 'Low' = 'Low';
  let legalReason = 'Formal MSME registration, written supplier agreements, and shipping delay terms active.';
  const openLegalCase = openCases.find((c) => c.incident_type === 'legal_threat');
  if (openLegalCase) {
    legalLevel = 'High';
    legalReason = `Active customer legal notice dispute or consumer forum threat (${openLegalCase.id}).`;
  } else if (auditData && auditData.category_scores?.legal < 60) {
    legalLevel = 'Medium';
    legalReason = 'Unregistered sole proprietorship without written vendor supply contracts.';
  }

  // 4. Brand
  let brandLevel: 'High' | 'Medium' | 'Low' = 'Low';
  let brandReason = 'Registered trademark and active follower trust protection protocols in place.';
  if (openCyberCase) {
    brandLevel = 'High';
    brandReason = 'Follower reputation at risk due to active scammers posting unauthorized crypto stories.';
  } else if (auditData && auditData.category_scores?.brand < 65) {
    brandLevel = 'Medium';
    brandReason = 'Brand name un-trademarked, leaving business exposed to copycat imposter handles.';
  }

  // Fallbacks for initial sample data state
  if (isSample && openCases.length === 0) {
    cyberLevel = 'High';
    cyberReason = 'Sample Data: MFA disabled on Meta Business Manager credentials.';
    fraudLevel = 'Medium';
    fraudReason = 'Sample Data: Manual payment verification susceptible to forged UPI proofs.';
    legalLevel = 'Medium';
    legalReason = 'Sample Data: Unregistered business without published shipping delay terms.';
    brandLevel = 'Low';
    brandReason = 'Sample Data: Established brand handle with basic identity protection.';
  }

  const rows: RiskRow[] = [
    {
      key: 'cyber',
      label: 'Cyber Defense',
      icon: ShieldAlert,
      level: cyberLevel,
      score: cyberLevel === 'High' ? 85 : cyberLevel === 'Medium' ? 50 : 15,
      reason: cyberReason,
    },
    {
      key: 'fraud',
      label: 'Fraud Exposure',
      icon: CreditCard,
      level: fraudLevel,
      score: fraudLevel === 'High' ? 85 : fraudLevel === 'Medium' ? 50 : 15,
      reason: fraudReason,
    },
    {
      key: 'legal',
      label: 'Legal & Dispute',
      icon: Scale,
      level: legalLevel,
      score: legalLevel === 'High' ? 85 : legalLevel === 'Medium' ? 50 : 15,
      reason: legalReason,
    },
    {
      key: 'brand',
      label: 'Brand Reputation',
      icon: Award,
      level: brandLevel,
      score: brandLevel === 'High' ? 85 : brandLevel === 'Medium' ? 50 : 15,
      reason: brandReason,
    },
  ];

  return (
    <div className="rounded-2xl p-6 glass-card border border-slate-200 dark:border-white/10 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Business Risk Radar
            </h3>
            <span className="text-[11px] text-slate-500">
              Live threat vector tracking across 4 core business dimensions
            </span>
          </div>
        </div>

        {isSample && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400">
            Sample data
          </span>
        )}
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const Icon = row.icon;
          const isExpanded = expandedKey === row.key;

          const isHigh = row.level === 'High';
          const isMed = row.level === 'Medium';

          const chipStyle = isHigh
            ? 'bg-red-500 text-white animate-pulse'
            : isMed
            ? 'bg-amber-500 text-white'
            : 'bg-emerald-500 text-white';

          const barColor = isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500';

          return (
            <div
              key={row.key}
              onClick={() => setExpandedKey(isExpanded ? null : row.key)}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-navy-900/60 hover:bg-slate-100 dark:hover:bg-navy-800/80 cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-200/60 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {row.label}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Small Bar Visualization */}
                  <div className="hidden sm:block w-24 h-2 rounded-full bg-slate-200 dark:bg-navy-950 overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${row.score}%` }}
                    />
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${chipStyle}`}>
                    {row.level} Risk
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Clickable One-Sentence Explanation */}
              {isExpanded && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-2 animate-in fade-in">
                  <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-normal">{row.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
