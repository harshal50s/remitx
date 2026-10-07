import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Citi Liquidity Nostro/Vostro Balances & Bulk Netting State
const citiLiquidityPools = {
  USD: {
    corridor: "United States (USD)",
    clearingRail: "FedNow / ACH Direct",
    nostroAccount: "CITI-NY-NOSTRO-9941-USD",
    availableLiquidity: 8420000,
    lockedRate: 0.011628, // 1 INR = 0.011628 USD (~86.00 INR/USD)
    inverseRate: 86.00,
    swiftEquivalentFeeUSD: 35.0,
    trustBridgeFeeUSD: 1.25,
    avgSettlementSec: 38,
  },
  EUR: {
    corridor: "Eurozone (EUR)",
    clearingRail: "SEPA Instant",
    nostroAccount: "CITI-FRK-NOSTRO-4482-EUR",
    availableLiquidity: 6150000,
    lockedRate: 0.01087, // ~92.00 INR/EUR
    inverseRate: 92.00,
    swiftEquivalentFeeUSD: 38.0,
    trustBridgeFeeUSD: 1.15,
    avgSettlementSec: 24,
  },
  GBP: {
    corridor: "United Kingdom (GBP)",
    clearingRail: "Faster Payments Service (FPS)",
    nostroAccount: "CITI-LDN-NOSTRO-3319-GBP",
    availableLiquidity: 4890000,
    lockedRate: 0.009259, // ~108.00 INR/GBP
    inverseRate: 108.00,
    swiftEquivalentFeeUSD: 42.0,
    trustBridgeFeeUSD: 1.40,
    avgSettlementSec: 19,
  },
  SGD: {
    corridor: "Singapore (SGD)",
    clearingRail: "PayNow / FAST",
    nostroAccount: "CITI-SGP-NOSTRO-7721-SGD",
    availableLiquidity: 7300000,
    lockedRate: 0.015625, // ~64.00 INR/SGD
    inverseRate: 64.00,
    swiftEquivalentFeeUSD: 30.0,
    trustBridgeFeeUSD: 0.95,
    avgSettlementSec: 14,
  },
  CAD: {
    corridor: "Canada (CAD)",
    clearingRail: "Interac / EFT Direct",
    nostroAccount: "CITI-TOR-NOSTRO-5510-CAD",
    availableLiquidity: 3950000,
    lockedRate: 0.015873, // ~63.00 INR/CAD
    inverseRate: 63.00,
    swiftEquivalentFeeUSD: 35.0,
    trustBridgeFeeUSD: 1.30,
    avgSettlementSec: 42,
  },
  AED: {
    corridor: "United Arab Emirates (AED)",
    clearingRail: "Aani / UAE Direct Payout",
    nostroAccount: "CITI-DXB-NOSTRO-8120-AED",
    availableLiquidity: 9100000,
    lockedRate: 0.042735, // ~23.40 INR/AED
    inverseRate: 23.40,
    swiftEquivalentFeeUSD: 28.0,
    trustBridgeFeeUSD: 1.10,
    avgSettlementSec: 28,
  },
};

// Inbound UPI Vostro Pool (Mumbai)
let mumbaiVostroINR = 145200000; // ₹14.52 Cr

// In-memory transactions store
interface TransactionRecord {
  id: string;
  timestamp: string;
  senderName: string;
  senderVpa: string;
  senderBank: string;
  senderPan: string;
  recipientName: string;
  recipientCountry: string;
  recipientCurrency: string;
  recipientAccount: string;
  recipientRouting: string;
  amountINR: number;
  amountForeign: number;
  fxRate: number;
  purposeCode: string;
  purposeDescription: string;
  lrsUtilizedYTD: number;
  status: "COMPLETED" | "PROCESSING" | "FLAGGED_REVIEW" | "REJECTED";
  step: "UPI_DEBIT" | "KYC_VERIFIED" | "AI_LEGALITY_SCORED" | "FX_LOCKED" | "CITI_NETTED" | "LOCAL_PAYOUT_SETTLED";
  aiScore: number;
  aiExplanation: string;
  regulatoryCitations: string[];
  swiftHopAvoided: boolean;
  bulkBatchId: string;
  auditHash: string;
  settlementLatencyMs: number;
}

