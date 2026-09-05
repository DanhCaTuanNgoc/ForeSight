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

🌐 **Live Production Terminal:** [foresightdex.vercel.app](https://foresightdex.vercel.app/) &nbsp;•&nbsp; ⚡ **Somnia Shannon Testnet:** `Chain ID: 50312` &nbsp;•&nbsp; 🎯 **Target Protocol:** `DreamDEX CLOB`

<br/>

> **Core Philosophy:** *"Understand the market before you trade it"*  
> ForeSight is **not a black-box predictive chatbot**. It is an **institutional-grade decision support and execution terminal** built specifically for DreamDEX Event Contracts on Somnia L1. ForeSight transforms volatile, sub-second prediction market noise into an actionable, verifiable 4-step decision loop: **DETECT $\rightarrow$ CHALLENGE $\rightarrow$ SIMULATE $\rightarrow$ EXECUTE**.

</div>

---

## 📑 Table of Contents

1. [Executive Summary & Product Vision](#-1-executive-summary--product-vision)
2. [The Core Problem & Market Opportunity on Somnia L1](#-2-the-core-problem--market-opportunity-on-somnia-l1)
3. [The 4-Stage Decision Architecture](#-3-the-4-stage-decision-architecture)
   - [Stage 1: DETECT (10s Orderbook Anomaly Scanner)](#1️⃣-detect-orderbook-anomaly-detection)
   - [Stage 2: CHALLENGE (Dual-Agent Adversarial Debate & Grounded RAG)](#2️⃣-challenge-adversarial-dual-agent-debate--grounded-rag)
   - [Stage 3: SIMULATE (Trajectory Physics & Zero-Lag Math)](#3️⃣-simulate-trajectory-physics--feasibility-modeling)
   - [Stage 4: EXECUTE (1-Click CLOB & Batch Settlement Sweeper)](#4️⃣-execute-1-click-clob-trading--settlement-sweeper)
4. [Mathematical Formulations & Quantitative Foundation](#-4-mathematical-formulations--quantitative-foundation)
   - [Velocity Coverage ($VC$) Trajectory Feasibility](#1-velocity-coverage-vc--trajectory-feasibility)
   - [Closed-Form Black-Scholes Binary Option Pricing & Half-Kelly](#2-closed-form-black-scholes-binary-option-pricing--model-edge)
   - [Discrete Binary Payoff Matrix & Early Exit](#3-discrete-binary-payoff-matrix--early-exit-formulation)
5. [Proof-of-Thesis Alpha Card Studio (1200×675 HD)](#-5-proof-of-thesis-alpha-card-studio)
6. [Automated Strategy Bot Suite & Personas](#-6-automated-strategy-bot-suite--personas)
7. [Three-Tier System Architecture & Data Flow](#-7-three-tier-system-architecture--data-flow)
8. [Developer Diagnostics & Test Verification (120/120 Tests)](#-8-developer-diagnostics--test-verification-120120-tests)
9. [Somnia & DreamDEX Developer Feedback Report](#-9-somnia--dreamdex-developer-feedback-report)
10. [Hackathon Judging Criteria Alignment](#-10-hackathon-judging-criteria-alignment)
11. [Local Installation & Development Guide](#-11-local-installation--development-guide)
12. [Future Roadmap Beyond Hackathon](#-12-future-roadmap-beyond-hackathon)
13. [License & Acknowledgements](#-13-license--acknowledgements)

---

## 🌟 1. Executive Summary & Product Vision

Binary event contracts represent the purest financial vehicle for expressing conviction on future events. On high-throughput, sub-second finality Layer 1 blockchains like **Somnia (100k+ TPS, sub-second finality)**, prediction markets operate at microsecond velocities across hundreds of concurrent pools.

However, speed without intelligence breeds reckless speculation. **ForeSight** bridges the gap between raw blockchain throughput and disciplined financial execution:

* **No Black-Box Predictions:** ForeSight never gives arbitrary "buy/sell" advice. Instead, it surfaces the macro and orderbook context so traders understand the market structure before committing capital.
* **Separation of Reasoning from Math:** Subjective reasoning is handled by an adversarial Dual AI debate with live news citations (RAG), while capital allocation and trajectory feasibilities are computed through deterministic financial physics.
* **Capital Efficiency:** Automatic detection and 1-click batch sweeping of matured contracts eliminates the stranded capital problem common in fast-cadence binary markets.

```
       RAW DREAMDEX CLOB DATA ──► [ DETECT ] ──► [ CHALLENGE ] ──► [ SIMULATE ] ──► [ EXECUTE ]
       (500+ Active Markets)       Spike Radar    Adversarial AI    Velocity Math    1-Click / Sweeper
```

---

## ⚡ 2. The Core Problem & Market Opportunity on Somnia L1

Across **500+ active event contracts** on DreamDEX (1m, 5m, 15m, 1h BTC/ETH/SOL contracts), traders face three fundamental bottlenecks:

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

### Why a "Decision Terminal" Instead of Another DEX?
DreamDEX already provides an exceptional CLOB orderbook and liquidity infrastructure. Building another basic trading UI adds little value. **ForeSight acts as the "Bloomberg Terminal + Quant Simulator" layer for Somnia Event Contracts**, elevating prediction markets from blind casinos into structured, professional trading environments.

---

## 🔄 3. The 4-Stage Decision Architecture

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
* **Verifiable Source Citations:** Every thesis cites real-world articles (`[View Evidence]`) ingested via live crypto RSS streams (CoinDesk, Cointelegraph, Decrypt).

#### 🧠 Context Ingestion & Structured Output Schema
```json
{
  "bullHeadline": "Institutional accumulation defending $77.5K strike",
  "bullConfidence": 0.85,
  "bullTarget": 0.80,
  "bullKeyArguments": ["Orderbook bid asymmetry exceeds ask depth..."],
  "bullCatalysts": ["Spot volume surge in last 15m..."],
  "bearHeadline": "Overextended volatility with binary theta decay",
  "bearConfidence": 0.75,
  "bearTarget": 0.35,
  "bearKeyArguments": ["Binary theta decay accelerates near expiry..."],
  "bearRiskFactors": ["Ask wall resistance at 75% probability..."],
  "summary": "Consensus favors short-term upside with tight stop..."
}
```

### 3️⃣ SIMULATE: Trajectory Physics & Feasibility Modeling
* **Velocity Coverage Metric (`VC`):** Evaluates whether the underlying spot asset has sufficient physical momentum to reach the strike price before round expiry:
  $$\Delta P_{\text{required}} = \frac{|P_{\text{strike}} - P_{\text{current}}|}{P_{\text{current}}} \times 100\%$$
  $$v_{\text{required}} = \frac{\Delta P_{\text{required}}}{T_{\text{remaining}}} \quad (\%/\text{minute})$$
  $$VC = \frac{v_{\text{observed}}}{v_{\text{required}}}$$
  * **$VC \ge 1.00\times$:** Realized spot momentum exceeds the required drift rate $\rightarrow$ **Trajectory physically feasible**.
  * **$VC < 1.00\times$:** Asset requires external momentum surge $\rightarrow$ **Elevated risk of expiring at zero ($0.00)**.
* **Zero-Latency Client-Side Math:** Sliders compute capital allocation, early-exit take-profit targets, expiration payoffs, and breakeven boundaries directly in the browser with 0ms network lag.

### 4️⃣ EXECUTE: 1-Click CLOB Trading & Settlement Sweeper
* **1-Click CLOB Dispatch:** Places limit and market orders directly to DreamDEX contracts via `@somnia-chain/markets-sdk` and Viem.
* **Simulation Sandbox Fallback:** High-fidelity simulation mode allows comprehensive terminal exploration even without an active funded private key.
* **Settlement Sweeper:** Detects all finalized rounds and batch-redeems winnings in a single transaction, eliminating stranded capital.

---

## 📐 4. Mathematical Formulations & Quantitative Foundation

ForeSight strictly separates qualitative multi-agent reasoning from **deterministic financial mathematics**:

### 1. Velocity Coverage (`VC`) — Trajectory Feasibility
Evaluates whether the spot asset has sufficient physical momentum to reach the strike price before round expiry:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  1. Distance to Strike:    ΔP = | P_strike - P_current |               │
│  2. Required Velocity:     v_req = (ΔP / P_current) / T_remaining      │
│  3. Observed Velocity:     v_obs = (P_current - P_t-15m) / 15m         │
│  4. Velocity Coverage:     VC = v_obs / v_req                          │
└────────────────────────────────────────────────────────────────────────┘
```

| Metric | Formulation | Operational Interpretation |
| :--- | :--- | :--- |
| **`v_req`** | $(\Delta P / P_{\text{current}}) / T_{\text{remaining}}$ | Required price drift rate (% per minute) to cross strike |
| **`v_obs`** | $(P_{\text{current}} - P_{t-15\text{m}}) / 15$ | Realized 15-minute price drift rate from spot oracle |
| **`VC ≥ 1.0×`** | $v_{\text{obs}} / v_{\text{req}} \ge 1.0$ | **Feasible Trajectory:** Current momentum exceeds required drift |
| **`VC < 1.0×`** | $v_{\text{obs}} / v_{\text{req}} < 1.0$ | **High Decay Risk:** Asset requires external momentum |

### 2. Closed-Form Black-Scholes Binary Option Pricing & Model Edge
To compute theoretical fair value independent of temporary orderbook imbalances, ForeSight implements the standard normal cumulative distribution $\Phi(d_2)$ via the **Abramowitz & Stegun rational Chebyshev approximation** (Formula 7.1.26, error $|\varepsilon| < 1.5 \times 10^{-7}$):

$$d_2 = \frac{\ln(S / K) + (r - 0.5 \sigma^2)\tau}{\sigma \sqrt{\tau}}$$
$$P_{\text{fair}} = \Phi(d_2)$$
$$\text{Theoretical Edge (bps)} = (P_{\text{fair}} - P_{\text{market}}) \times 10,000 \text{ bps}$$
$$\text{Half-Kelly Fraction } (f^*) = 0.5 \times \min\left(\frac{P_{\text{fair}} - P_{\text{market}}}{1 - P_{\text{market}}}, 0.25\right)$$

| Parameter / Metric | Definition & Value Range | Operational Role |
| :--- | :--- | :--- |
| **`S / K`** | Spot Price `S` / Strike Price `K` | Moneyness ratio from spot oracle |
| **`τ_eff` (Anti-Pin Risk)** | $\max(\tau, 45\text{s})$ | Diffusion floor preventing probability cliff collapses near expiry |
| **`Edge (bps)`** | $(P_{\text{fair}} - P_{\text{market}}) \times 10,000$ | Mispricing spread in basis points relative to CLOB mid-price |
| **`Half-Kelly (f*)`** | $\min(f^*, 25\%)$ | Recommended capital allocation percentage, capped for preservation |

### 3. Discrete Binary Payoff Matrix & Early-Exit Formulation
Given user collateral $C$ and entry price $P_{\text{entry}} \in (0.01, 0.99)$:

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
| **Early Take-Profit** | $\text{PnL} = C \times \frac{P_{\text{exit}} - P_{\text{entry}}}{P_{\text{entry}}}$ | Exit @ 0.85 $\rightarrow$ **+$41.67 (+41.7% ROI)** |
| **Expiry Win (YES)** | $\text{PnL} = C \times \frac{1.00 - P_{\text{entry}}}{P_{\text{entry}}}$ | Settle @ $1.00 $\rightarrow$ **+$66.67 (+66.7% ROI)** |
| **Expiry Loss (NO)** | $\text{PnL} = -C$ | Settle @ $0.00 $\rightarrow$ **-$100.00 (-100.0% Max Loss)** |

---

## 📸 5. Proof-of-Thesis Alpha Card Studio

To support viral social prediction sharing across the Somnia ecosystem, ForeSight provides an in-terminal **Alpha Card Studio**:

<p align="center">
  <img src="./src/assets/ForeSight-BTC-Thesis.png" width="800" alt="ForeSight BTC Alpha Card" />
</p>

* **1200×675 HD Canvas Export:** Generates high-resolution cybernetic trading cards formatted for X / Twitter (16:9) and Telegram.
* **Dual Evidence Stamps:** Displays quantitative metrics (VC momentum ratio, Model Edge in bps) alongside Dual AI consensus excerpts.
* **Network Verification Seal:** Certified watermark referencing Somnia Shannon Testnet (`Chain ID: 50312`) and DreamDEX CLOB.
* **1-Click Social Sharing:** 1-click copy raw image to clipboard, download PNG, or open a pre-populated tweet intent on X.

---

## 🤖 6. Automated Strategy Bot Suite & Personas

For algorithmic traders and automated market operations, ForeSight includes modular strategy runners powered by `@somnia-chain/markets-sdk`:

| Strategy CLI | Bot Persona | Strategy Description & Logic |
| :--- | :--- | :--- |
| `npm run agent:starter` | **Baseline Validator** | Submits baseline limit orders and validates wallet approvals on Somnia Shannon |
| `npm run agent:maker` | **🛡️ Titan (Market Maker)** | Continuously quotes dynamic bid-ask spreads around fair probability $\Phi(d2)$ |
| `npm run agent:oracle` | **🔮 Oracle (Arbitrageur)** | Evaluates spot oracle drift (Binance feeds) and snipes mispriced CLOB orders |
| `npm run agent:copilot` | **⚡ Volt (AI Copilot)** | Executes conditional orders based on Dual AI Arena conviction thresholds |

---

## 🏗️ 7. Three-Tier System Architecture & Data Flow

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

## 🧪 8. Developer Diagnostics & Test Verification (120/120 Tests)

ForeSight maintains **100% test pass rate** with 10 comprehensive Vitest test suites verifying financial math, agent execution, and network resilience:

```bash
npm test
```

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

## 🛠️ 9. Somnia & DreamDEX Developer Feedback Report

During the development of ForeSight on the **Somnia Shannon Testnet (`Chain ID: 50312`)**, we deeply integrated `@somnia-chain/markets-sdk` with `viem` to build automated snapshot ingestion, AI reasoning agents, scenario simulations, and automated settlement sweeps.

Below is our structured technical feedback for the Somnia Core Devs:

### 🟢 What Worked Exceptionally Well (Strengths)
1. **High-Performance GraphQL Indexer (`dev.smk.somnia.host`):** Real-time querying of 500+ active event contracts is remarkably fast with sub-second indexer response times.
2. **Modular SDK Design (`SomniaMarkets`):** The unified abstraction for order placement (`createOrder`), balance checks (`fetchBalance`), and book depth retrieval (`fetchOrderBook`) aligns smoothly with standard CCXT-style trading paradigms.
3. **Sub-Second Block Finality on Somnia Shannon:** Rapid block confirmations enable automated snapshot workers to record micro-volatility shifts and detect probability spikes without missing interim price updates.

### 💡 High-Value Opportunities for Protocol Enhancement
1. **Native Batch Settlement Helper (`batchClaimSettledMarkets`):**
   * *Current Behavior:* Developers currently iterate through individual settled markets to execute sequential claim transactions.
   * *Recommendation:* Add an SDK method `exchange.claimAllSettled({ venueId })` that batches multiple redemption calls into a single multicall on-chain transaction to save gas and reduce roundtrips.
2. **WebSocket Orderbook Streaming:**
   * *Current Behavior:* Retrieving granular orderbook depth relies on frequent polling of `fetchOrderBook`.
   * *Recommendation:* Expose typed WebSocket subscriptions (`exchange.subscribeOrderBook(symbol, callback)` and `exchange.subscribeSpikes(threshold, callback)`) out-of-the-box in `@somnia-chain/markets-sdk`.
3. **Strict TypeScript Typing for Binary Event Contracts:**
   * *Current Behavior:* In the raw indexer response, `marketType`, `expiry`, and `strike` sometimes appear under dynamic `info` fields as varied string/number formats.
   * *Recommendation:* Provide strict TypeScript interfaces (`BinaryMarketInfo` with guaranteed `expiryTimestamp`, `strikePrice`, `underlyingAsset`, and `timeRemainingSec`).

---

## 🎯 10. Hackathon Judging Criteria Alignment

Below is the structured breakdown of how **ForeSight** directly fulfills each of the official Somnia × DreamDEX Hackathon judging criteria:

### 1. Innovation & Originality — 20%
* **Hackathon Criteria:** *How novel is the idea? Does the project use Event Contracts creatively to solve a real-world problem?*
* **How ForeSight Delivers:**
  * **From Black-Box Guessing to Adversarial Debate:** Replaces generic chatbot hallucinations with an **Adversarial Dual AI Arena (Alpha Bull vs Macro Bear)** that ingests live crypto RSS news context and grounds every argument in verifiable sources.
  * **Physical Momentum Mathematics ($VC$):** Introduces the **Velocity Coverage ($VC$)** metric, comparing real-time spot price velocity against the required trajectory to physically reach strike before round expiry.

### 2. Technical Implementation — 25%
* **Hackathon Criteria:** *How effectively does the project use DreamDEX Event Contracts and available APIs/SDKs? How strong and functional is the technical implementation?*
* **How ForeSight Delivers:**
  * **End-to-End SDK Integration:** Full integration with `@somnia-chain/markets-sdk` and Viem for on-chain limit orders, book depth retrieval, and balance queries on Somnia Shannon (`50312`).
  * **Automated Background Telemetry:** Autonomous `MarketSnapshotWorker` polling indexers every 10s to detect $\ge 10\%$ probability surges in real time.
  * **Automated Strategy Bots:** 4 distinct bot runners (`starter-bot`, `market-maker`, `oracle-follower`, `ai-copilot`).
  * **Production-Grade Rigor:** **120/120 passing Vitest tests (100% pass rate)** covering financial math invariants, RAG grounding, and order engines.

### 3. User Experience & Design — 20%
* **Hackathon Criteria:** *How intuitive, accessible, and usable is the product? Does it provide a compelling overall user experience?*
* **How ForeSight Delivers:**
  * **Institutional Cyberpunk Bento Terminal:** Single-screen cockpit layout with zero page reloads, dark surfaces, and high-legibility monospace metrics.
  * **Zero-Latency Client-Side Simulation:** Interactive parameter sliders compute PnL, ROI, and break conditions instantly with 0ms network lag.
  * **Simulation Sandbox Fallback:** Users can explore the entire terminal with virtual funds without requiring wallet connection or faucet setup.

### 4. Business & Ecosystem Impact — 20%
* **Hackathon Criteria:** *Does the project have the potential to: Attract new users, Generate trading activity, Increase Event Contracts adoption, Expand the DreamDEX ecosystem, Create a sustainable product or use case?*
* **How ForeSight Delivers:**
  * **Solving the Stranded Capital Problem:** The **Settlement Sweeper** batch-redeems matured winning shares across 500+ pools, returning liquidity to active circulation.
  * **Bridging Retail & Quantitative Quants:** Empowers retail traders with cognitive context while giving algorithmic quants automated bot templates.
  * **Viral Social Loop:** 1200×675 HD **Alpha Card Studio** encourages traders to share verified on-chain theses across X/Twitter and Telegram.

### 5. Presentation & Demo — 15%
* **Hackathon Criteria:** *How clearly does the team communicate: The problem, The solution, The product, The demonstration, The future vision?*
* **How ForeSight Delivers:**
  * **Live Production Terminal:** Instantly accessible on Vercel at [foresightdex.vercel.app](https://foresightdex.vercel.app/).
  * **Transparent Technical Documentation:** Comprehensive mathematical formulations, architecture diagrams, and a dedicated Developer Feedback Report for Somnia core engineers.

---

## ⚡ 11. Local Installation & Development Guide

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
Open **`http://localhost:3000`** in your browser.

### 5. CLI Developer Utilities
```bash
npm run doctor          # Validate Somnia RPC, Indexer, Venue ID, and wallet state
npm run markets         # Query and inspect all 500+ active event contracts
npm run claim           # Scan finalized markets and execute batch settlement sweep
npm run agent:starter   # Launch Baseline Starter Bot
npm run agent:maker     # Launch Two-Sided Market Maker Bot
npm run agent:oracle    # Launch Oracle Momentum Follower Bot
npm run agent:copilot   # Launch Autonomous AI Copilot Bot
```

---

## 🗺️ 12. Future Roadmap Beyond Hackathon

* **Phase 1 (Current):** Testnet MVP on Somnia Shannon (`50312`), Dual AI Arena, 4 Strategy Bots, Alpha Card Studio.
* **Phase 2 (Somnia Mainnet):** Mainnet Deployment, Somnia Native Reactive Agent VM integration, Institutional REST API SDK, Mobile PWA Terminal.
* **Phase 3 (Ecosystem Scaling):** Cross-venue prediction aggregation, Social Copy-Trading Vaults, and decentralized strategy competitions.

---

## 📄 13. License & Acknowledgements

MIT License — see the [LICENSE](LICENSE) file for details. Built with ❤️ for the **Somnia × DreamDEX Event Contracts Hackathon**.  
Special thanks to the **Somnia Network** & **DreamDEX** engineering teams for developer tools, GraphQL indexers, and documentation support.


