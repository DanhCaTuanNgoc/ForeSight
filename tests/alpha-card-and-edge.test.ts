import { describe, it, expect } from "vitest";
import { calculateBlackScholesBinaryFairValue } from "../src/core/quantitative-pricing.js";
import { calculateScenario } from "../src/agents/strategies/dual-debate-engine.js";

describe("Alpha Card & Social Proof Data Integrity", () => {
  it("formats valid Proof-of-Thesis payload with accurate metrics", () => {
    const scenario = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 250,
      entryPrice: 0.52,
      targetExitPrice: 0.78,
      timeRemainingMin: 12,
      currentSpot: 89400,
      strikePrice: 89650,
    });

    const cardPayload = {
      title: "ForeSight Alpha Thesis",
      symbol: scenario.symbol,
      outcome: scenario.outcome,
      impliedOddsPercent: scenario.entryPrice * 100,
      modelFairValuePercent: scenario.modelFairProbabilityPercent,
      edgeBps: scenario.modelEdgeBps,
      velocityCoverage: scenario.velocityCoverage,
      projectedPnl: scenario.earlyExitPnlUsdc,
      projectedRoi: scenario.earlyExitRoiPercent,
      network: "Somnia Shannon (50312)",
      protocol: "DreamDEX CLOB",
      timestamp: Date.now(),
    };

    expect(cardPayload.symbol).toBe("BTC-15M-UP");
    expect(cardPayload.outcome).toBe("YES");
    expect(cardPayload.impliedOddsPercent).toBe(52);
    expect(cardPayload.network).toBe("Somnia Shannon (50312)");
    expect(cardPayload.projectedRoi).toBeGreaterThan(0);
    expect(typeof cardPayload.velocityCoverage).toBe("number");
  });

  it("evaluates contrarian NO positions with inverted strike distances", () => {
    const noScenario = calculateScenario({
      symbol: "ETH-5M-DOWN",
      outcome: "NO",
      investmentUsdc: 100,
      entryPrice: 0.45,
      targetExitPrice: 0.70,
      timeRemainingMin: 5,
      currentSpot: 2600,
      strikePrice: 2580,
    });

    expect(noScenario.outcome).toBe("NO");
    expect(noScenario.earlyExitPnlUsdc).toBeGreaterThan(0);
    expect(noScenario.settlementWinPnlUsdc).toBeGreaterThan(0);
    expect(noScenario.modelFairProbability).toBeDefined();
  });

  it("handles high-frequency 60-second micro-expiries gracefully", () => {
    const pricing = calculateBlackScholesBinaryFairValue({
      currentSpot: 88500,
      strikePrice: 88520,
      timeRemainingSeconds: 60, // 1-minute turbo round
      asset: "BTC",
      isCall: true,
      marketPrice: 0.50,
    });

    expect(pricing.tauSecondsClamped).toBe(60);
    expect(pricing.fairProbability).toBeGreaterThan(0.01);
    expect(pricing.fairProbability).toBeLessThan(0.99);
  });

  it("correctly models large investment allocations without overflow", () => {
    const whaleScenario = calculateScenario({
      symbol: "BTC-1H-UP",
      outcome: "YES",
      investmentUsdc: 50_000,
      entryPrice: 0.65,
      targetExitPrice: 0.90,
      timeRemainingMin: 45,
      currentSpot: 89000,
      strikePrice: 89100,
    });

    expect(whaleScenario.contractsCount).toBeCloseTo(76923.08, 1);
    expect(whaleScenario.earlyExitPnlUsdc).toBeGreaterThan(15000);
    expect(whaleScenario.maxLossUsdc).toBe(50000);
  });

  it("ensures risk-reward ratio is never negative or zero for valid trades", () => {
    const scenario = calculateScenario({
      symbol: "SOL-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.40,
      targetExitPrice: 0.60,
      stopLossPrice: 0.30,
    });

    expect(scenario.riskRewardRatio).toBeGreaterThan(0);
    expect(scenario.stopLossPnlUsdc).toBeLessThan(0);
  });
});
