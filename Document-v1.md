# DreamDEX Intelligence Layer

## Product & Technical Design Document

### Tagline

**Understand the market before you trade it.**

---

## 1. Product Overview

DreamDEX Intelligence Layer is an intelligence and visualization layer built on top of DreamDEX prediction market infrastructure.

Traditional prediction markets primarily present users with raw market data such as probability, price, volume, and order books. While these metrics are essential for experienced traders, they can create a significant analysis barrier for new users and require traders to manually connect market movements with external events and news.

DreamDEX Intelligence Layer addresses this problem by transforming raw prediction-market data into an interactive decision-support experience.

Instead of simply showing users **what the market price is**, DreamDEX helps users understand:

> **What happened → What changed → What might happen → What can I do?**

The core product flow is:

**Probability Timeline → Contextual AI + Evidence → Scenario Simulator → Trading**

The system does not attempt to predict the market outcome on behalf of the user. Instead, it provides contextual information, transparent evidence, and deterministic scenario calculations so that users can make their own trading decisions.

---

# 2. Problem Statement

Prediction markets are powerful because they aggregate collective expectations about future events. However, the current user experience often requires users to manually perform several analytical tasks.

A typical workflow may look like:

1. Open a prediction market.
2. Check the current probability.
3. Inspect the historical price movement.
4. Search for relevant news.
5. Compare timestamps between market movements and external events.
6. Determine what may have influenced the movement.
7. Calculate potential profit or loss.
8. Return to the market and execute the trade.

This workflow creates three major problems:

### 2.1 Information Fragmentation

Market data and external information are separated.

Users must switch between:

* Prediction market data
* News websites
* Social media
* Charts
* Financial calculations

### 2.2 High Cognitive Load

Probability values such as:

> YES: 63%

do not immediately explain why the market reached that level.

Users need contextual information to interpret market movements.

### 2.3 Decision Friction

Even after understanding the market, users may still need to manually calculate potential outcomes before deciding whether to trade.

DreamDEX aims to reduce this friction without removing user control.

---

# 3. Product Vision

DreamDEX Intelligence Layer transforms prediction-market data into contextual, actionable information.

### Traditional Prediction Market

**Market → Data → User Interpretation → Trade**

### DreamDEX Intelligence Layer

**Market → Data → Context → Scenario → User Decision → Trade**

The product is not intended to replace the trader's judgment.

Instead, it helps the trader reach an informed decision faster.

---

# 4. Core User Journey

The entire experience is organized around four questions.

| User Question      | Product Module           | Purpose                                                |
| ------------------ | ------------------------ | ------------------------------------------------------ |
| **What happened?** | Probability Timeline     | Visualize how market probability changed               |
| **What changed?**  | Contextual AI + Evidence | Explain the events surrounding significant movements   |
| **What if?**       | Scenario Simulator       | Calculate potential outcomes under different scenarios |
| **What do I do?**  | Streamlined Execution    | Allow the user to execute and manage a position        |

The resulting flow is:

```text
                    DREAMDEX MARKET
                          │
                          ▼
                ┌───────────────────┐
                │ WHAT HAPPENED?    │
                │ Probability       │
                │ Timeline          │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ WHAT CHANGED?     │
                │ AI + Evidence     │
                │ News / Events     │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ WHAT IF?          │
                │ Scenario          │
                │ Simulator         │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ WHAT DO I DO?     │
                │ Trade & Position  │
                └───────────────────┘
```

---

# 5. Feature Matrix

| User Journey          | Module                       | UX / User Action                                                                                                                   | Core Differentiation                                                                                    |
| --------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **1. WHAT HAPPENED?** | **Probability Timeline**     | User explores the historical probability chart and clicks significant spikes or movements to inspect their timestamps.             | Converts raw probability data into an understandable visual market story.                               |
| **2. WHAT CHANGED?**  | **Contextual AI + Evidence** | User selects a significant market movement and receives relevant events, news context, AI-generated summary, and original sources. | Adds an intelligence layer on top of raw market data while maintaining transparency through evidence.   |
| **3. WHAT IF?**       | **Scenario Simulator**       | User enters capital and entry price, then adjusts the exit price to calculate the resulting scenario PnL.                          | Turns financial calculations into an intuitive interactive experience without promising future returns. |
| **4. WHAT DO I DO?**  | **Streamlined Execution**    | User chooses Buy YES/NO, confirms the transaction through a wallet, and sees the updated position in the portfolio.                | Connects market understanding directly to action while preserving user control.                         |

