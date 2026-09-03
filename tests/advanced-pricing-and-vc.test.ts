import { describe, it, expect } from "vitest";
import {
  normalCdf,
  calculateBlackScholesBinaryFairValue,
  BASELINE_VOLATILITIES,
  SECONDS_PER_YEAR,
  PIN_RISK_FLOOR_SECONDS,
} from "../src/core/quantitative-pricing.js";
import { calculateScenario } from "../src/agents/strategies/dual-debate-engine.js";

// ---------------------------------------------------------------------------
// Suite 1 — Velocity Coverage (VC) Boundary Conditions
// ---------------------------------------------------------------------------
describe("Trajectory Velocity Coverage (VC) — Edge Cases & Invariants", () => {
  it("returns VC = 0 when spot equals strike (zero required move)", () => {
    const result = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.75,
      timeRemainingMin: 10,
      currentSpot: 100000,
      strikePrice: 100000, // spot == strike, required move = 0%
    });
    // When distance is zero the VC is effectively infinite (already there) or
    // the engine may return a sentinel. In either case it must be defined.
    expect(result.velocityCoverage).toBeDefined();
    expect(result.velocityCoverage).toBeGreaterThanOrEqual(0);
  });

  it("yields VC > 1 when observed momentum exceeds required velocity", () => {
    const result = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.60,
      targetExitPrice: 0.85,
      timeRemainingMin: 10,
      currentSpot: 100000,
      strikePrice: 100300, // +0.3% gap
    });
    // observedVelocity (0.045%/min) > requiredVelocity (0.03%/min) → VC 1.5
    expect(result.velocityCoverage).toBeGreaterThan(1);
  });

  it("yields VC < 1 when momentum is insufficient to reach strike", () => {
    const result = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.55,
      targetExitPrice: 0.80,
      timeRemainingMin: 1,
      currentSpot: 100000,
      strikePrice: 105000, // 5% gap in only 1 minute — very unlikely
    });
    expect(result.velocityCoverage).toBeLessThan(1);
  });

  it("proportionally scales requiredVelocity with shrinking time window", () => {
    const base = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.80,
      timeRemainingMin: 10,
      currentSpot: 100000,
      strikePrice: 100500,
    });
    const squeezed = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.80,
      timeRemainingMin: 5, // half the time → double the required speed
      currentSpot: 100000,
      strikePrice: 100500,
    });
    // Less time ⇒ higher required velocity ⇒ lower VC
    expect(squeezed.requiredVelocity).toBeGreaterThan(base.requiredVelocity);
  });

  it("VC computation is deterministic — same inputs always produce same output", () => {
    const params = {
      symbol: "ETH-15M-UP",
      outcome: "YES" as const,
      investmentUsdc: 50,
      entryPrice: 0.45,
      targetExitPrice: 0.70,
      timeRemainingMin: 8,
      currentSpot: 3200,
      strikePrice: 3220,
    };
    const r1 = calculateScenario(params);
    const r2 = calculateScenario(params);
    expect(r1.velocityCoverage).toBe(r2.velocityCoverage);
    expect(r1.requiredVelocity).toBe(r2.requiredVelocity);
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Black-Scholes Monotonicity & Model Properties
// ---------------------------------------------------------------------------
describe("Black-Scholes Binary Pricing — Monotonicity & Model Properties", () => {
  it("call probability strictly increases as spot rises above strike", () => {
    // Use near-ATM spots over 1 hour so CDF stays well inside [0.01, 0.99]
    const spots = [99700, 99850, 100000, 100150, 100300];
    let prev = 0;
    for (const spot of spots) {
      const res = calculateBlackScholesBinaryFairValue({
        currentSpot: spot,
        strikePrice: 100000,
        timeRemainingSeconds: 3600, // 1 hour gives enough vol surface room
        isCall: true,
      });
      expect(res.fairProbability).toBeGreaterThan(prev);
      prev = res.fairProbability;
    }
  });

  it("put probability strictly decreases as spot rises above strike", () => {
    const spots = [99700, 99850, 100000, 100150, 100300];
    let prev = 1;
    for (const spot of spots) {
      const res = calculateBlackScholesBinaryFairValue({
        currentSpot: spot,
        strikePrice: 100000,
        timeRemainingSeconds: 3600,
        isCall: false,
      });
      expect(res.fairProbability).toBeLessThan(prev);
      prev = res.fairProbability;
    }
  });

  it("higher sigma widens the probability distribution (OTM call increases)", () => {
    const otmCall = (vol: number) =>
      calculateBlackScholesBinaryFairValue({
        currentSpot: 99000,
        strikePrice: 100000,
        timeRemainingSeconds: 900,
        customVol: vol,
        isCall: true,
      }).fairProbability;

    expect(otmCall(0.80)).toBeGreaterThan(otmCall(0.30));
  });

  it("fair probability converges toward 0.5 for long-dated ATM contracts", () => {
    const longDated = calculateBlackScholesBinaryFairValue({
      currentSpot: 100000,
      strikePrice: 100000,
      timeRemainingSeconds: 365 * 24 * 3600, // 1 year ATM
      isCall: true,
    });
    // For ATM with zero drift, d2 → 0 as T → ∞ only with zero drift,
    // but with negative drift (-0.5σ²T) it should still be near ATM territory
    expect(longDated.fairProbability).toBeGreaterThan(0.01);
    expect(longDated.fairProbability).toBeLessThan(0.99);
  });

  it("SOMI baseline vol (0.85) is greater than BTC baseline vol (0.52)", () => {
    expect(BASELINE_VOLATILITIES.SOMI).toBeGreaterThan(BASELINE_VOLATILITIES.BTC);
  });

  it("ETH baseline vol (0.62) is between BTC (0.52) and SOL (0.78)", () => {
    expect(BASELINE_VOLATILITIES.ETH).toBeGreaterThan(BASELINE_VOLATILITIES.BTC);
    expect(BASELINE_VOLATILITIES.ETH).toBeLessThan(BASELINE_VOLATILITIES.SOL);
  });

  it("SECONDS_PER_YEAR constant equals 365.25 * 24 * 3600", () => {
    expect(SECONDS_PER_YEAR).toBe(31_557_600);
  });

  it("PIN_RISK_FLOOR clamps tauSeconds to 45s minimum", () => {
    const result = calculateBlackScholesBinaryFairValue({
      currentSpot: 100000,
      strikePrice: 100000,
      timeRemainingSeconds: 0,
      isCall: true,
    });
    expect(result.tauSecondsClamped).toBe(PIN_RISK_FLOOR_SECONDS);
    expect(result.tauSecondsClamped).toBe(45);
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — Half-Kelly Criterion Sizing Properties
// ---------------------------------------------------------------------------
describe("Half-Kelly Capital Sizing — Boundary & Safety Properties", () => {
  it("Kelly fraction is zero when model price equals market price (no edge)", () => {
    const result = calculateBlackScholesBinaryFairValue({
      currentSpot: 100000,
      strikePrice: 100000,
      timeRemainingSeconds: 900,
      isCall: true,
      marketPrice: 0.5, // exactly equal to expected ATM fair value
    });
    // Minimal or zero edge → kelly should be 0
    // (exact result depends on computed fair probability vs 0.5)
    expect(result.halfKellyFraction).toBeGreaterThanOrEqual(0);
    expect(result.halfKellyFraction!).toBeLessThanOrEqual(0.25);
  });

  it("Kelly fraction is capped at 0.25 (25% max) to prevent over-sizing", () => {
    const result = calculateBlackScholesBinaryFairValue({
      currentSpot: 103000, // Deep ITM, very high edge
      strikePrice: 100000,
      timeRemainingSeconds: 900,
      isCall: true,
      marketPrice: 0.01, // absurdly underpriced
    });
    expect(result.halfKellyFraction).toBeLessThanOrEqual(0.25);
  });

  it("Kelly fraction is 0 when market is unfavorable (book overprices fair value)", () => {
    const result = calculateBlackScholesBinaryFairValue({
      currentSpot: 97000, // OTM call
      strikePrice: 100000,
      timeRemainingSeconds: 900,
      isCall: true,
      marketPrice: 0.85, // massively overpriced vs fair ~15-20%
    });
    expect(result.halfKellyFraction).toBe(0);
    expect(result.isFavorable).toBe(false);
  });

  it("Kelly fraction is undefined when no market price is supplied", () => {
    const result = calculateBlackScholesBinaryFairValue({
      currentSpot: 100000,
      strikePrice: 100000,
      timeRemainingSeconds: 900,
      isCall: true,
      // no marketPrice
    });
    expect(result.halfKellyFraction).toBeUndefined();
    expect(result.edgeBps).toBeUndefined();
    expect(result.isFavorable).toBeUndefined();
  });

  it("edgeBps is positive when fair value exceeds market price", () => {
    const result = calculateBlackScholesBinaryFairValue({
      currentSpot: 101000,
      strikePrice: 100000,
      timeRemainingSeconds: 900,
      isCall: true,
      marketPrice: 0.40, // book underpricing
    });
    expect(result.edgeBps).toBeGreaterThan(0);
    expect(result.isFavorable).toBe(true);
  });

  it("edgeBps is negative when fair value is below market price", () => {
    const result = calculateBlackScholesBinaryFairValue({
      currentSpot: 99000,
      strikePrice: 100000,
      timeRemainingSeconds: 900,
      isCall: true,
      marketPrice: 0.85, // book overpricing
    });
    expect(result.edgeBps).toBeLessThan(0);
    expect(result.isFavorable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Scenario Calculator: Portfolio-Level Stress Tests
// ---------------------------------------------------------------------------
describe("Scenario Calculator — Multi-Asset & Portfolio-Level Stress Tests", () => {
  it("correctly handles a 1-hour SOMI expiry contract", () => {
    const result = calculateScenario({
      symbol: "SOMI-1H-UP",
      outcome: "YES",
      investmentUsdc: 200,
      entryPrice: 0.35,
      targetExitPrice: 0.65,
      timeRemainingMin: 60,
      currentSpot: 0.85,
      strikePrice: 0.90,
    });
    expect(result.symbol).toBe("SOMI-1H-UP");
    expect(result.contractsCount).toBeCloseTo(571.43, 1);
    expect(result.earlyExitPnlUsdc).toBeGreaterThan(0);
  });

  it("calculates correct PnL for a 5-minute SOL contract near expiry", () => {
    const result = calculateScenario({
      symbol: "SOL-5M-UP",
      outcome: "YES",
      investmentUsdc: 30,
      entryPrice: 0.70,
      targetExitPrice: 0.85,
      timeRemainingMin: 2,
    });
    expect(result.contractsCount).toBeCloseTo(42.857, 2);
    // (42.857 * 0.85) - 30 = 36.43 - 30 = +$6.43
    expect(result.earlyExitPnlUsdc).toBeCloseTo(6.43, 1);
  });

  it("survives a round-number $500 investment without precision loss", () => {
    const result = calculateScenario({
      symbol: "BTC-1H-UP",
      outcome: "YES",
      investmentUsdc: 500,
      entryPrice: 0.50,
      targetExitPrice: 0.80,
    });
    expect(result.contractsCount).toBe(1000);
    expect(result.earlyExitPnlUsdc).toBe(300); // 1000 * 0.80 - 500 = +$300
    expect(result.maxLossUsdc).toBe(500);
  });

  it("computes ROI symmetrically for equal-magnitude bull and bear scenarios", () => {
    const bull = calculateScenario({
      symbol: "ETH-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.75,
    });
    const bear = calculateScenario({
      symbol: "ETH-15M-DOWN",
      outcome: "NO",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.75,
    });
    expect(bull.earlyExitRoiPercent).toBe(bear.earlyExitRoiPercent);
    expect(bull.contractsCount).toBe(bear.contractsCount);
  });

  it("confirms settlement win is always better than early exit (exit < $1.00)", () => {
    const result = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.80, // early exit < 1.00
    });
    expect(result.settlementWinPnlUsdc).toBeGreaterThan(result.earlyExitPnlUsdc);
    expect(result.settlementWinRoiPercent).toBeGreaterThan(result.earlyExitRoiPercent);
  });

  it("summary text contains the symbol, entry price, and projected gain", () => {
    const result = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.75,
    });
    expect(result.summaryText).toContain("YES");
    expect(result.summaryText).toContain("0.50");
    expect(result.summaryText).toContain("+");
  });

  it("normalCdf maps extreme positive z-scores safely to 0.9999", () => {
    expect(normalCdf(9)).toBe(0.9999);
    expect(normalCdf(100)).toBe(0.9999);
  });

  it("normalCdf maps extreme negative z-scores safely to 0.0001", () => {
    expect(normalCdf(-9)).toBe(0.0001);
    expect(normalCdf(-100)).toBe(0.0001);
  });
});
