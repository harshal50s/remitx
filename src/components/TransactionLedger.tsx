import React, { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  ChevronRight,
  Award,
} from "lucide-react";
import { TransactionRecord } from "../types/remittance";

interface TransactionLedgerProps {
  transactions: TransactionRecord[];
  onSelectTransaction: (txn: TransactionRecord) => void;
  onOpenCertificateModal: (evalResult: any) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  onSelectTransaction,
  onOpenCertificateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.purposeCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "COMPLETED") return matchesSearch && t.status === "COMPLETED";
    if (statusFilter === "REJECTED") return matchesSearch && t.status === "REJECTED";
    return matchesSearch;
  });

  return (
    <div className="w-full space-y-5">
      {/* Search and Segmented Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions, VPAs, purpose codes, or recipients..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Functional Segmented Control Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Transfers ({transactions.length})
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === "COMPLETED"
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Settled Local
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === "REJECTED"
                ? "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            AI Blocked
          </button>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 bg-slate-950/60">
                <th className="py-3 px-4 font-semibold">TRANSACTION ID</th>
                <th className="py-3 px-4 font-semibold">SENDER & VPA</th>
                <th className="py-3 px-4 font-semibold">BENEFICIARY</th>
                <th className="py-3 px-4 font-semibold">PURPOSE</th>
                <th className="py-3 px-4 font-semibold text-right">INR DEBIT</th>
                <th className="py-3 px-4 font-semibold text-right">PAYOUT NET</th>
                <th className="py-3 px-4 font-semibold text-center">AI SCORE</th>
                <th className="py-3 px-4 font-semibold text-center">STATUS</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTxn(t)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-cyan-400">
                    {t.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{t.senderName}</div>
                    <div className="text-[11px] font-mono text-slate-500 truncate max-w-[150px]">
                      {t.senderVpa}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">{t.recipientName}</div>
                    <div className="text-[11px] text-slate-500">{t.recipientCountry}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded text-[11px] border border-slate-800">
                      {t.purposeCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-white tabular-nums">
                    ₹{t.amountINR.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400 tabular-nums">
                    {t.recipientCurrency} {t.amountForeign.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`font-mono font-bold text-xs ${
                        t.aiScore >= 80 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {t.aiScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] font-mono font-semibold ${
                        t.status === "COMPLETED"
                          ? "text-emerald-400"
                          : t.status === "REJECTED"
                          ? "text-rose-400"
                          : "text-amber-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTxn(t);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700/80 cursor-pointer"
                    >
                      Audit Trail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            No transactions match the selected filter criteria.
          </div>
        )}
      </div>

      {/* Transaction Details Slide-Out Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400">
                  TrustBridge Institutional Audit Trail
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Transaction {selectedTxn.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Inbound UPI Debit</span>
                <span className="text-sm font-bold font-mono text-white tabular-nums">
                  ₹{selectedTxn.amountINR.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Outbound Payout</span>
                <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                  {selectedTxn.recipientCurrency} {selectedTxn.amountForeign.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Locked FX Rate</span>
                <span className="text-xs font-mono text-slate-300">
                  {selectedTxn.fxRate.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Settlement Time</span>
                <span className="text-xs font-mono text-cyan-400">
                  {(selectedTxn.settlementLatencyMs / 1000).toFixed(1)}s (FedNow/FPS)
                </span>
              </div>
            </div>

            {/* AI Legality Explanation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  AI Legality Engine Compliance Finding:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Score: {selectedTxn.aiScore}/100
                </span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                {selectedTxn.aiExplanation}
              </div>
            </div>

            {/* Regulatory Basis */}
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Statutory Citations:
              </span>
              <div className="space-y-1">
                {selectedTxn.regulatoryCitations.map((cit, i) => (
                  <div key={i} className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <span className="text-cyan-400">✓</span>
                    <span>{cit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Institutional Clearance Details */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div>Sender Origin: {selectedTxn.senderBank} ({selectedTxn.senderVpa})</div>
              <div>Beneficiary: {selectedTxn.recipientName} ({selectedTxn.recipientAccount})</div>
              <div>Citi Netting Batch: {selectedTxn.bulkBatchId}</div>
              <div className="text-cyan-400 truncate">Audit Hash: {selectedTxn.auditHash}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onOpenCertificateModal({
                    status: selectedTxn.status === "COMPLETED" ? "APPROVED" : "REJECTED",
                    legalityScore: selectedTxn.aiScore,
                    confidenceScore: 98,
                    humanReadableExplanation: selectedTxn.aiExplanation,
                    regulatoryBasis: selectedTxn.regulatoryCitations,
                    auditCertificateId: `TB-CERT-${selectedTxn.id}`,
                    clearedByCitiSettlementRule: selectedTxn.status === "COMPLETED",
                    timestamp: selectedTxn.timestamp,
                    riskBreakdown: {
                      amlRisk: "LOW",
                      sanctionScreening: "CLEAR",
                      purposePermissibility: "COMPLIANT",
                      sourceOfWealth: "VERIFIED_PRIMARY_BANK",
                      structuringRisk: "LOW",
                    },
                  });
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Export Regulatory Audit Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
