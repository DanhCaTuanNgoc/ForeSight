<div align="center">

<p align="center">
  <img src="./public/foresight-logo.svg" width="120" height="120" alt="ForeSight Logo" />
</p>

# ForeSight
### *The Precision Trading & Decision Terminal for DreamDEX on Somnia L1*

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

🌐 **Live Production Terminal:** [foresightdex.vercel.app](https://foresightdex.vercel.app/) &nbsp;•&nbsp; ⚡ **Somnia Shannon Testnet:** `Chain ID: 50312` &nbsp;•&nbsp; 🎯 **Target Protocol:** `DreamDEX CLOB`

<br/>

> **Core Philosophy:** *"Understand the market before you trade it"*  
> ForeSight is **not a black-box predictive chatbot**. It is an **institutional-grade decision support terminal** built specifically for DreamDEX Event Contracts on Somnia L1. ForeSight transforms volatile, high-cadence prediction market noise into an actionable, verifiable 4-step decision loop: **DETECT $\rightarrow$ CHALLENGE $\rightarrow$ SIMULATE $\rightarrow$ EXECUTE**.

</div>

---

### 🧭 Hackathon Judges & Developers Quick Navigation

| Resource | Description | Direct Link |
| :--- | :--- | :--- |
| 🚀 **Live Production Terminal** | High-performance institutional trading terminal on Vercel | [foresightdex.vercel.app](https://foresightdex.vercel.app/) |
| 📖 **Technical Architecture Document** | Product specification, mathematical modeling & risk framework | [Project-Details.md](Project-Details.md) |
| 🛠️ **DreamDEX SDK & Protocol Feedback** | 12 technical findings & ergonomic suggestions for Somnia Core Devs | [DreamDEX-SDK-Feedback.md](DreamDEX-SDK-Feedback.md) |
| 🎬 **Demo Video Pitch & Script** | 2.5-minute structured demonstration video pitch guide | [Demo-Video-Script.md](Demo-Video-Script.md) |
| 📋 **Milestone Backlog & Verification** | Complete development log & verification checklist | [Plan-Tracking-v1.md](Plan-Tracking-v1.md) |

---

## 🌟 1. The Core Problem on DreamDEX & Somnia

On high-throughput, sub-second finality blockchains like **Somnia Layer 1 (100k+ TPS)**, binary event contracts (1m, 5m, 15m, 1h BTC/ETH/SOL contracts) operate at unprecedented speed. Across **500+ active markets** on DreamDEX, traders face three critical bottlenecks:

1. **Contextless Volatility Surges:** Odds suddenly swing from 30% to 75% in minutes. Traders have zero immediate context on whether the spike is driven by macro news, spot momentum, or temporary orderbook skew.
2. **The "Black-Box AI" Dilemma:** Generic predictive bots offer single-number speculation without sources, encouraging uncalculated gambling instead of disciplined risk management.
3. **Non-Linear Payoffs & Stranded Capital:** Binary options settle discontinuously ($1.00 or $0.00). Calculating required price velocity, early-exit PnL, and breakeven boundaries under time pressure is complex, while winnings remain stranded across dozens of expired rounds without batch redemption.

---

## 🔄 2. The 4-Stage Decision Architecture

ForeSight resolves these bottlenecks by organizing raw CLOB orderbooks into a structured **decision loop**:

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
* **10-Second Anomaly Scanner:** Continuously monitors active event contracts. Any probability shift $\ge 10\%$ between snapshots is automatically flagged with an interactive timeline marker.

### 2️⃣ CHALLENGE: Dual-Agent Thesis Debate & Grounded RAG
* **Adversarial Multi-Agent Debate:** When an asset or spike is selected, two specialized agents synthesize the market context:
  * **Alpha Bull AI:** Analyzes orderbook bid depth, upside momentum, order asymmetry, and positive spot catalysts.
  * **Macro Bear AI:** Evaluates overhead resistance, time decay ($\theta$ decay), downside risk skew, and binary asymmetry.
* **Verifiable Source Citations:** Every thesis cites real-world articles (`[View Evidence]`) ingested via live crypto RSS streams (CoinDesk, Cointelegraph, Decrypt). Subjective reasoning is strictly separated from deterministic mathematics.

#### 🧠 Context-Grounding Prompt & Schema Architecture
ForeSight transforms raw on-chain state and live news streams into a structured adversarial prompt:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      DYNAMIC CONTEXT INGESTION                         │
│  - Market: [Asset] Event Contract ([Interval] Cadence)                 │
│  - On-Chain State: Live Implied Odds [X]%, Orderbook Spread [Y] bps    │
│  - Real-Time Grounding Context (RAG):                                  │
│    [1] "Bitcoin Spot ETF Inflows Expand..." (CoinDesk)                 │
│    [2] "Macro Fed Liquidity Sentiment..." (CoinTelegraph)              │
│    [3] "Decentralized Prediction Orderbooks..." (Decrypt)              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ADVERSARIAL PROMPT INSTRUCTION                       │
│  "You are ForeSight Dual AI Arena on Somnia L1. Synthesize two        │
│   opposing institutional perspectives for this prediction market.      │
│   Return strictly valid JSON with bull & bear cases."                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      STRUCTURED JSON OUTPUT SCHEMA                     │
│  {                                                                     │
│    "bullHeadline": "Institutional accumulation defending $77.5K strike",│
│    "bullConfidence": 0.85,                                             │
│    "bullTarget": 0.80,                                                 │
│    "bullKeyArguments": ["Orderbook bid asymmetry exceeds ask depth..."],│
│    "bullCatalysts": ["Spot volume surge in last 15m..."],              │
│    "bearHeadline": "Overextended volatility with binary theta decay", │
│    "bearConfidence": 0.75,                                             │
│    "bearTarget": 0.35,                                                 │
│    "bearKeyArguments": ["Binary theta decay accelerates near expiry..."],│
│    "bearRiskFactors": ["Ask wall resistance at 75% probability..."],  │
│    "summary": "Consensus favors short-term upside with tight stop..."  │
│  }                                                                     │
└────────────────────────────────────────────────────────────────────────┘
```


### 3️⃣ SIMULATE: Trajectory Physics & Feasibility Modeling
* **Velocity Coverage Metric (`VC`):** Rather than speculative guesses, ForeSight calculates a physical trajectory feasibility ratio:
  ```text
  ΔP_required = | P_strike - P_current | / P_current × 100%
  v_required  = ΔP_required / T_remaining  (%/minute)
  VC          = v_observed / v_required
  ```
  * If `VC ≥ 1.00×`: Observed spot momentum is running at or above required velocity → **Trajectory physically feasible**.
  * If `VC < 1.00×`: Market requires spot acceleration → **Elevated risk of expiring at zero ($0.00)**.
* **Zero-Latency Client-Side Math:** Sliders compute capital allocation, early-exit PnL, expiry payout, and breakeven boundaries directly in the browser with 0ms network lag.

### 4️⃣ EXECUTE: 1-Click CLOB Trading & Batch Auto-Claim
* **1-Click CLOB Order Dispatch:** Submits limit orders directly to DreamDEX contracts via `@somnia-chain/markets-sdk` and Viem.
* **Simulation Sandbox Fallback:** High-fidelity simulation mode allows full interface testing even without an active funded private key.
* **Settlement Sweeper:** Detects all matured contracts and batch-redeems winnings in a single transaction, eliminating stranded capital.

---

## 🏗️ 3. Three-Tier System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              1. PRESENTATION & TERMINAL UI                             │
│  - Precision Terminal & Dark Surfaces  - Interactive Dual Debate Arena                 │
│  - Real-time Probability Timeline      - 1-Click Simulator & Execution Dock            │
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

---

### 1. Velocity Coverage (`VC`) Trajectory Feasibility
Evaluates whether the underlying spot asset has sufficient momentum to reach the strike price before round expiry.

```text
┌────────────────────────────────────────────────────────────────────────┐
│  1. Distance to Strike:    ΔP = | P_strike - P_current |               │
│  2. Required Velocity:     v_req = (ΔP / P_current) / T_remaining      │
│  3. Observed Velocity:     v_obs = (P_current - P_t-15m) / 15m         │
│  4. Velocity Coverage:     VC = v_obs / v_req                          │
└────────────────────────────────────────────────────────────────────────┘
```

| Metric | Formulation | Interpretation |
| :--- | :--- | :--- |
| **`v_req`** | `(ΔP / P_current) / T_remaining` | Required price drift rate (% per minute) to cross strike |
| **`v_obs`** | `(P_current - P_t-15m) / 15` | Realized 15-minute price drift rate from spot oracle |
| **`VC ≥ 1.0×`** | `v_obs / v_req ≥ 1.0` | **Feasible Trajectory:** Current momentum exceeds required drift |
| **`VC < 1.0×`** | `v_obs / v_req < 1.0` | **High Decay Risk:** Asset requires external momentum |

---

### 2. Closed-Form Black-Scholes Binary Option Pricing & Model Edge
To compute theoretical fair value independent of temporary orderbook imbalances, ForeSight implements the standard normal cumulative distribution `Φ(d2)` via the **Abramowitz & Stegun rational Chebyshev approximation** (Formula 7.1.26, error `|ε| < 1.5 × 10⁻⁷`):

```text
┌────────────────────────────────────────────────────────────────────────┐
│  d2 = [ ln(S / K) + (r - 0.5 * σ²) * τ ] / [ σ * sqrt(τ) ]             │
│  Fair Probability (P_fair) = Φ(d2)                                     │
│  Theoretical Edge (bps)   = (P_fair - P_market) × 10,000 bps           │
│  Half-Kelly Fraction (f*) = 0.5 × [ (P_fair - P_market) / (1 - P_market) ]│
└────────────────────────────────────────────────────────────────────────┘
```

| Parameter / Metric | Definition & Value Range | Operational Role |
| :--- | :--- | :--- |
| **`S / K`** | Spot Price `S` / Strike Price `K` | Moneyness ratio from spot oracle |
| **`τ_eff` (Anti-Pin Risk)** | `max(τ, 45s)` | Diffusion floor preventing probability cliff collapses near expiry |
| **`Edge (bps)`** | `(P_fair - P_market) × 10,000` | Mispricing spread in basis points relative to CLOB mid-price |
| **`Half-Kelly (f*)`** | `min(f*, 25%)` | Recommended capital allocation percentage, capped for preservation |

---

### 3. Discrete Binary Payoff & Early-Exit Formulation
Given user collateral `C` and market entry price `P_entry ∈ (0.01, 0.99)`:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  Contracts Minted (N) = C / P_entry                                    │
│  Early-Exit PnL       = C × [ (P_target - P_entry) / P_entry ]         │
│  Expiry Settlement    = C × [ (1.00 - P_entry) / P_entry ]             │
│  Maximum Loss         = -100% × C  (Explicit downside cap)             │
└────────────────────────────────────────────────────────────────────────┘
```

| Scenario | Payoff Equation | Example ($100 Collateral @ 0.60 Entry) |
| :--- | :--- | :--- |
| **Early Take-Profit** | `PnL = C × ((P_exit - P_entry) / P_entry)` | Exit @ 0.85 → **+$41.67 (+41.7% ROI)** |
| **Expiry Win (YES)** | `PnL = C × ((1.00 - P_entry) / P_entry)` | Settle @ $1.00 → **+$66.67 (+66.7% ROI)** |
| **Expiry Loss (NO)** | `PnL = -C` | Settle @ $0.00 → **-$100.00 (-100.0% Max Loss)** |

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

| Strategy CLI | Description | Execution Logic |
| :--- | :--- | :--- |
| `npm run agent:starter` | **Starter Order Bot** | Submits baseline limit orders and validates wallet approvals |
| `npm run agent:maker` | **Two-Sided Market Maker** | Quotes dynamic bid-ask spreads around mid-market probability |
| `npm run agent:oracle` | **Oracle Momentum Follower** | Evaluates spot oracle drift and takes mispriced orders |
| `npm run agent:copilot` | **Autonomous AI Copilot** | Executes conditional orders based on Dual AI conviction thresholds |

---

## 💻 7. Developer Diagnostics & Test Coverage

ForeSight emphasizes protocol reliability and developer tooling:

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

---

## ⚡ 8. Quickstart Guide (Local Setup in 3 Minutes)

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

## 📄 License & Acknowledgements

MIT License. Built with ❤️ for the **Somnia × DreamDEX Event Contracts Hackathon**.  
Special thanks to the **Somnia Network** & **DreamDEX** engineering teams for developer tools and documentation support.
