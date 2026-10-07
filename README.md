# TrustBridge

### Compliance-First Cross-Border Remittance Infrastructure

> Compliance runs before the money moves - not after

TrustBridge is a compliance-first cross-border remittance prototype that aims to make international transfers more transparent, explainable, and efficient. It leverages UPI as the domestic funding rail, deterministic regulatory rules + AI-assisted compliance reasoning, and simulates the downstream financial infrastructure required for FX locking, institutional liquidity, netting, settlement and local payout.

The core idea is simple: Before a remittance is allowed to proceed, TrustBridge evaluates the transaction and explains the compliance decision, before locking the applicable FX rate, verifying simulated settlement capacity, proceeding to the settlement workflow.
---

## Problem

Cross-border remittance consists of multiple levels of complexity:

- Sender identity and KYC verification
- Purpose-of-remittance validation
- Regulatory and foreign-exchange restrictions
- Risk and sanctions screening
- FX conversion
- Liquidity management
- Correspondent/intermediary banking
- Settlement and local payout
- Auditability and compliance records

Traditional international payment flows tend to involve multiple intermediaries, fragmented compliance checks, limited transparency, and higher operational costs. And more importantly, compliance can be turned into a downstream operational process and not embedded directly in the transaction lifecycle

### The Challenge

> How can we make cross-border remittance compliance proactive, explainable and integrated directly into the transaction lifecycle?
---

## Solution

TrustBridge takes a compliance-first transaction pipeline approach

While other systems design a compliance workflow as a parallel step to the transaction, TrustBridge places it right before any settlement execution

### Transaction Lifecycle

```text
Sender
│
▼
UPI Funding (Domestic Origin)
│
▼
Verified Bank Account / KYC Reuse
│
▼
Purpose + Beneficiary Details
│
▼
AI-Assisted Compliance Assessment
+
Deterministic Rule Engine
│
├── Reject / Flag / Hold (FEMA Violations / LRS Exceeded)
│
▼
Approved Under Configured Rules
│
▼
FX Rate Lock (15-Minute Guaranteed Freeze)
│
▼
Liquidity Verification (Nostro / Vostro Capacity)
│
▼
Bilateral / Batch Netting
│
▼
Settlement Simulation
│
▼
Local Payment Rail Dispatch (FedNow, SEPA, FPS, PayNow)
│
▼
Transaction Ledger (Audit Trail)
│
▼
Compliance & Audit Certificate
```
---

## Key Architectural Pillars

### 1. Inbound UPI Funding & KYC Reuse
- Single-Origin Mandate: Payment strictly originates from the sender's own domestic bank account via UPI Virtual Payment Address (VPA). This satisfies Prevention of Money Laundering Act's first-party origin mandates. Third-party deposits are strictly barred
- CKYC Registry Integration: Simulates instant onboarding by reusing existing bank KYC and Central KYC (CKYC) 14-digit identifiers with PAN linkage

### 2. Dual-Engine Compliance Architecture
- Deterministic Rule Engine: Hard checks for FEMA 1999 Schedule I Prohibitions, Liberalised Remittance Scheme (LRS) ceiling, Tax Collected at Source (TCS) for remittances exceeding ₹7,00,000 INR
- AI-Assisted Reasoning (Google Gemini 3.8 Flash): Generates human-readable, statutory explanations for each evaluation decision. Gracefully falls back to the deterministic engine when offline, or if the API key is not configured

### 3. Transparent FX Rate Freezing
- 15-Minute Session Lock: Protects senders from foreign exchange market volatility while they review transfer details and authorize payment
- Zero Hidden Spread: Shows side-by-side fee comparisons against conventional correspondent wire deductions

### 4. Bilateral Netting & Institutional Liquidity
- Nostro/Vostro Clearing Model: Avoids multiple correspondent banking hops by routing domestic UPI funding into Citi Mumbai Vostro accounts, while disbursing local currency from pre-funded foreign Nostro accounts
- Aggregated Batching: Bilateral institutional settlement offsets gross flows, eliminating individual SWIFT wire fees

### 5. Institutional Audit Trail & Compliance Certificates
- Digitally Verifiable Audit: Each completed remittance generates a unique transaction tracking ID, Citi batch ID, and audit hash
- Compliance Certificate: Generates a downloadable / exportable compliance document detailing the statutory basis, risk breakdown scores, and regulatory references
---

## Supported Corridors & Clearing Rails