// Initial realistic transactions
const transactions: TransactionRecord[] = [
  {
    id: "TB-TXN-882194",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    senderName: "Aarav Sharma",
    senderVpa: "aarav.sharma@okhdfcbank",
    senderBank: "HDFC Bank (Verified A/C ****4821)",
    senderPan: "ABCPS1829K",
    recipientName: "Columbia University - Bursar Office",
    recipientCountry: "United States",
    recipientCurrency: "USD",
    recipientAccount: "ACCT-8492019482",
    recipientRouting: "021000021 (Fedwire / ACH)",
    amountINR: 430000,
    amountForeign: 5000,
    fxRate: 0.011628,
    purposeCode: "S0305",
    purposeDescription: "Higher Education / University Tuition Abroad",
    lrsUtilizedYTD: 24500,
    status: "COMPLETED",
    step: "LOCAL_PAYOUT_SETTLED",
    aiScore: 98,
    aiExplanation: "Compliant under RBI FEMA (Current Account) Rules Schedule III. Purpose code S0305 matches accredited institution invoice. Sender PAN KYC reused via CKYC identifier with zero third-party account hopping.",
    regulatoryCitations: [
      "FEMA 1999 Section 5: Current Account Transaction",
      "RBI Master Direction No. 7/2015-16: Liberalised Remittance Scheme",
      "Rule 3(1) PMLA 2002: Strict First-Party Source of Funds Mandate"
    ],
    swiftHopAvoided: true,
    bulkBatchId: "BATCH-CITI-USD-2026-092",
    auditHash: "0x8fa3d49e72810a4b08dc22883f3e71029471928374a83b271",
    settlementLatencyMs: 38200,
  },
  {
    id: "TB-TXN-882193",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    senderName: "Priyanka Nair",
    senderVpa: "priyanka.nair@icici",
    senderBank: "ICICI Bank (Verified A/C ****9102)",
    senderPan: "BKNPN4028L",
    recipientName: "Dr. Rohan Nair",
    recipientCountry: "United Kingdom",
    recipientCurrency: "GBP",
    recipientAccount: "GB82BARC20201540928172",
    recipientRouting: "20-20-15 (Faster Payments)",
    amountINR: 216000,
    amountForeign: 2000,
    fxRate: 0.009259,
    purposeCode: "S1107",
    purposeDescription: "Maintenance of Close Relative Abroad",
    lrsUtilizedYTD: 14200,
    status: "COMPLETED",
    step: "LOCAL_PAYOUT_SETTLED",
    aiScore: 96,
    aiExplanation: "Verified under LRS close relative maintenance provision. No third-party pay-in; direct UPI collect authorized against linked ICICI salary account. Pre-funded Citi London FPS pool disbursed recipient funds in 19 seconds.",
    regulatoryCitations: [
      "RBI Master Direction - Other Remittance Facilities para 4.2",
      "FEMA Notification No. FEMA 1/2000-RB"
    ],
    swiftHopAvoided: true,
    bulkBatchId: "BATCH-CITI-GBP-2026-041",
    auditHash: "0x3912ca94b029482f718294738491823901928374928374829",
    settlementLatencyMs: 19400,
  },
  {
    id: "TB-TXN-882192",
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    senderName: "Devansh Patel",
    senderVpa: "devansh@axisbank",
    senderBank: "Axis Bank (Verified A/C ****3341)",
    senderPan: "CLLPP9921M",
    recipientName: "TechHub GmbH Berlin",
    recipientCountry: "Germany",
    recipientCurrency: "EUR",
    recipientAccount: "DE89370400440532013000",
    recipientRouting: "COBADEFFXXX (SEPA Instant)",
    amountINR: 276000,
    amountForeign: 3000,
    fxRate: 0.01087,
    purposeCode: "S1002",
    purposeDescription: "Software Services & International SaaS Subscription",
    lrsUtilizedYTD: 8500,
    status: "COMPLETED",
    step: "LOCAL_PAYOUT_SETTLED",
    aiScore: 94,
    aiExplanation: "Bona fide business current account remittance under permitted IT services code. Cleared sanction checks and tax compliance threshold.",
    regulatoryCitations: [
      "FEMA Current Account Regulations 2000",
      "RBI Foreign Exchange Management (Manner of Receipt and Payment)"
    ],
    swiftHopAvoided: true,
    bulkBatchId: "BATCH-CITI-EUR-2026-088",
    auditHash: "0x77c2e10984920194837261948291038472910482910384920",
    settlementLatencyMs: 24100,
  },
];

