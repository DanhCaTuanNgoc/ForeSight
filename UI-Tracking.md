You are a senior product designer and frontend engineer.

Build a polished, production-quality **Web3 financial analytics dashboard** inspired by the visual language of DreamDEX.

IMPORTANT:

* Use DreamDEX only as visual inspiration.
* Do NOT copy logos, brand assets, proprietary text, exact illustrations, or exact page content.
* Do not implement betting, gambling, prediction-market trading, or real-money transaction functionality.
* This is a UI/UX prototype focused on market analytics and visualization.

## 1. Design Direction

Create a dark, minimal, premium Web3 interface with the visual feeling of a modern on-chain exchange.

Design characteristics:

* Very dark background
* High contrast typography
* Minimal borders
* Subtle gray surfaces
* Small uppercase labels
* Monospace or technical typography for numerical data
* Dense but organized information layout
* Green/red market movement indicators
* Thin charts and data visualization
* Compact cards instead of large rounded marketing components
* Strong horizontal alignment
* Minimal gradients
* Avoid excessive glassmorphism
* Avoid excessive shadows
* Avoid oversized rounded cards

The interface should feel:

> technical + institutional + crypto-native + fast + data-driven

Do NOT make it look like a generic SaaS dashboard.

---

## 2. Global Layout

Create a responsive application shell:

```text
┌─────────────────────────────────────────────────────────┐
│ LOGO        Markets   Analytics   Insights        Wallet │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    MAIN CONTENT                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Desktop should use a dense multi-column layout.

Mobile should collapse the navigation and stack analytical sections vertically.

Use generous horizontal alignment but relatively compact vertical spacing.

---

## 3. Header

Create a compact top navigation.

Left:

* Product logo/name
* Small status indicator

Center:

* Markets
* Analytics
* Insights
* Activity

Right:

* Network indicator
* Wallet/account placeholder
* Settings icon

The header should remain visually lightweight.

Do not use a large hero navigation.

---

## 4. Market Ticker

Below the header, create a horizontally scrolling market ticker inspired by modern crypto exchanges.

Example:

```text
BTC/USD   $78,624.7   ▼ -0.42%
ETH/USD   $2,450.1    ▼ -1.36%
SOL/USD   $182.4      ▲ +2.05%
SOMI/USD  $0.1095     ▲ +2.05%
```

Requirements:

* Compact height
* Small typography
* Monospace numerical values
* Green positive movement
* Red negative movement
* Smooth horizontal scrolling
* No oversized cards

Use mock data only.

---

# 5. Main Analytics Page

Create a dashboard centered around one selected market.

Top section:

```text
BTC / USD

$78,624.70

▼ -0.42%

24H Volume
$12.4M

24H High
$79,120

24H Low
$76,820
```

Below it, create a large interactive chart.

---

# 6. Primary Chart

The chart should be the visual centerpiece.

Requirements:

* Dark background
* Thin line
* Subtle grid
* Minimal axis labels
* Interactive tooltip
* Time range selector

Time ranges:

```text
15m   1H   4H   1D   1W
```

When hovering:

```text
14:32 UTC

Price
$78,624.70

Volume
$1.24M
```

Keep the chart visually clean.

Avoid unnecessary chart decorations.

---

# 7. Market Depth Visualization

Add a CLOB-style analytical visualization.

This is for **visual analytics only**.

Example:

```text
BUY DEPTH                    SELL DEPTH

██████████                   ███████
████████                     █████████
██████                       ███████████
████                         █████████
──────────────────────────────────────
             MID PRICE
```

Use subtle green/red tones.

Do not implement actual order placement or execution.

---

# 8. Recent Activity

Create a compact activity stream:

```text
RECENT ACTIVITY

14:32   BUY      1,250      $78,624
14:31   SELL       820      $78,612
14:30   BUY        430      $78,605
14:29   SELL     1,100      $78,590
```

Each row should include:

* Timestamp
* Side
* Size
* Price
* Optional shortened transaction identifier

Use a dense exchange-style table.

---

# 9. Intelligence Panel

Add a differentiated analytics panel called:

## MARKET CONTEXT

This is where the application's unique value should appear.

Example:

```text
MARKET CONTEXT

Price movement
+4.8% over the last 6 hours

Key events

14:32
Major market event detected

13:47
Trading volume increased 42%

12:20
Related asset moved +3.1%

