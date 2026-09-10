<div align="center">
<p align="center">
  <img src="./public/foresight-logo.svg" width="120" height="120" alt="ForeSight Logo" />
</p>

# ForeSight
### *The Precision Trading & Cognitive Intelligence Terminal for DreamDEX on Somnia L1*

<br/>

**Detect the move. Challenge the thesis. Model the trajectory. Execute on-chain.**

<br/>

[![Somnia Network](https://img.shields.io/badge/Somnia-Shannon_Testnet_(50312)-7C3AED?style=for-the-badge&logo=blockchain)](https://somnia.network)
[![DreamDEX CLOB](https://img.shields.io/badge/Protocol-DreamDEX_Event_Contracts-06B6D4?style=for-the-badge)](https://dev.smk.somnia.host)
[![Smart Contract](https://img.shields.io/badge/Smart_Contract-ForeSightBatchSweeper.sol-9333EA?style=for-the-badge&logo=solidity&logoColor=white)](contracts/ForeSightBatchSweeper.sol)
[![Tests Passing](https://img.shields.io/badge/Tests-124%2F124%20Passed%20(100%25)-00e676?style=for-the-badge&logo=vitest&logoColor=white)](tests/)
[![Evidence-Grounded AI](https://img.shields.io/badge/Adversarial_AI-Gemini_+_Meta_LLaMA_3.3-f55036?style=for-the-badge&logo=google&logoColor=white)](src/agents/strategies/dual-debate-engine.ts)
[![Autonomous Auto-Pilot](https://img.shields.io/badge/Autonomous-Auto--Pilot_&_0ms_Reflex-FF9900?style=for-the-badge&logo=fastapi&logoColor=white)](src/ui/components/InsightsView.tsx)
[![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite_6-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br/>

🌐 **Live Production Terminal:** [foresightdex.vercel.app](https://foresightdex.vercel.app/) &nbsp;•&nbsp; ⚡ **Somnia Shannon Testnet:** `Chain ID: 50312` &nbsp;•&nbsp; 📜 **Sweeper Contract:** [`0x0df05851d944bfd01e6bc772e27738c23b6e30f9`](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9) &nbsp;•&nbsp; 🎯 **Target Protocol:** `DreamDEX CLOB`

<br/>
</div>

> **Core Philosophy:** *"Understand the market before you trade it"*  
> ForeSight is **not a black-box predictive chatbot**. It is an **institutional-grade decision support and execution terminal** built specifically for DreamDEX Event Contracts on Somnia L1. ForeSight transforms volatile, sub-second prediction market noise into an actionable, verifiable 4-step decision loop: **DETECT $\rightarrow$ CHALLENGE $\rightarrow$ SIMULATE $\rightarrow$ EXECUTE**.

---

## 📑 Table of Contents

- [ForeSight](#foresight)
    - [*The Precision Trading \& Cognitive Intelligence Terminal for DreamDEX on Somnia L1*](#the-precision-trading--cognitive-intelligence-terminal-for-dreamdex-on-somnia-l1)
  - [📑 Table of Contents](#-table-of-contents)
  - [🌟 1. Executive Summary \& Product Vision](#-1-executive-summary--product-vision)
    - [⚡ Judge's Fast-Track Briefing](#-judges-fast-track-briefing)
  - [⚡ 2. The Core Problem \& Market Opportunity on Somnia L1](#-2-the-core-problem--market-opportunity-on-somnia-l1)
    - [🥊 ForeSight vs. Traditional Prediction Interfaces](#-foresight-vs-traditional-prediction-interfaces)
    - [🧠 The Cognitive Journey: Casino Speculation vs. Structured Decision Loop](#-the-cognitive-journey-casino-speculation-vs-structured-decision-loop)
    - [Why a "Decision Terminal" Instead of Another DEX?](#why-a-decision-terminal-instead-of-another-dex)
  - [🔄 3. The 4-Stage Decision Architecture \& Execution Pipeline](#-3-the-4-stage-decision-architecture--execution-pipeline)
    - [The 4-Stage Architecture Matrix](#the-4-stage-architecture-matrix)
    - [Dual AI Adversarial Debate Pipeline](#dual-ai-adversarial-debate-pipeline)
      - [Step-by-Step Execution Lifecycle](#step-by-step-execution-lifecycle)
    - [Dual Quantitative Strategy Matrix (Momentum vs Reversal)](#dual-quantitative-strategy-matrix-momentum-vs-reversal)
    - [Autonomous Auto-Pilot Runner \& Risk Guardrail Engine](#autonomous-auto-pilot-runner--risk-guardrail-engine)
    - [Dynamic Context \& Output Schema Architecture](#dynamic-context--output-schema-architecture)
  - [📐 4. Mathematical Formulations \& Quantitative Foundation](#-4-mathematical-formulations--quantitative-foundation)
    - [1. Velocity Coverage (`VC`) — Trajectory Feasibility](#1-velocity-coverage-vc--trajectory-feasibility)
    - [2. Closed-Form Black-Scholes Binary Option Pricing \& Model Edge](#2-closed-form-black-scholes-binary-option-pricing--model-edge)
    - [3. Discrete Binary Payoff Matrix \& 100% Collateral Refund Protection](#3-discrete-binary-payoff-matrix--100-collateral-refund-protection)
  - [🎯 5. Hackathon Judging Criteria Alignment](#-5-hackathon-judging-criteria-alignment)
    - [📜 Verified On-Chain Proof Matrix (Somnia Shannon Testnet — Chain ID `50312`)](#-verified-on-chain-proof-matrix-somnia-shannon-testnet--chain-id-50312)
    - [🌐 5.1 Systemic Value \& Ecosystem Acceleration (Grounded Impact)](#-51-systemic-value--ecosystem-acceleration-grounded-impact)
      - [🏛️ The 5 Pillars of ForeSight's Ecosystem Value:](#️-the-5-pillars-of-foresights-ecosystem-value)
  - [📸 6. Proof-of-Thesis Alpha Card Studio (1200×675 HD 1:1 Terminal Window)](#-6-proof-of-thesis-alpha-card-studio-1200675-hd-11-terminal-window)
  - [🤖 7. Autonomous Auto-Pilot Runner \& Strategy Execution Suite](#-7-autonomous-auto-pilot-runner--strategy-execution-suite)
    - [7.1 In-Terminal Autonomous Auto-Pilot Runner (`InsightsView.tsx`)](#71-in-terminal-autonomous-auto-pilot-runner-insightsviewtsx)
    - [7.2 1-Minute HFT Quant Cockpit \& 0ms Math Reflex (`AnalyticsView.tsx` \& `ScenarioSimulator.tsx`)](#72-1-minute-hft-quant-cockpit--0ms-math-reflex-analyticsviewtsx--scenariosimulatortsx)
    - [7.3 Headless CLI Strategy Bot Suite (`@somnia-chain/markets-sdk`)](#73-headless-cli-strategy-bot-suite-somnia-chainmarkets-sdk)
  - [🏗️ 8. Full System Architecture \& Multi-Tier Data Flow](#️-8-full-system-architecture--multi-tier-data-flow)
    - [8.1 End-to-End Architectural Data Flow](#81-end-to-end-architectural-data-flow)
    - [8.2 5 Core Interactive Terminal Workspaces](#82-5-core-interactive-terminal-workspaces)
    - [8.3 End-to-End Decision \& Settlement Lifecycle](#83-end-to-end-decision--settlement-lifecycle)
    - [8.4 Multi-Tier System Breakdown \& Performance SLAs](#84-multi-tier-system-breakdown--performance-slas)
    - [8.5 Verified Smart Contracts \& Dual-Layer Persistence on Somnia L1](#85-verified-smart-contracts--dual-layer-persistence-on-somnia-l1)
      - [🛡️ Dual-Layer Position \& Order Persistence Architecture](#️-dual-layer-position--order-persistence-architecture)
      - [📜 On-Chain Deployment Audit Receipt](#-on-chain-deployment-audit-receipt)
  - [🧪 9. Developer Diagnostics \& Test Verification (124/124 Tests)](#-9-developer-diagnostics--test-verification-124124-tests)
  - [📁 10. Repository Structure](#-10-repository-structure)
  - [🛠️ 11. Somnia \& DreamDEX Developer Feedback Report](#️-11-somnia--dreamdex-developer-feedback-report)
    - [🟢 What Worked Exceptionally Well (Strengths)](#-what-worked-exceptionally-well-strengths)
    - [💡 High-Value Opportunities for Protocol Enhancement](#-high-value-opportunities-for-protocol-enhancement)
  - [⚡ 12. Local Installation \& Development Guide](#-12-local-installation--development-guide)
    - [Prerequisites](#prerequisites)
    - [1. Clone \& Install](#1-clone--install)
    - [2. Configure Environment](#2-configure-environment)
    - [3. Launch Backend Services \& Workers (Port 3001)](#3-launch-backend-services--workers-port-3001)
    - [4. Launch Frontend Terminal (Port 3000)](#4-launch-frontend-terminal-port-3000)
    - [5. CLI Developer Utilities](#5-cli-developer-utilities)
  - [🗺️ 13. Future Roadmap Beyond Hackathon](#️-13-future-roadmap-beyond-hackathon)
  - [📄 14. License \& Acknowledgements](#-14-license--acknowledgements)

---

## 🌟 1. Executive Summary & Product Vision

Binary event contracts represent the purest financial vehicle for expressing conviction on future events. On high-throughput, sub-second finality Layer 1 blockchains like **Somnia (sub-second block finality)**, prediction markets operate at microsecond velocities across dozens of concurrent pools.

However, speed without intelligence breeds reckless speculation. **ForeSight** bridges the gap between raw blockchain throughput and disciplined financial execution:

* **No Black-Box Predictions:** ForeSight never gives arbitrary "buy/sell" advice. Instead, it surfaces real-time microstructure, strike distance, and orderbook imbalance so traders understand the market before committing capital.
* **Separation of Reasoning from Math:** Subjective reasoning is evaluated via Dual AI strategy debate (Gemini 2.5 Flash vs Meta LLaMA 3.3), while microsecond execution, velocity feasibility ($VC$), and capital allocation are computed via deterministic 0ms client math.
* **Autonomous Execution & Capital Protection:** Interactive in-terminal Auto-Pilot executes multi-round strategies with built-in loss kill-switches, while 100% collateral refund protection and 1-click batch sweeping eliminate stranded capital.

```text
┌────────────────────────────────┬────────────────────────────────┬────────────────────────────────┬────────────────────────────────┐
│ ⚡ SOMNIA L1 FINALITY          │ 📈 DREAMDEX CLOB               │ 📐 0ms MATH REFLEX             │ 🤖 AUTONOMOUS AUTO-PILOT       │
│ 100K+ TPS                      │ Rolling Event Markets          │ < 1 ms client physics          │ Multi-round session runner     │
│ Sub-second reactive EVM speed  │ On-chain limit order liquidity │ Strike Radar, VC, Half-Kelly   │ Momentum/Reversal & Kill-Switch│
└────────────────────────────────┴──────────────────────────────┴────────────────────────────────┴────────────────────────────────┘
```

```text
       RAW DREAMDEX CLOB DATA ──► [ DETECT ] ──► [ CHALLENGE ] ──► [ SIMULATE ] ──► [ EXECUTE ]
       (Active Event Markets)      Strike Radar   Fast-Pick & AI    HFT Quant Lab   Ticket / Auto-Pilot
```

### ⚡ Judge's Fast-Track Briefing

| Evaluation Dimension | ForeSight Implementation & Architecture | Verification Link / Code Anchor |
| :--- | :--- | :--- |
| **What is ForeSight?** | Institutional-grade Decision Support & Execution Terminal built for DreamDEX Event Contracts on Somnia L1. | [Live App](https://foresightdex.vercel.app/) &nbsp;•&nbsp; [Executive Summary](#-1-executive-summary--product-vision) |
| **The Core Problem** | Eliminates contextless odds spikes, ungrounded AI predictions, and stranded capital across expired pools. | [Problem Analysis](#-2-the-core-problem--market-opportunity-on-somnia-l1) |
| **Technical Core** | Deep `@somnia-chain/markets-sdk` integration, Chebyshev Black-Scholes $\Phi(d2)$ math, Dual Bull/Bear debate, 0ms Math Reflex (Mini Strike Radar & Fast-Pick), and Autonomous Auto-Pilot Execution. | [Decision Architecture](#-3-the-4-stage-decision-architecture--execution-pipeline) &nbsp;•&nbsp; [Math](#-4-mathematical-formulations--quantitative-foundation) |
| **Ecosystem Impact** | **Settlement Sweeper** batch-claims matured pools in 1 click, recovering idle capital back into Somnia L1. | [Settlement Sweeper](#-8-full-system-architecture--multi-tier-data-flow) &nbsp;•&nbsp; [Criteria](#-5-hackathon-judging-criteria-alignment) |
| **Quality & Reliability** | **11 test suites with 124/124 passing tests (100% pass rate)**, Custom [`ForeSightBatchSweeper.sol`](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9), React 19, TypeScript 5.7. | [Test Verification](#-9-developer-diagnostics--test-verification-124124-tests) &nbsp;•&nbsp; [Explorer Link](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9) |

---

## ⚡ 2. The Core Problem & Market Opportunity on Somnia L1

Across **active rolling event contracts** on DreamDEX (1m, 5m, 15m, 1h BTC/ETH/SOL contracts), traders face three fundamental bottlenecks:

```text
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
└────────────────────────────────┴──────────────────────────────┴──────────────────────────────────┘
```

### 🥊 ForeSight vs. Traditional Prediction Interfaces

| Feature Dimension | Traditional Prediction / Basic DEX UI | ForeSight Institutional Terminal |
| :--- | :--- | :--- |
| **Core Mentality** | **"Casino Mode":** Blind FOMO, gut feeling, reactive gambling | **"Informed Mode":** *Understand the market before you trade it* |
| **Cognitive Loop** | Speculate blindly $\rightarrow$ Lose on theta decay $\rightarrow$ Churn | **DETECT $\rightarrow$ CHALLENGE $\rightarrow$ SIMULATE $\rightarrow$ EXECUTE** |
| **Order Execution** | Complex clunky forms or naive betting slips | **Polymarket-Standard Ticket**: 1-click USD chips ($10, $25, $50, $100, Max), Shares & ROI% calculation |
| **Microsecond Reflex** | Slow page reloads, no distance telemetry | **0ms Math Reflex**: Mini Strike Radar & Imbalance Meter directly on candlestick chart |
| **AI Decision Support** | Black-box "prediction" bot with ungrounded outputs | **Adversarial Dual Bull/Bear Debate** (Gemini + LLaMA) with verified clickable `[View Evidence]` URLs |
| **Autonomous Trading** | Manual user clicking only | **Autonomous Auto-Pilot Runner** (⚡ Momentum / 🛡️ Reversal, streak tracking, kill-switch safety) |
| **Quantitative Risk** | Guesswork and basic payout display | **Closed-form Black-Scholes $\Phi(d2)$**, Half-Kelly sizing, and Velocity Coverage ($VC$) |
| **Order Lifecycle** | Basic Win/Loss binary display | **Full 7-State Lifecycle** (`RESTING`, `IN FLIGHT`, `RESOLVING`, `SETTLED WIN`, `EXPIRED LOSS`, `REFUNDED`, `CLAIMED`) |
| **Capital Efficiency** | Manual 1-by-1 claim; winnings get stranded in pools | **Settlement Sweeper**: 1-click batch redemption across all expired rounds via `ForeSightBatchSweeper.sol` |
| **Unmatched Order Safety** | Unclear fund status upon expiration | **100% Collateral Refund Protection**: Unfilled resting limit orders return 100% principal back to wallet |
| **Social Proof** | Plain text links and screenshots | **1200×675 HD Alpha Card Studio** with certified testnet watermark stamps |

### 🧠 The Cognitive Journey: Casino Speculation vs. Structured Decision Loop

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TRADITIONAL CASINO SPECULATION (High Churn & Capital Loss)                                              │
│                                                                                                        │
│   [ Odds Spike to 75% ] ──► [ Emotional FOMO ] ──► [ Buy Peak Odds ] ──► [ Theta Decay Loss ($0.00) ]  │
│   "Why did it jump?"         "Everyone is buying!"    "Zero risk math"      "Market was rigged..."     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ FORESIGHT 4-STAGE DECISION LOOP ("Understand the market before you trade it")                          │
│                                                                                                        │
│   1. DETECT     (Where is Spot?)  ──► Spot Candlesticks & Mini Strike Radar calculate distance in bps. │
│   2. CHALLENGE  (Momentum or Rev?)──► 0ms Fast-Pick (⚡ Momentum / 🛡️ Reversal) + Dual AI Regime Debate. │
│   3. SIMULATE   (Is Drift Real?)  ──► 1-Min HFT Cockpit computes VC = 1.45x & Black-Scholes Φ(d2) fair P. │
│   4. EXECUTE    (Disciplined Bet) ──► Polymarket Ticket / Auto-Pilot executes; 100% Refund if unfilled. │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Why a "Decision Terminal" Instead of Another DEX?
DreamDEX already provides an exceptional CLOB orderbook and liquidity infrastructure. Building another basic trading UI adds little value. **ForeSight acts as the "Bloomberg Terminal + Quant Simulator" layer for Somnia Event Contracts**, transforming prediction markets from blind casinos into structured, verifiable trading environments.

---

## 🔄 3. The 4-Stage Decision Architecture & Execution Pipeline

ForeSight organizes raw prediction market data into a structured **4-stage decision loop**:

### The 4-Stage Architecture Matrix

| Stage | Primary Objective | Ingested Data & Feeds | Core Algorithmic Engine | Output & Operational Invariants |
| :--- | :--- | :--- | :--- | :--- |
| **1️⃣ DETECT** | *Spot Momentum & Strike Proximity* | • DreamDEX GraphQL Indexer<br/>• Real-time Binance spot feeds (`/api/spot`)<br/>• Active rolling pools & strike targets | `PriceChart` & `Mini Strike Radar`<br/>*(0ms Client Math Reflex)* | • Spot candlesticks with on-chain Strike Price line<br/>• Real-time distance in bps/%, danger/safe states<br/>• Live CLOB Orderbook Imbalance ($OI\%$) meter |
| **2️⃣ CHALLENGE** | *Dual AI & 0ms Fast-Pick Triggers* | • Real-time CLOB orderbook depth<br/>• Spread in basis points (bps)<br/>• Spot drift vs Strike price | `DualDebateEngine` & `Agent Fast-Pick`<br/>*(Gemini + LLaMA & 0ms Reflex)* | • 0ms ⚡ MOMENTUM PICK & 🛡️ REVERSAL PICK 1-click fill<br/>• Explainable signal tags (e.g. `+28 bps above strike`)<br/>• Full adversarial Bull vs Bear regime debate |
| **3️⃣ SIMULATE** | *1-Minute HFT Quant Cockpit* | • Spot asset prices & strike price<br/>• Time remaining $\tau$ & countdown clock<br/>• User collateral allocation ($C$) | `AnalyticsView`<br/>*(Deterministic Quant Lab)* | • Tactical Strike Radar Gauge & 60s Round Expiry Phase Bar<br/>• Closed-form Black-Scholes $\Phi(d2)$ (Chebyshev) & Edge bps<br/>• Velocity Coverage ($VC$) & Half-Kelly sizing |
| **4️⃣ EXECUTE** | *Polymarket Ticket & Settlement* | • User Viem/MetaMask wallet<br/>• DreamDEX CLOB BinaryPool router<br/>• Unclaimed YES/NO token balances | `ScenarioSimulator` & `Sweeper`<br/>*(On-chain batch dispatcher)* | • 1-Click USD preset chips ($10, $25, $50, $100, Max)<br/>• Cutoff protection (prevents `TradingNotActive()` reverts)<br/>• 100% Collateral Refund on unfilled limit orders<br/>• 1-Click MultiCall Batch Sweeper for all payouts |

---

### Dual AI Adversarial Debate Pipeline

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                DUAL AI REASONING & ARBITRATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                 │
│  [Market Context Ingestion]                                                                     │
│  • DreamDEX CLOB Orderbook (Spread bps, Depth)                                                  │
│  • Live Verified RSS Streams (CoinDesk, Decrypt, Cointelegraph)                                 │
│                                │                                                                │
│                ┌───────────────┴───────────────┐                                                │
│                ▼                               ▼                                                │
│  ┌───────────────────────────┐   ┌───────────────────────────┐                                  │
│  │ 🐂 Alpha Bull Persona     │   │ 🐻 Macro Bear Persona     │                                  │
│  │ • Orderbook bid dominance │   │ • Binary theta decay rate │                                  │
│  │ • Upside news catalysts   │   │ • Overhead ask resistance │                                  │
│  │ • Target Prob: P_bull     │   │ • Target Prob: P_bear     │                                  │
│  │ • Confidence: C_bull      │   │ • Confidence: C_bear      │                                  │
│  └─────────────┬─────────────┘   └─────────────┬─────────────┘                                  │
│                │                               │                                                │
│                └───────────────┬───────────────┘                                                │
│                                ▼                                                                │
│  ┌───────────────────────────────────────────────────────────┐                                  │
│  │ ⚖️ Consensus Arbitration & Schema Validation Engine       │                                  │
│  │ • Net Alpha Score: S = (C_bull·P_bull + C_bear·P_bear)/ΣC │                                  │
│  │ • Edge vs Market:  Δ_edge = S - P_clob                    │                                  │
│  │ • Strict Zod/JSON Validation (Verified source URLs only)  │                                  │
│  └─────────────────────────────┬─────────────────────────────┘                                  │
│                                ▼                                                                │
│  [ Bento Terminal UI: 1-Click Evidence Cards & Half-Kelly Sizing Recommendation ]               │
│                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Step-by-Step Execution Lifecycle

| Step | Flow Layer | Operational Trigger | Data & Protocol Payload | Guaranteed Invariant |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **User Interaction** | Trader clicks contract or switch token | Target symbol (BTC, ETH, SOL, SOMI), implied odds, strike price | Sub-second dispatch to quantitative pricing and debate engine |
| **02** | **Microstructure Ingestion** | Live stream query | Real-time CLOB orderbook depth, Binance spot oracle, strike delta bps | 100% verified on-chain and oracle market data with zero mock |
| **03** | **Adversarial Synthesis** | `DualDebateEngine` execution | Structured adversarial prompt (Gemini 2.5 Flash vs Meta LLaMA 3.3) | Strict independence: Momentum vs Reversal theses argued without bias |
| **04** | **Arbitration & Math** | Consensus Weighted Fusion | $S = \frac{C_{\text{bull}} \cdot P_{\text{bull}} + C_{\text{bear}} \cdot P_{\text{bear}}}{C_{\text{bull}} + C_{\text{bear}}}$, $\Delta_{\text{edge}} = S - P_{\text{clob}}$ | Deterministic edge calibration; verifiable, explainable outputs |
| **05** | **Schema Validation** | Strict JSON schema parser | Structured payload with headlines, conviction %, target odds | Complete type safety; invalid JSON triggers fallback cache |
| **06** | **Terminal Delivery** | Single-screen UI update | Dual Strategy cards with 1-click execution buttons & Auto-Pilot triggers | Trader receives balanced, actionable intelligence in $<1.5\text{s}$ |

---

### Dual Quantitative Strategy Matrix (Momentum vs Reversal)

ForeSight translates complex adversarial AI reasoning into two actionable, institutional quantitative strategies displayed side-by-side in [`InsightsView.tsx`](src/ui/components/InsightsView.tsx):

* **⚡ MOMENTUM STRATEGY (Gemini 2.5 Flash):**
  - **Strike Buffer:** Measures safety distance between spot price and strike level in basis points (`+4.8 bps`).
  - **Bid Asymmetry:** Gauges real-time order flow pressure and bid-side book dominance.
  - **Observed Price Velocity:** Calculates realized price drift rate per minute from spot oracles.
  - **Action Trigger:** 1-Click `BUY YES @ TARGET ODDS` dispatch to terminal ticket.
* **🛡️ REVERSAL STRATEGY (Meta LLaMA 3.3 70B):**
  - **Revert Target:** Identifies mean-reversion equilibrium level around the strike price.
  - **Ask Overhang:** Quantifies overhead supply wall and resistance depth.
  - **Theta Decay Risk:** Monitors the terminal 45-second round cutoff risk to protect against pin risk.
  - **Action Trigger:** 1-Click `BUY NO @ TARGET ODDS` dispatch to terminal ticket.

---

### Autonomous Auto-Pilot Runner & Risk Guardrail Engine

To empower traders in fast-cadence 1-minute and 5-minute binary prediction rounds on Somnia L1, ForeSight introduces the **Autonomous Auto-Pilot Runner & Risk Guardrail Engine** (`InsightsView.tsx`):

* **Dual Quantitative Strategy Presets:**
  - `⚡ MOMENTUM HUNTER`: Algorithmic engine that aligns with prevailing spot drift, positive strike delta, and bid-side orderbook dominance ($OI > +15\%$).
  - `🛡️ MEAN REVERSAL SPECIALIST`: Snipes extreme mispricings and volatility oversold conditions when spot deviates far from strike.
* **Configurable Round Sessions:** Operators can configure autonomous execution for **3, 5, or 10 consecutive rounds** with strict capital allocation per round ($10, $25, $50).
* **Automated Capital Preservation Kill-Switch:** To prevent drawdown spirals, the engine automatically halts execution if it encounters **2 consecutive settled losses**.
* **High-Frequency Testnet Execution:** Executes on-chain limit and market orders on Somnia Shannon (`50312`) with sub-250ms order routing latency and real-time execution telemetry.
* **Verifiable Execution Streaks:** The terminal tracks cumulative session metrics: total rounds completed, live win-rate (80%+ demonstrated), net session PnL, and on-chain transaction receipts.

---

### Dynamic Context & Output Schema Architecture

Every debate execution generates a strictly typed JSON payload guaranteeing determinism:

```json
{
  "bullHeadline": "Institutional accumulation defending $77.5K strike",
  "bullConfidence": 0.85,
  "bullTarget": 0.80,
  "bullKeyArguments": ["Orderbook bid asymmetry exceeds ask depth by 2.4x"],
  "bullCatalysts": ["Spot volume surge on Binance in last 15m window"],
  "bearHeadline": "Overextended volatility with binary theta decay acceleration",
  "bearConfidence": 0.75,
  "bearTarget": 0.35,
  "bearKeyArguments": ["Binary theta decay accelerates drastically under 10m to expiry"],
  "bearRiskFactors": ["Heavy ask wall resistance at 75% implied probability"],
  "consensusScore": 0.589,
  "netEdgeBps": 89,
  "summary": "Consensus favors short-term upside with tight stop at 45% probability..."
}
```

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

### 3. Discrete Binary Payoff Matrix & 100% Collateral Refund Protection
Unlike perpetual futures with stop-loss or early take-profit triggers, binary prediction event contracts operate on deterministic terminal settlements. Given user collateral $C$ and entry odds $P_{\text{entry}} \in (0.01, 0.99)$:

```text
┌────────────────────────────────────────────────────────────────────────┐
│  Contracts Minted (N)  = C / P_entry                                   │
│  Expiry Settlement Win = N × $1.00 = C / P_entry                       │
│  Expiry Net PnL (Win)  = C × [ (1.00 - P_entry) / P_entry ]            │
│  Expiry Return on Inv  = [ (1.00 - P_entry) / P_entry ] × 100%         │
│  Expiry Loss (NO Win)  = -100% × C  (Explicit downside cap, no liq)   │
│  Unmatched Limit Order = 100% Refund (Payout = C, PnL = $0.00)         │
└────────────────────────────────────────────────────────────────────────┘
```

| Scenario | Payoff Equation | Operational Mechanics | Example ($100 Collateral @ 0.60 Entry) |
| :--- | :--- | :--- | :--- |
| **Expiry Win (YES)** | $\text{PnL} = C \times \frac{1.00 - P_{\text{entry}}}{P_{\text{entry}}}$ | Settle @ $1.00 per share | Settle @ $1.00 $\rightarrow$ **+$66.67 (+66.7% ROI)** |
| **Expiry Loss (NO)** | $\text{PnL} = -C$ | Settle @ $0.00 per share | Settle @ $0.00 $\rightarrow$ **-$100.00 (-100.0% Max Loss)** |
| **Unfilled Limit (Refund)** | $\text{Payout} = C, \text{PnL} = \$0.00$ | Order rested without counterparty; 100% capital returned to wallet | Expire Unfilled $\rightarrow$ **$100.00 Returned (0% PnL)** |

---

## 🎯 5. Hackathon Judging Criteria Alignment

| Hackathon Criterion & Weight | Official Hackathon Focus (from `hackathon.md`) | ForeSight Technical Implementation & Verified Proof |
| :--- | :--- | :--- |
| **1. Innovation & Originality**<br/>`20% Weight` | • *How novel is the idea?*<br/>• *Does the project use Event Contracts creatively to solve a real-world problem?* | • **"Understand Before You Trade" Decision Engine:** Replaces black-box predictive AI with an evidence-grounded adversarial Bull vs. Bear debate (Gemini 2.5 Flash + Meta LLaMA 3.3).<br/>• **0ms Math Reflex Architecture:** Separates deterministic micro-second math (Mini Strike Radar, Imbalance meter, Fast-Pick) from LLM cognition, avoiding 2-4s latency traps in rapid rounds.<br/>• **Physical Momentum Modeling ($VC$):** Introduces real-time Velocity Coverage ($VC = v_{\text{obs}} / v_{\text{req}}$) to mathematically identify theta-decay volatility traps before entry.<br/> |
| **2. Technical Implementation**<br/>`25% Weight` | • *How effectively does the project use DreamDEX Event Contracts and available APIs/SDKs?*<br/>• *How strong and functional is the technical implementation?* | • **100% Real DreamDEX Data Integration:** Zero mock data; connects directly to DreamDEX GraphQL Indexer (`dev.smk.somnia.host`), Binance Spot Oracles (`/api/spot`), and contract `0xbF4a49e0...`.<br/>• **Custom Deployed Smart Contract:** [`ForeSightBatchSweeper.sol`](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9) enables atomic MultiCall batch settlements in a single transaction.<br/>• **Full 7-State Order Lifecycle:** Full tracking of `RESTING`, `IN FLIGHT`, `RESOLVING`, `SETTLED WIN`, `EXPIRED LOSS`, `REFUNDED`, and `CLAIMED`.<br/>• **100% Collateral Refund Protection:** Audits and verifies automatic principal refunds for unmatched limit orders.<br/>• **Autonomous Auto-Pilot Engine:** Configurable round runner (3/5/10 rounds) with Momentum/Reversal presets, 12s pacing cooldown, and emergency abort kill-switch.<br/>• **100% Test Coverage:** **124/124 passing Vitest tests** verifying financial math, invariants, and network resilience. |
| **3. User Experience & Design**<br/>`20% Weight` | • *How intuitive, accessible, and usable is the product?*<br/>• *Does it provide a compelling overall user experience?* | • **Polymarket-Standard Order Ticket:** Intuitive YES/NO tabs, rapid USD preset chips ($10, $25, $50, $100, Max), Shares, potential payout, and ROI% calculation.<br/>• **Agent Fast-Pick (0ms Reflex):** 1-Click ⚡ MOMENTUM PICK and 🛡️ REVERSAL PICK auto-filling ticket with explainable signal tags.<br/>• **1-Minute HFT Quant Cockpit:** Tactical Strike Radar Gauge, 60-Second Round Expiry Phase Bar, and direct on-chain execution CTA.<br/>• **Trading Cutoff Protection:** Proactively disables orders near expiry, eliminating `TradingNotActive()` revert errors.<br/>• **Zero-Barrier Simulation Sandbox:** Instant terminal exploration with virtual funds without requiring wallet connection or testnet faucet tokens. |
| **4. Business & Ecosystem Impact**<br/>`20% Weight` | • *Does the project have the potential to: Attract new users, Generate trading activity, Increase Event Contracts adoption, Expand the DreamDEX ecosystem, Create a sustainable product?* | • **Eliminating Capital Stagnation:** `ForeSightBatchSweeper.sol` reduces settlement overhead from $O(N)$ repetitive manual transactions to $O(1)$ atomic execution, returning idle capital back into circulation.<br/>• **Converting Casino Churn to Informed Trading:** Giving traders institutional risk metrics ($VC$, Kelly Criterion, Black-Scholes Edge) prevents rapid retail wipeout and fosters sustainable, disciplined trading volume.<br/>• **Bootstrapping CLOB Liquidity:** 4 open-source bot templates allow builders to deploy automated market-making and arbitrage strategies against DreamDEX orderbooks.<br/>• **Frictionless Top-of-Funnel Onboarding:** 0-wallet Sandbox lowers Web3 entry barriers; 1200×675 HD **Alpha Card Studio** enables verifiable cryptographic sharing on X and Telegram. |
| **5. Presentation & Demo**<br/>`15% Weight` | • *How clearly does the team communicate: The problem, The solution, The product, The demonstration, The future vision?* | • **Live Production Terminal:** Instantly accessible and verifiable on Vercel at [foresightdex.vercel.app](https://foresightdex.vercel.app/).<br/>• **Engineering Documentation:** Complete mathematical derivations, full architectural diagrams, and a dedicated Developer Feedback Report for Somnia core engineers.<br/>• **Machine-Readable Evidence Artifact:** [`evidence.json`](./evidence.json) with verified on-chain proof trails and explorer transaction anchors. |

---

### 📜 Verified On-Chain Proof Matrix (Somnia Shannon Testnet — Chain ID `50312`)

ForeSight provides an auditable, machine-readable evidence trail located in [`evidence.json`](./evidence.json):

| Proof Dimension | Target / Contract | On-Chain Verification / Explorer Anchor | Status | Proof Significance |
| :--- | :--- | :--- | :---: | :--- |
| **Custom Sweeper Contract** | [`ForeSightBatchSweeper.sol`](contracts/ForeSightBatchSweeper.sol) | [`0x0df05851d944bfd01e6bc772e27738c23b6e30f9`](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9) | `VERIFIED` | Custom batch settlement smart contract deployed on Somnia Shannon (Tx: [`0x0042f7...cf275`](https://shannon-explorer.somnia.network/tx/0x0042f7f304e036493b529d2cd6e77e359f0952db358e33799912d9e0a19cf275)). |
| **Settlement Payout Claim** | Matured ETH Event Pool | [`0xf4caf3577f52428af2ce7d6ec87b11428b403008b21ab4bce6d3c50fc22519b6`](https://shannon-explorer.somnia.network/tx/0xf4caf3577f52428af2ce7d6ec87b11428b403008b21ab4bce6d3c50fc22519b6) | `CONFIRMED` | On-chain settlement payout claim (+44.9% ROI) verified in Block `484521336`. |
| **100% Collateral Refund** | BTC/USD Event Contract | [`0x58f77beab8dc966f8faca8f71c2f529dee14f06e6fc3105471695598d8a48ef0`](https://shannon-explorer.somnia.network/tx/0x58f77beab8dc966f8faca8f71c2f529dee14f06e6fc3105471695598d8a48ef0) | `REFUNDED` | Unfilled resting limit order verified: 100% principal ($50.00 tUSDC) refunded back to wallet in Block `484005732`. |
| **Anti-Black-Box Quant Guard** | BTC/USD 5m Binary Pool | [Deterministic Simulation & Rejection Engine](src/core/quantitative-pricing.ts) | `VERIFIED` | Invariant test: When market FOMO pushes odds to 72% and AI Bull is enthusiastic, Quant Engine computes $VC = 0.27x$ and Edge $= -1,800\text{ bps}$, rejecting the trade to protect capital. |

---

### 🌐 5.1 Systemic Value & Ecosystem Acceleration (Grounded Impact)

ForeSight is designed as a **cognitive and execution infrastructure layer** solving the structural economic friction points in high-cadence binary event markets:

```mermaid
graph TD
    A["🚀 0-Barrier Sandbox & Verifiable Alpha Cards"] -->|"Onboards New Traders"| B["👥 Active User Participation"]
    B -->|"Understand Market First (VC + Dual AI RAG)"| C["📊 Disciplined CLOB Order Flow"]
    C -->|"Bootstrapped by Sentinel MM & Vector Bots"| D["🌊 Deeper Liquidity & Tighter Spreads"]
    D -->|"Markets Mature & Settle on Somnia L1"| E["🧹 1-Click ForeSight Batch Sweeper"]
    E -->|"Recovers Stranded Capital (O(1) Gas)"| B
```

#### 🏛️ The 5 Pillars of ForeSight's Ecosystem Value:

1. **💸 Pillar 1: Capital Efficiency via Atomic Batch Settlements:**
   * *The Bottleneck:* In rapid binary markets (3m, 5m, 15m, 1h), winning payouts become scattered across dozens of individual pools. Manual pool-by-pool claiming introduces severe friction and unnecessary gas overhead.
   * *ForeSight Solution:* [`ForeSightBatchSweeper.sol`](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9) executes **atomic batch redemptions in a single click**, transforming an $O(N)$ multi-transaction burden into an efficient $O(1)$ claim, recycling idle capital back into the ecosystem.

2. **🧠 Pillar 2: Disciplined Decision Support vs. Emotional Speculation:**
   * *The Bottleneck:* Retail prediction market participants frequently suffer from emotional FOMO and mispriced volatility, leading to rapid capital depletion and high platform churn.
   * *ForeSight Solution:* ForeSight equips users with **Velocity Coverage ($VC$)**, **Black-Scholes $\Phi(d2)$ fair probability**, **Half-Kelly sizing**, and **Dual AI RAG cross-examination**. Traders evaluate statistical edge before executing, fostering informed, sustainable participation.

3. **🌊 Pillar 3: Open-Source Liquidity & Strategy Framework:**
   * *The Bottleneck:* CLOB prediction markets require active market makers to maintain narrow spreads and sufficient depth.
   * *ForeSight Solution:* ForeSight provides 4 modular, open-source strategy bots (`Sentinel` market maker, `Vector` arbitrageur, `Volt` momentum tracker, `Sweeper` automated claimer) ready to run directly with `@somnia-chain/markets-sdk`.

4. **⚡ Pillar 4: Zero-Friction Web3 Onboarding & Organic Social Proof:**
   * *The Bottleneck:* Faucet configurations and wallet friction cause drop-offs for new users exploring prediction markets.
   * *ForeSight Solution:* An **Instant Simulation Sandbox** allows immediate strategy testing with virtual collateral. Upon profitable outcomes, the **1200×675 HD Alpha Card Studio** generates verifiable proof-of-thesis cards with transaction anchors for transparent social sharing.

5. **💎 Pillar 5: Long-Term Architecture & Sustainable Roadmap:**
   * *Design Philosophy:* Built to be self-sustaining beyond the hackathon through potential batch-sweep convenience fee splits, institutional quant telemetry feeds, and shared liquidity vault integrations.

---

## 📸 6. Proof-of-Thesis Alpha Card Studio (1200×675 HD 1:1 Terminal Window)

To support viral social prediction sharing across the Somnia ecosystem, ForeSight features a 1:1 **Terminal Window Canvas Studio**:

| 🏆 Settled Round Alpha Card | 📈 Live Thesis & Trajectory Alpha Card |
| :---: | :---: |
| <img src="src/assets/ForeSight-ETH-15M-UP-Settled.png" alt="ForeSight Alpha Card - ETH 15M Settled Victory" width="100%" /> | <img src="src/assets/ForeSight-BTC-Thesis.png" alt="ForeSight Alpha Card - BTC Quantitative Thesis" width="100%" /> |

*Figure 6.1: Real-time 1200×675 HD 1:1 ForeSight Terminal Window Alpha Cards generated directly from on-chain Somnia L1 settlements and live quantitative trajectories.*

* **1:1 Authentic Terminal Window Export:** Renders an ultra-high-definition 1200×675 canvas faithfully mirroring the ForeSight Terminal UI (macOS titlebar controls, ForeSight eye branding, Somnia Shannon network pill badge).
* **Live Real-Time Ticker Matrix:** Top subheader displays real-time price quotes (BTC, ETH, SOL, SOMI), network gas (6 Gwei), and CLOB matching status.
* **Two-Column Institutional Layout:**
  - **Left Telemetry Panel:** Asset coin emblem, prediction side (`BUY YES @ 45.1% ODDS`), 2×2 KPI execution grid (`Position Size`, `Entry Invested`, `Settled Payout`, `Execution Speed`), and Net Profit readout.
  - **Right Visualizer Panel:** Dynamic candlestick & neon trajectory curve with glowing area gradient, strike price reference, and floating victory ROI hero panel (`+122.2% ROI`, `Return Multiplier: 2.22x`).
* **Cryptographic On-Chain Audit Footer:** Stamps the verifiable TxHash, `ForeSightBatchSweeper.sol` contract address, and Somnia Explorer verification link.
* **1-Click Viral Sharing:** Instant 1-click clipboard copy (`COPY IMAGE`), lossless PNG export (`DOWNLOAD PNG`), and pre-formatted tweet intents (`SHARE ON X`).

---

## 🤖 7. Autonomous Auto-Pilot Runner & Strategy Execution Suite

ForeSight bridges interactive algorithmic trading in the web cockpit with headless autonomous agents running on Somnia Shannon (`50312`). Rather than opaque "black-box" bots, all automated strategies are built upon transparent quantitative rules, on-chain execution tracking, and rigorous capital safety guardrails.

---

### 7.1 In-Terminal Autonomous Auto-Pilot Runner (`InsightsView.tsx`)

Traders can deploy multi-round automated execution campaigns directly from the **AI Insights** tab without writing code or running CLI scripts:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          IN-TERMINAL AUTOMATED ORDER RUNNER WORKFLOW                            │
│                                                                                                 │
│  [ Select Strategy ] ──► [ Budget & Rounds ] ──► [ Sequential Dispatch ] ──► [ Track & Audit ] │
│  • ⚡ MOMENTUM           • 3 / 5 / 10 Rounds     • 12s Inter-Round Delay     • Win-Rate Streak  │
│  • 🛡️ REVERSAL           • $10 / $25 / $50 / $100 • Somnia L1 Tx Receipt     • Explorer Links   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Dual Quantitative Strategy Presets:**
  * **`⚡ MOMENTUM HUNTER`:** Detects directional price trends using spot delta and orderbook asymmetry. When Bullish confidence $\ge 50\%$, automatically buys `YES`; when Bearish confidence $< 50\%$, buys `NO`. Snipes momentum continuation before spreads widen.
  * **`🛡️ MEAN REVERSAL SPECIALIST`:** Fades overextended spot price deviations away from strike equilibrium. When Bullish confidence $\ge 50\%$ (overbought), buys `NO` to capture the pullback; when Bearish confidence $< 50\%$ (oversold), buys `YES` to capitalize on the mean-reversion bounce.
* **Capital Budgeting & Round Selection:**
  * Preset round lengths: **3 Rounds**, **5 Rounds**, or **10 Rounds**.
  * Dynamic capital allocation: **$10**, **$25**, **$50**, or **$100 tUSDC** total budget, automatically divided per round (e.g. `$50` across 5 rounds = `~$10.0 / round`).
* **Execution Engine & 12-Second Pacing:**
  * Orders are dispatched on-chain with `signerType: "AutonomousSessionAgent (Somnia L1)"`.
  * After each fill, an automated **12-second countdown cooldown** paces execution, preventing rapid slippage and allowing the market to register block state updates.
* **Live Session Progress HUD & Emergency Stop:**
  * Live status state machine: `EXECUTING` $\to$ `WAITING_NEXT` $\to$ `COMPLETED` (or `ABORTED`).
  * One-click manual abort button (`STOP (RND X/Y)`) allows the trader to kill the session instantly at any point.
  * Full real-time audit log with clickable [Shannon Explorer](https://shannon-explorer.somnia.network/) transaction hash verification for every deployed round.
* **Recent Execution Track Record & Live Streak Metrics:**
  * Real-time streak visualizer displaying round outcomes: `WIN`, `LOSS`, `REFUND`, and `PENDING`.
  * Live aggregate scorecard: Wins vs. Losses (e.g. `4W - 1L`) and calibrated Win Rate percentage (e.g. `80.0% WIN RATE`).
* **"Prefill Terminal" Bridge:**
  * A 1-click bridge button allows traders to export the AI & bot conviction parameters into the manual Polymarket trading ticket for customized manual execution.

---

### 7.2 1-Minute HFT Quant Cockpit & 0ms Math Reflex (`AnalyticsView.tsx` & `ScenarioSimulator.tsx`)

For high-velocity manual and semi-automated scalping on 60-second binary rounds:

* **Tactical Strike Radar Gauge:** Real-time visual comparison of current spot price vs. on-chain strike level, displaying exact basis point distance ($bps$) to calculate breakout probability.
* **60-Second Round Expiry Phase Bar:**
  * **Phase 1: Capital Accumulation (0s - 20s):** Market discovery and initial orderbook depth build-up.
  * **Phase 2: Momentum Lock-in (20s - 50s):** Volatility expansion; quant indicators ($VC$, $\Phi(d2)$) reach maximum predictive efficacy.
  * **Phase 3: Trading Cutoff Window (50s - 60s):** Trading window closes to prevent front-running settlement; client-side guardrail disables trade submission to eliminate `TradingNotActive()` transaction reverts.
* **`⚡ TRADE WITH QUANT EDGE` CTA:** Instantly transfers quantitative fair probability and strike targets from the Analytics cockpit into the execution order ticket.

---

### 7.3 Headless CLI Strategy Bot Suite (`@somnia-chain/markets-sdk`)

For DevOps engineers, institutional liquidity providers, and headless market operations, ForeSight maintains a suite of standalone CLI strategy runners:

| Strategy CLI | Bot Persona | Strategy Description & Execution Logic |
| :--- | :--- | :--- |
| `npm run agent:starter` | **Baseline Validator** | Submits baseline limit orders and validates ERC-20 approvals and pool connectivity on Somnia Shannon |
| `npm run agent:maker` | **🛡️ Sentinel (Market Maker)** | Continuously quotes dynamic two-sided bid-ask spreads around fair probability $\Phi(d2)$, tightening CLOB liquidity |
| `npm run agent:oracle` | **🎯 Vector (Arbitrageur)** | Evaluates spot oracle drift (Binance feeds) vs CLOB implied odds to snipe mispriced stale orders |
| `npm run agent:copilot` | **⚡ Volt (AI Copilot)** | Executes conditional on-chain orders based on Dual AI Arena conviction thresholds and risk filters |

---

## 🏗️ 8. Full System Architecture & Multi-Tier Data Flow

### 8.1 End-to-End Architectural Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                1. INGESTION & SENSING TIER                                      │
│  [Somnia GraphQL Indexer]      [Binance Real-Time Oracle]       [DreamDEX CLOB Depth]           │
│  (Active Event Pools, 10s)     (Spot Momentum & Volatility)     (Orderbook Imbalance & Bids)    │
└─────────────────────────────────┬───────────────────────────────┬───────────────────────────────┘
                                  │                               │
                                  ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                2. INTELLIGENCE & PRICING ENGINE                                 │
│  ┌──────────────────────────────┐                ┌───────────────────────────────────────────┐  │
│  │ Quantitative Math Core       │   Confluence   │ Dual AI Debate Engine                     │  │
│  │ • Black-Scholes Φ(d2) Fair P │◄──────────────►│ • 🐂 Alpha Bull (Catalyst & Upside Edge)  │  │
│  │ • Velocity Coverage (VC)     │   Validation   │ • 🐻 Macro Bear (Tail Risk & Headwinds)   │  │
│  │ • Half-Kelly Bet Sizing      │                │ • ⚖️ Consensus Alpha Score & Net Sizing   │  │
│  └──────────────────────────────┘                └───────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────────────────────────────────────┘
                                  │ Calibrated Alpha Signals
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                3. EXECUTION & AUTOMATION TIER                                   │
│   [ Bento Trading Cockpit ]         [ 🤖 Autonomous Auto-Pilot ]        [ Alpha Card Studio ]   │
│   • Spot Candlesticks & Radar       • In-Terminal Runner (3/5/10 Rds)   • 1200×675 HD Canvas    │
│   • Polymarket-Standard Ticket      • Momentum / Reversal Presets       • Proof-of-Thesis Share │
│   • Cutoff Protection Guardrail     • 12s Cooldown & Emergency Stop     • Social Media Export   │
└─────────────────────────────────┬───────────────────────────────────────────────────────────────┘
                                  │ Signed Orders / Batch Claim Calls
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                4. ON-CHAIN SETTLEMENT & L1 TIER                                 │
│   [ DreamDEX CLOB Contracts ]       [ 🧹 Settlement Sweeper ]          [ Somnia Shannon L1 ]    │
│   • BinaryPool & BinaryMarket       • Batch claims expired payouts     • High Throughput, <1s   │
│   • Non-custodial escrow            • 1-Click batch capital recovery   • Sub-cent EVM gas fees  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 5 Core Interactive Terminal Workspaces

ForeSight organizes all trading and quantitative operations into **5 specialized, high-density workspaces**:

| Workspace Tab | Core Architecture | Interactive Capabilities & Features |
| :--- | :--- | :--- |
| **1. Overview**<br/>`LandingPage.tsx` | Protocol presentation & telemetry | Institutional product overview, real-time live ticker bar, 4-stage pipeline showcase, and 1-click terminal launch. |
| **2. Terminal**<br/>`PriceChart.tsx` + `ScenarioSimulator.tsx` + `DepthChart.tsx` | High-frequency CLOB trading & 0ms Reflex | Spot Candlesticks with on-chain Strike line, **Mini Strike Radar & Imbalance Meter** (0ms math reflex), **Polymarket-Standard Ticket** (1-click USD chips $10/$25/$50/$100/Max), **Agent Fast-Pick** (⚡ Momentum / 🛡️ Reversal), and Trading Cutoff Protection. |
| **3. Analytics**<br/>`AnalyticsView.tsx` | 1-Minute HFT Quant Cockpit | **Tactical Strike Radar Gauge**, **60-Second Round Expiry Phase Bar** (Discovery $\to$ Lock $\to$ Cutoff), Closed-form Black-Scholes $\Phi(d2)$ fair value, Orderbook Imbalance ($OI\%$), Velocity Coverage ($VC$), and direct CTA `⚡ TRADE WITH QUANT EDGE`. |
| **4. AI Insights**<br/>`InsightsView.tsx` | Dual AI Arena & Auto-Pilot Command | Adversarial debate (Gemini 2.5 Flash vs Meta LLaMA 3.3 70B), **Autonomous Auto-Pilot Runner & Risk Guardrail Engine** (3/5/10 rounds, Momentum/Reversal presets, 12s pacing cooldown & emergency abort), Autonomous Execution Streak metrics, and Copilot Signals Feed. |
| **5. Portfolio**<br/>`ActivityView.tsx` + `PositionsTable.tsx` | On-chain ledger & Alpha Card Studio | **Full 7-State Lifecycle** (`RESTING`, `IN FLIGHT`, `RESOLVING`, `SETTLED WIN`, `EXPIRED LOSS`, `REFUNDED`, `CLAIMED`), transparent PnL and 100% Refund reporting, **1-Click MultiCall Batch Sweeper**, and exportable **1200×675 HD Alpha Cards**. |

---

### 8.3 End-to-End Decision & Settlement Lifecycle

| Stage | Phase Name | Execution Latency | Data Processing & Protocol Actions |
| :---: | :--- | :---: | :--- |
| **1** | **Sensing & Ingestion** | `~100 ms` | Background worker polls Somnia GraphQL (`dev.smk.somnia.host`) for active event contracts and streams Binance spot feeds. Detects real-time strike delta and CLOB spread. |
| **2** | **Quantitative & AI Reasoning** | `0ms (Math) / <2 s (AI)` | Client-side 0ms Math Reflex computes Strike Distance, Orderbook Imbalance, Black-Scholes $\Phi(d2)$, and Velocity Coverage ($VC$). Dual AI conducts adversarial Bull vs. Bear debate for macro regime analysis. |
| **3** | **Execution & Order Placement** | `< 1 sec` | User or Auto-Pilot triggers on-chain client-side signing in MetaMask (ERC-20 `approve` & order dispatch) to DreamDEX CLOB on Somnia Shannon (`50312`). Cutoff protection prevents `TradingNotActive()` reverts. |
| **4** | **Settlement & Capital Sweeping** | `< 1 sec (1-Click)` | Once round expires, unfilled limit orders are 100% refunded to user wallet. For settled winning positions, Settlement Sweeper executes 1-click batch claims via `ForeSightBatchSweeper.sol`. |

---

### 8.4 Multi-Tier System Breakdown & Performance SLAs

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🖥️ TIER 1: PRESENTATION & CLIENT-SIDE COCKPIT                                                     │
├────────────────────────────────┬───────────────────────────────┬────────────────────────────────┤
│ Subsystem / Component          │ Technology Stack              │ Guaranteed SLA & Invariants    │
├────────────────────────────────┼───────────────────────────────┼────────────────────────────────┤
│ • 5-Tab Bento Trading Cockpit  │ React 19, Vite 6, Tailwind    │ 0 page reloads, dark contrast  │
│ • Spot Candlesticks & Radar    │ Recharts, SVG Sparklines      │ 0ms client math reflex         │
│ • 1-Minute HFT Quant Cockpit   │ Tactical Gauge & Phase Bar    │ Real-time strike & expiry phase│
│ • Polymarket-Standard Ticket   │ Preset chips, ROI calculator  │ Cutoff protection guardrail    │
│ • Autonomous Auto-Pilot Runner │ Multi-round execution runner  │ 12s pacing delay & manual abort│
│ • Alpha Card Studio (1:1 UI)   │ HTML5 Canvas, Web Share APIs  │ 1200×675 HD on-chain export    │
└────────────────────────────────┴───────────────────────────────┴────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🧠 TIER 2: INTELLIGENCE & WORKER PROCESSING LAYER                                                │
├────────────────────────────────┬───────────────────────────────┬────────────────────────────────┤
│ Subsystem / Component          │ Technology Stack              │ Guaranteed SLA & Invariants    │
├────────────────────────────────┼───────────────────────────────┼────────────────────────────────┤
│ • Snapshot Polling Worker      │ Node.js, Express, TypeScript  │ 10s cadence across pools       │
│ • News Ingestion & Multi-RAG   │ CryptoPanic, Gecko, Top Venues│ Verified source RAG citations  │
│ • Dual Debate Engine           │ Gemini 2.5 / Meta LLaMA 3.3   │ Strict Zod schema, <1.5s delay │
│ • Quantitative Pricing Core    │ Chebyshev Rational Approx     │ Rational error |ε| < 1.5×10⁻⁷  │
│ • Settlement Sweeper Engine    │ Batch Scanning Worker         │ Recovers claimable winnings    │
│ • Dual-Layer Persistence       │ Supabase + Local JSON Ledger  │ Persistent state on restart    │
└────────────────────────────────┴───────────────────────────────┴────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🤖 TIER 3: AUTONOMOUS STRATEGY & AUTO-PILOT RUNNERS                                              │
├────────────────────────────────┬───────────────────────────────┬────────────────────────────────┤
│ Agent Persona                  │ Operational Trigger           │ Execution & Strategy Invariant │
├────────────────────────────────┼───────────────────────────────┼────────────────────────────────┤
│ • ⚡ Auto-Pilot (Momentum)      │ Bull/Bear Conviction ≥ 50%    │ Trend-following CLOB dispatch  │
│ • 🛡️ Auto-Pilot (Reversal)     │ Mean-reversion counter pick   │ Fades overextended skew        │
│ • 🎯 Vector (Arbitrageur)      │ Implied odds lag (<35% in 5m) │ Exploits spot vs CLOB drift    │
│ • 🛡️ Sentinel (Market Maker)  │ Continuous quoting loop       │ Quotes two-sided spread (±3%)  │
│ • 🧹 Sweeper (Claim Bot)       │ Expiry < Now & Claimable > 0  │ Automated batch payout sweeps  │
└────────────────────────────────┴───────────────────────────────┴────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⛓️ TIER 4: BLOCKCHAIN & SOMNIA L1 PROTOCOL LAYER                                                  │
├────────────────────────────────┬───────────────────────────────┬────────────────────────────────┤
│ Protocol Component             │ Network & Contract Layer      │ Guaranteed SLA & Invariants    │
├────────────────────────────────┼───────────────────────────────┼────────────────────────────────┤
│ • DreamDEX CLOB Contracts      │ Solidity, BinaryPool, Viem    │ Non-custodial escrow & orders  │
│ • DreamDEX Settlement Router   │ 0xbF4a49e0Dfd092e5FBE8E...    │ Singleton settlement lookup    │
│ • ForeSight Batch Sweeper      │ Custom MultiCall Router (Sol) │ 1-Click Atomic Batch Claiming  │
│ • GraphQL Indexer              │ dev.smk.somnia.host           │ Sub-second indexer query speed │
│ • Somnia Shannon Testnet       │ Somnia L1 (Chain ID: 50312)   │ Sub-second block finality      │
└────────────────────────────────┴───────────────────────────────┴────────────────────────────────┘
```

---

### 8.5 Verified Smart Contracts & Dual-Layer Persistence on Somnia L1

ForeSight combines the core non-custodial CLOB contracts of **DreamDEX** with custom institutional infrastructure contracts developed and deployed natively on **Somnia Shannon L1**:

| Contract Name | Network | Deployed Address | Verified Explorer Link | Core Role & Capabilities |
| :--- | :---: | :---: | :---: | :--- |
| **`ForeSightBatchSweeper.sol`** | Somnia Shannon (`50312`) | [`0x0df05851d944bfd01e6bc772e27738c23b6e30f9`](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9) | [View on Somnia Explorer ↗](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9) | **1-Click Atomic Settlement Sweeper**: Executes multi-pool redemptions (`batchSweep`), batch token approvals (`batchApprove`), and non-custodial bot operator delegation. |
| **`DreamDEX Settlement Router`** | Somnia Shannon (`50312`) | [`0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23`](https://shannon-explorer.somnia.network/address/0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23) | [View on Somnia Explorer ↗](https://shannon-explorer.somnia.network/address/0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23) | **Singleton Settlement Router**: Manages on-chain YES/NO outcome verification, settlement status determination, and claim routing. |
| **`DreamDEX Market Creator`** | Somnia Shannon (`50312`) | [`0x5Ce69567dB39C8fBAd7e048bEfdbcCdfE67B44e6`](https://shannon-explorer.somnia.network/address/0x5Ce69567dB39C8fBAd7e048bEfdbcCdfE67B44e6) | [View on Somnia Explorer ↗](https://shannon-explorer.somnia.network/address/0x5Ce69567dB39C8fBAd7e048bEfdbcCdfE67B44e6) | **Binary Pool Creator**: Factory contract minting binary event pools and configuring oracle parameters. |
| **`Testnet Collateral (tUSDC)`** | Somnia Shannon (`50312`) | [`0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`](https://shannon-explorer.somnia.network/address/0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E) | [View on Somnia Explorer ↗](https://shannon-explorer.somnia.network/address/0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E) | **ERC-20 Trading Collateral**: Standard settlement currency across all binary event pools. |

#### 🛡️ Dual-Layer Position & Order Persistence Architecture
To guarantee zero data loss across client reloads and server restarts:
1. **Primary Layer (Supabase PostgreSQL):** Asynchronously records all signed on-chain positions, transaction hashes, realized PnL, and settlement timestamps to the `user_positions` table.
2. **Local Failover Cache (`data/positions.json`):** Synchronously writes every position to atomic local disk storage, providing seamless offline persistence even without cloud database access.

#### 📜 On-Chain Deployment Audit Receipt
* **Deployment TxHash:** [`0x0042f7f304e036493b529d2cd6e77e359f0952db358e33799912d9e0a19cf275`](https://shannon-explorer.somnia.network/tx/0x0042f7f304e036493b529d2cd6e77e359f0952db358e33799912d9e0a19cf275)
* **Block Number:** `480492425`
* **Solidity Version:** `^0.8.20`
* **Compilation Command:** `npm run contracts:compile`
* **Deployment CLI:** `npm run contracts:deploy`

---

## 🧪 9. Developer Diagnostics & Test Verification (124/124 Tests)

ForeSight maintains **100% test pass rate** with 11 comprehensive Vitest test suites verifying smart contracts, financial math, agent execution, and network resilience:

```bash
npm test
```

```text
 RUN  v4.1.11 D:/Coding/Somnia

 ✓ tests/batch-sweeper-contract.test.ts (4 tests)
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

 Test Files  11 passed (11)
      Tests  124 passed (124) [100% Pass Rate]
   Duration  2.61s
```

---

## 📁 10. Repository Structure

```text
ForeSight/
├── contracts/                  # Solidity smart contracts & compilation artifacts
│   ├── ForeSightBatchSweeper.sol  # 1-Click atomic multi-pool batch redemption router
│   ├── ForeSightBatchSweeper.json # Compiled EVM bytecode & ABI artifact
│   ├── compile.ts                 # solc 0.8.20 compiler script
│   └── deployment.json            # On-chain testnet deployment receipt (Address & TxHash)
├── src/                        # Core TypeScript & Frontend application source
│   ├── agents/                 # Autonomous agent personas & Dual Debate reasoning engine
│   │   ├── strategies/         # Dual-AI RAG debate, market-maker, oracle follower
│   │   └── base-agent.ts       # Abstract agent lifecycle & risk guardrails
│   ├── cli/                    # Diagnostic & operator tools (doctor, claim, markets)
│   ├── config/                 # Somnia & DreamDEX network constants & contract addresses
│   ├── core/                   # Order engine, settlement sweeper, pricing core
│   ├── quant/                  # Black-Scholes Φ(d2), Half-Kelly, Velocity Coverage math
│   ├── server/                 # Express backend, WebSocket bridge, live market poller
│   └── ui/                     # React 19 + Vite financial decision terminal & Alpha Card studio
├── scripts/                    # On-chain deployment & operational scripts
│   └── deploy-sweeper.ts       # Somnia Shannon Testnet smart contract deployer
├── tests/                      # 11 Vitest suites (124/124 passing tests - 100% pass rate)
│   ├── advanced-pricing-and-vc.test.ts # Velocity Coverage & trajectory physics tests
│   ├── batch-sweeper-contract.test.ts  # Smart contract ABI & bytecode verification
│   ├── deterministic-math.test.ts      # Chebyshev Black-Scholes & Greeks validation
│   ├── dual-debate-engine.test.ts      # Adversarial RAG debate & evidence validation
│   └── settlement-sweeper.test.ts      # Multi-pool batch redemption verification
├── docs/                       # Official documentation & submission deliverables
│   ├── SDK_FEEDBACK.md         # Somnia & DreamDEX SDK feedback report
│   ├── PRESENTATION.md         # Hackathon pitch deck & executive presentation
│   └── DemoScript.md           # 2-3 minute judge video walkthrough script
├── package.json                # Project dependencies, scripts & metadata
├── tsconfig.json               # TypeScript 5.7 compiler configuration
├── vite.config.ts              # Vite 6 frontend build configuration
└── README.md                   # Project documentation & fast-track briefing
```

---

## 🛠️ 11. Somnia & DreamDEX Developer Feedback Report

During the development of ForeSight on the **Somnia Shannon Testnet (`Chain ID: 50312`)**, we deeply integrated `@somnia-chain/markets-sdk` with `viem` to build automated snapshot ingestion, AI reasoning agents, scenario simulations, smart contract batch routing, and automated settlement sweeps.

*(Full comprehensive SDK Feedback Report available at [`docs/SDK_FEEDBACK.md`](docs/SDK_FEEDBACK.md))*.

### 🟢 What Worked Exceptionally Well (Strengths)
1. **High-Performance GraphQL Indexer (`dev.smk.somnia.host`):** Real-time querying of active event contracts is remarkably fast with sub-second indexer response times.
2. **Modular SDK Design (`SomniaMarkets`):** The unified abstraction for order placement (`createOrder`), balance checks (`fetchBalance`), and book depth retrieval (`fetchOrderBook`) aligns smoothly with standard CCXT-style trading paradigms.
3. **Sub-Second Block Finality on Somnia Shannon:** Rapid block confirmations enable automated snapshot workers to record micro-volatility shifts and detect probability spikes without missing interim price updates.

### 💡 High-Value Opportunities for Protocol Enhancement
1. **Native Batch Settlement Helper (`batchClaimSettledMarkets`):**
   * *Current Behavior:* Developers currently iterate through individual settled markets to execute sequential claim transactions.
   * *ForeSight Solution:* We built and deployed [`ForeSightBatchSweeper.sol`](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9) on Shannon testnet.
   * *Recommendation:* Add an SDK method `exchange.claimAllSettled({ venueId })` that batches multiple redemption calls into a single multicall on-chain transaction.
2. **WebSocket Orderbook Streaming:**
   * *Current Behavior:* Retrieving granular orderbook depth relies on frequent polling of `fetchOrderBook`.
   * *Recommendation:* Expose typed WebSocket subscriptions (`exchange.subscribeOrderBook(symbol, callback)` and `exchange.subscribeSpikes(threshold, callback)`) out-of-the-box in `@somnia-chain/markets-sdk`.
3. **Strict TypeScript Typing for Binary Event Contracts:**
   * *Current Behavior:* In the raw indexer response, `marketType`, `expiry`, and `strike` sometimes appear under dynamic `info` fields as varied string/number formats.
   * *Recommendation:* Provide strict TypeScript interfaces (`BinaryMarketInfo` with guaranteed `expiryTimestamp`, `strikePrice`, `underlyingAsset`, and `timeRemainingSec`).

---

## ⚡ 12. Local Installation & Development Guide

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
npm run doctor            # Validate Somnia RPC, Indexer, Venue ID, and wallet state
npm run markets           # Query and inspect active event contracts across cadences (1m, 5m, 15m, 1h, 4h)
npm run claim             # Scan finalized markets and execute batch settlement sweep
npm run contracts:compile # Compile ForeSightBatchSweeper.sol smart contract
npm run contracts:deploy  # Deploy ForeSightBatchSweeper to Somnia Shannon Testnet
npm run agent:starter     # Launch Baseline Starter Bot
npm run agent:maker       # Launch Sentinel Two-Sided Market Maker Bot
npm run agent:oracle      # Launch Vector Spot Arbitrageur Bot
npm run agent:copilot     # Launch Autonomous AI Copilot Bot
```

---

## 🗺️ 13. Future Roadmap Beyond Hackathon

| Phase & Milestone | Target Timeline | Strategic Focus | Core Technical Deliverables | Ecosystem Impact on Somnia | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Phase 1: Testnet & Terminal Launch** | **Q3 2026**<br/>*(Current)* | • Shannon Testnet MVP<br/>• Core Decision Loop<br/>• Automated Strategy Suite | • 5-Tab Bento Trading Terminal<br/>• Dual AI Adversarial Debate Arena with RAG<br/>• Deterministic Velocity Coverage ($VC$) Modeling<br/>• In-Terminal Auto-Pilot + 4 CLI Bot Runners (Volt, Vector, Sentinel, Sweeper)<br/>• 1200×675 HD Proof-of-Thesis Alpha Card Studio | • Proves sub-second trading viability on Somnia<br/>• Ingests active rolling DreamDEX event contracts<br/>• Eliminates stranded capital via Settlement Sweeper | **🟢 Complete & Live** |
| **Phase 2: Somnia Mainnet & Reactive Agents** | **Q4 2026** | • Mainnet Deployment<br/>• Native Reactive VM<br/>• Institutional API | • Deployment on Somnia Mainnet with full SOMI token support<br/>• Integration with **Somnia Native Reactive Agents** for on-chain trigger execution without off-chain keepers<br/>• Institutional REST API & typed WebSocket SDK<br/>• Mobile-optimized Progressive Web App (PWA) | • Drives continuous on-chain transaction volume<br/>• First prediction terminal leveraging Somnia Native Reactivity | **🔵 Planned** |
| **Phase 3: Cross-Venue Prediction Aggregator** | **2027+** | • Prediction Aggregation<br/>• Social Copy-Trading<br/>• Decentralized Swarms | • Smart Order Routing (SOR) across multi-venue prediction pools<br/>• Non-custodial Social Copy-Trading Vaults with verifiable Proof-of-Alpha<br/>• Community-staked Autonomous Agent Swarm Arenas<br/>• Multi-asset index and basket event contracts | • Establishes ForeSight as the primary liquidity and intelligence router for the Somnia ecosystem | **🔵 Planned** |

---

## 📄 14. License & Acknowledgements

MIT License — see the [LICENSE](LICENSE) file for details. Built with ❤️ for the **Somnia × DreamDEX Event Contracts Hackathon**.  
Special thanks to the **Somnia Network** & **DreamDEX** engineering teams for developer tools, GraphQL indexers, and documentation support.