---

# 6. Module 1 — Probability Timeline

## 6.1 Objective

The Probability Timeline is the primary visualization layer of DreamDEX.

Instead of presenting only the current market probability, the system visualizes how probability evolved over time.

### Example

```text
Probability

70% |                              ●
    |                           ╱
60% |                        ●
    |                     ╱
50% |                 ●
    |              ╱
40% |         ●────╯
    |
30% |    ●
    |
    └────────────────────────────────
       10:00   12:00   14:00   16:00
```

Significant market movements are identified as interactive points.

---

## 6.2 User Interaction

Users can:

* Hover over probability points.
* Click significant spikes.
* Inspect the timestamp of the movement.
* View the probability before and after the movement.
* Open contextual events associated with that period.

Example:

```text
14:32 UTC

Probability
41% → 58%

Change
+17 percentage points

[View Context]
```

---

## 6.3 Design Principle

The system should avoid unnecessary financial chart complexity.

The objective is not to reproduce a professional trading terminal.

The objective is:

> **Make probability movement immediately understandable.**

---

# 7. Module 2 — Contextual AI + Evidence

## 7.1 Objective

When a user selects a significant probability movement, DreamDEX retrieves external information surrounding that period and presents relevant context.

The system should answer:

> **What changed around this market movement?**

rather than making unsupported claims about causality.

---

## 7.2 Example Experience

```text
Probability increased

41% → 58%
+17 percentage points

Key events around this movement:

14:32 UTC
Fed announces rate decision

14:35 UTC
BTC moves +4.2%

14:47 UTC
Analyst forecast revised
```

The AI then provides a concise contextual summary:

> The probability increase coincided with the Fed announcement and subsequent BTC price movement. These events may have contributed to the market repricing.

---

## 7.3 Evidence-Based AI

The AI layer uses a Retrieval-Augmented Generation (RAG) pipeline.

```text
Market Spike
     │
     ▼
Determine Time Window
     │
     ▼
Retrieve Relevant News
     │
     ▼
Rank / Filter Sources
     │
     ▼
Provide Evidence to LLM
     │
     ▼
Generate Contextual Summary
     │
     ▼
Display Sources
```

Every AI-generated explanation should provide access to the original sources.

### Required UI

**[View Sources]**

The user should be able to verify the information independently.

---

## 7.4 Important Product Principle

The AI should **not claim causation unless causation can actually be established**.

For example:

### Avoid

> "The Fed announcement caused probability to increase by 17%."

### Prefer

> "Probability increased by 17 percentage points shortly after the Fed announcement."

or:

> "The market movement coincided with the Fed announcement and subsequent BTC price movement."

This distinction is important for maintaining product credibility.

---

# 8. Module 3 — Scenario Simulator

## 8.1 Objective

Prediction-market share pricing can make potential outcomes difficult for new users to calculate mentally.

The Scenario Simulator converts the calculation into an interactive model.

---

## 8.2 User Inputs

The user provides:

* Capital
* Position side
* Entry price
* Exit price

The user can then adjust the exit price using a slider.

Example:

```text
Capital
$100

Entry Price
$0.30

Exit Price
$0.70

Estimated Scenario PnL
+$133.33

Return
+133.3%
```

---

## 8.3 Deterministic Calculation

The PnL engine should be deterministic.

The calculation should not depend on an LLM.

Conceptually:

```text
Shares = Capital / Entry Price

Exit Value = Shares × Exit Price

PnL = Exit Value - Capital
```

