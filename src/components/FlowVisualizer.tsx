import React, { useState } from "react";
import {
  CreditCard,
  UserCheck,
  Cpu,
  Lock,
  Building2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";

interface FlowVisualizerProps {
  currentStepIndex?: number; // 0 to 5
  isProcessing?: boolean;
}

export const FLOW_STEPS = [
  {
    id: "upi",
    stepNumber: "01",
    title: "UPI Inbound Debit",
    sub: "Direct from Sender Bank",
    icon: CreditCard,
    accent: "from-blue-500 to-indigo-600",
    description:
      "Money enters ONLY from the sender's verified bank account via UPI Auto-collect. 0 third-party pay-ins permitted, strictly adhering to PMLA and eliminating account fraud.",
    specs: ["Single-origin mandate", "Bank account VPA verification", "Instant NPCI rails"],
  },
  {
    id: "kyc",
    stepNumber: "02",
    title: "Instant KYC Reuse",
    sub: "CKYC Registry Match",
    icon: UserCheck,
    accent: "from-cyan-500 to-blue-600",
    description:
      "Reuses verified domestic bank KYC via Central KYC (CKYC) registry. No redundant document uploads, no 48-hour wait.",
    specs: ["CKYC 14-digit identifier", "PAN validation", "Real-time Aadhaar linkage verification"],
  },
  {
    id: "risk",
    stepNumber: "03",
    title: "AI Compliance Assessment",
    sub: "Configured FEMA & LRS Rules",
    icon: Cpu,
    accent: "from-emerald-500 to-teal-600",
    description:
      "AI-assisted compliance assessment evaluates every remittance using configured regulatory rules BEFORE money moves, with human-readable explanations citing RBI Master Directions. Not a legally binding determination.",
    specs: ["Configured FEMA Schedule III checks", "LRS $250k ceiling tracker", "Sanction/PEP screening"],
  },
  {
    id: "fx",
    stepNumber: "04",
    title: "Locked FX Rate",
    sub: "Guaranteed 15-Min Freeze",
    icon: Lock,
    accent: "from-amber-500 to-yellow-600",
    description:
      "Interbank mid-market rate locked for 15 minutes. 0.35% transparent margin vs 3.5% traditional banking spread, protecting against market slippage.",
    specs: ["0.35% fixed spread", "Zero hidden markup", "15-minute guarantee window"],
  },
  {
    id: "citi",
    stepNumber: "05",
    title: "Citi Bulk Netting",
    sub: "Pre-Funded Nostro Queue",
    icon: Building2,
    accent: "from-purple-500 to-pink-600",
    description:
      "Settles through Citi's pre-funded local accounts abroad. Inbound UPI credits are aggregated and bilaterally netted in batches, completely bypassing the SWIFT network.",
    specs: ["Zero per-tx SWIFT fees", "Bilateral batch netting", "No volatile crypto intermediate"],
  },
  {
    id: "payout",
    stepNumber: "06",
    title: "Local Payout Received",
    sub: "Instant Clearing Abroad",
    icon: CheckCircle2,
    accent: "from-emerald-400 to-green-500",
    description:
      "Beneficiary receives local fiat currency directly in their foreign bank account via instant local rails (FedNow/ACH in US, SEPA in EU, FPS in UK, PayNow in Singapore).",
    specs: ["FedNow / SEPA / FPS / PayNow", "Full amount credited", "Average latency: 28 seconds"],
  },
];

export const FlowVisualizer: React.FC<FlowVisualizerProps> = ({
  currentStepIndex = -1,
  isProcessing = false,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(
    currentStepIndex >= 0 ? currentStepIndex : 0
  );

  const active = currentStepIndex >= 0 ? currentStepIndex : selectedStep;
  const stepDetail = FLOW_STEPS[selectedStep];

  return (
    <div className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-5 md:p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
              The TrustBridge Rail Architecture
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Zero-SWIFT · Zero-Crypto · Bulk Netted</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">
            End-to-End UPI Cross-Border Remittance Pipeline
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Avg. Payout: 28s
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 font-mono text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Configured FEMA Rules
          </span>
        </div>
      </div>

      {/* 6 Step Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 my-5">
        {FLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrentInLiveProcess = isProcessing && currentStepIndex === idx;
          const isPassedInLiveProcess = isProcessing && currentStepIndex > idx;
          const isSelected = selectedStep === idx;

          return (
            <button
              key={step.id}
              onClick={() => setSelectedStep(idx)}
              className={`relative text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between min-h-[118px] ${
                isSelected
                  ? "bg-slate-800/90 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30"
                  : isPassedInLiveProcess
                  ? "bg-slate-900/90 border-emerald-500/50"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[10px] font-mono font-semibold tracking-wider ${
                    isSelected ? "text-cyan-400" : "text-slate-500"
                  }`}
                >
                  {step.stepNumber}
                </span>

                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    isCurrentInLiveProcess
                      ? "bg-cyan-500 text-slate-950 animate-pulse"
                      : isPassedInLiveProcess
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isSelected
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="mt-2">
                <div className="text-xs font-semibold text-slate-200 line-clamp-1">{step.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{step.sub}</div>
              </div>

              {/* Progress bar line if in flight */}
              {isCurrentInLiveProcess && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Step Expanded Details */}
      <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-cyan-400">
              {React.createElement(stepDetail.icon, { className: "w-5 h-5" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-cyan-400">
                  Step {stepDetail.stepNumber}
                </span>
                <span className="text-slate-600">·</span>
                <h3 className="text-sm font-bold text-white">{stepDetail.title}</h3>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">{stepDetail.sub}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {stepDetail.description}
              </p>
            </div>
          </div>

          <div className="flex md:flex-col gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
            {stepDetail.specs.map((spec, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
