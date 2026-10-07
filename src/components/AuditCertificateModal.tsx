import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  X,
  FileText,
  Lock,
} from "lucide-react";
import { ComplianceEvaluation } from "../types/remittance";

interface AuditCertificateModalProps {
  evaluation: ComplianceEvaluation | null;
  onClose: () => void;
}

export const AuditCertificateModal: React.FC<AuditCertificateModalProps> = ({
  evaluation,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!evaluation) return null;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(evaluation, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isApproved = evaluation.status === "APPROVED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        {/* Certificate Top Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                Official Regulatory Audit Document
              </div>
              <h3 className="text-sm font-bold text-white">
                FEMA 1999 & LRS Statutory Compliance Certificate
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 md:p-8 space-y-6 bg-slate-900">
          {/* Certificate Badge and ID Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Certificate Tracking Identifier:
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {evaluation.auditCertificateId}
              </span>
              <div className="text-[11px] text-slate-400 mt-1">
                Issued on: {new Date(evaluation.timestamp).toUTCString()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isApproved ? (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>APPROVED UNDER CONFIGURED RULES</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-600/40 text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>TRANSACTION PROHIBITED</span>
                </div>
              )}
            </div>
          </div>

          {/* Legal Compliance Decision Prose */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Statutory Finding & Legal Reasoning:
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-slate-200 leading-relaxed font-sans">
              {evaluation.humanReadableExplanation}
            </div>
          </div>

          {/* Multi-Factor Audit Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Compliance Score</span>
              <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                {evaluation.legalityScore} / 100
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Sanctions & Watchlist</span>
              <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                {evaluation.riskBreakdown?.sanctionScreening || "CLEAR"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">PMLA Single-Origin</span>
              <span className="text-sm font-bold font-mono text-cyan-400 mt-0.5 block">
                VERIFIED (UPI)
              </span>
            </div>
          </div>

          {/* Statutory References */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Enforced Regulatory Directives:
            </span>
            <div className="space-y-1">
              {evaluation.regulatoryBasis.map((r, i) => (
                <div
                  key={i}
                  className="text-xs font-mono text-slate-300 p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-2"
                >
                  <span className="text-cyan-400">§</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Signature Footer */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">
                AI-Assisted Assessment by TrustBridge Compliance Engine (Gemini + Configured FEMA Rules)
              </span>
            </div>
            <span className="text-amber-400/70 shrink-0 font-semibold ml-2">Prototype Simulation</span>
          </div>
        </div>

        {/* Certificate Actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "JSON Copied!" : "Copy JSON Audit Trail"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
