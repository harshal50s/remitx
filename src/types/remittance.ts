export type CurrencyCode = "USD" | "EUR" | "GBP" | "SGD" | "CAD" | "AED";

export interface CorridorConfig {
  code: CurrencyCode;
  currencyName: string;
  country: string;
  flag: string;
  clearingRail: string;
  nostroAccount: string;
  availableLiquidity: number;
  rateINR: number;
  inverseRate: number;
  swiftEquivalentFeeUSD: number;
  trustBridgeFeeUSD: number;
  avgSettlementSec: number;
  recipientAccountLabel: string;
  recipientRoutingLabel: string;
  sampleAccount: string;
  sampleRouting: string;
}

export interface PurposeCodeItem {
  code: string;
  title: string;
  category: string;
  description: string;
  rbiCategory: "Education" | "Maintenance" | "Medical" | "Travel" | "Consulting" | "Prohibited";
  isRestrictedOrProhibited?: boolean;
}

export interface ComplianceEvaluation {
  status: "APPROVED" | "FLAGGED_FOR_REVIEW" | "REJECTED";
  legalityScore: number;
  confidenceScore: number;
  humanReadableExplanation: string;
  regulatoryBasis: string[];
  tcsApplicable?: boolean;
  tcsAmountINR?: number;
  riskBreakdown: {
    amlRisk: string;
    sanctionScreening: string;
    purposePermissibility: string;
    sourceOfWealth: string;
    structuringRisk: string;
  };
  auditCertificateId: string;
  clearedByCitiSettlementRule: boolean;
  timestamp: string;
  evaluatedBy?: string;
}

export interface TransactionRecord {
  id: string;
  timestamp: string;
  senderName: string;
  senderVpa: string;
  senderBank: string;
  senderPan: string;
  recipientName: string;
  recipientCountry: string;
  recipientCurrency: CurrencyCode;
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
