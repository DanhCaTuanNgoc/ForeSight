import { describe, it, expect } from "vitest";
import { calculateScenario } from "../src/agents/strategies/dual-debate-engine.js";

describe("Deterministic Financial Mathematics & Trajectory Velocity ($VC$)", () => {
  it("calculates accurate early exit PnL and ROI for YES positions", () => {
    const result = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.75,
    });

    expect(result.contractsCount).toBe(200); // 100 / 0.50 = 200 contracts
    expect(result.earlyExitPnlUsdc).toBe(50); // 200 * 0.75 - 100 = 50 USDC
    expect(result.earlyExitRoiPercent).toBe(50); // +50% ROI
    expect(result.settlementWinPnlUsdc).toBe(100); // 200 * 1.00 - 100 = 100 USDC (+100%)
    expect(result.maxLossUsdc).toBe(100);
  });

  it("calculates accurate early exit PnL for contrarian NO positions", () => {
    const result = calculateScenario({
      symbol: "ETH-15M-DOWN",
      outcome: "NO",
      investmentUsdc: 50,
      entryPrice: 0.40,
      targetExitPrice: 0.80,
    });

    expect(result.contractsCount).toBe(125); // 50 / 0.40 = 125 contracts
    expect(result.earlyExitPnlUsdc).toBe(50); // 125 * 0.80 - 50 = +50 USDC
    expect(result.earlyExitRoiPercent).toBe(100); // +100% ROI
    expect(result.settlementWinPnlUsdc).toBe(75); // 125 * 1.00 - 50 = +75 USDC (+150%)
  });

  it("computes exact physical Trajectory Velocity Coverage ($VC$)", () => {
    const result = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.60,
      targetExitPrice: 0.85,
      timeRemainingMin: 10,
      currentSpot: 100000,
      strikePrice: 100300, // +0.3% distance
    });

    // Required move: 0.3% over 10 minutes = 0.03% / min
    // Observed momentum = 0.045% / min
    // Velocity Coverage = 0.045 / 0.03 = 1.50x
    expect(result.requiredVelocity).toBeCloseTo(0.03, 3);
    expect(result.observedVelocity).toBe(0.045);
    expect(result.velocityCoverage).toBe(1.5);
  });

  it("enforces safety boundaries and clamps prices between 0.01 and 0.99", () => {
    const clampedResult = calculateScenario({
      symbol: "SOL-1H-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: -0.5, // invalid negative
      targetExitPrice: 1.5, // invalid > 1.0
    });

    expect(clampedResult.entryPrice).toBe(0.01);
    expect(clampedResult.targetExitPrice).toBe(0.99);
    expect(clampedResult.maxLossUsdc).toBe(100);
  });

  it("computes accurate Stop-Loss risk/reward ratios", () => {
    const result = calculateScenario({
      symbol: "BTC-15M-UP",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.75, // +$50 gain
      stopLossPrice: 0.40, // -$20 loss
    });

    expect(result.stopLossPnlUsdc).toBe(-20);
    expect(result.stopLossLossPercent).toBe(-20);
    expect(result.riskRewardRatio).toBe(2.5); // 50 / 20 = 2.5 R:R
  });

  it("handles penny contract asymmetry ($0.05 entry to $1.00 settlement)", () => {
    const result = calculateScenario({
      symbol: "BTC-5M-OUTLIER",
      outcome: "YES",
      investmentUsdc: 10,
      entryPrice: 0.05,
      targetExitPrice: 0.25,
    });

    expect(result.contractsCount).toBe(200); // 10 / 0.05 = 200 contracts
    expect(result.earlyExitPnlUsdc).toBe(40); // 200 * 0.25 - 10 = +$40 (+400%)
    expect(result.earlyExitRoiPercent).toBe(400);
    expect(result.settlementWinPnlUsdc).toBe(190); // 200 * $1.00 - 10 = +$190 (+1900%)
    expect(result.settlementWinRoiPercent).toBe(1900);
  });

  it("handles high conviction contract pricing ($0.90 entry)", () => {
    const result = calculateScenario({
      symbol: "BTC-15M-HIGH-CONVICTION",
      outcome: "YES",
      investmentUsdc: 90,
      entryPrice: 0.90,
      targetExitPrice: 0.95,
    });

    expect(result.contractsCount).toBe(100);
    expect(result.earlyExitPnlUsdc).toBe(5); // 100 * 0.95 - 90 = +$5
    expect(result.settlementWinPnlUsdc).toBe(10); // 100 * 1.00 - 90 = +$10
  });

  it("produces correct human-readable executive summary text", () => {
    const result = calculateScenario({
      symbol: "ETH-15M",
      outcome: "YES",
      investmentUsdc: 100,
      entryPrice: 0.50,
      targetExitPrice: 0.70,
    });

    expect(result.summaryText).toContain("Entering YES @ $0.50 with $100 yields +$40 (+40%)");
    expect(result.summaryText).toContain("Trajectory VC:");
  });
});