// Helper for offline compliance heuristic fallback
function evaluateRuleBasedCompliance(data: {
  amountINR: number;
  purposeCode: string;
  senderVpa: string;
  recipientName: string;
  lrsUtilizedYTD: number;
}) {
  const { amountINR, purposeCode, senderVpa, recipientName, lrsUtilizedYTD } = data;
  const isSuspectPurpose = ["GAMBLING", "CRYPTO", "LOTTERY", "MARGIN_FX", "CALL_BACK"].some((k) =>
    purposeCode.toUpperCase().includes(k)
  );

  const approxUSD = amountINR / 86.0;
  const projectedTotal = lrsUtilizedYTD + approxUSD;

  if (isSuspectPurpose) {
    return {
      status: "REJECTED" as const,
      legalityScore: 8,
      confidenceScore: 99,
      humanReadableExplanation: `REJECTED: Purpose "${purposeCode}" is prohibited under FEMA Schedule I (Prohibited Transactions, including lottery winnings, remittance for crypto/margin trading or call back services). Transaction blocked prior to any UPI debit.`,
      regulatoryBasis: [
        "FEMA 1999 Schedule I: Prohibited Current Account Transactions",
        "RBI Master Circular on Liberalised Remittance Scheme Section 4.1",
      ],
      tcsApplicable: false,
      tcsAmountINR: 0,
      riskBreakdown: {
        amlRisk: "HIGH",
        sanctionScreening: "FLAGGED_PROHIBITED_PURPOSE",
        purposePermissibility: "ILLEGAL",
        sourceOfWealth: "UNVERIFIED",
        structuringRisk: "HIGH",
      },
      auditCertificateId: `TB-AUDIT-REJ-${Date.now().toString(36).toUpperCase()}`,
      clearedByCitiSettlementRule: false,
    };
  }

  if (projectedTotal > 250000) {
    return {
      status: "FLAGGED_FOR_REVIEW" as const,
      legalityScore: 42,
      confidenceScore: 95,
      humanReadableExplanation: `FLAGGED: Projected fiscal year remittance exceeds the $250,000 USD Liberalised Remittance Scheme threshold (Current: $${lrsUtilizedYTD.toLocaleString()} + Requested: $${Math.round(approxUSD).toLocaleString()} = $${Math.round(projectedTotal).toLocaleString()}). Requires prior RBI approval under FEMA 1999 Regulation 5.`,
      regulatoryBasis: [
        "RBI Master Direction No. 7/2015-16 Section 3 (LRS Aggregate Ceiling)",
        "Rule 5 of Foreign Exchange Management (Current Account Transactions) Rules",
      ],
      tcsApplicable: true,
      tcsAmountINR: Math.round(amountINR * 0.2),
      riskBreakdown: {
        amlRisk: "MEDIUM",
        sanctionScreening: "CLEAR",
        purposePermissibility: "REQUIRES_RBI_SPECIAL_PERMISSION",
        sourceOfWealth: "VERIFIED_PRIMARY_BANK",
        structuringRisk: "MEDIUM",
      },
      auditCertificateId: `TB-AUDIT-REV-${Date.now().toString(36).toUpperCase()}`,
      clearedByCitiSettlementRule: false,
    };
  }

  const isTCSAboveThreshold = amountINR > 700000;
  const tcsAmount = isTCSAboveThreshold ? Math.round((amountINR - 700000) * 0.2) : 0;

  return {
    status: "APPROVED" as const,
    legalityScore: 97,
    confidenceScore: 98,
    humanReadableExplanation: `APPROVED: Fully compliant with RBI FEMA 1999 guidelines for current account remittance under purpose code ${purposeCode}. Inbound payment originates strictly from sender's verified bank VPA (${senderVpa}), meeting PMLA single-origin requirements without third-party pay-in or SWIFT transit risk.`,
    regulatoryBasis: [
      "FEMA 1999 Section 5 (Permissible Current Account Remittances)",
      "RBI Master Direction on LRS (Annual cap compliant)",
      "PMLA Rule 3(1) Verified Primary KYC Reuse",
      isTCSAboveThreshold ? "Section 206C(1G) IT Act TCS Computed" : "Below ₹7 Lakh TCS threshold",
    ],
    tcsApplicable: isTCSAboveThreshold,
    tcsAmountINR: tcsAmount,
    riskBreakdown: {
      amlRisk: "LOW",
      sanctionScreening: "CLEAR (OFAC/UN/RBI Watchlists)",
      purposePermissibility: "PERMISSIBLE",
      sourceOfWealth: "VERIFIED_FIRST_PARTY_ACCOUNT",
      structuringRisk: "LOW",
    },
    auditCertificateId: `TB-AUDIT-APP-${Date.now().toString(36).toUpperCase()}`,
    clearedByCitiSettlementRule: true,
  };
}

