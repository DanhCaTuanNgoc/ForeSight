# 🛠️ Developer Feedback Report: DreamDEX SDK & Documentation

**Project Name:** ForeSight — Precision Trading & Cognitive Intelligence Terminal  
**Target Network:** Somnia Shannon Testnet (`Chain ID: 50312`)  
**SDK Under Evaluation:** `@somnia-chain/markets-sdk` (v0.28.1+)  
**Indexer Endpoint:** DreamDEX GraphQL Indexer (`dev.smk.somnia.host`)  
**Documentation Evaluated:** [DreamDEX Developer Docs](https://docs.dreamdex.io/developers/event-contracts) & [DreamDEX Bot Kit](https://github.com/somnia-chain/dreamdex-bot-kit)  
**Submission Category:** *Feedback Report regarding SDK and Documentation (Optional Hackathon Deliverable)*  

---

## 📋 Executive Summary

During the development and testing of **ForeSight** for the **Somnia × DreamDEX Event Contracts Hackathon**, our team deeply integrated `@somnia-chain/markets-sdk`, `viem`, and the DreamDEX GraphQL indexer across 500+ rolling binary prediction markets (1m, 5m, 15m, 1h horizons on BTC, ETH, and SOL).

Overall, the Somnia Layer 1 blockchain and the DreamDEX CLOB architecture provide an **exceptional, ultra-low-latency foundation** for high-cadence on-chain prediction markets. Block confirmations on Somnia Shannon consistently settle in **sub-second speeds**, enabling real-time algorithmic quoting and rapid state updates.

To support the Somnia and DreamDEX core engineering teams in their mission to build world-class developer tooling, this report offers **constructive, structured, and actionable technical feedback** based on our real-world development experience.

---

## 💻 Section 1: SDK Evaluation (`@somnia-chain/markets-sdk`)

### 🟢 1.1 What Worked Exceptionally Well (Strengths)

1. **Unified CCXT-Style Trading Interface:**  
   The `SomniaMarkets` abstraction provides intuitive, standardized methods (`fetchOrderBook`, `createOrder`, `fetchBalance`, `cancelOrder`) that make onboarding seamless for quantitative and algorithmic developers.
2. **ERC-6909 Native Outcomes:**  
   Utilizing multi-token ERC-6909 standards for binary outcome shares (`YES`/`NO`) avoids the gas bloat of deploying individual ERC-20 contracts per rolling round.
3. **Sub-Second Block Finality Compatibility:**  
   The SDK executes and queries transactions with minimal client-side overhead, taking full advantage of Somnia's sub-second reactive EVM.

---

### 💡 1.2 Actionable Recommendations & Code Proposals

#### 1. Native On-Chain Batch Settlement Helper (`batchClaimSettledMarkets`)
* **Current Friction:**  
  When multiple short-horizon contracts mature simultaneously, developers must iterate through individual settled markets to execute sequential redemption calls. For traders holding positions in 10+ pools, this causes unnecessary gas overhead and transaction signing friction.
* **Our Workaround:**  
  We built and deployed [`ForeSightBatchSweeper.sol`](https://shannon-explorer.somnia.network/address/0x0df05851d944bfd01e6bc772e27738c23b6e30f9) on Somnia Shannon, which batches multi-pool settlements into a single atomic transaction.
* **SDK Proposal:**  
  Add an official batch redemption helper directly in `@somnia-chain/markets-sdk`:
  ```typescript
  // Proposed SDK API
  const receipt = await exchange.claimAllSettled({
    venueId: "0x...",
    marketAddresses: ["0xPool1", "0xPool2", "0xPool3"],
    recipient: userAddress,
  });
  ```

---

#### 2. First-Class Typed WebSocket Streaming for Orderbook Depth
* **Current Friction:**  
  Currently, tracking granular orderbook depth and price drift relies on periodic HTTP/GraphQL polling (`fetchOrderBook`). During rapid momentum spikes ($\Delta P \ge 10\%$), 3–5 second polling introduces noticeable staleness for high-frequency agents.
* **SDK Proposal:**  
  Provide native WebSocket event subscriptions:
  ```typescript
  // Proposed SDK API
  const unsubscribe = exchange.subscribeOrderBook({
    symbol: "BTC-5M-UP",
    intervalMs: 100,
    onDepthUpdate: (orderBook) => {
      console.log("Best Bid:", orderBook.bids[0], "Best Ask:", orderBook.asks[0]);
    },
  });
  ```

---

#### 3. Strict Compile-Time TypeScript Schemas for Binary Event Markets
* **Current Friction:**  
  In the raw indexer response, contract metadata (`strikePrice`, `expiry`, `underlyingAsset`) is sometimes nested inside dynamic `info` JSON objects with varying string/number representations (`status: 3` vs `status: "Finalized"`).
* **SDK Proposal:**  
  Export strongly-typed TypeScript interfaces and Zod schemas:
  ```typescript
  export interface BinaryEventMarket {
    id: string;
    symbol: string;
    underlyingAsset: "BTC" | "ETH" | "SOL" | string;
    strikePriceUsd: number;
    expiryTimestamp: number;
    timeRemainingSec: number;
    status: "Active" | "Paused" | "Settled";
    outcomeTokens: {
      yesTokenId: bigint;
      noTokenId: bigint;
    };
  }
  ```

---

#### 4. Internal Optimistic Nonce Management for High-Frequency Bot Swarms
* **Current Friction:**  
  Because Somnia confirms blocks in sub-second intervals, autonomous strategy bots dispatching multiple orders across different markets in rapid succession occasionally trigger `replacement transaction underpriced` or `nonce too low` errors if the RPC provider lags by 100ms.
* **SDK Proposal:**  
  Incorporate an optimistic in-memory `NonceTracker` within the SDK that automatically handles nonce increments and transient RPC retries.

---

## 📚 Section 2: Documentation & Developer Resources Evaluation

### 🟢 2.1 Documentation Strengths
* **Clear High-Level Concepts:** The core documentation on Event Contracts architecture and binary settlement formulas is clear, concise, and easy to grasp.
* **Starter Bot Kit:** The [`dreamdex-bot-kit`](https://github.com/somnia-chain/dreamdex-bot-kit) repository serves as a helpful baseline for initial setup.

---

### 💡 2.2 Documentation Gaps & Enhancement Opportunities

#### 1. End-to-End TypeScript Examples for Event Contracts
* **Observation:** Some example snippets in the documentation focus on general Spot AMM flows rather than the specific lifecycle of Event Contracts (Minting $\rightarrow$ CLOB Trading $\rightarrow$ Oracle Resolution $\rightarrow$ Outcome Redemption).
* **Recommendation:** Add a dedicated step-by-step tutorial: *"How to build an Event Contract Trading Agent in TypeScript from scratch"*, illustrating the complete lifecycle with code samples.

#### 2. Comprehensive GraphQL Indexer Schema Reference
* **Observation:** Developers often have to inspect raw GraphQL responses using Apollo Studio or manual POST requests to discover field names and enum values.
* **Recommendation:** Provide an interactive GraphQL query reference table documenting all available queries (`activeMarkets`, `recentTrades`, `settledRounds`), filter parameters, and pagination arguments.

#### 3. Troubleshooting & Error Code Glossary
* **Observation:** When an order placement or redemption fails on-chain, custom smart contract revert bytes (e.g. `0x3f...`) are returned without descriptive error strings.
* **Recommendation:** Include a "Common Error Codes & Revert Reasons" guide in the documentation (e.g., `Error: InsufficientAllowance`, `Error: MarketAlreadyExpired`, `Error: MinSpreadViolation`).

---

## 🌟 Section 3: Summary Scorecard & Developer Experience (DevEx)

| Evaluation Dimension | Current Rating | Feedback Summary |
| :--- | :---: | :--- |
| **Blockchain Performance (Somnia L1)** | ⭐⭐⭐⭐⭐ `5.0 / 5.0` | Flawless sub-second finality, negligible gas costs, highly stable on Shannon testnet. |
| **SDK Usability (`markets-sdk`)** | ⭐⭐⭐⭐☆ `4.2 / 5.0` | Very clean CCXT-like API; would benefit from batch settlement helpers and WebSocket depth streaming. |
| **Indexer Speed & Reliability** | ⭐⭐⭐⭐☆ `4.5 / 5.0` | High-speed GraphQL queries; needs strictly typed schema exports in TypeScript. |
| **Documentation & Guides** | ⭐⭐⭐⭐☆ `4.0 / 5.0` | Great conceptual foundation; needs more end-to-end binary contract tutorials and error code references. |

---

## 🏁 Conclusion

Building **ForeSight** on Somnia and DreamDEX has been a fantastic developer experience. The high-throughput infrastructure of Somnia L1 unlocks possibilities for algorithmic trading, predictive intelligence, and autonomous agents that are simply unfeasible on slower EVM chains.

We hope this feedback report assists the Somnia Network and DreamDEX core teams in refining their SDKs and developer documentation ahead of mainnet launch.

---

*Submitted with ❤️ by the **ForeSight Engineering Team** for the Somnia × DreamDEX Event Contracts Hackathon.*

