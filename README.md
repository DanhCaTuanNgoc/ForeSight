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
* **Adversarial Multi-Agent Debate:** When a spike is selected, two specialized agents synthesize the market context:
  * **Alpha Bull AI:** Analyzes orderbook bid depth, upside momentum, and positive spot drift.
  * **Macro Bear AI:** Evaluates overhead resistance, time decay, and downside risk factors.
* **Verifiable Source Citations:** Every thesis cites real-world articles (`[View Evidence]`) ingested via live crypto RSS streams (CoinDesk, Cointelegraph, Decrypt). Subjective reasoning is strictly separated from deterministic mathematics.

### 3️⃣ SIMULATE: Trajectory Physics & Feasibility Modeling
* **Velocity Coverage Metric ($VC$):** Rather than speculative guesses, ForeSight calculates a physical trajectory feasibility ratio:
  $$\Delta\%_{\text{required}} = \frac{|P_{\text{strike}} - P_{\text{current}}|}{P_{\text{current}}} \times 100\%$$
  $$v_{\text{req}} = \frac{\Delta\%_{\text{required}}}{T_{\text{remaining}}} \quad (\%/\text{minute})$$
  $$VC = \frac{v_{\text{obs}}}{v_{\text{req}}}$$
  * If $VC = 1.35\times$: Observed spot momentum is running at 135% of the required velocity $\rightarrow$ **Trajectory mathematically feasible**.
  * If $VC = 0.42\times$: Market requires immediate $2.4\times$ acceleration $\rightarrow$ **High risk of expiry at zero**.
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
│  │ (Velocity $VC$, PnL & ROI)  │ │ (Batch Auto-Claim Finalized)│ │ (Binance 24h Live)│ │
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

### 1. Velocity Coverage ($VC$) Trajectory Feasibility
To evaluate: *"Does the underlying asset have sufficient spot momentum to cross the strike price before round expiry?"*

* **Distance to Strike ($\Delta P$):**
  $$\Delta P = |P_{\text{strike}} - P_{\text{current}}|$$

* **Required Velocity ($v_{\text{req}}$):**
  $$v_{\text{req}} = \frac{\Delta P / P_{\text{current}}}{T_{\text{remaining}}} \quad (\%/\text{minute})$$

* **Observed Velocity ($v_{\text{obs}}$):**
  $$v_{\text{obs}} = \frac{P_{\text{current}} - P_{t-15\text{m}}}{15} \quad (\%/\text{minute})$$

* **Trajectory Coverage Ratio ($VC$):**
  $$VC = \frac{v_{\text{obs}}}{v_{\text{req}}}$$
  * $VC \ge 1.0\times$: Observed spot momentum is running at or above required speed $\rightarrow$ **Trajectory physically feasible**.
  * $VC < 1.0\times$: Market requires spot acceleration $\rightarrow$ **Elevated risk of expiring out-of-the-money ($0.00)**.

---

### 2. Closed-Form Black-Scholes Binary Option Pricing & Basis Point Edge
To compute theoretical fair value independent of temporary orderbook imbalances, ForeSight implements the standard normal cumulative distribution $\Phi(d_2)$ via the **Abramowitz & Stegun rational Chebyshev approximation** (Formula 7.1.26, $|\epsilon| < 1.5 \times 10^{-7}$):

* **Standard Binary $d_2$ Term:**
  $$d_2 = \frac{\ln(S / K) + \left(r - \frac{1}{2}\sigma^2\right)\tau}{\sigma \sqrt{\tau}}$$

* **Theoretical Fair Probability ($P_{\text{fair}}$):**
  $$P_{\text{fair}} = \Phi(d_2)$$

* **Anti-Pin-Risk Diffusion Floor:** For short horizons ($1\text{m}, 5\text{m}$), ForeSight enforces a diffusion floor $\tau_{\text{floor}} = 45\text{s}$ to prevent step-function probability cliff collapses as $\tau \to 0$:
  $$\tau_{\text{eff}} = \max(\tau, \, \tau_{\text{floor}})$$

* **Theoretical Edge in Basis Points ($\text{Edge}_{\text{bps}}$):**
  $$\text{Edge}_{\text{bps}} = (P_{\text{fair}} - P_{\text{market}}) \times 10{,}000 \quad (\text{bps})$$

* **Half-Kelly Capital Allocation ($f^*$):**
  $$f^* = \frac{1}{2} \left[ \frac{P_{\text{fair}} - P_{\text{market}}}{1 - P_{\text{market}}} \right]$$
  *(Note: $f^*$ is automatically capped at $25\%$ of portfolio collateral to guard against tail variance).*

---

### 3. Discrete Binary Payoff & Early-Exit Formulation
Given user allocation $C$ (Collateral) and entry market price $P_{\text{entry}} \in (0, 1)$:

* **Contracts Minted ($N$):**
  $$N = \frac{C}{P_{\text{entry}}}$$

* **Early-Exit PnL (at target market price $P_{\text{target}}$):**
  $$\text{PnL}_{\text{early}} = (N \times P_{\text{target}}) - C = C \times \left( \frac{P_{\text{target}} - P_{\text{entry}}}{P_{\text{entry}}} \right)$$

* **Expiry Settlement PnL (at settlement payout $\$1.00$):**
  $$\text{PnL}_{\text{expiry}} = (N \times \$1.00) - C = C \times \left( \frac{1.00 - P_{\text{entry}}}{P_{\text{entry}}} \right)$$

* **Maximum Downside Risk:**
  $$\text{Max Loss} = -100\% \times C$$

---

## 📸 5. Proof-of-Thesis Alpha Card Studio

To support viral social prediction sharing across the Somnia ecosystem, ForeSight provides an in-terminal **Alpha Card Studio**:
* **1200×675 HD Canvas Export:** Generates high-resolution cybernetic trading cards formatted for X / Twitter (16:9) and Telegram.
* **Dual Evidence Stamps:** Displays quantitative metrics ($VC$ momentum ratio, Model Edge in bps) alongside Dual AI consensus excerpts.
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
