import React, { useState } from 'react';
import {
  ClipboardCheck,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  AlertTriangle,
  Lightbulb,
  ListOrdered,
  TrendingUp,
} from 'lucide-react';
import { submitAudit } from '../services/api';
import { AuditAnswers, AuditResult } from '../types';
import { useApp } from '../context/AppContext';
import { ScoreGauge } from '../components/ScoreGauge';

export const AuditPage: React.FC = () => {
  const { setCurrentTab } = useApp();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AuditAnswers>({
    registration: false,
    gst: false,
    mfa: false,
    invoices: false,
    vendor_contracts: false,
    trademark: false,
    backups: false,
    password_manager: false,
    staff_access: false,
    cyber_insurance: false,
    payment_verification: false,
    incident_plan: false,
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const questions = [
    {
      key: 'registration' as keyof AuditAnswers,
      title: '1. Formal Business Registration',
      category: 'Legal',
      question: 'Is your business formally registered as an MSME / Udyam, Sole Proprietorship, or LLP/Pvt Ltd?',
      hint: 'Registration establishes legal identity and gives you standing to file official trademark appeals.',
    },
    {
      key: 'gst' as keyof AuditAnswers,
      title: '2. GST & Tax Registration',
      category: 'Legal',
      question: 'Do you possess an active GST number or official tax registration for commercial shipments?',
      hint: 'Required for interstate parcel transit and enterprise vendor accounts.',
    },
    {
      key: 'mfa' as keyof AuditAnswers,
      title: '3. Multi-Factor Authentication (MFA)',
      category: 'Security',
      question: 'Is Two-Factor Authentication (Authenticator App or Hardware Key) enabled on your Instagram and WhatsApp?',
      hint: 'Single-password accounts are 99% more vulnerable to credential stuffing attacks.',
    },
    {
      key: 'invoices' as keyof AuditAnswers,
      title: '4. Numbered Sales Invoices',
      category: 'Operations',
      question: 'Do you issue formal, serial-numbered invoices or digital receipts for every customer order?',
      hint: 'Essential proof of legitimate transactions during chargeback disputes or fraud investigations.',
    },
    {
      key: 'vendor_contracts' as keyof AuditAnswers,
      title: '5. Written Vendor Contracts',
      category: 'Legal',
      question: 'Do you have written contracts, MOUs, or clear WhatsApp terms with your fabric/product suppliers?',
      hint: 'Protects against sudden supply chain price gouging and delivery default.',
    },
    {
      key: 'trademark' as keyof AuditAnswers,
      title: '6. Brand Trademark Protection',
      category: 'Brand',
      question: 'Have you applied for or registered your brand name and logo with the Trademark Registry (IP India)?',
      hint: 'Prevents copycat accounts from stealing your brand identity or shutting you down via fake infringement claims.',
    },
    {
      key: 'backups' as keyof AuditAnswers,
      title: '7. Regular Catalog & Customer Backups',
      category: 'Operations',
      question: 'Do you maintain weekly offline or cloud backups of your customer phone numbers and catalog photos?',
      hint: 'Ensures business continuity even if an Instagram handle is permanently suspended.',
    },
    {
      key: 'password_manager' as keyof AuditAnswers,
      title: '8. Dedicated Password Manager',
      category: 'Security',
      question: 'Do you store business credentials in a dedicated encrypted password manager (e.g. Bitwarden, 1Password)?',
      hint: 'Avoids reusing identical passwords across personal and business apps.',
    },
    {
      key: 'staff_access' as keyof AuditAnswers,
      title: '9. Role-Based Staff Access',
      category: 'Security',
      question: 'Do assistants, photographers, or family members use separate staff accounts rather than sharing master logins?',
      hint: 'Meta Business Manager allows employee access without revealing master passwords.',
    },
    {
      key: 'cyber_insurance' as keyof AuditAnswers,
      title: '10. Small Business Cyber Insurance',
      category: 'Brand',
      question: 'Do you maintain an MSME cyber risk insurance policy covering digital extortion or fraudulent payouts?',
      hint: 'Emerging protection policy that covers ransomware and digital asset recovery costs.',
    },
    {
      key: 'payment_verification' as keyof AuditAnswers,
      title: '11. Bank Settlement Verification Habit',
      category: 'Operations',
      question: 'Do you verify cleared ledger credits in your bank/merchant app before dispatching goods rather than trusting buyer screenshots?',
      hint: 'Prevents fake UPI payment screenshot scams that exploit shipping urgency.',
    },
    {
      key: 'incident_plan' as keyof AuditAnswers,
      title: '12. Documented Incident Rescue Plan',
      category: 'Operations',
      question: 'Do you have a written 1-page emergency checklist with carrier numbers and platform recovery links?',
      hint: 'Reduces downtime from days to minutes during an active cyber incident.',
    },
  ];

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectAnswer = async (val: boolean) => {
    const updated = { ...answers, [currentQ.key]: val };
    setAnswers(updated);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed last question, submit to backend
      setSubmitting(true);
      try {
        const res = await submitAudit(updated);
        setResult(res);
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const resetAudit = () => {
    setCurrentIndex(0);
    setAnswers({
      registration: false,
      gst: false,
      mfa: false,
      invoices: false,
      vendor_contracts: false,
      trademark: false,
      backups: false,
      password_manager: false,
      staff_access: false,
      cyber_insurance: false,
      payment_verification: false,
      incident_plan: false,
    });
    setResult(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            12-Point Business Health Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Guided digital resilience check across Legal, Security, Operations, and Brand hygiene
          </p>
        </div>

        {result && (
          <button
            onClick={resetAudit}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Audit</span>
          </button>
        )}
      </div>

      {!result ? (
        /* Question Card & Progress Bar */
        <div className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 glass-card border border-slate-200 dark:border-white/10 shadow-xl space-y-8">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Question {currentIndex + 1} of {questions.length} • {currentQ.category}
              </span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-navy-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Body */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {currentQ.question}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal p-3 rounded-xl bg-blue-50/50 dark:bg-navy-900/40 border border-blue-100 dark:border-blue-900/30">
              <strong className="text-blue-600 dark:text-cyan-400 mr-1">Why this matters:</strong>
              {currentQ.hint}
            </p>
          </div>

          {/* Answer Choice Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => handleSelectAnswer(true)}
              disabled={submitting}
              className="py-4 px-6 rounded-2xl border-2 border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-base flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Check className="w-5 h-5 text-emerald-500" />
              <span>YES, IN PLACE</span>
            </button>

            <button
              onClick={() => handleSelectAnswer(false)}
              disabled={submitting}
              className="py-4 px-6 rounded-2xl border-2 border-slate-300 dark:border-white/20 hover:border-slate-400 bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 font-extrabold text-base flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <X className="w-5 h-5 text-slate-400" />
              <span>NO / NOT YET</span>
            </button>
          </div>

          {/* Navigation Back */}
          {currentIndex > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous question</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Audit Output Dossier */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Top Score Summary Banner */}
          <div className="rounded-3xl p-8 glass-card border border-blue-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Maturity Level: {result.maturity_level}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Business Health Assessment Complete
              </h2>
              <p className="text-xs text-slate-500 max-w-lg">
                Your answers have been evaluated through the MCP scoring engine. Your updated Protection Score is now synchronized across your dashboard.
              </p>
            </div>

            <div className="flex-shrink-0">
              <ScoreGauge
                score={result.overall_score}
                label="Protection Score"
                subtitle={`Level: ${result.maturity_level}`}
                size={160}
              />
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="rounded-2xl p-6 glass-card border border-emerald-500/30 space-y-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-emerald-600 dark:text-emerald-400 flex items-center">
                <Check className="w-4 h-4 mr-1.5" />
                Identified Strengths
              </h3>
              <div className="space-y-2">
                {result.strengths.map((str, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 text-xs text-slate-800 dark:text-slate-200 border border-emerald-500/20"
                  >
                    ✓ {str}
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="rounded-2xl p-6 glass-card border border-amber-500/30 space-y-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-amber-600 dark:text-amber-400 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Vulnerabilities & Exposure
              </h3>
              <div className="space-y-2">
                {result.weaknesses.map((weak, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 text-xs text-slate-800 dark:text-slate-200 border border-amber-500/20"
                  >
                    ⚠ {weak}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5-Step Action Plan */}
          <div className="rounded-2xl p-6 glass-card border border-slate-200 dark:border-white/10 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900 dark:text-white flex items-center">
              <ListOrdered className="w-4 h-4 mr-1.5 text-blue-600 dark:text-cyan-400" />
              5-Step Hardening Action Plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.action_plan.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* CTA to Protection Score Dashboard */}
          <div className="flex justify-end">
            <button
              onClick={() => setCurrentTab('score')}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              <span>View Protection Score Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
