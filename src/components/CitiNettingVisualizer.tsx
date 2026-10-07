import React, { useState, useEffect } from "react";
import {
  Building2,
  RefreshCw,
  Zap,
  TrendingUp,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Clock,
  Sparkles,
} from "lucide-react";
import { CORRIDORS } from "../data/mockData";

export const CitiNettingVisualizer: React.FC = () => {
  const [nettingCycleSeconds, setNettingCycleSeconds] = useState<number>(74);
  const [isNettingBatch, setIsNettingBatch] = useState<boolean>(false);
  const [clearedBatchesCount, setClearedBatchesCount] = useState<number>(142);
  const [swiftHopsAvoided, setSwiftHopsAvoided] = useState<number>(18492);
  const [totalSavedUSD, setTotalSavedUSD] = useState<number>(785910);

  // Periodic netting countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNettingCycleSeconds((prev) => {
        if (prev <= 1) {
          triggerBatchNetting();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerBatchNetting = () => {
    setIsNettingBatch(true);
    setTimeout(() => {
      setClearedBatchesCount((prev) => prev + 1);
      setSwiftHopsAvoided((prev) => prev + 14);
      setTotalSavedUSD((prev) => prev + 595);
      setIsNettingBatch(false);
      setNettingCycleSeconds(120);
    }, 1800);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-purple-400">
                  Global Liquidity & Clearing Layer
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">Citi Network Bilateral Settlement</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Pre-Funded Nostro Accounts & Bulk Netting Engine
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerBatchNetting}
              disabled={isNettingBatch}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isNettingBatch ? "animate-spin" : ""}`} />
              <span>{isNettingBatch ? "Netting Ledger..." : "Trigger Netting Batch"}</span>
            </button>
          </div>
        </div>

        {/* Real Quantitative Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">SWIFT Hops Avoided</span>
            <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums mt-0.5 block">
              {swiftHopsAvoided.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">0 intermediary banks</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Cumulative Fees Saved</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums mt-0.5 block">
              ${totalSavedUSD.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Vs. $35-45/wire fees</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Netting Cycle Interval</span>
            <span className="text-lg font-bold font-mono text-amber-400 tabular-nums mt-0.5 block">
              {nettingCycleSeconds}s remaining
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Auto-settling batch</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Netted Batches Cleared</span>
            <span className="text-lg font-bold font-mono text-purple-400 tabular-nums mt-0.5 block">
              {clearedBatchesCount} Batches Today
            </span>
            <span className="text-[10px] text-slate-500 font-mono">99.4% netting efficiency</span>
          </div>
        </div>
      </div>

      {/* Pre-Funded Local Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Active Nostro & Vostro Liquidity Pools</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Pre-funded by Citi Treasury</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Mumbai Inbound Vostro */}
          <div className="rounded-xl bg-slate-900/90 border border-cyan-500/40 p-4 shadow-lg ring-1 ring-cyan-500/20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇮🇳</span>
                <div>
                  <span className="text-xs font-bold text-white">Mumbai Central Vostro</span>
                  <div className="text-[10px] font-mono text-cyan-400">CITI-MUM-VOSTRO-001-INR</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                ACTIVE
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <span className="text-[11px] text-slate-400 block">Inbound UPI Liquidity:</span>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                ₹14,52,00,000 <span className="text-xs text-slate-400 font-sans font-normal">(₹14.52 Cr)</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
              <span>Clearing Rail:</span>
              <span className="text-slate-200 font-mono">NPCI UPI 2.0 / IMPS</span>
            </div>
          </div>

          {/* Foreign Nostro Accounts */}
          {Object.values(CORRIDORS).map((c) => (
            <div
              key={c.code}
              className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-lg hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.flag}</span>
                  <div>
                    <span className="text-xs font-bold text-white">{c.country} ({c.code})</span>
                    <div className="text-[10px] font-mono text-slate-400">{c.nostroAccount}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  {c.clearingRail.split("/")[0]}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <span className="text-[11px] text-slate-400 block">Available Local Liquidity:</span>
                <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                  {c.code === "USD" ? "$" : c.code === "EUR" ? "€" : c.code === "GBP" ? "£" : "$"}
                  {c.availableLiquidity.toLocaleString()} {c.code}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                <span>Avg. Local Payout:</span>
                <span className="text-cyan-400 font-mono font-semibold">{c.avgSettlementSec}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep Architectural Contrast: Why No SWIFT Hop & No Crypto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
            <ArrowRightLeft className="w-4 h-4" />
            <span>Why TrustBridge Eliminates The SWIFT Hop</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-2">
            Traditional SWIFT Correspondent Banking Inefficiency
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            In standard banking, sending money from India to the US requires 3 to 4 correspondent banks.
            Each intermediary bank deducts a $15–$25 fee, takes 24–48 hours to reconcile, and creates manual error risk.
          </p>
          <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-slate-200">The TrustBridge Netting Model:</div>
            <p className="text-[11px] text-slate-400">
              The sender pays via UPI into Citi Mumbai's Vostro pool. Simultaneously, Citi disburses local currency directly from its New York Nostro pool via FedNow/ACH. The gross bilateral flows between the two desks are netted in aggregated institutional blocks, eliminating 100% of individual wire fees.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Why TrustBridge Uses Zero Crypto Layers</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-2">
            Eliminating Regulatory Friction & FX Volatility
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Crypto-based remittance solutions (stablecoins, bridges) face severe regulatory hurdles in India:
            RBI restrictions, FEMA Schedule I prohibitions, 30% flat taxation, and costly off-ramp spreads.
          </p>
          <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-slate-200">Pure Sovereign Fiat Rails:</div>
            <p className="text-[11px] text-slate-400">
              TrustBridge operates exclusively within the regulated banking perimeter (NPCI UPI + Citi Global Transaction Services). Senders get institutional security, clean tax compliance certificates, and zero slippage or off-ramp conversion friction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
