import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { FlowVisualizer } from "./components/FlowVisualizer";
import { RemittancePortal } from "./components/RemittancePortal";
import { AILegalityInspector } from "./components/AILegalityInspector";
import { CitiNettingVisualizer } from "./components/CitiNettingVisualizer";
import { TransactionLedger } from "./components/TransactionLedger";
import { ArchitectureDocs } from "./components/ArchitectureDocs";
import { AuditCertificateModal } from "./components/AuditCertificateModal";
import { ComplianceEvaluation, TransactionRecord } from "./types/remittance";
import { ArrowUpRight, ShieldCheck, Zap, Layers, RefreshCw } from "lucide-react";
import heroSettlementRails from "./assets/images/hero_settlement_rails_1791371311740.jpg";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("remit");
  const [activeCorridorCode, setActiveCorridorCode] = useState<string>("USD");

  // Transactions state
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [totalLiquidityUSD, setTotalLiquidityUSD] = useState<string>("39.8M");
  const [lastEvaluation, setLastEvaluation] = useState<ComplianceEvaluation | null>(null);

  // Modal state
  const [certificateModalEval, setCertificateModalEval] = useState<ComplianceEvaluation | null>(null);

  // Fetch initial fx rates and transactions
  useEffect(() => {
    fetch("/api/fx-rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.pools) {
          const sum = data.pools.reduce((acc: number, p: any) => acc + p.availableLiquidity, 0);
          setTotalLiquidityUSD((sum / 1000000).toFixed(1) + "M");
        }
      })
      .catch((err) => console.warn("Could not load fx-rates:", err));

    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions) {
          setTransactions(data.transactions);
        }
      })
      .catch((err) => console.warn("Could not load transactions:", err));
  }, []);

  // Handle new evaluation completed in portal
  const handleEvaluationComplete = (evalResult: ComplianceEvaluation) => {
    setLastEvaluation(evalResult);
  };

  // Execute settlement
  const handleExecuteSettlement = async (
    txnParams: any,
    evalResult: ComplianceEvaluation
  ): Promise<TransactionRecord> => {
    const res = await fetch("/api/execute-settlement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...txnParams,
        complianceResult: evalResult,
      }),
    });
    const data = await res.json();
    if (data.transaction) {
      setTransactions((prev) => [data.transaction, ...prev]);
      return data.transaction;
    }
    throw new Error("Settlement failed");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar adhering to 3-Zone Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewTransferClick={() => setActiveTab("remit")}
        totalLiquidityUSD={totalLiquidityUSD}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Editorial Hero Area */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 md:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-xs font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>UPI Funding · AI Compliance · FX Lock · Citi Netting · Local Payout</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Compliance-First Cross-Border Remittances. Zero SWIFT Hops. Zero Crypto.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                UPI-powered funding with AI-assisted compliance, transparent FX, institutional liquidity and auditable settlement.
                The sender pays through their verified Indian bank account; compliance runs before the money moves — not after.
              </p>

              <p className="text-xs text-amber-400/80 font-mono border border-amber-800/40 bg-amber-950/20 rounded px-3 py-1.5 w-fit">
                ⚠️ Prototype simulation — not a live money-transfer service or legal determination.
              </p>

              {/* Mechanism Chain */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="text-slate-200">UPI Funding</span>
                <span>→</span>
                <span className="text-slate-200">Verified KYC</span>
                <span>→</span>
                <span className="text-emerald-400">AI Compliance</span>
                <span>→</span>
                <span className="text-slate-200">Locked FX</span>
                <span>→</span>
                <span className="text-purple-400">Citi Netting</span>
                <span>→</span>
                <span className="text-cyan-400">Local Payout</span>
              </div>
            </div>

            {/* Right Visual Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
                <img
                  src={heroSettlementRails}
                  alt="TrustBridge Global Liquidity Settlement Network"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="text-cyan-400">CITI GLOBAL NETTING POOLS</span>
                  <span className="text-emerald-400">FEDNOW / SEPA / FPS DIRECT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6-Step End-to-End Architecture Flow Visualizer */}
        <section>
          <FlowVisualizer />
        </section>

        {/* Active View Container */}
        <section className="pt-2">
          {activeTab === "remit" && (
            <RemittancePortal
              onEvaluationComplete={handleEvaluationComplete}
              onExecuteSettlement={handleExecuteSettlement}
              isProcessing={false}
              activeCorridorCode={activeCorridorCode}
              setActiveCorridorCode={setActiveCorridorCode}
            />
          )}

          {activeTab === "legality" && (
            <AILegalityInspector
              lastEvaluation={lastEvaluation}
              onOpenCertificateModal={(evalResult) => setCertificateModalEval(evalResult)}
            />
          )}

          {activeTab === "netting" && <CitiNettingVisualizer />}

          {activeTab === "ledger" && (
            <TransactionLedger
              transactions={transactions}
              onSelectTransaction={() => {}}
              onOpenCertificateModal={(evalResult) => setCertificateModalEval(evalResult)}
            />
          )}

          {activeTab === "protocol" && <ArchitectureDocs />}
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">TrustBridge</span>
            <span className="text-slate-600">·</span>
            <span>Compliance-First Cross-Border Remittance Layer</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span>Configured FEMA 1999 Rules</span>
            <span>·</span>
            <span>PMLA Rule 3(1) Single-Origin</span>
            <span>·</span>
            <span>RBI Master Direction No. 7/2015-16</span>
          </div>

          <div className="text-slate-500 font-mono text-[11px] text-center">
            <div>Zero SWIFT Hops · Zero Volatile Crypto</div>
            <div className="text-amber-600/60 mt-0.5">Prototype simulation — not a live service or legal determination.</div>
          </div>
        </div>
      </footer>

      {/* Official Audit Certificate Modal */}
      {certificateModalEval && (
        <AuditCertificateModal
          evaluation={certificateModalEval}
          onClose={() => setCertificateModalEval(null)}
        />
      )}
    </div>
  );
}