Additional platform-specific factors such as fees, spread, or execution conditions should be incorporated when applicable.

---

## 8.4 User Safety / Transparency

The simulator must clearly communicate that it is a scenario calculation rather than a prediction.

Recommended UI note:

> **Illustrative scenario based on selected entry and exit prices. Actual execution may vary.**

The simulator should never imply that the user is guaranteed to achieve the displayed outcome.

---

# 9. Module 4 — Streamlined Execution

## 9.1 Objective

Once users understand the market and evaluate a scenario, they should be able to execute the trade without leaving the experience.

The intended flow is:

```text
Scenario
   │
   ▼
User Decision
   │
   ▼
[Buy YES] / [Buy NO]
   │
   ▼
Wallet Confirmation
   │
   ▼
Blockchain Transaction
   │
   ▼
Transaction Confirmation
   │
   ▼
My Positions
```

---

## 9.2 User Control

The system should never automatically execute a trade based on AI analysis or simulator results.

The AI provides context.

The simulator provides calculations.

**The user makes the final decision.**

This preserves the product philosophy:

> **Understand → Decide → Trade**

---

## 9.3 State Management

The UI should update relevant state without requiring unnecessary full-page reloads.

Examples include:

* Current market probability
* Transaction status
* Wallet state
* Position balance
* Portfolio information

This creates a responsive trading experience.

---

# 10. Intelligence Layer Architecture

The system is divided into three primary layers.

```text
┌─────────────────────────────────────────────┐
│                 USER LAYER                  │
│                                             │
│ Timeline → AI Context → Simulator → Trade  │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              INTELLIGENCE LAYER             │
│                                             │
│ Timeline Analysis                           │
│ Event Matching                              │
│ RAG Retrieval                               │
│ AI Context Generation                       │
│ Scenario Calculation                        │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                 DATA LAYER                  │
│                                             │
│ DreamDEX API                                │
│ Market Probability                          │
│ Market Price                                │
│ Volume                                      │
│ External News Sources                       │
│ Event Data                                  │
└─────────────────────────────────────────────┘
                       │
                       ▼
              DreamDEX Infrastructure
```

---

# 11. Data Layer

The Data Layer collects the information required by the Intelligence Layer.

### DreamDEX Data

Potential data sources include:

* Market probability
* Share price
* Trading volume
* Market metadata
* Historical market movements
* Market status

### External Data

Potential sources include:

* RSS feeds
* News APIs
* Public event feeds
* Other trusted information sources

The external information should be normalized and stored with timestamps so that it can be matched against market movements.

---

# 12. Model / Intelligence Layer

The Intelligence Layer processes raw data into contextual information.

### Core pipeline

```text
Market Data
     │
     ▼
Detect Significant Movement
     │
     ▼
Create Relevant Time Window
     │
     ▼
Retrieve External Events
     │
     ▼
Rank Relevant Evidence
     │
     ▼
RAG Context
     │
     ▼
LLM Summary
     │
     ▼
Structured JSON
     │
     ▼
Frontend Visualization
```

The AI output should be structured rather than directly rendered as unrestricted text.

Example conceptual response:

```json
{
  "movement": {
    "before": 0.41,
    "after": 0.58,
    "change": 0.17
  },
  "events": [
    {
      "timestamp": "14:32 UTC",
      "title": "Fed announces rate decision",
      "relevance": "high",
      "source": "..."
    }
  ],
  "summary": "...",
  "confidence": "medium"
}
```

The frontend can then render the information consistently.

---

# 13. Execution Layer

The Execution Layer connects the user interface to DreamDEX's trading infrastructure.

Potential technologies include:

* DreamDEX SDK
* Viem
* Wallet integration
* Smart contracts

Conceptually:

```text
User Decision
     │
     ▼
Trade Parameters
     │
     ▼
DreamDEX SDK / Viem
     │
     ▼
Wallet
     │
     ▼
Smart Contract
     │
     ▼
Transaction Result
     │
     ▼
Application State
```

The Scenario Simulator should provide information to the trade interface, but it should not directly trigger blockchain transactions.