[View Evidence]
```

This should feel like an analytical intelligence layer rather than a chatbot.

---

# 10. Event Timeline

Create an interactive horizontal timeline.

Example:

```text
10:00 ───── 12:00 ───── 14:00 ───── 16:00

             ●              ●
          Event A        Event B
```

Clicking an event should open a compact contextual panel:

```text
EVENT

14:32 UTC

Market event detected

Market movement:
$76,820 → $78,624

Context:
Relevant external information was detected
around this time.

[View Evidence]
```

Do not make unsupported causal claims.

Use language such as:

* "coincided with"
* "around this time"
* "market movement followed"
* "relevant information detected"

rather than:

* "caused"
* "guaranteed"
* "will result in"

---

# 11. Heatmap

Add a compact market activity heatmap.

Categories:

```text
CRYPTO
SPORTS
MACRO
TECH
OTHER
```

Use cell intensity to represent activity level.

Example:

```text
BTC       ██████████
ETH       ████████
SOL       █████
MACRO     █████████
TECH      ████
```

Keep it compact.

Do not turn it into a huge dashboard component.

---

# 12. Visual Style

Use the following design principles:

### Colors

Background:

* Near-black
* Charcoal

Surface:

* Very dark gray

Text:

* Off-white
* Secondary gray

Positive:

* Green

Negative:

* Red

Accent:

* One restrained accent color

Do not use many bright colors simultaneously.

---

# 13. Typography

Use a modern technical typography system.

Recommended:

* Inter
* Geist
* IBM Plex Sans
* IBM Plex Mono

Use monospace typography for:

* Prices
* Percentages
* Transaction IDs
* Timestamps
* Technical metadata

Use normal sans-serif typography for:

* Headings
* Navigation
* Descriptions

---

# 14. Component Philosophy

Prefer:

```text
small radius
thin borders
compact spacing
strong alignment
clear hierarchy
```

Avoid:

```text
huge rounded cards
heavy shadows
excessive gradients
oversized headings
generic SaaS dashboard aesthetics
```

The UI should feel like a professional technical terminal rather than a marketing website.

---

# 15. Interaction Design

Add subtle micro-interactions:

* Hover states
* Chart tooltip
* Ticker movement
* Table row highlighting
* Smooth panel transitions
* Loading skeletons
* Data refresh indicators

Animations should be fast and subtle.

Avoid excessive animation.

---

# 16. Responsive Design

Desktop:

```text
┌──────────────┬──────────────────────────────┐
│              │                              │
│ Market List  │       Main Chart             │
│              │                              │
│              ├──────────────────────────────┤
│              │ Market Context               │
└──────────────┴──────────────────────────────┘
```

Mobile:

```text
Header
   ↓
Selected Market
   ↓
Chart
   ↓
Market Statistics
   ↓
Market Context
   ↓
Event Timeline
   ↓
Recent Activity
```

Everything must remain readable without horizontal scrolling.

---

# 17. Technical Requirements

Use:

* Next.js
* TypeScript
* React
* Tailwind CSS
* Recharts or another lightweight charting library

Use mock data initially.

Create reusable components:

```text
AppShell
Header
MarketTicker
MarketHeader
PriceChart
MarketStats
DepthChart
ActivityTable
ContextPanel
EventTimeline
Heatmap
```

Keep components modular.

Do not put the entire dashboard into one large component.

---

# 18. Code Quality

Requirements:

* TypeScript strict mode
* Reusable components
* Clean props/interfaces
* No unnecessary dependencies
* Responsive from the beginning
* Accessible buttons and interactive elements
* Proper loading states
* Proper empty states
* Proper error states
* No hardcoded duplicated UI structures

Before finishing:

1. Run the project.
2. Check for TypeScript errors.
3. Check responsive layout.
4. Check console errors.
5. Verify every interactive element.
6. Remove unnecessary code.
7. Ensure the final UI looks polished rather than merely functional.

---

# 19. Most Important Instruction

Do not blindly copy DreamDEX.

Study the **design language**:

* dense technical layout
* dark Web3 aesthetic
* exchange-style data presentation
* compact typography
* live-data feeling
* minimal visual noise
* strong information hierarchy

Then create an original interface around those principles.

The final result should feel like:

> **A premium on-chain analytics terminal built for people who want to understand market data quickly.**

Not:

> **A generic SaaS dashboard.**
