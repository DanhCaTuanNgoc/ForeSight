import { describe, it, expect } from "vitest";
import {
  normalCdf,
  erf,
  calculateBlackScholesBinaryFairValue,
  BASELINE_VOLATILITIES,
  PIN_RISK_FLOOR_SECONDS,
} from "../src/core/quantitative-pricing.js";
import { calculateScenario } from "../src/agents/strategies/dual-debate-engine.js";

describe("High-Precision Abramowitz & Stegun Normal CDF & Error Function", () => {
  it("computes erf(0) = 0 and erf(x) symmetry correctly", () => {
    expect(erf(0)).toBe(0);
    expect(erf(1.0)).toBeCloseTo(0.8427, 4);
    expect(erf(-1.0)).toBeCloseTo(-0.8427, 4);
    expect(erf(2.0)).toBeCloseTo(0.9953, 4);
  });

  it("matches standard normal cumulative distribution milestones", () => {
    // Phi(0) = 0.5
    expect(normalCdf(0)).toBe(0.5);

    // Phi(1) approx 0.84134
    expect(normalCdf(1.0)).toBeCloseTo(0.8413, 3);

    // Phi(-1) approx 0.15866
    expect(normalCdf(-1.0)).toBeCloseTo(0.1587, 3);

    // Phi(1.96) approx 0.975 (95% confidence interval one-tailed)
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);

    // Phi(-1.96) approx 0.025
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);

    // Phi(2.576) approx 0.995
    expect(normalCdf(2.576)).toBeCloseTo(0.995, 3);
  });

  it("preserves exact complementary symmetry Phi(-z) + Phi(z) = 1.0", () => {
    const testPoints = [0.25, 0.5, 0.84, 1.25, 1.96, 2.5, 3.2];
    for (const z of testPoints) {
      const pPositive = normalCdf(z);
      const pNegative = normalCdf(-z);
      expect(pPositive + pNegative).toBeCloseTo(1.0, 4);
    }
  });

  it("handles extreme bounds safely without NaN or infinity", () => {
    expect(normalCdf(10)).toBe(0.9999);
    expect(normalCdf(-10)).toBe(0.0001);
    expect(normalCdf(NaN)).toBe(0.5);
  });
});

