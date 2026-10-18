import React, { useState } from 'react';
import {
  Upload,
  FileImage,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  ExternalLink,
  Info,
  Scan,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ReasoningPanel } from '../components/ReasoningPanel';
import { checkPaymentScreenshot, createCase } from '../services/api';
import { PaymentCheckResult } from '../types';
import { useApp } from '../context/AppContext';

export const PaymentCheckerPage: React.FC = () => {
  const { setActiveCaseId, setCurrentTab } = useApp();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<PaymentCheckResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [creatingCase, setCreatingCase] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds 5 MB size limit. Please upload a smaller JPG or PNG image.");
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage("Unsupported file format. Please upload a PNG or JPG screenshot.");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setErrorMessage(null);
    try {
      // Small simulated scanning delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 1200));

      let base64Str = "";
      if (imagePreview) {
        base64Str = imagePreview.split(',')[1] || "";
      }

      const res = await checkPaymentScreenshot(selectedImage || undefined, base64Str);
      setResult(res);
    } catch (e: any) {
      setErrorMessage("Analysis could not complete. Reverting to safe verification checklist.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateCaseFromCheck = async () => {
    if (!result) return;
    setCreatingCase(true);
    try {
      const caseRes = await createCase({
        incident_type: 'fake_payment_fraud',
        details: `Payment Checker scan initiated for ${selectedImage?.name || 'uploaded screenshot'}. Risk rating: ${result.risk_level} (${result.risk_score}%). Warning signs: ${result.warning_signs.join('; ')}`,
        source: 'payment_checker',
        answers: {
          warning_signs: result.warning_signs,
          risk_score: result.risk_score,
        },
      });

      setActiveCaseId(caseRes.case_id);
      setCurrentTab('cases');
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingCase(false);
    }
  };

  const resetChecker = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Fake Payment Screenshot Checker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Anti-Fraud Scanner
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detect manipulated UPI receipts, font disparities, timestamp errors, and unverified UTR numbers
          </p>
        </div>

        {result && (
          <button
            onClick={resetChecker}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Another Image</span>
          </button>
        )}
      </div>

      {/* Main Grid: Upload & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Drag & Drop Upload Zone */}
        <div className="lg:col-span-5 rounded-3xl p-6 glass-card border border-slate-200 dark:border-white/10 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
            <span>Upload Payment Receipt</span>
            <span className="text-[10px] text-slate-400 font-normal">Max 5 MB (PNG/JPG)</span>
          </h3>

          {!imagePreview ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-cyan-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 dark:bg-navy-950/50 transition-all cursor-pointer min-h-[260px]"
            >
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-cyan-400">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Drag & drop payment screenshot here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">or click below to select file from device</p>
              </div>

              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                id="file-upload-input"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <label
                htmlFor="file-upload-input"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow"
              >
                Browse File
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview Container */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 max-h-72 bg-slate-950 flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="Payment receipt preview"
                  className="max-h-72 w-auto object-contain"
                />

                {/* Overlay Scanning Animation */}
                {analyzing && (
                  <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 text-white">
                    <Scan className="w-10 h-10 text-cyan-400 animate-spin" />
                    <span className="text-xs font-bold tracking-widest uppercase animate-pulse">
                      Analyzing Risk Signals...
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={resetChecker}
                  disabled={analyzing}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/10"
                >
                  Remove Image
                </button>

                {!result && (
                  <button
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="flex-1 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{analyzing ? 'Scanning...' : 'Analyze Screenshot'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Demo Pre-load Button */}
          {!imagePreview && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  // Synthetic demo image trigger
                  setImagePreview("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400' fill='%230B1B3A'><rect width='300' height='400' fill='%230B1B3A'/><text x='20' y='50' fill='%2310B981' font-size='20' font-family='sans-serif'>UPI SUCCESS</text><text x='20' y='100' fill='%23FFFFFF' font-size='28' font-family='sans-serif'>₹ 8,500.00</text><text x='20' y='140' fill='%2394A3B8' font-size='12' font-family='sans-serif'>Ref UTR: 329104829104</text><text x='20' y='180' fill='%2394A3B8' font-size='12' font-family='sans-serif'>Time: 11:42 AM</text></svg>");
                }}
                className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline font-bold"
              >
                Or click here to load Priya's sample payment proof →
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Right Column: Analysis Results Dossier */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
              {/* Mandatory Risk Signal Notice */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-slate-900 dark:text-slate-100 flex items-start space-x-3 shadow-md">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Risk Signals Advisory
                  </h4>
                  <p className="text-xs font-bold leading-relaxed text-amber-900 dark:text-amber-200">
                    "{result.disclaimer}"
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Automated screenshot checks identify visual template anomalies; they are risk indicators, not guaranteed verdicts.
                  </p>
                </div>
              </div>

              {/* Risk Level & Warning Signs Card */}
              <div className="rounded-2xl glass-card border border-red-500/30 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Detected Warning Signals
                    </h3>
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse uppercase">
                    {result.risk_level} ({result.risk_score}% Risk)
                  </span>
                </div>

                {/* Warning Signs List */}
                <div className="space-y-2">
                  {result.warning_signs.map((sign, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 text-xs text-slate-800 dark:text-slate-200 font-medium flex items-start space-x-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{sign}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank App Checklist */}
              <div className="rounded-2xl glass-card border border-blue-500/30 p-6 space-y-3 shadow-xl">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                  <span>Verify in Your Banking App Checklist</span>
                </h3>

                <div className="space-y-2">
                  {result.bank_checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 text-xs text-slate-800 dark:text-slate-200 font-medium flex items-start space-x-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visible Reasoning Panel ("Why this verdict") */}
              <ReasoningPanel reasoning={result.reasoning} />

              {/* "Create a case from this" CTA Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCreateCaseFromCheck}
                  disabled={creatingCase}
                  className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{creatingCase ? 'Creating Case...' : 'Create a Case From This Findings'}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl glass-card border border-slate-200 dark:border-white/10 p-12 text-center text-slate-400 text-xs space-y-3">
              <FileImage className="w-10 h-10 mx-auto opacity-40" />
              <p className="font-medium text-slate-600 dark:text-slate-300">
                Upload a payment screenshot on the left to run anti-fraud risk analysis.
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Analyzes timestamp consistency, font editing artifacts, UTR structure, and payment gateway layout indicators.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