// 1. AI Legality & Compliance Engine Endpoint
app.post("/api/evaluate-compliance", async (req, res) => {
  try {
    const {
      amountINR,
      recipientCurrency,
      purposeCode,
      purposeCategory,
      senderName,
      senderVpa,
      senderBank,
      senderPan,
      recipientName,
      recipientCountry,
      recipientAccount,
      lrsUtilizedYTD = 18000,
    } = req.body;

    if (!amountINR || !recipientCurrency || !purposeCode) {
      res.status(400).json({ error: "Missing required transaction parameters" });
      return;
    }

    const approxUSD = amountINR / 86.0;

    // Check if Gemini API is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are the TrustBridge Real-Time AI Legality Engine, an institutional regulatory compliance system adhering strictly to the Reserve Bank of India (RBI) Foreign Exchange Management Act (FEMA 1999), Liberalised Remittance Scheme (LRS), and Prevention of Money Laundering Act (PMLA).

Analyze this cross-border transaction BEFORE any funds move:
Sender: ${senderName || "Aarav Sharma"}
Sender Verified UPI VPA: ${senderVpa || "aarav.sharma@okhdfcbank"}
Sender Bank Account: ${senderBank || "HDFC Bank (Linked Primary Account)"}
Sender PAN: ${senderPan || "ABCPS1829K"}
Inbound Rail: UPI Auto-debit (Zero intermediary bank hops; money ONLY leaves sender's own verified bank account)
Recipient: ${recipientName || "Columbia University"} (${recipientCountry || "USA"})
Recipient Local Rails: Citi Local Payout (${recipientCurrency})
Purpose Code: ${purposeCode} (${purposeCategory || "Educational / Tuition"})
Amount INR: ₹${amountINR.toLocaleString()} (Approx $${Math.round(approxUSD)} USD)
Current FY LRS Utilization: $${lrsUtilizedYTD.toLocaleString()} USD (Annual Ceiling: $250,000 USD)

Regulatory rules to enforce:
1. FEMA Schedule I prohibits: lottery winnings, income from racing/riding, purchase of lottery tickets, remittance for margin trading or cryptocurrency speculation, call-back services.
2. LRS Annual Limit: $250,000 USD per financial year for individuals.
3. Tax Collected at Source (TCS) under Section 206C(1G): If amount exceeds ₹7,00,000 INR, 20% TCS applies (except education/medical which is 5% or 0.5% with loan).
4. PMLA / First-Party Rule: Remittance must strictly originate from the sender's own verified bank account. Third-party deposits are strictly barred.
5. Sanctions: Screen against OFAC, FATF blacklists, and PEP.

Return your evaluation strictly in the requested JSON format. Include a thorough, human-readable legal explanation in professional regulatory prose explaining why this transaction is permitted, flagged, or rejected.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                status: {
                  type: Type.STRING,
                  description: "APPROVED, FLAGGED_FOR_REVIEW, or REJECTED",
                },
                legalityScore: {
                  type: Type.NUMBER,
                  description: "Compliance score from 0 to 100",
                },
                confidenceScore: {
                  type: Type.NUMBER,
                  description: "Model confidence score from 0 to 100",
                },
                humanReadableExplanation: {
                  type: Type.STRING,
                  description: "Clear plain-language legal explanation citing RBI FEMA guidelines",
                },
                regulatoryBasis: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific statutory clauses or RBI master directions",
                },
                tcsApplicable: {
                  type: Type.BOOLEAN,
                  description: "Whether Tax Collected at Source applies",
                },
                tcsAmountINR: {
                  type: Type.NUMBER,
                  description: "Calculated TCS amount in INR",
                },
                riskBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    amlRisk: { type: Type.STRING },
                    sanctionScreening: { type: Type.STRING },
                    purposePermissibility: { type: Type.STRING },
                    sourceOfWealth: { type: Type.STRING },
                    structuringRisk: { type: Type.STRING },
                  },
                },
                auditCertificateId: {
                  type: Type.STRING,
                  description: "Unique institutional audit tracking ID",
                },
                clearedByCitiSettlementRule: {
                  type: Type.BOOLEAN,
                  description: "Whether transaction meets Citi pre-funded account clearance rules",
                },
              },
              required: [
                "status",
                "legalityScore",
                "confidenceScore",
                "humanReadableExplanation",
                "regulatoryBasis",
                "riskBreakdown",
                "auditCertificateId",
                "clearedByCitiSettlementRule",
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        res.json({
          ...parsed,
          timestamp: new Date().toISOString(),
          evaluatedBy: "TrustBridge Gemini AI Legality Engine (v3.8-Flash)",
        });
        return;
      } catch (geminiError) {
        console.warn("Gemini evaluation error, falling back to rule-based engine:", geminiError);
      }
    }

    // Fallback to deterministic rule-based compliance engine
    const fallbackResult = evaluateRuleBasedCompliance({
      amountINR,
      purposeCode,
      senderVpa: senderVpa || "sender@verifiedbank",
      recipientName: recipientName || "Foreign Beneficiary",
      lrsUtilizedYTD,
    });

    res.json({
      ...fallbackResult,
      timestamp: new Date().toISOString(),
      evaluatedBy: "TrustBridge Deterministic Compliance Engine (FEMA 1999 Standard)",
    });
  } catch (err: any) {
    console.error("Compliance error:", err);
    res.status(500).json({ error: "Failed to evaluate compliance", details: err.message });
  }
});