describe("Closed-Form Black-Scholes Binary Option Pricing & Model Edge", () => {
  it("prices ATM (At-The-Money) binary calls around ~50%", () => {
    const pricing = calculateBlackScholesBinaryFairValue({
      currentSpot: 100000,
      strikePrice: 100000,
      timeRemainingSeconds: 900, // 15 mins
      asset: "BTC",
      isCall: true,
      marketPrice: 0.50,
    });

    expect(pricing.fairProbability).toBeCloseTo(0.50, 1);
    expect(pricing.fairProbabilityPercent).toBeGreaterThanOrEqual(48);
    expect(pricing.fairProbabilityPercent).toBeLessThanOrEqual(52);
    expect(pricing.pricingModel).toContain("Black-Scholes Binary");
  });

  it("prices Deep ITM binary calls with high probability (>85%)", () => {
    const pricing = calculateBlackScholesBinaryFairValue({
      currentSpot: 101500, // +1.5% above strike
      strikePrice: 100000,
      timeRemainingSeconds: 600, // 10 mins
      asset: "BTC",
      isCall: true,
      marketPrice: 0.70,
    });

    expect(pricing.fairProbability).toBeGreaterThan(0.85);
    expect(pricing.isFavorable).toBe(true); // 85%+ vs 70% book gives >1500 bps edge
    expect(pricing.edgeBps).toBeGreaterThan(1000);
  });

  it("prices Deep OTM binary calls with low probability (<20%)", () => {
    const pricing = calculateBlackScholesBinaryFairValue({
      currentSpot: 98000, // -2% below strike
      strikePrice: 100000,
      timeRemainingSeconds: 600,
      asset: "BTC",
      isCall: true,
      marketPrice: 0.35,
    });

    expect(pricing.fairProbability).toBeLessThan(0.20);
    expect(pricing.isFavorable).toBe(false); // Unfavorable to buy call
    expect(pricing.edgeBps).toBeLessThan(0);
  });

  it("enforces Anti-Pin-Risk diffusion floor when time is near zero", () => {
    const pricing = calculateBlackScholesBinaryFairValue({
      currentSpot: 100010,
      strikePrice: 100000,
      timeRemainingSeconds: 2, // Near zero seconds remaining!
      asset: "BTC",
      isCall: true,
    });

    // Should clamp to 45 seconds rather than blowing up with division by zero
    expect(pricing.tauSecondsClamped).toBe(PIN_RISK_FLOOR_SECONDS);
    expect(Number.isFinite(pricing.zScore)).toBe(true);
    expect(pricing.fairProbability).toBeGreaterThan(0);
    expect(pricing.fairProbability).toBeLessThan(1);
  });

  it("computes accurate Basis Point (bps) Edge against CLOB implied book odds", () => {
    const pricing = calculateBlackScholesBinaryFairValue({
      currentSpot: 100500,
      strikePrice: 100000,
      timeRemainingSeconds: 900,
      asset: "BTC",
      isCall: true,
      marketPrice: 0.55, // Book quotes 55%
    });

    // If model gives ~65%, edge is approx +1000 bps
    expect(pricing.edgeBps).toBeDefined();
    expect(pricing.edgePercent).toBeDefined();
    expect(pricing.isFavorable).toBe(pricing.edgeBps! > 50);
  });

  it("recommends sensible Half-Kelly capital allocation when edge is positive", () => {
    const pricingFavorable = calculateBlackScholesBinaryFairValue({
      currentSpot: 100800,
      strikePrice: 100000,
      timeRemainingSeconds: 900,
      asset: "BTC",
      isCall: true,
      marketPrice: 0.50,
    });

    expect(pricingFavorable.halfKellyFraction).toBeGreaterThan(0);
    expect(pricingFavorable.halfKellyFraction).toBeLessThanOrEqual(0.25); // Capped at 25% max

    // Unfavorable market: Kelly should be zero
    const pricingUnfavorable = calculateBlackScholesBinaryFairValue({
      currentSpot: 99200,
      strikePrice: 100000,
      timeRemainingSeconds: 900,
      asset: "BTC",
      isCall: true,
      marketPrice: 0.60,
    });
    expect(pricingUnfavorable.halfKellyFraction).toBe(0.0);
  });

  it("correctly applies asset volatility priors (BTC, ETH, SOL, SOMI)", () => {
    expect(BASELINE_VOLATILITIES.BTC).toBe(0.52);
    expect(BASELINE_VOLATILITIES.ETH).toBe(0.62);
    expect(BASELINE_VOLATILITIES.SOL).toBe(0.78);
    expect(BASELINE_VOLATILITIES.SOMI).toBe(0.85);
  });
});

describe("Deterministic Scenario Integration with Quantitative Valuation", () => {
  it("enriches calculateScenario with both Trajectory VC and Quantitative Fair Value", () => {
    const scenario = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.55,
      targetExitPrice: 0.80,
      timeRemainingMin: 15,
      currentSpot: 100200,
      strikePrice: 100000,
    });

    // Verifies original deterministic metrics
    expect(scenario.contractsCount).toBeCloseTo(181.82, 1);
    expect(scenario.earlyExitPnlUsdc).toBeGreaterThan(0);
    expect(scenario.velocityCoverage).toBeDefined();

    // Verifies new quantitative model fields
    expect(scenario.modelFairProbability).toBeDefined();
    expect(scenario.modelFairProbabilityPercent).toBeDefined();
    expect(scenario.modelEdgeBps).toBeDefined();
    expect(scenario.isFavorableEdge).toBeDefined();
    expect(scenario.halfKellyFraction).toBeDefined();
  });
});
