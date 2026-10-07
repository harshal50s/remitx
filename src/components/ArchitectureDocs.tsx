import React from "react";
import {
  ShieldCheck,
  Building2,
  Cpu,
  Layers,
  ArrowRight,
  FileCheck,
  Lock,
  Zap,
} from "lucide-react";

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="w-full space-y-8">
      {/* Overview Banner */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="max-w-3xl">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            Technical & Regulatory Architecture Whitepaper
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            TrustBridge: The UPI-Linked Institutional Cross-Border Rail
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Cross-border retail remittance from India has historically suffered from prohibitive fees (3-5% FX markups + $35 SWIFT wire charges), multi-day settlement delays, and onerous manual compliance.
            TrustBridge simulates a compliance-first pipeline: UPI-funded remittances undergo AI-assisted regulatory assessment before any settlement, then route through Citi's global liquidity network for local payout.
          </p>
          <p className="text-xs text-amber-400/70 font-mono mt-2">
            ⚠️ Prototype simulation — not a live money-transfer service. Configured regulatory rules + AI reasoning, not a legal compliance guarantee.
          </p>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Single-Origin Money Rule */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">Invariant 01</span>
              <h3 className="text-base font-bold text-white">Strict Single-Origin Bank Invariant</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Money enters TrustBridge <strong>exclusively from the sender's own verified primary bank account</strong> via UPI Collect / Auto-debit. Third-party deposits, cash top-ups, and intermediate account pooling are prevented by design.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200">Regulatory Impact:</div>
            <p>
              Satisfies Section 12 of the Prevention of Money Laundering Act (PMLA 2002). Senders cannot "smurf" or route third-party illicit capital through TrustBridge.
            </p>
          </div>
        </div>

        {/* Pillar 2: Central KYC (CKYC) Reuse */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">Invariant 02</span>
              <h3 className="text-base font-bold text-white">Instant Frictionless KYC Reuse</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Rather than requiring users to scan passports, utility bills, and bank statements on every transaction, TrustBridge integrates with the CERSAI Central KYC (CKYC) registry.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200">Regulatory Impact:</div>
            <p>
              Conforms to RBI Master Direction on Know Your Customer (KYC) Direction 2016, reducing user verification onboarding latency from 48 hours to under 2 seconds.
            </p>
          </div>
        </div>

        {/* Pillar 3: AI-Assisted Compliance Assessment */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Invariant 03</span>
              <h3 className="text-base font-bold text-white">Pre-Transaction AI-Assisted Compliance Assessment</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every transaction is evaluated using AI-assisted compliance reasoning combined with configured regulatory rules <strong>before any money moves</strong>. Assessment covers FEMA 1999 Schedule I &amp; III purpose-code permissibility, configured sanctions watchlists, and the $250,000 LRS fiscal year ceiling.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200">Compliance Impact (Simulated):</div>
            <p>
              Generates a human-readable compliance explanation and audit record for each remittance decision. This is an AI-assisted assessment, not a legally binding regulatory certification.
            </p>
          </div>
        </div>

        {/* Pillar 4: Pre-Funded Accounts & Bulk Netting */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase">Invariant 04</span>
              <h3 className="text-base font-bold text-white">Pre-Funded Nostro Accounts & Bilateral Netting</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Money does not travel internationally on a per-transaction basis. Senders credit Citi's Mumbai Vostro pool via UPI; Citi instantly disburses foreign currency from pre-funded Nostro accounts abroad.
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200">Regulatory Impact:</div>
            <p>
              Zero SWIFT hops, zero correspondent bank deductions, zero crypto volatility. Bilateral batch netting clears institutional balances periodically with bank-grade safety.
            </p>
          </div>
        </div>
      </div>

      {/* Regulatory Matrix Table */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3">
          Permissible vs. Prohibited Current Account Transactions (FEMA 1999)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3 font-semibold">PURPOSE CATEGORY</th>
                <th className="py-2.5 px-3 font-semibold">RBI PURPOSE CODE</th>
                <th className="py-2.5 px-3 font-semibold">LRS LIMIT</th>
                <th className="py-2.5 px-3 font-semibold">TCS TAX STATUS</th>
                <th className="py-2.5 px-3 font-semibold">TRUSTBRIDGE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Higher Education / Tuition Abroad</td>
                <td className="py-2.5 px-3 font-mono text-cyan-400">S0305</td>
                <td className="py-2.5 px-3 font-mono text-slate-300">$250,000 / FY</td>
                <td className="py-2.5 px-3 text-slate-400">0.5% (Loan) / 5% &gt; ₹7L</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">Simulated Approved</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Maintenance of Close Relative</td>
                <td className="py-2.5 px-3 font-mono text-cyan-400">S1107</td>
                <td className="py-2.5 px-3 font-mono text-slate-300">$250,000 / FY</td>
                <td className="py-2.5 px-3 text-slate-400">20% on excess &gt; ₹7L</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">Simulated Approved</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Private International Travel</td>
                <td className="py-2.5 px-3 font-mono text-cyan-400">S0102</td>
                <td className="py-2.5 px-3 font-mono text-slate-300">$250,000 / FY</td>
                <td className="py-2.5 px-3 text-slate-400">20% on excess &gt; ₹7L</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">Simulated Approved</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Medical Treatment Overseas</td>
                <td className="py-2.5 px-3 font-mono text-cyan-400">S0001</td>
                <td className="py-2.5 px-3 font-mono text-slate-300">$250,000 / FY</td>
                <td className="py-2.5 px-3 text-slate-400">5% on excess &gt; ₹7L</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">Simulated Approved</td>
              </tr>
              <tr className="bg-rose-950/20">
                <td className="py-2.5 px-3 font-medium text-rose-300">Speculative Crypto / Margin FX</td>
                <td className="py-2.5 px-3 font-mono text-rose-400">BANNED</td>
                <td className="py-2.5 px-3 font-mono text-rose-400">$0 (Prohibited)</td>
                <td className="py-2.5 px-3 text-rose-400">N/A (Disallowed)</td>
                <td className="py-2.5 px-3 font-mono text-rose-400 font-bold">Hard AI Intercept</td>
              </tr>
              <tr className="bg-rose-950/20">
                <td className="py-2.5 px-3 font-medium text-rose-300">Overseas Lottery / Sweepstakes</td>
                <td className="py-2.5 px-3 font-mono text-rose-400">BANNED</td>
                <td className="py-2.5 px-3 font-mono text-rose-400">$0 (Prohibited)</td>
                <td className="py-2.5 px-3 text-rose-400">N/A (Disallowed)</td>
                <td className="py-2.5 px-3 font-mono text-rose-400 font-bold">Hard AI Intercept</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