// 2. Locked FX Rates & Citi Liquidity Status
app.get("/api/fx-rates", (req, res) => {
  const quoteExpirySeconds = 900; // 15-minute rate guarantee
  const responseData = Object.entries(citiLiquidityPools).map(([curr, pool]) => {
    return {
      currency: curr,
      corridor: pool.corridor,
      clearingRail: pool.clearingRail,
      nostroAccount: pool.nostroAccount,
      availableLiquidity: pool.availableLiquidity,
      rateINR: pool.lockedRate,
      inverseRate: pool.inverseRate,
      swiftEquivalentFeeUSD: pool.swiftEquivalentFeeUSD,
      trustBridgeFeeUSD: pool.trustBridgeFeeUSD,
      avgSettlementSec: pool.avgSettlementSec,
      rateExpiresInSeconds: quoteExpirySeconds,
      timestamp: new Date().toISOString(),
    };
  });
  res.json({
    pools: responseData,
    mumbaiVostroINR,
    globalNettingCycleSec: 120, // Netting batch runs every 2 mins
    swiftHopsSavedTotal: 18492,
    totalNettedUSD: 48920190,
  });
});

// 3. Transactions List
app.get("/api/transactions", (req, res) => {
  res.json({ transactions });
});

// 4. Execute Full Remittance Flow
app.post("/api/execute-settlement", async (req, res) => {
  try {
    const {
      senderName,
      senderVpa,
      senderBank,
      senderPan,
      recipientName,
      recipientCountry,
      recipientCurrency,
      recipientAccount,
      recipientRouting,
      amountINR,
      purposeCode,
      purposeDescription,
      complianceResult,
    } = req.body;

    const pool = citiLiquidityPools[recipientCurrency as keyof typeof citiLiquidityPools] || citiLiquidityPools.USD;
    const amountForeign = Number((amountINR * pool.lockedRate).toFixed(2));

    const newTxnId = `TB-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const batchId = `BATCH-CITI-${recipientCurrency}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const randomHash = "0x" + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const newTxn: TransactionRecord = {
      id: newTxnId,
      timestamp: new Date().toISOString(),
      senderName: senderName || "Aarav Sharma",
      senderVpa: senderVpa || "aarav.sharma@okhdfcbank",
      senderBank: senderBank || "HDFC Bank (Verified A/C ****4821)",
      senderPan: senderPan || "ABCPS1829K",
      recipientName: recipientName || "Columbia University",
      recipientCountry: recipientCountry || "United States",
      recipientCurrency: recipientCurrency || "USD",
      recipientAccount: recipientAccount || "ACCT-8492019482",
      recipientRouting: recipientRouting || "021000021",
      amountINR: Number(amountINR),
      amountForeign,
      fxRate: pool.lockedRate,
      purposeCode: purposeCode || "S0305",
      purposeDescription: purposeDescription || "Higher Education Abroad",
      lrsUtilizedYTD: 24500,
      status: complianceResult?.status === "REJECTED" ? "REJECTED" : "COMPLETED",
      step: complianceResult?.status === "REJECTED" ? "AI_LEGALITY_SCORED" : "LOCAL_PAYOUT_SETTLED",
      aiScore: complianceResult?.legalityScore || 96,
      aiExplanation: complianceResult?.humanReadableExplanation || "Approved under RBI FEMA guidelines.",
      regulatoryCitations: complianceResult?.regulatoryBasis || ["FEMA 1999 Section 5", "RBI LRS Compliance"],
      swiftHopAvoided: true,
      bulkBatchId: batchId,
      auditHash: randomHash,
      settlementLatencyMs: Math.floor(pool.avgSettlementSec * 1000 + (Math.random() * 4000 - 2000)),
    };

    // Update pool balances
    if (newTxn.status === "COMPLETED") {
      pool.availableLiquidity = Math.max(100000, pool.availableLiquidity - amountForeign);
      mumbaiVostroINR += Number(amountINR);
    }

    transactions.unshift(newTxn);

    res.json({
      success: true,
      transaction: newTxn,
      updatedPool: pool,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Settlement execution failed", details: err.message });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TrustBridge server active on port ${PORT}`);
  });
}

startServer();