| Corridor | Currency | Local Clearing Rail | Nostro Clearing Account | Avg. Simulated Latency |
|:---|:---:|:---|:---|:---:|
| United States | `USD` | FedNow / ACH Direct | `CITI-NY-NOSTRO-9941-USD` | ~38s |
| Eurozone | `EUR` | SEPA Instant | `CITI-FRK-NOSTRO-4482-EUR` | ~24s |
| United Kingdom | `GBP` | Faster Payments Service (FPS) | `CITI-LDN-NOSTRO-3319-GBP` | ~19s |
| Singapore | `SGD` | PayNow / FAST | `CITI-SGP-NOSTRO-7721-SGD` | ~14s |
| Canada | `CAD` | Interac / EFT Direct | `CITI-TOR-NOSTRO-5510-CAD` | ~42s |
| UAE | `AED` | Aani / UAE Direct Payout | `CITI-DXB-NOSTRO-8120-AED` | ~28s |
---

## Tech Stack

- Frontend: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- Icons & Motion: [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/)
- Backend: [Express 4](https://expressjs.com/), [Node.js](https://nodejs.org/)
- Build Tool: [Vite 8](https://vitejs.dev/) with `tsx` execution
- AI Engine: Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash` with deterministic rule fallback
---

## Project Structure

```text
TrustBridge/
├── server.ts            # Express backend: compliance APIs, FX rates, settlement
├── index.html           # HTML entrypoint
├── vite.config.ts         # Vite configuration
├── package.json          # Project dependencies and run scripts
├── src/
│  ├── main.tsx          # React application bootstrap
│  ├── App.tsx           # Top-level application container & navigation
│  ├── index.css          # Tailwind v4 global theme styles
│  ├── types/
│  │  └── remittance.ts      # TypeScript interfaces for corridors, transactions, compliance
│  ├── data/
│  │  └── mockData.ts       # Corridor configurations, purpose codes, preset test scenarios
│  └── components/
│    ├── Header.tsx       # Top navigation bar with active liquidity badge
│    ├── RemittancePortal.tsx  # 2-column core payment interface, FX lock, sandbox PIN modal
│    ├── AILegalityInspector.tsx # Deep-dive compliance reasoning & regulatory citations
│    ├── CitiNettingVisualizer.tsx# Nostro/Vostro pool tracking and bilateral batch netting
│    ├── TransactionLedger.tsx  # Institutional ledger, search filters, audit details
│    ├── ArchitectureDocs.tsx  # Regulatory architecture specification & invariant docs
│    ├── AuditCertificateModal.tsx# Formal compliance certificate modal & JSON exporter
│    └── FlowVisualizer.tsx   # Step-by-step transaction lifecycle visualization
```
---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ is recommended)
- `npm` (v10+)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/harshal50s/remitx.git
cd remitx
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up Gemini API Key:
create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
> If you omit `GEMINI_API_KEY`, Trustbridge runs seamlessly in deterministic compliance mode using configured FEMA 1999 rules.

### Running the Application

Start the local development server:
```bash
npm run dev
```

Open your browser at:
```text
http://localhost:3000
```

### Type Checking & Build

```bash
# Verify TypeScript types
npm run lint

# Build production bundle
npm run build
```
---

## Testing Pre-Configured Scenarios

TrustBridge has a host of instant pre-configured test cases right on the remittance dashboard:

1. Harvard University Tuition ($5k USD) - tests permissible current account remittance (S0305), zero TCS trigger, FedNow clearing
2. UK Family Maintenance (£2k GBP) - tests permissible family living support (S1107) under Faster Payments
3. High-Value Remittance (₹8.5L INR) - tests Section 206C(1G) 20% TCS tax calculation on amounts exceeding ₹7L INR
4. Prohibited Crypto / Margin Scheme ($1.5k USD) - tests instant compliance interception under FEMA Schedule I resulting in a pre-debit block with HTTP `403 Forbidden` on settlement
---

## Regulatory & Prototype Disclaimer

> ⚠️ Prototype Simulation Notice: TrustBridge is an architectural simulation and proof-of-concept prototype. It does not transfer live funds, hold client deposits, or issue legally binding regulatory determinations. All banking rails, CKYC lookups, Nostro account balances, and payout latencies are simulated for demonstration purposes. Users should consult licensed Authorized Dealer Category-I (AD-I) banks and qualified legal counsel for binding compliance guidance.