---

# 14. Recommended Technology Stack

For a 15-day hackathon sprint, a web-first architecture is recommended.

## Frontend

**Next.js + TypeScript**

Reasons:

* Fast development
* Strong React ecosystem
* Excellent support for interactive dashboards
* Easy integration with Web3 tooling
* Suitable for responsive web applications

## UI / Visualization

Potential choices:

* Recharts
* D3.js
* Lightweight charting libraries
* Custom React visualization components

The project should prioritize clarity over excessive visual complexity.

## Backend / Data

**Supabase**

Potential responsibilities:

* News storage
* Event metadata
* Cached market data
* Application state
* RAG-related data

## Web3

Potential stack:

* Viem
* Wallet integration
* DreamDEX SDK
* DreamDEX smart contracts

## AI

Potential components:

* LLM API
* Embedding model
* Vector search
* RAG pipeline

The AI provider should be abstracted where practical so that the model can be changed without restructuring the application.

---

# 15. 15-Day Hackathon Development Strategy

The project should prioritize a complete working user journey over feature quantity.

## Phase 1 — Foundation

### Days 1–3

* Initialize Next.js project
* Configure TypeScript
* Configure Supabase
* Connect DreamDEX API
* Verify market data retrieval
* Implement basic market page
* Establish application state management

### Goal

A user can open a DreamDEX market and see real market data.

---

## Phase 2 — Core Intelligence Experience

### Days 4–7

Implement:

* Probability Timeline
* Spike detection
* Event timestamps
* News ingestion
* Relevant event retrieval
* Basic RAG pipeline

### Goal

A user can click a probability movement and inspect relevant contextual events.

---

## Phase 3 — AI + Scenario

### Days 8–10

Implement:

* Contextual AI summary
* Source citations
* Scenario Simulator
* Deterministic PnL calculation
* Responsive UI states

### Goal

A user can understand a market movement and simulate a trade scenario.

---

## Phase 4 — Execution

### Days 11–12

Implement:

* Buy YES
* Buy NO
* Wallet connection
* Transaction confirmation
* Position tracking
* Error handling

### Goal

A user can complete the entire journey from analysis to trade.

---

## Phase 5 — Testing & Demo Optimization

### Days 13–15

Focus on:

* Continuous testing
* Edge cases
* API failure handling
* Wallet rejection handling
* Loading states
* Empty states
* AI fallback behavior
* Mobile responsiveness
* Demo data consistency
* Final UI polish

The final objective is not maximum feature count.

It is a reliable:

> **Understand → Simulate → Trade**

happy path.

---

# 16. Continuous Testing Strategy

Each module should be independently testable.

### Probability Timeline

Test:

* Empty market history
* Missing timestamps
* Large probability spikes
* Small probability movements
* Duplicate data
* API failure

### AI Context

Test:

* No relevant news
* Multiple relevant news articles
* Duplicate articles
* Missing source URL
* Incorrect timestamps
* LLM timeout
* LLM hallucination prevention

### Scenario Simulator

Test:

* Zero capital
* Invalid entry price
* Exit below entry
* Exit above entry
* Maximum/minimum prices
* Fees if applicable
* Floating-point precision

### Trading

Test:

* Wallet not connected
* User rejects transaction
* Transaction fails
* Transaction pending
* Transaction confirmed
* Position update failure

---

# 17. Core UX Principles

## Principle 1 — Progressive Disclosure

Do not expose every analytical feature at once.

The default experience should remain simple:

```text
Probability
     ↓
Context
     ↓
Scenario
     ↓
Trade
```

Advanced information can be expanded when needed.

---

## Principle 2 — Evidence Over Claims

AI should provide context and evidence rather than unsupported certainty.

Users should always be able to inspect the original source.

---

## Principle 3 — User Decides

The system should never turn AI output into an automatic trading recommendation.

The product helps users understand information and model scenarios.

The final trading decision remains with the user.

---

## Principle 4 — Visualization With Purpose

