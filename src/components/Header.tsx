import React from "react";
import { ShieldCheck, RefreshCw, ArrowUpRight } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewTransferClick: () => void;
  totalLiquidityUSD: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewTransferClick,
  totalLiquidityUSD,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto grid grid-cols-[auto_1fr] items-center gap-4 px-6 py-3.5 lg:grid-cols-[auto_minmax(0,1fr)_auto] xl:gap-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center justify-self-end gap-3">
          <button
            onClick={() => setActiveTab("remit")}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-inner">
              <span className="font-bold text-white text-base tracking-tighter">TB</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              TrustBridge
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden min-w-0 items-center justify-center gap-3 text-xs font-medium lg:flex xl:gap-5 xl:text-sm 2xl:gap-6">
          <button
            onClick={() => setActiveTab("remit")}
            className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
              activeTab === "remit"
                ? "text-cyan-400 border-b-2 border-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Remittance Rail
          </button>
          <button
            onClick={() => setActiveTab("legality")}
            className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
              activeTab === "legality"
                ? "text-cyan-400 border-b-2 border-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            AI Compliance Assessment
          </button>
          <button
            onClick={() => setActiveTab("netting")}
            className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
              activeTab === "netting"
                ? "text-cyan-400 border-b-2 border-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Citi Bulk Netting
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
              activeTab === "ledger"
                ? "text-cyan-400 border-b-2 border-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Transaction Ledger
          </button>
          <button
            onClick={() => setActiveTab("protocol")}
            className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
              activeTab === "protocol"
                ? "text-cyan-400 border-b-2 border-cyan-400 font-semibold"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Architecture & Protocol
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <div className="hidden 2xl:flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tabular-nums font-mono text-slate-300">Citi Liquidity: ${totalLiquidityUSD}</span>
          </div>

          <button
            onClick={onNewTransferClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-md transition-all whitespace-nowrap shadow-sm cursor-pointer"
          >
            <span>Simulate Transfer</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
