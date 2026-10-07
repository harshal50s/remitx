import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronDown,
  Sparkles,
  Zap,
  Building,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { CORRIDORS, PURPOSE_CODES, PRESET_SCENARIOS } from "../data/mockData";
import { CorridorConfig, ComplianceEvaluation, TransactionRecord } from "../types/remittance";

interface RemittancePortalProps {
  onEvaluationComplete: (evalResult: ComplianceEvaluation, txnParams: any) => void;
  onExecuteSettlement: (txnParams: any, evalResult: ComplianceEvaluation) => Promise<TransactionRecord>;
  isProcessing: boolean;
  activeCorridorCode: string;
  setActiveCorridorCode: (code: string) => void;
}

export const RemittancePortal: React.FC<RemittancePortalProps> = ({
  onEvaluationComplete,
  onExecuteSettlement,
  isProcessing,
  activeCorridorCode,
  setActiveCorridorCode,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number | null>(0);
  const corridor: CorridorConfig = CORRIDORS[activeCorridorCode] || CORRIDORS.USD;

  // Form states
  const [amountINR, setAmountINR] = useState<number>(430000);
  const [senderName, setSenderName] = useState<string>("Aarav Sharma");
  const [senderVpa, setSenderVpa] = useState<string>("aarav.sharma@okhdfcbank");
  const [senderBank, setSenderBank] = useState<string>("HDFC Bank (Verified Salary A/C ****4821)");
  const [senderPan, setSenderPan] = useState<string>("ABCPS1829K");

  const [recipientName, setRecipientName] = useState<string>("Columbia University - Bursar Office");
  const [recipientAccount, setRecipientAccount] = useState<string>("084920194821");
  const [recipientRouting, setRecipientRouting] = useState<string>("021000021");
  const [purposeCode, setPurposeCode] = useState<string>("S0305");

  // Rate lock timer countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(884);

  // Evaluation & modal state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<ComplianceEvaluation | null>(null);
  const [showUpiModal, setShowUpiModal] = useState<boolean>(false);
  const [upiPin, setUpiPin] = useState<string>("4821");
  const [upiPinError, setUpiPinError] = useState<string | null>(null);
  const [executionStep, setExecutionStep] = useState<number>(-1);
  const [completedTxn, setCompletedTxn] = useState<TransactionRecord | null>(null);

  // 15-minute countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute foreign currency amount based on locked rate
  const amountForeign = (amountINR * corridor.rateINR).toFixed(2);
  const trustBridgeFeeINR = Math.round(corridor.trustBridgeFeeUSD * corridor.inverseRate);
  const swiftFeeINR = Math.round(corridor.swiftEquivalentFeeUSD * corridor.inverseRate);
  const totalSavingsINR = swiftFeeINR - trustBridgeFeeINR + Math.round(amountINR * 0.028); // SWIFT fee + 2.8% spread markup savings

  // Apply scenario preset
  const handleSelectPreset = (index: number) => {
    setSelectedScenarioIndex(index);
    const preset = PRESET_SCENARIOS[index];
    setSenderName(preset.senderName);
    setSenderVpa(preset.senderVpa);
    setSenderBank(preset.senderBank);
    setSenderPan(preset.senderPan);
    setRecipientName(preset.recipientName);
    setActiveCorridorCode(preset.recipientCurrency);
    setRecipientAccount(preset.recipientAccount);
    setRecipientRouting(preset.recipientRouting);
    setAmountINR(preset.amountINR);
    setPurposeCode(preset.purposeCode);
    setEvaluation(null);
    setCompletedTxn(null);
  };

  // Trigger AI Legality Evaluation
  const handleEvaluateCompliance = async () => {
    setIsEvaluating(true);
    setEvaluation(null);
    setCompletedTxn(null);

    const payload = {
      amountINR,
      recipientCurrency: corridor.code,
      purposeCode,
      purposeCategory: PURPOSE_CODES.find((p) => p.code === purposeCode)?.category || "General Remittance",
      senderName,
      senderVpa,
      senderBank,
      senderPan,
      recipientName,
      recipientCountry: corridor.country,
      recipientAccount,
      lrsUtilizedYTD: 24500,
    };

    try {
      const res = await fetch("/api/evaluate-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: ComplianceEvaluation = await res.json();
      setEvaluation(data);
      onEvaluationComplete(data, payload);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Confirm and Execute Transfer
  const handleConfirmAndPay = async () => {
    if (!evaluation) return;
    if (upiPin !== "4821") {
      setUpiPinError("Incorrect sandbox PIN. Enter 4821 to continue.");
      return;
    }

    setShowUpiModal(false);
    setUpiPinError(null);
    setExecutionStep(0);

    const payload = {
      senderName,
      senderVpa,
      senderBank,
      senderPan,
      recipientName,
      recipientCountry: corridor.country,
      recipientCurrency: corridor.code,
      recipientAccount,
      recipientRouting,
      amountINR,
      purposeCode,
      purposeDescription: PURPOSE_CODES.find((p) => p.code === purposeCode)?.title || "Cross-Border Remittance",
      complianceResult: evaluation,
    };

    // Step-by-step UI progression simulation for realistic feel
    const stepInterval = setInterval(() => {
      setExecutionStep((prev) => {
        if (prev >= 5) {
          clearInterval(stepInterval);
          return 5;
        }
        return prev + 1;
      });
    }, 600);

    try {
      const txn = await onExecuteSettlement(payload, evaluation);
      setCompletedTxn(txn);
    } catch (e) {
      console.error("Settlement failed", e);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="w-full space-y-6">
      {/* Preset Scenarios Selector Ribbon */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Quick Test Scenarios
            </span>
          </div>
          <span className="text-xs text-slate-400">Click to autofill authentic institutional & edge cases</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {PRESET_SCENARIOS.map((preset, idx) => {
            const isSelected = selectedScenarioIndex === idx;
            const isProhibited = preset.purposeCode.includes("PROHIBITED");
            return (
              <button
                key={idx}
                onClick={() => handleSelectPreset(idx)}
                className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? isProhibited
                      ? "bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500/40"
                      : "bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/40"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold line-clamp-1 ${
                      isProhibited ? "text-rose-300" : "text-white"
                    }`}
                  >
                    {preset.label}
                  </span>
                  {isProhibited && (
                    <span className="text-[10px] text-rose-400 font-mono font-semibold">TEST BLOCK</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Remittance Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transfer & Corridor Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 md:p-6 shadow-xl">
            {/* Step Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div>
                <span className="text-xs font-mono font-semibold text-cyan-400">1. ORIGINATION & DESTINATION</span>
                <h3 className="text-base font-bold text-white mt-0.5">Configure Cross-Border Payment</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rate Lock: {timeFormatted}</span>
              </div>
            </div>

            {/* Corridor Selector Tabs */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-400 block mb-2">
                Select Destination Payout Rail & Currency:
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {Object.values(CORRIDORS).map((c) => {
                  const isActive = activeCorridorCode === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => {
                        setActiveCorridorCode(c.code);
                        setEvaluation(null);
                        setCompletedTxn(null);
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? "bg-slate-800 border-cyan-400 ring-1 ring-cyan-400/30 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-xl mb-1">{c.flag}</span>
                      <span className="text-xs font-bold tracking-tight">{c.code}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{c.clearingRail.split("/")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Inputs with Live Conversion */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* You Send (INR) */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>You Pay via UPI (INR)</span>
                  <span className="font-mono text-cyan-400">NPCI Rail</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-mono font-bold text-white mr-2">₹</span>
                  <input
                    type="number"
                    value={amountINR}
                    onChange={(e) => {
                      setAmountINR(Math.max(100, Number(e.target.value)));
                      setEvaluation(null);
                      setCompletedTxn(null);
                    }}
                    className="w-full bg-transparent text-xl font-mono font-bold text-white focus:outline-none tabular-nums"
                  />
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                    INR
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>From: Verified Bank A/C</span>
                  <span className="text-emerald-400 font-mono">Zero UPI fee</span>
                </div>
              </div>

              {/* Recipient Receives (Foreign) */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>Recipient Receives Net</span>
                  <span className="font-mono text-cyan-400">{corridor.clearingRail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-mono font-bold text-emerald-400 mr-2">
                    {corridor.code === "USD" ? "$" : corridor.code === "EUR" ? "€" : corridor.code === "GBP" ? "£" : "$"}
                  </span>
                  <span className="w-full text-xl font-mono font-bold text-emerald-400 tabular-nums">
                    {Number(amountForeign).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                    {corridor.code}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>Rate: 1 {corridor.code} = ₹{corridor.inverseRate.toFixed(2)}</span>
                  <span className="text-cyan-400 font-mono">Locked 15m</span>
                </div>
              </div>
            </div>

            {/* Sender Verified Identity Box (Highlighting single-origin rule) */}
            <div className="mt-5 p-3.5 rounded-lg bg-blue-950/20 border border-blue-900/40">
              <div className="flex items-center justify-between text-xs text-blue-300 mb-2 font-semibold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Sender Verified Bank Account (Single-Origin UPI Mandate)</span>
                </div>
                <span className="text-[10px] text-blue-400 font-mono">PMLA Rule 3(1) Verified</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Sender & PAN:</span>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {senderName} · <span className="font-mono text-cyan-300">{senderPan}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Verified UPI ID (VPA):</span>
                  <div className="font-mono text-slate-200 mt-0.5">{senderVpa}</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 border-t border-blue-900/30 pt-2">
                🔒 Security Guarantee: TrustBridge only accepts remittances originating from the sender's own Aadhaar-PAN verified bank account. Third-party deposits are strictly prohibited.
              </p>
            </div>

            {/* FEMA Purpose Code Selector */}
            <div className="mt-5">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                RBI FEMA Purpose Code (Required for LRS Schedule III):
              </label>
              <select
                value={purposeCode}
                onChange={(e) => {
                  setPurposeCode(e.target.value);
                  setEvaluation(null);
                  setCompletedTxn(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {PURPOSE_CODES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code} - {p.title}
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-400 mt-1">
                {PURPOSE_CODES.find((p) => p.code === purposeCode)?.description}
              </div>
            </div>

            {/* Beneficiary Details */}
            <div className="mt-5 space-y-3">
              <div className="text-xs font-mono font-semibold text-cyan-400">
                BENEFICIARY LOCAL CLEARING DETAILS
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Recipient Legal Name:</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {corridor.recipientAccountLabel}:
                  </label>
                  <input
                    type="text"
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {corridor.recipientRoutingLabel}:
                </label>
                <input
                  type="text"
                  value={recipientRouting}
                  onChange={(e) => setRecipientRouting(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Primary Action Button: Evaluate AI Legality */}
            <div className="mt-6">
              <button
                onClick={handleEvaluateCompliance}
                disabled={isEvaluating}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>AI Compliance Assessment Running (FEMA & LRS Rules)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Evaluate Compliance & Lock FX Rate</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Fee Analytics & Live Settlement Confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Side-by-side SWIFT vs TrustBridge comparison */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cost & Execution Comparison
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-emerald-400 font-semibold font-mono">
                  Save ₹{totalSavingsINR.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">(Simulated)</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* TrustBridge Layer */}
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-xs font-bold text-white">TrustBridge (UPI + Citi Netting)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    ₹{trustBridgeFeeINR} (~${corridor.trustBridgeFeeUSD})
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-cyan-900/30">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Settlement Speed:</span>
                    <span className="text-emerald-400 font-semibold font-mono">~{corridor.avgSettlementSec} Seconds</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Intermediary Hops:</span>
                    <span className="text-slate-200 font-semibold font-mono">0 (Pre-funded Netting)</span>
                  </div>
                </div>
              </div>

              {/* Traditional SWIFT Hop */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-xs font-semibold text-slate-400">Traditional SWIFT Wire</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 line-through">
                    ₹{swiftFeeINR} (~${corridor.swiftEquivalentFeeUSD})
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Settlement Speed:</span>
                    <span className="text-amber-400 font-mono">3 to 5 Business Days</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Intermediary Hops:</span>
                    <span className="text-rose-400 font-mono">3-4 Correspondent Banks</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400">
              💡 <strong className="text-slate-300">Simulated comparison:</strong> In this model, money never leaves domestic banking in individual wires. Inbound UPI enters Citi Mumbai Vostro, and Citi disburses from pre-funded foreign accounts, batch-netting the aggregate ledger.
            </div>
          </div>

          {/* AI Legality Result Card (if evaluated) */}
          {evaluation && (
            <div
              className={`rounded-xl border p-5 shadow-xl transition-all ${
                evaluation.status === "APPROVED"
                  ? "bg-slate-900/90 border-emerald-500/60 ring-1 ring-emerald-500/20"
                  : evaluation.status === "FLAGGED_FOR_REVIEW"
                  ? "bg-slate-900/90 border-amber-500/60 ring-1 ring-amber-500/20"
                  : "bg-slate-900/90 border-rose-500/60 ring-1 ring-rose-500/20"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {evaluation.status === "APPROVED" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : evaluation.status === "FLAGGED_FOR_REVIEW" ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                  <div>
                    <span
                      className={`text-xs font-bold tracking-wide ${
                        evaluation.status === "APPROVED"
                          ? "text-emerald-400"
                          : evaluation.status === "FLAGGED_FOR_REVIEW"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      AI COMPLIANCE SCORE: {evaluation.legalityScore}/100
                    </span>
                    <div className="text-[11px] text-slate-400">
                      Status: {evaluation.status.replace(/_/g, " ")}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Confidence: {evaluation.confidenceScore}%
                </span>
              </div>

              {/* Human-Readable Explanation */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Compliance Officer Explanation:
                </div>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                  {evaluation.humanReadableExplanation}
                </p>
              </div>

              {/* Regulatory Citations */}
              <div className="mt-3">
                <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Statutory Basis:</div>
                <div className="space-y-1">
                  {evaluation.regulatoryBasis.map((basis, i) => (
                    <div key={i} className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400" />
                      <span>{basis}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TCS Notice if applicable */}
              {evaluation.tcsApplicable && (
                <div className="mt-3 p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300">
                  ⚠️ Section 206C(1G) TCS Notice: Transfer exceeds ₹7,00,000 threshold. 20% TCS of ₹
                  {evaluation.tcsAmountINR?.toLocaleString()} calculated.
                </div>
              )}

              {/* Audit Certificate Number */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Certificate: {evaluation.auditCertificateId}</span>
                <span className="text-emerald-400">Citi Clearance OK</span>
              </div>

              {/* Trigger Payment Button if Approved */}
              {evaluation.status === "APPROVED" && !completedTxn && (
                <button
                  onClick={() => {
                    setUpiPinError(null);
                    setShowUpiModal(true);
                  }}
                  className="mt-4 w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorize UPI Payment & Dispatch Citi Local Payout</span>
                </button>
              )}

              {evaluation.status === "REJECTED" && (
                <div className="mt-4 p-2.5 rounded bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 text-center font-semibold">
                  🛑 Transaction Blocked: Prohibited under RBI FEMA Regulations. No UPI collect request generated.
                </div>
              )}
            </div>
          )}

          {/* Completed Transaction Receipt */}
          {completedTxn && (
            <div className="rounded-xl bg-slate-900/90 border border-emerald-500/80 p-5 shadow-2xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Simulated Settlement Complete!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ₹{completedTxn.amountINR.toLocaleString()} simulated UPI debit from {completedTxn.senderBank}. Simulated local payout of{" "}
                <span className="font-bold text-emerald-400">
                  {completedTxn.recipientCurrency} {completedTxn.amountForeign.toLocaleString()}
                </span>{" "}
                dispatched via {corridor.clearingRail} to {completedTxn.recipientName}.
              </p>
              <div className="mt-3 p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 space-y-1">
                <div>Txn Ref: {completedTxn.id}</div>
                <div>Citi Batch: {completedTxn.bulkBatchId}</div>
                <div>Simulated Latency: {(completedTxn.settlementLatencyMs / 1000).toFixed(1)}s</div>
                <div className="text-cyan-400 truncate">Audit Hash: {completedTxn.auditHash}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulated UPI Collect PIN Authorization Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                  UPI
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">UPI Mandate Authorization</h4>
                  <span className="text-[10px] text-slate-400">NPCI Cross-Border Collector</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-white">₹{amountINR.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 text-xs space-y-1.5 border border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Payer Account:</span>
                <span className="text-slate-200 font-mono">{senderBank}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Virtual Payment Address:</span>
                <span className="text-cyan-400 font-mono">{senderVpa}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Beneficiary Abroad:</span>
                <span className="text-slate-200">{recipientName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Foreign Rail:</span>
                <span className="text-emerald-400 font-mono">
                  {corridor.code} {amountForeign} ({corridor.clearingRail})
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Enter 4-Digit UPI PIN:</label>
              <input
                type="password"
                maxLength={4}
                value={upiPin}
                onChange={(e) => {
                  setUpiPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                  setUpiPinError(null);
                }}
                className="w-full text-center tracking-[1em] font-mono text-xl py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-1">
                Simulated Sandbox PIN (Default: 4821)
              </span>
              {upiPinError && (
                <span role="alert" className="text-[11px] text-rose-400 block text-center mt-2">
                  {upiPinError}
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowUpiModal(false)}
                className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAndPay}
                className="w-1/2 py-2 text-xs font-bold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                Confirm UPI Debit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