Every visualization must answer a question.

For example:

* Timeline → **What happened?**
* Event marker → **When did it happen?**
* AI summary → **What changed around that movement?**
* Simulator → **What happens under my scenario?**

If a visualization does not improve understanding, it should not be included in the MVP.

---

# 18. What We Deliberately Do Not Build in the MVP

To maintain a realistic 15-day scope, the following features are intentionally excluded:

### Market Heatmap

Useful for market discovery, but not essential to proving the core Intelligence Layer.

### Event Dependency Graph

Potentially powerful, but requires reliable relationship modeling and introduces the risk of confusing correlation with causation.

### 3D Risk / Reward Visualization

High visual complexity with relatively low incremental value compared with a clear 2D scenario chart.

### Automated Trading

Not required for the core product and conflicts with the principle of keeping the user in control.

The MVP should prioritize **depth over breadth**.

---

# 19. Competitive Differentiation

DreamDEX should not position itself as:

> "Another prediction market with a better UI."

The stronger positioning is:

> **An intelligence layer that helps users understand prediction markets before trading them.**

### Traditional Experience

```text
Market
  ↓
Probability
  ↓
User researches manually
  ↓
User calculates manually
  ↓
Trade
```

### DreamDEX Experience

```text
Market
  ↓
Probability Timeline
  ↓
Contextual Evidence
  ↓
AI Summary
  ↓
Scenario Simulator
  ↓
Trade
```

The key differentiation is therefore not the presence of AI alone.

It is the combination of:

**Market Data + Temporal Context + Evidence + Scenario Modeling + Execution**

inside a single workflow.

---

# 20. Hackathon Value Proposition

DreamDEX Intelligence Layer demonstrates meaningful integration with the DreamDEX ecosystem by using DreamDEX market data as the foundation of an intelligent user experience.

The architecture follows:

```text
DreamDEX Data
      ↓
Intelligence Layer
      ↓
Contextual Understanding
      ↓
Scenario Modeling
      ↓
DreamDEX Execution
```

This creates a closed product loop:

> **Data → Intelligence → Decision → Action**

Rather than building a standalone AI application, the project extends the utility of DreamDEX's existing prediction-market infrastructure.

---

# 21. Success Criteria

The MVP should be considered successful if a new user can complete the following flow without external tools:

### Step 1

Open a prediction market.

### Step 2

Understand how its probability has changed over time.

### Step 3

Click a significant movement and see relevant events.

### Step 4

Read an AI-generated contextual summary.

### Step 5

Verify the information through original sources.

### Step 6

Enter a hypothetical trade scenario.

### Step 7

Understand the resulting PnL under that scenario.

### Step 8

Execute a YES/NO position through the DreamDEX infrastructure.

### Step 9

See the resulting position in the portfolio.

The ideal experience should take approximately:

> **30 seconds from market discovery to basic understanding and scenario evaluation.**

---

# 22. Final Product Narrative

DreamDEX Intelligence Layer is built around one simple idea:

> **Prediction markets provide the probability. DreamDEX provides the context.**

The platform transforms a raw market signal into an understandable decision workflow.

### WHAT HAPPENED?

**Probability Timeline**

See how the market moved.

### WHAT CHANGED?

**Contextual AI + Evidence**

Understand what happened around the movement and verify the underlying information.

### WHAT IF?

**Scenario Simulator**

Explore the financial outcome of a hypothetical entry and exit.

### WHAT DO I DO?

**Streamlined Execution**

Make the decision and execute the trade directly through DreamDEX.

The result is a prediction-market experience designed around:

> **Understand the market before you trade it.**

---

# 23. One-Line Pitch

> **DreamDEX Intelligence Layer transforms raw prediction-market data into contextual insight and interactive scenarios, helping users understand the market before they trade it.**

# 24. Short Hackathon Pitch

> **Prediction markets tell you what the market thinks. DreamDEX helps you understand why it moved, explore what could happen under your scenario, and act on that information — all in one workflow.**

**What happened → What changed → What if → What do I do.**
