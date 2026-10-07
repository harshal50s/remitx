import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Cpu,
  Scale,
  RefreshCw,
  Award,
} from "lucide-react";
import { PURPOSE_CODES } from "../data/mockData";
import { ComplianceEvaluation } from "../types/remittance";

interface AILegalityInspectorProps {
  lastEvaluation: ComplianceEvaluation | null;
  onOpenCertificateModal: (evalResult: ComplianceEvaluation) => void;
}

export const AILegalityInspector: React.FC<AILegalityInspectorProps> = ({
  lastEvaluation,
  onOpenCertificateModal,
}) => {
  // Interactive test bench states
  const [testAmountINR, setTestAmountINR] = useState<number>(450000);
  const [testPurposeCode, setTestPurposeCode] = useState<string>("S0305");
  const [testSenderVpa, setTestSenderVpa] = useState<string>("priya.iyer@okhdfcbank");
  const [testRecipientName, setTestRecipientName] = useState<string>("London School of Economics");
  const [testLrsYtd, setTestLrsYtd] = useState<number>(32000);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ComplianceEvaluation | null>(lastEvaluation);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const activeResult = testResult || lastEvaluation;

  const runTestEvaluation = async () => {
    setIsTesting(true);
    try {
      const res = await fetch("/api/evaluate-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountINR: testAmountINR,
          recipientCurrency: "GBP",
          purposeCode: testPurposeCode,
          purposeCategory: PURPOSE_CODES.find((p) => p.code === testPurposeCode)?.category || "General",
          senderName: "Priya Iyer",
          senderVpa: testSenderVpa,
          senderBank: "HDFC Bank (Linked Salary Account)",
          senderPan: "AXCPI9921B",
          recipientName: testRecipientName,
          recipientCountry: "United Kingdom",
          lrsUtilizedYTD: testLrsYtd,
        }),
      });
      const data: ComplianceEvaluation = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  const copyCertId = (certId: string) => {
    navigator.clipboard.writeText(certId);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Overview Banner */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-emerald-400">
                  Pre-Transaction Legality Engine
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">FEMA 1999 & RBI LRS Guardrail</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                AI Legality & Compliance Verification Core
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400">
              Model: Gemini 3.8 Flash
            </span>
            <span className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
              Latency: &lt;450ms
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-4 leading-relaxed max-w-4xl">
          Unlike traditional banking where compliance checks take days or occur post-clearing via human review,
          TrustBridge's AI Legality Engine scores every single transaction <strong className="text-white">before money moves</strong>.
          It inspects the inbound UPI sender's verified bank linkage, verifies FEMA 1999 Schedule I & III permissibility, tracks fiscal year $250,000 LRS ceilings, computes Section 206C(1G) TCS tax obligations, and generates a human-readable legal explanation for every clearance decision.
        </p>
      </div>

      {/* Main Grid: Live Evaluation Result + Test Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Compliance Decision Card (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {activeResult ? (
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
              {/* Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  {activeResult.status === "APPROVED" ? (
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : activeResult.status === "FLAGGED_FOR_REVIEW" ? (
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold tracking-tight uppercase ${
                          activeResult.status === "APPROVED"
                            ? "text-emerald-400"
                            : activeResult.status === "FLAGGED_FOR_REVIEW"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {activeResult.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-mono text-slate-400">
                        Score: {activeResult.legalityScore}/100
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Evaluated by: {activeResult.evaluatedBy || "TrustBridge Gemini AI Legality Engine"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenCertificateModal(activeResult)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View Certificate</span>
                </button>
              </div>

              {/* Human-Readable Compliance Officer Explanation */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Human-Readable Legal Explanation:
                </h4>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/90 text-xs text-slate-200 leading-relaxed font-sans">
                  {activeResult.humanReadableExplanation}
                </div>
              </div>

              {/* Regulatory Basis & Statutory Clauses */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Regulatory & Statutory Citations:
                </h4>
                <div className="space-y-1.5">
                  {activeResult.regulatoryBasis.map((citation, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300"
                    >
                      <span className="text-cyan-400 font-bold">§</span>
                      <span>{citation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Five-Point Institutional Risk Matrix */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Multi-Factor Compliance Risk Matrix:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">AML Risk Level</span>
                    <span className="text-xs font-bold font-mono text-emerald-400 mt-1 block">
                      {activeResult.riskBreakdown.amlRisk}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Sanction / PEP</span>
                    <span className="text-xs font-bold font-mono text-emerald-400 mt-1 block">
                      {activeResult.riskBreakdown.sanctionScreening}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Purpose Code</span>
                    <span className="text-xs font-bold font-mono text-cyan-400 mt-1 block">
                      {activeResult.riskBreakdown.purposePermissibility}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Source of Wealth</span>
                    <span className="text-xs font-bold font-mono text-emerald-400 mt-1 block">
                      {activeResult.riskBreakdown.sourceOfWealth}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Structuring / Velocity</span>
                    <span className="text-xs font-bold font-mono text-emerald-400 mt-1 block">
                      {activeResult.riskBreakdown.structuringRisk}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Citi Settlement Rule</span>
                    <span className="text-xs font-bold font-mono text-emerald-400 mt-1 block">
                      {activeResult.clearedByCitiSettlementRule ? "CLEARED" : "HELD"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate Hash Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span>Certificate ID:</span>
                  <span className="text-cyan-400">{activeResult.auditCertificateId}</span>
                </div>
                <button
                  onClick={() => copyCertId(activeResult.auditCertificateId)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedHash ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-8 text-center text-slate-400">
              <Cpu className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-300">No recent transaction evaluation loaded</p>
              <p className="text-xs text-slate-500 mt-1">
                Run the interactive test bench on the right or simulate a transfer in the Remittance tab.
              </p>
            </div>
          )}
        </div>

        {/* Right: Live Interactive Compliance Test Bench (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Legality Engine Test Bench</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Sandbox v3.8</span>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Test Amount (INR):
                </label>
                <input
                  type="number"
                  value={testAmountINR}
                  onChange={(e) => setTestAmountINR(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  FEMA Purpose Code:
                </label>
                <select
                  value={testPurposeCode}
                  onChange={(e) => setTestPurposeCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                >
                  {PURPOSE_CODES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Sender Verified VPA:
                </label>
                <input
                  type="text"
                  value={testSenderVpa}
                  onChange={(e) => setTestSenderVpa(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Foreign Beneficiary:
                </label>
                <input
                  type="text"
                  value={testRecipientName}
                  onChange={(e) => setTestRecipientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Current FY LRS Utilization (USD):
                </label>
                <input
                  type="number"
                  value={testLrsYtd}
                  onChange={(e) => setTestLrsYtd(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Annual Individual Limit: $250,000 USD
                </span>
              </div>

              <button
                onClick={runTestEvaluation}
                disabled={isTesting}
                className="w-full py-2.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Regulations...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Run Real-Time Compliance Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Regulatory Reference Box */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl text-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-200">RBI Regulatory Invariants Enforced:</h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
              <li>
                <strong className="text-slate-300">Single-Origin Rule:</strong> Pay-ins only accepted from sender's verified bank account via UPI.
              </li>
              <li>
                <strong className="text-slate-300">Schedule I Ban:</strong> Zero transactions permitted for overseas lottery or crypto margin.
              </li>
              <li>
                <strong className="text-slate-300">Section 206C(1G):</strong> Automated 20% TCS threshold logic above ₹7,00,000 INR.
              </li>
              <li>
                <strong className="text-slate-300">LRS Cap:</strong> Real-time aggregation against $250,000 fiscal year cap.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
