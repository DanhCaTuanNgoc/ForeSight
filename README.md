<div align="center">

<p align="center">
  <img src="./public/foresight-logo.svg" width="120" height="120" alt="ForeSight Logo" />
</p>

# ForeSight
### *The Precision Trading & Cognitive Intelligence Terminal for DreamDEX on Somnia L1*

**Detect the move. Challenge the thesis. Model the trajectory. Execute on-chain.**

<br/>

[![Somnia Network](https://img.shields.io/badge/Somnia-Shannon_Testnet_(50312)-7C3AED?style=for-the-badge&logo=blockchain)](https://somnia.network)
[![DreamDEX CLOB](https://img.shields.io/badge/Protocol-DreamDEX_Event_Contracts-06B6D4?style=for-the-badge)](https://dev.smk.somnia.host)
[![Tests Passing](https://img.shields.io/badge/Tests-120%2F120%20Passed%20(100%25)-00e676?style=for-the-badge&logo=vitest&logoColor=white)](tests/)
[![Evidence-Grounded AI](https://img.shields.io/badge/Adversarial_AI-Gemini_+_Groq_+_RAG-f55036?style=for-the-badge&logo=google&logoColor=white)](src/agents/strategies/dual-debate-engine.ts)
[![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite_6-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br/>

🌐 **Live Terminal:** [foresightdex.vercel.app](https://foresightdex.vercel.app/) &nbsp;•&nbsp; ⚡ **Somnia Shannon Testnet:** `Chain ID: 50312` &nbsp;•&nbsp; 🎯 **Target Protocol:** `DreamDEX CLOB`

<br/>

> **Core Philosophy:** *"Understand the market before you trade it"*  
> ForeSight is **not a black-box predictive chatbot**. It is an **institutional-grade decision support and execution terminal** built specifically for DreamDEX Event Contracts on Somnia L1. ForeSight transforms volatile, sub-second prediction market noise into an actionable, verifiable 4-step decision loop: **DETECT $\rightarrow$ CHALLENGE $\rightarrow$ SIMULATE $\rightarrow$ EXECUTE**.

</div>

---

### 🧭 Hackathon Judges & Developers Quick Navigation

| Resource | Description | Direct Link |
| :--- | :--- | :--- |
| 🚀 **Live Production Terminal** | High-performance institutional trading terminal on Vercel | [foresightdex.vercel.app](https://foresightdex.vercel.app/) |
| 📖 **Technical Architecture Document** | Deep product specification, mathematical modeling & risk framework | [Project-Details.md](docs/Project-Details.md) |
| 🛠️ **DreamDEX SDK & Protocol Feedback** | 12 technical findings & ergonomic suggestions for Somnia Core Devs | [DreamDEX-SDK-Feedback.md](docs/DreamDEX-SDK-Feedback.md) |
| 🎬 **Demo Video Pitch & Script** | 2.5-minute structured demonstration video pitch guide | [Demo-Video-Script.md](docs/Demo-Video-Script.md) |
| 📋 **Milestone Backlog & Verification** | Complete development log & verification checklist | [Plan-Tracking-v1.md](docs/Plan-Tracking-v1.md) |
| 🎨 **UI Design System Spec** | Institutional cyberpunk token design specifications | [ui-design-system.md](ui-design-system.md) |

---

## 🌟 1. The Core Problem on DreamDEX & Somnia

On high-throughput, sub-second finality blockchains like **Somnia Layer 1 (100k+ TPS)**, binary event contracts (1m, 5m, 15m, 1h BTC/ETH/SOL contracts) operate at unprecedented speed. Across **500+ active markets** on DreamDEX, traders face three critical bottlenecks:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE 3 CRITICAL TRADING BOTTLENECKS                                │
├──────────────────────────────┬──────────────────────────────┬──────────────────────────────────┤
│ 1. CONTEXTLESS FLASH SPIKES  │ 2. THE "BLACK-BOX AI" TRAP   │ 3. NON-LINEAR PAYOFFS & STRANDED │
│                              │                              │    CAPITAL                       │
│ Odds swing from 30% to 75%   │ Generic predictive bots      │ Binary options settle            │
│ in seconds. Traders have zero│ output ungrounded numbers    │ discontinuously ($1.00 or $0.00).│
│ context on whether spikes    │ without sources, encouraging │ Required price velocity is hard  │
│ stem from spot momentum or   │ gambling instead of          │ to model, and winnings stay      │
│ orderbook imbalances.        │ disciplined risk management. │ stranded in dozens of pools.     │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────────────┘
```

---

## 🔄 2. The 4-Stage Decision Architecture

ForeSight transforms raw CLOB orderbooks into a structured **cognitive decision loop**:

```text
                 DREAMDEX ON-CHAIN CLOB (500+ Active Markets)
                                │
                                ▼
                      ┌───────────────────┐
                      │    1. DETECT      │
                      │                   │
                      │ Orderbook Spikes  │
                      │ 10s Indexer Scan  │
                      │ Timeline Markers  │
                      └─────────┬─────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │   2. CHALLENGE    │
                      │                   │
                      │ Bull vs Bear AI   │
                      │ Verifiable RAG    │
                      │ Consensus Edge    │
                      └─────────┬─────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │   3. SIMULATE     │
                      │                   │
                      │ Velocity Coverage │
                      │ Greeks Modeling   │
                      │ Zero-Lag PnL Math │
                      └─────────┬─────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │    4. EXECUTE     │
                      │                   │
                      │ 1-Click CLOB Order│
                      │ Batch Auto-Sweep  │
                      │ Alpha Card Export │
                      └───────────────────┘
```

### 1️⃣ DETECT: Orderbook Anomaly Detection
* **Real-Time Implied Odds Timeline:** Continuously plots market probability ($0\% \rightarrow 100\%$) across multiple timeframes (`15m`, `1h`, `4h`) using live market indexer data.
* **10-Second Anomaly Scanner (`MarketSnapshotWorker`):** Continuously monitors active event contracts. Any probability shift $\ge 10\%$ between snapshots is automatically flagged with an interactive timeline marker.

### 2️⃣ CHALLENGE: Adversarial Dual-Agent Debate & Grounded RAG
* **Adversarial Synthesis (`DualDebateEngine`):** Rather than outputting a single speculative number, two specialized agents synthesize the market context:
  * 🐂 **Alpha Bull AI:** Analyzes orderbook bid depth, upside momentum, order asymmetry, and positive spot catalysts.
  * 🐻 **Macro Bear AI:** Evaluates overhead resistance, binary time decay ($\theta$), downside risk skew, and volatility traps.
* **Verifiable Source Citations:** Every thesis cites real-world articles (`[View Evidence]`) ingested via live crypto RSS streams (CoinDesk, Cointelegraph, Decrypt). Subjective reasoning is strictly separated from deterministic mathematics.

#### 🧠 Dynamic Context & Output Schema Architecture
```text
┌────────────────────────────────────────────────────────────────────────┐
│                      DYNAMIC CONTEXT INGESTION                         │
│  - Market: [Asset] Event Contract ([Interval] Cadence)                 │
│  - On-Chain State: Live Implied Odds [X]%, Orderbook Spread [Y] bps    │
│  - Grounding Context (RAG): Live RSS Ingestion (CoinDesk, Cointelegraph)│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ADVERSARIAL PROMPT INSTRUCTION                       │
│  "Synthesize two opposing institutional perspectives for this         │
│   prediction market. Return strictly valid structured JSON."           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      STRUCTURED JSON OUTPUT SCHEMA                     │
│  {                                                                     │
│    "bullHeadline": "Institutional accumulation defending strike",      │
│    "bullConfidence": 0.85, "bullTarget": 0.80,                         │
│    "bullKeyArguments": ["Orderbook bid asymmetry exceeds ask depth..."],│
│    "bullCatalysts": ["Spot volume surge in last 15m..."],              │
│    "bearHeadline": "Overextended volatility with binary theta decay", │
│    "bearConfidence": 0.75, "bearTarget": 0.35,                         │
│    "bearKeyArguments": ["Binary theta decay accelerates near expiry..."],│
│    "bearRiskFactors": ["Ask wall resistance at 75% probability..."],  │
│    "summary": "Consensus favors short-term upside with tight stop..."  │
│  }                                                                     │
└────────────────────────────────────────────────────────────────────────┘
```

### 3️⃣ SIMULATE: Trajectory Physics & Feasibility Modeling
* **Velocity Coverage Metric (`VC`):** Evaluates whether the underlying asset has sufficient physical momentum to cross the strike before round expiry:
  $$\Delta P_{\text{required}} = \frac{|P_{\text{strike}} - P_{\text{current}}|}{P_{\text{current}}} \times 100\%$$
  $$v_{\text{required}} = \frac{\Delta P_{\text{required}}}{T_{\text{remaining}}} \quad (\%/\text{minute})$$
  $$VC = \frac{v_{\text{observed}}}{v_{\text{required}}}$$
  * **$VC \ge 1.00\times$:** Realized spot momentum exceeds the required drift rate $\rightarrow$ **Trajectory physically feasible**.
  * **$VC < 1.00\times$:** Asset requires external momentum surge $\rightarrow$ **Elevated risk of expiring at zero ($0.00)**.
* **Zero-Latency Client-Side Math:** Interactive sliders compute capital allocation, early-exit take-profit targets, expiration payoffs, and breakeven boundaries directly in the browser with 0ms network lag.

### 4️⃣ EXECUTE: 1-Click CLOB Trading & Settlement Sweeper
* **1-Click CLOB Dispatch:** Places limit and market orders directly to DreamDEX contracts via `@somnia-chain/markets-sdk` and Viem.
* **Simulation Sandbox Fallback:** High-fidelity simulation mode allows comprehensive terminal exploration even without an active funded private key.
* **Settlement Sweeper:** Detects all finalized rounds and batch-redeems winnings in a single transaction, eliminating stranded capital.

---

## 🏗️ 3. Three-Tier System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              1. PRESENTATION & TERMINAL UI                             │
│  - Precision Terminal & Dark Surfaces  - Interactive Dual Debate Arena                 │
│  - Real-time Probability Timeline      - 1-Click Simulator & Execution Dock            │
│  - Proof-of-Thesis Alpha Card Studio   - Live Orderbook & Market Depth Canvas          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                           2. INTELLIGENCE & MODELING LAYER                             │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌───────────────────┐ │
│  │    MarketSnapshotWorker     │ │     NewsIngestionWorker     │ │  DualDebateEngine │ │
│  │ (10s Poller & Spike Tagger) │ │  (RSS Ingestion & Grounding)│ │ (Bull vs Bear RAG)│ │
│  └─────────────────────────────┘ └─────────────────────────────┘ └───────────────────┘ │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌───────────────────┐ │
│  │  Deterministic Math Core    │ │   Settlement Sweeper Worker │ │   Spot Oracle Feed│ │
│  │ (Velocity VC, PnL & ROI)    │ │ (Batch Auto-Claim Finalized)│ │ (Binance 24h Live)│ │
│  └─────────────────────────────┘ └─────────────────────────────┘ └───────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                         3. BLOCKCHAIN & AUTOMATION LAYER                               │
│  - DreamDEX On-Chain CLOB (BinaryPool & BinaryMarket Contracts)                        │
│  - Somnia GraphQL Indexer (https://dev.smk.somnia.host/v1/graphql)                     │
│  - Strategy Bot Suite: Starter Bot, Two-Sided Maker, Oracle Follower, AI Copilot       │
│  - Somnia Shannon Testnet (Chain ID: 50312, Sub-Second Block Finality)                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 4. Mathematical Formulations & Financial Modeling

ForeSight strictly separates qualitative multi-agent analysis from **deterministic financial mathematics**:

### 1. Trajectory Feasibility ($VC$)
| Metric | Formulation | Operational Interpretation |
| :--- | :--- | :--- |
| **`v_req`** | $(\Delta P / P_{\text{current}}) / T_{\text{remaining}}$ | Required price drift rate (% per minute) to cross strike |
| **`v_obs`** | $(P_{\text{current}} - P_{t-15\text{m}}) / 15$ | Realized 15-minute price drift rate from spot oracle |
| **`VC ≥ 1.0×`** | $v_{\text{obs}} / v_{\text{req}} \ge 1.0$ | **Feasible Trajectory:** Current momentum exceeds required drift |
| **`VC < 1.0×`** | $v_{\text{obs}} / v_{\text{req}} < 1.0$ | **High Decay Risk:** Asset requires external momentum |

### 2. Closed-Form Black-Scholes Binary Option Pricing
Computes theoretical fair value using the standard normal cumulative distribution $\Phi(d_2)$ via the **Abramowitz & Stegun rational Chebyshev approximation** (Formula 7.1.26, error $|\varepsilon| < 1.5 \times 10^{-7}$):

$$d_2 = \frac{\ln(S / K) + (r - 0.5 \sigma^2)\tau}{\sigma \sqrt{\tau}}$$
$$P_{\text{fair}} = \Phi(d_2)$$
$$\text{Theoretical Edge (bps)} = (P_{\text{fair}} - P_{\text{market}}) \times 10,000 \text{ bps}$$
$$\text{Half-Kelly Fraction } (f^*) = 0.5 \times \min\left(\frac{P_{\text{fair}} - P_{\text{market}}}{1 - P_{\text{market}}}, 0.25\right)$$

### 3. Discrete Binary Payoff Matrix
Given user collateral $C$ and entry price $P_{\text{entry}} \in (0.01, 0.99)$:

| Scenario | Payoff Equation | Example ($100 Collateral @ 0.60 Entry) |
| :--- | :--- | :--- |
| **Early Take-Profit** | $\text{PnL} = C \times \frac{P_{\text{exit}} - P_{\text{entry}}}{P_{\text{entry}}}$ | Exit @ 0.85 $\rightarrow$ **+$41.67 (+41.7% ROI)** |
| **Expiry Win (YES)** | $\text{PnL} = C \times \frac{1.00 - P_{\text{entry}}}{P_{\text{entry}}}$ | Settle @ $1.00 $\rightarrow$ **+$66.67 (+66.7% ROI)** |
| **Expiry Loss (NO)** | $\text{PnL} = -C$ | Settle @ $0.00 $\rightarrow$ **-$100.00 (-100.0% Max Loss)** |

---

## 📸 5. Proof-of-Thesis Alpha Card Studio

To support viral social prediction sharing across the Somnia ecosystem, ForeSight provides an in-terminal **Alpha Card Studio**:
* **1200×675 HD Canvas Export:** Generates high-resolution cybernetic trading cards formatted for X / Twitter (16:9) and Telegram.
* **Dual Evidence Stamps:** Displays quantitative metrics (VC momentum ratio, Model Edge in bps) alongside Dual AI consensus excerpts.
* **Network Verification Seal:** Certified watermark referencing Somnia Shannon Testnet (`Chain ID: 50312`) and DreamDEX CLOB.
* **1-Click Social Sharing:** 1-click copy raw image to clipboard, download PNG, or open a pre-populated tweet intent on X.

---

## 🤖 6. Automated Strategy Bot Suite

For algorithmic traders and automated market operations, ForeSight includes modular strategy runners powered by `@somnia-chain/markets-sdk`:

| Strategy CLI | Strategy Description | Execution Logic |
| :--- | :--- | :--- |
| `npm run agent:starter` | **Starter Order Bot** | Submits baseline limit orders and validates wallet approvals on Somnia Shannon |
| `npm run agent:maker` | **Two-Sided Market Maker** | Continuously quotes dynamic bid-ask spreads around fair probability |
| `npm run agent:oracle` | **Oracle Momentum Follower** | Evaluates spot oracle drift (Binance feeds) and snipes mispriced CLOB orders |
| `npm run agent:copilot` | **Autonomous AI Copilot** | Executes conditional orders based on Dual AI Arena conviction thresholds |

---

## 🎯 7. Hackathon Judging Criteria Alignment

| Hackathon Criterion | Weight | How ForeSight Delivers Impact |
| :--- | :---: | :--- |
| **Innovation & Originality** | **20%** | Replaces black-box guessing with **Adversarial Dual AI debate (Bull vs Bear)** grounded in live RAG news citations and deterministic trajectory physics ($VC$). |
| **Technical Implementation** | **25%** | Deep integration with `@somnia-chain/markets-sdk`, automated 10s anomaly indexer, 4 autonomous bot runners, and **120/120 passing Vitest tests (100%)**. |
| **User Experience & Design** | **20%** | Institutional cyberpunk bento cockpit, zero-latency client-side math, 1200×675 HD social Alpha Cards, and interactive onboarding guide. |
| **Business & Ecosystem Impact**| **20%** | Bridges retail traders and quants to DreamDEX CLOB, solves stranded capital via Settlement Sweeper, and drives continuous on-chain transactions on Somnia. |
| **Presentation & Demo** | **15%** | Comprehensive documentation, live working production terminal on Vercel, and a concise 2.5-minute video pitch walkthrough. |

---

## 🛠️ 8. Developer Feedback for Somnia & DreamDEX SDK

During the hackathon, we compiled **12 key findings & architectural recommendations** for the Somnia Core Team (see [DreamDEX-SDK-Feedback.md](docs/DreamDEX-SDK-Feedback.md)):

1. **Batch Settlement Claim Helper (`batchClaimSettledMarkets`):** Add a native SDK method `exchange.claimAllSettled({ venueId })` to batch-redeem winning shares across multiple matured pools in one multicall.
2. **Native WebSocket Orderbook Subscriptions:** Expose typed WebSocket subscriptions (`subscribeOrderBook`, `subscribeSpikes`) in `@somnia-chain/markets-sdk` to eliminate HTTP polling.
3. **Strict TypeScript Schemas for Binary Events:** Provide strongly-typed `BinaryMarketInfo` interfaces for `strikePrice`, `expiryTimestamp`, and `moneyness`.

---

## 💻 9. Developer Diagnostics & Test Coverage

ForeSight emphasizes protocol reliability, reproducible builds, and comprehensive test coverage:

```bash
# 1. Validate Somnia RPC, Indexer, Venue ID, and wallet state
npm run doctor

# 2. Query and inspect all 500+ active event contracts on Somnia Shannon
npm run markets

# 3. Scan finalized markets and execute automated batch settlement sweep
npm run claim

# 4. Run automated test suite (120/120 unit & integration tests passing)
npm test

# 5. Compile backend TypeScript engine
npm run build

# 6. Build production-optimized React 19 / Vite bundle
npm run build:ui
```

### Test Suite Execution Summary:
```text
 RUN  v4.1.11 D:/Coding/Somnia

 ✓ tests/deterministic-math.test.ts (14 tests)
 ✓ tests/advanced-pricing-and-vc.test.ts (22 tests)
 ✓ tests/quantitative-pricing.test.ts (18 tests)
 ✓ tests/confluence-and-invariants.test.ts (16 tests)
 ✓ tests/alpha-card-and-edge.test.ts (12 tests)
 ✓ tests/dual-debate-engine.test.ts (8 tests)
 ✓ tests/order-engine.test.ts (10 tests)
 ✓ tests/settlement-sweeper.test.ts (8 tests)
 ✓ tests/wallet-and-network.test.ts (6 tests)
 ✓ tests/market-snapshot-worker.test.ts (6 tests)

 Test Files  10 passed (10)
      Tests  120 passed (120) [100% Pass Rate]
   Duration  2.60s
```

---

## ⚡ 10. Quickstart Guide (Local Setup in 3 Minutes)

### Prerequisites
* Node.js $\ge 20.0.0$
* npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/DanhCaTuanNgoc/ForeSight.git
cd ForeSight
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Optional: Set `PRIVATE_KEY` for live on-chain testnet execution; without it, ForeSight operates in high-fidelity simulation mode).*

### 3. Launch Backend Services & Workers (Port 3001)
```bash
npm run server
```

### 4. Launch Frontend Terminal (Port 3000)
```bash
npm run ui
```
Open **`http://localhost:3000`** in your browser to access the live ForeSight terminal.

---

## 🗺️ 11. Future Roadmap Beyond Hackathon

* **Phase 1 (Current):** Testnet MVP on Somnia Shannon (`50312`), Dual AI Arena, 4 Strategy Bots, Alpha Card Studio.
* **Phase 2 (Somnia Mainnet):** Mainnet Deployment, Somnia Native Reactive Agent VM integration, Institutional REST API SDK, Mobile PWA Terminal.
* **Phase 3 (Ecosystem Scaling):** Cross-venue prediction aggregation, Social Copy-Trading Vaults, and decentralized strategy competitions.

---

## 📄 License & Acknowledgements

MIT License — see the [LICENSE](LICENSE) file for details. Built with ❤️ for the **Somnia × DreamDEX Event Contracts Hackathon**.  
Special thanks to the **Somnia Network** & **DreamDEX** engineering teams for developer tools, GraphQL indexers, and documentation support.

