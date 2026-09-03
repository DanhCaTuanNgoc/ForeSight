<div align="center">

# 🧠 ForeSight — The Cognitive Trading Terminal for DreamDEX
### *Detect the move. Challenge the thesis. Model the trajectory. Execute with confidence on Somnia L1.*

[![Somnia Network](https://img.shields.io/badge/Somnia-Shannon_Testnet_(50312)-7C3AED?style=for-the-badge&logo=blockchain)](https://somnia.network)
[![DreamDEX CLOB](https://img.shields.io/badge/Protocol-DreamDEX_Event_Contracts-06B6D4?style=for-the-badge)](https://dev.smk.somnia.host)
[![Tests Passing](https://img.shields.io/badge/Tests-120%2F120%20Passed%20(100%25)-00e676?style=for-the-badge&logo=vitest&logoColor=white)](tests/)
[![Evidence-Grounded AI](https://img.shields.io/badge/Adversarial_AI-Gemini_+_Groq_+_RAG-f55036?style=for-the-badge&logo=google&logoColor=white)](src/agents/strategies/dual-debate-engine.ts)
[![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite_6-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br/>

**Live Production Terminal:** [foresightdex.vercel.app](https://foresightdex.vercel.app/) &nbsp;•&nbsp; **Somnia Shannon Testnet:** `Chain ID: 50312` &nbsp;•&nbsp; **Target Protocol:** `DreamDEX On-Chain CLOB`

<br/>

> **Core Philosophy:** *"Understand the market before you trade it"*  
> ForeSight is **not a black-box predictive chatbot**. It is a **cognitive decision-support terminal** designed specifically for DreamDEX Event Contracts on Somnia L1. ForeSight transforms volatile, fast-cadence prediction market noise into an actionable, verifiable 4-step decision loop: **DETECT $\rightarrow$ DEBATE $\rightarrow$ SIMULATE $\rightarrow$ EXECUTE**.

</div>

---

### 🧭 Judges & Developers Quick Navigation

| Resource | Description | Direct Link |
| :--- | :--- | :--- |
| 🚀 **Live Terminal UI** | Production Cyberpunk Trading Terminal on Vercel | [foresightdex.vercel.app](https://foresightdex.vercel.app/) |
| 📖 **Technical Architecture Document** | In-depth product specification, trajectory modeling & risk framework | [Project-Details.md](Project-Details.md) |
| 🛠️ **DreamDEX SDK & Protocol Feedback** | 12 critical findings & ergonomic recommendations for Somnia Core Devs | [DreamDEX-SDK-Feedback.md](DreamDEX-SDK-Feedback.md) |
| 🎬 **Demo Video Walkthrough Script** | 2.5-minute structured demonstration pitch & screen recording guide | [Demo-Video-Script.md](Demo-Video-Script.md) |
| 📋 **Sprint Tracking & Verification** | Phase-by-phase development backlog & milestone checklist | [Plan-Tracking-v1.md](Plan-Tracking-v1.md) |

---

## 🌟 1. The Core Problem on DreamDEX & Somnia

On high-throughput, sub-second finality blockchains like **Somnia Layer 1 (100k+ TPS)**, binary event contracts (1m, 5m, 15m, 1h BTC/ETH/SOL contracts) operate at unprecedented speed. With over **500+ active markets** on DreamDEX, traders face three critical bottlenecks:

1. **Contextless Volatility Surges:** Odds suddenly swing from 30% to 75% in minutes. Traders have no context on whether the spike is driven by macro news, spot momentum, or temporary order book skew.
2. **The "Black-Box AI" Dilemma:** Generic LLM bots offer unverified predictions without citations, encouraging blind gambling instead of disciplined trading.
3. **Non-Linear Payoffs & Stranded Capital:** Binary options settle discontinuously ($1.00 or $0.00). Manually calculating required price velocity, early-exit PnL, and breakeven odds under time pressure is nearly impossible, while winnings remain stranded across dozens of expired rounds without batch redemption.

---

## 🔄 2. The 4-Step Cognitive Trading Loop

ForeSight resolves these bottlenecks by organizing raw CLOB order books into a complete **cognitive trading loop**:

```text
                 DREAMDEX CLOB (500+ Active Markets)
                                │
                                ▼
                      ┌───────────────────┐
                      │    1. DETECT      │
                      │                   │
                      │ What happened?    │
                      │ Probability Curve │
                      │ Spike Detection   │
                      └─────────┬─────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │    2. DEBATE      │
                      │                   │
                      │ What changed?     │
                      │ Bull vs Bear AI   │
                      │ Grounded Sources  │
                      └─────────┬─────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │   3. SIMULATE     │
                      │                   │
                      │ What if?          │
                      │ Velocity Coverage │
                      │ Zero-Lag PnL Math │
                      └─────────┬─────────┘
                                │
                                ▼
                      ┌───────────────────┐
                      │    4. EXECUTE     │
                      │                   │
                      │ What do I do?     │
                      │ 1-Click CLOB Order│
                      │ Auto-Claim Sweep  │
                      └───────────────────┘
```

### 1️⃣ DETECT: *"What happened?"* (Probability Timeline & Anomaly Detection)
* **Real-Time Area Chart:** Continuously plots implied odds ($0\% \rightarrow 100\%$) across multiple time windows (`15m`, `1h`, `4h`) using live market indexer data.
* **10-Second Spike Detection Worker:** Continuously scans all 500+ active event contracts. Any probability shift $\ge 10\%$ between snapshots is automatically flagged with an interactive, pulsing spike marker.

### 2️⃣ DEBATE: *"What changed?"* (Adversarial AI Arena & Grounded RAG)
* **Dual-Agent Adversarial Debate:** When a spike is selected, two competing agents synthesize the market context:
  * **Alpha Bull AI:** Analyzes orderbook bid depth, upside momentum, and positive spot drift.
  * **Macro Bear AI:** Evaluates overhead resistance, time decay, and downside risk factors.
* **Evidence-Grounded Source Attribution:** Every argument cites verified real-world articles (`[View Sources]`) ingested via live crypto RSS streams (CoinDesk, Cointelegraph, Decrypt). Subjective reasoning is completely separated from mathematical calculation.

### 3️⃣ SIMULATE: *"What if?"* (Velocity Coverage & Trajectory Modeling)
* **Velocity Coverage Metric ($VC$):** Rather than offering speculative guesses, ForeSight calculates a physical **Trajectory Feasibility Metric**:
  $$\Delta\%_{\text{required}} = \frac{|P_{\text{strike}} - P_{\text{current}}|}{P_{\text{current}}} \times 100\%$$
  $$v_{\text{req}} = \frac{\Delta\%_{\text{required}}}{T_{\text{remaining}}} \quad (\%/\text{minute})$$
  $$VC = \frac{v_{\text{obs}}}{v_{\text{req}}}$$
  * If $VC = 1.35\times$: Observed spot momentum is running at 135% of the required velocity $\rightarrow$ **Trajectory mathematically feasible**.
  * If $VC = 0.42\times$: Market requires immediate $2.4\times$ acceleration $\rightarrow$ **High risk of expiry at zero**.
* **Instant Client-Side Deterministic Math:** Zero-network-latency sliders calculate position size, early-exit PnL, expiry payoff, and breakeven boundaries directly in the browser.

### 4️⃣ EXECUTE: *"What do I do?"* (Streamlined CLOB Trading & Auto-Claim)
* **1-Click CLOB Order Dispatch:** Submits limit orders directly to DreamDEX contracts via `@somnia-chain/markets-sdk` and Viem.
* **Simulation Mode Fallback:** High-fidelity simulation mode allows full interface testing even without an active funded private key.
* **Auto-Claim Settlement Sweeper:** Detects all matured contracts and batch-redeems winnings in a single transaction, eliminating stranded capital.

---

## 🏗️ 3. Three-Tier System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              1. CORE: COGNITIVE TRADING LOOP                            │
│  - Probability Timeline (Detect)       - Dual AI Arena Debate (Debate)                 │
│  - Velocity Coverage & Simulator (Simulate) - 1-Click Execution & Sweeper (Execute)    │
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
│  - Strategy Bot Fleet: Starter Bot, Two-Sided Maker, Oracle Follower, AI Copilot       │
│  - Somnia Shannon Testnet (Chain ID: 50312, Sub-Second Block Finality)                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 4. Mathematical Modeling & Settlement Formulations

ForeSight strictly separates subjective qualitative analysis from **deterministic financial mathematics**:

### 1. Velocity Coverage ($VC$) as a Trajectory Feasibility Metric
To answer: *"Does the underlying asset have sufficient momentum to cross the strike before round expiry?"*
* **Distance to Strike:** $\Delta P = |P_{\text{strike}} - P_{\text{current}}|$
* **Required Velocity:** $v_{\text{req}} = \frac{\Delta P / P_{\text{current}}}{T_{\text{remaining}}}$
* **Observed Velocity:** $v_{\text{obs}} = \frac{P_{\text{current}} - P_{t-15\text{m}}}{15}$
* **Trajectory Coverage Ratio:**
  $$VC = \frac{v_{\text{obs}}}{v_{\text{req}}}$$
  *(Note: $VC$ is a momentum feasibility metric, not an unconditional guarantee. It informs whether the required path is physically plausible given current volatility).*

### 2. Closed-Form Black-Scholes Binary Option Pricing & Basis Point Edge
To compute theoretical fair value independent of orderbook imbalances, ForeSight implements high-precision standard normal cumulative distribution $\Phi(z)$ via **Abramowitz & Stegun rational Chebyshev approximation** (Formula 7.1.26, $|\epsilon| < 1.5 \times 10^{-7}$):
$$d_2 = \frac{\ln(S / K) + \left(r - \frac{1}{2}\sigma^2\right)\tau}{\sigma \sqrt{\tau}}$$
$$\text{Fair Probability} = \Phi(d_2)$$
* **Anti-Pin-Risk Diffusion Floor:** For short horizons ($1\text{m}, 5\text{m}$), enforces $\tau_{\text{floor}} = 45\text{s}$ to prevent step-function probability cliff collapses as $\tau \to 0$.
* **Theoretical Edge in Basis Points ($bps$):**
  $$\text{Edge}_{bps} = (\text{Fair Probability} - P_{\text{market}}) \times 10{,}000 \quad (bps)$$
* **Half-Kelly Capital Allocation:** Recommends optimal bankroll fraction $f^* = \frac{1}{2} \left[ \frac{\text{Fair} - P_{\text{market}}}{1 - P_{\text{market}}} \right]$, capped at $25\%$ to protect against drawdown.

### 3. Discrete Binary Payoff & Early-Exit Formulation
Given user allocation $C$ (Collateral) and entry odds $P_{\text{entry}} \in [0.01, 0.99]$:
* **Contracts Minted:** $N = \frac{C}{P_{\text{entry}}}$
* **Early-Exit PnL (at target odds $P_{\text{target}}$):**
  $$\text{PnL}_{\text{early}} = (N \times P_{\text{target}}) - C = C \times \left( \frac{P_{\text{target}} - P_{\text{entry}}}{P_{\text{entry}}} \right)$$
* **Expiry Settlement PnL (at payout $\$1.00$):**
  $$\text{PnL}_{\text{expiry}} = (N \times \$1.00) - C = C \times \left( \frac{1.00 - P_{\text{entry}}}{P_{\text{entry}}} \right)$$
* **Maximum Risk:** $\text{Max Loss} = -100\% \times C$ (Disclosed explicitly before execution).

---

## 📸 5. Proof-of-Thesis Alpha Card Studio & Viral Social Sharing

To accelerate viral ecosystem adoption and social prediction sharing on Somnia, ForeSight includes an in-terminal **Proof-of-Thesis Alpha Card Studio**:
* **1200×675 HD Canvas Export:** Renders cybernetic, high-resolution trading cards formatted perfectly for Twitter (16:9) and Telegram.
* **Dual Evidence Stamps:** Displays both quantitative metrics ($VC$ momentum ratio, Model Edge in bps) and qualitative Dual AI consensus snippets.
* **Network Verification Seal:** Certified watermark referencing Somnia Shannon Testnet (`Chain ID: 50312`) and DreamDEX CLOB.
* **1-Click Social Intent:** Single click to copy raw image to clipboard, download high-DPI PNG, or launch a pre-populated tweet on X.

---

## 🤖 6. Automated Strategy Bot Suite

For programmatic traders, ForeSight provides modular strategy runners built on top of `@somnia-chain/markets-sdk`:

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

# 4. Run automated test suite (120/120 unit & integration tests passing — 10 test suites)
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
*(Optional: Add `PRIVATE_KEY` for live on-chain testnet execution; without it, ForeSight runs in high-fidelity simulation mode).*

### 3. Launch Backend Services & Workers (Port 3001)
```bash
npm run server
```

### 4. Launch Frontend Terminal (Port 3000)
```bash
npm run ui
```
Open **`http://localhost:3000`** to access the live ForeSight terminal.

---

## 📄 License & Acknowledgements

MIT License. Built with ❤️ for the **Somnia × DreamDEX Event Contracts Hackathon** on DoraHacks.
Special thanks to the **Somnia Network** & **DreamDEX** engineering teams for developer support.
