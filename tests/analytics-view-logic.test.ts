import { describe, it, expect } from "vitest";
import { calculateBlackScholesBinaryFairValue } from "../src/core/quantitative-pricing.js";

describe("AnalyticsView Logic Verification & Regression Tests", () => {
  // ─── 1. Black-Scholes Call Pricing & Theoretical Edge Invariants ───────────
  describe("1. Black-Scholes Call Pricing & Theoretical Edge", () => {
    it("prices YES contract as a Call even when market probability is under 50%", () => {
      // Scenario: Spot is slightly below strike (e.g. BTC spot $77,000, strike $77,500)
      // Market implies 40% probability for YES ($0.40)
      const spotPrice = 77000;
      const strikePrice = 77500;
      const countdownSec = 600;
      const prob = 40.0; // < 50%
      const marketPrice = prob / 100; // 0.40

      const quantResult = calculateBlackScholesBinaryFairValue({
        currentSpot: spotPrice,
        strikePrice,
        timeRemainingSeconds: Math.max(30, countdownSec),
        asset: "BTC",
        isCall: true, // Fixed: Always Call for YES
        marketPrice,
      });

      // Fair probability of YES should be less than 50% because spot < strike
      expect(quantResult.fairProbabilityPercent).toBeLessThan(50);
      expect(quantResult.fairProbabilityPercent).toBeGreaterThan(0);

      // Edge should be (fairProbability - marketPrice) * 10000
      // Because fairProb (~0.2%) < marketPrice (40%), edge is NEGATIVE (-3979 bps).
      // Under the old bug (isCall = isUp = false), fairProb was 99.8% producing a fake positive edge of +5979 bps!
      const expectedEdgeBps = Math.round((quantResult.fairProbability - marketPrice) * 10000);
      expect(quantResult.edgeBps).toBe(expectedEdgeBps);
      expect(quantResult.edgeBps).toBeLessThan(0); // Correctly recognizes YES is overpriced
    });

    it("prices YES contract consistently when market probability is above 50%", () => {
      const spotPrice = 78000;
      const strikePrice = 77500;
      const countdownSec = 600;
      const prob = 65.0; // >= 50%
      const marketPrice = prob / 100; // 0.65

      const quantResult = calculateBlackScholesBinaryFairValue({
        currentSpot: spotPrice,
        strikePrice,
        timeRemainingSeconds: Math.max(30, countdownSec),
        asset: "BTC",
        isCall: true,
        marketPrice,
      });

      // Spot is above strike, so Call fair prob should be > 50%
      expect(quantResult.fairProbabilityPercent).toBeGreaterThan(50);
      expect(quantResult.edgeBps).toBe(Math.round((quantResult.fairProbability - marketPrice) * 10000));
    });
  });

  // ─── 2. Velocity Coverage (VC) Physical Invariants ─────────────────────────
  describe("2. Velocity Coverage (VC) & In-The-Money (ITM) Mechanics", () => {
    it("recognizes ITM state (spot >= strike) with sufficient pace (VC >= 1.0)", () => {
      const spotPrice = 78000;
      const strikePrice = 77500;
      const remainingMinutes = 5;
      const dailyChange = 1.8;

      const isAboveSpot = spotPrice >= strikePrice;
      const distDollar = Math.abs(strikePrice - spotPrice);
      const distPercent = (distDollar / Math.max(1, spotPrice)) * 100;
      const reqVelocityPerMin = isAboveSpot ? 0 : (distPercent / remainingMinutes);
      const dailyAbsChange = Math.abs(dailyChange);
      const observedVelocityPerMin = Math.max(0.015, (dailyAbsChange / 1440) * 18);
      const velocityCoverage = isAboveSpot
        ? Number(Math.max(1.5, 1 + distPercent).toFixed(2))
        : Number((observedVelocityPerMin / Math.max(0.001, reqVelocityPerMin)).toFixed(2));
      const isVcSufficient = velocityCoverage >= 1.0;

      expect(isAboveSpot).toBe(true);
      expect(reqVelocityPerMin).toBe(0);
      expect(velocityCoverage).toBeGreaterThanOrEqual(1.5);
      expect(isVcSufficient).toBe(true);
    });

    it("correctly flags lagging pace when OTM with a huge distance and low time", () => {
      const spotPrice = 70000;
      const strikePrice = 77500; // $7,500 gap (10.7%)
      const remainingMinutes = 1; // only 1 minute left
      const dailyChange = 1.0;

      const isAboveSpot = spotPrice >= strikePrice;
      const distDollar = Math.abs(strikePrice - spotPrice);
      const distPercent = (distDollar / Math.max(1, spotPrice)) * 100;
      const reqVelocityPerMin = isAboveSpot ? 0 : (distPercent / remainingMinutes);
      const dailyAbsChange = Math.abs(dailyChange);
      const observedVelocityPerMin = Math.max(0.015, (dailyAbsChange / 1440) * 18);
      const velocityCoverage = isAboveSpot
        ? Number(Math.max(1.5, 1 + distPercent).toFixed(2))
        : Number((observedVelocityPerMin / Math.max(0.001, reqVelocityPerMin)).toFixed(2));
      const isVcSufficient = velocityCoverage >= 1.0;

      expect(isAboveSpot).toBe(false);
      expect(reqVelocityPerMin).toBeGreaterThan(5); // needs > 5%/min
      expect(velocityCoverage).toBeLessThan(0.1); // practically impossible
      expect(isVcSufficient).toBe(false);
    });
  });

  // ─── 3. Fallback Strike Price Logic ────────────────────────────────────────
  describe("3. Fallback Strike Price & Visual Slider Alignment", () => {
    it("sets strike below spot when prob >= 50% so that isAbove is true", () => {
      const spotPrice = 77590;
      const prob = 58.0;
      const isUp = prob >= 50;

      const mult = isUp ? 0.996 : 1.004;
      const strikePrice = Number((spotPrice * mult).toFixed(spotPrice > 10 ? 1 : 4));

      expect(strikePrice).toBeLessThan(spotPrice);
      const isAbove = spotPrice >= strikePrice;
      expect(isAbove).toBe(true);

      const deltaPct = ((spotPrice - strikePrice) / strikePrice) * 100;
      expect(deltaPct).toBeGreaterThan(0);

      // Slider position should be to the right of center (> 50%)
      const sliderPos = Math.min(95, Math.max(5, 50 + deltaPct * 120));
      expect(sliderPos).toBeGreaterThan(50);
    });

    it("sets strike above spot when prob < 50% so that isAbove is false", () => {
      const spotPrice = 77590;
      const prob = 42.0;
      const isUp = prob >= 50;

      const mult = isUp ? 0.996 : 1.004;
      const strikePrice = Number((spotPrice * mult).toFixed(spotPrice > 10 ? 1 : 4));

      expect(strikePrice).toBeGreaterThan(spotPrice);
      const isAbove = spotPrice >= strikePrice;
      expect(isAbove).toBe(false);

      const deltaPct = ((spotPrice - strikePrice) / strikePrice) * 100;
      expect(deltaPct).toBeLessThan(0);

      // Slider position should be to the left of center (< 50%)
      const sliderPos = Math.min(95, Math.max(5, 50 + deltaPct * 120));
      expect(sliderPos).toBeLessThan(50);
    });
  });

  // ─── 4. Orderbook Asks Sorting ─────────────────────────────────────────────
  describe("4. CLOB Orderbook Asks Sorting", () => {
    it("sorts asks descending so the lowest ask (best ask) is adjacent to mid equilibrium", () => {
      // API returns asks in ascending order: [bestAsk, bestAsk+0.01, ...]
      const apiAsks: [number, number][] = [
        [0.51, 100],
        [0.52, 200],
        [0.53, 300],
        [0.54, 400],
        [0.55, 500],
      ];

      const displayAsks = [...apiAsks].sort((a, b) => b[0] - a[0]);

      // First item (top row) should be highest ask
      expect(displayAsks[0][0]).toBe(0.55);
      // Last item (bottom row, adjacent to mid price) should be bestAsk
      expect(displayAsks[displayAsks.length - 1][0]).toBe(0.51);
    });
  });

  // ─── 5. Mid Equilibrium Price & Prob Sync ─────────────────────────────────
  describe("5. Mid Equilibrium Price & Prob Sync", () => {
    it("synchronizes displayed mid price with prob source", () => {
      const orderbook = { midPrice: 0.545 };
      const activeMarket = { midPrice: 0.500 };
      const prob = Number((orderbook.midPrice * 100).toFixed(1)); // 54.5%

      const displayedMid = ((orderbook?.midPrice ?? activeMarket?.midPrice ?? (prob / 100)) || 0.50).toFixed(3);
      expect(displayedMid).toBe("0.545");
      expect(prob).toBe(54.5);
      // Ensure the displayed dollar price matches the implied probability: 0.545 * 100 = 54.5%
      expect(Number(displayedMid) * 100).toBeCloseTo(prob, 1);
    });

    it("falls back gracefully when orderbook midPrice is null or undefined", () => {
      const orderbook = null;
      const activeMarket = { midPrice: 0.520 };
      const prob = 52.0;

      const displayedMid = (((orderbook as any)?.midPrice ?? activeMarket?.midPrice ?? (prob / 100)) || 0.50).toFixed(3);
      expect(displayedMid).toBe("0.520");
    });
  });

  // ─── 6. Invalidation Price Decimal Precision ──────────────────────────────
  describe("6. Invalidation Price Precision", () => {
    it("preserves 2 decimal places for high-value and mid-value assets (BTC, ETH, SOL)", () => {
      const btcSpot = 77590.25;
      const ethSpot = 2420.75;
      const solSpot = 145.60;

      const btcInvalidation = Number((btcSpot * 0.994).toFixed(btcSpot > 10 ? 2 : 4));
      const ethInvalidation = Number((ethSpot * 0.994).toFixed(ethSpot > 10 ? 2 : 4));
      const solInvalidation = Number((solSpot * 0.994).toFixed(solSpot > 10 ? 2 : 4));

      expect(btcInvalidation.toFixed(2)).toBe("77124.71");
      expect(ethInvalidation.toFixed(2)).toBe("2406.23");
      expect(solInvalidation.toFixed(2)).toBe("144.73");
    });

    it("preserves 4 decimal places for low-value assets (SOMI)", () => {
      const somiSpot = 0.7425;
      const somiInvalidation = Number((somiSpot * 0.994).toFixed(somiSpot > 10 ? 2 : 4));

      expect(somiInvalidation.toFixed(4)).toBe("0.7380");
    });
  });

  // ─── 7. Extreme Boundary & Numerical Guardrail Tests ───────────────────────
  describe("7. Extreme Boundary & Numerical Guardrails", () => {
    it("handles countdownSec <= 0 safely without NaN or Division by Zero", () => {
      const spotPrice = 77000;
      const strikePrice = 77500;
      const countdownSec = 0; // Expiration boundary
      const remainingMinutes = Math.max(0.5, Number((countdownSec / 60).toFixed(2))); // 0.5 min floor

      expect(remainingMinutes).toBe(0.5);

      const isAboveSpot = spotPrice >= strikePrice;
      const distDollar = Math.abs(strikePrice - spotPrice);
      const distPercent = (distDollar / Math.max(1, spotPrice)) * 100;
      const reqVelocityPerMin = isAboveSpot ? 0 : (distPercent / remainingMinutes);

      expect(Number.isFinite(reqVelocityPerMin)).toBe(true);

      const quantResult = calculateBlackScholesBinaryFairValue({
        currentSpot: spotPrice,
        strikePrice,
        timeRemainingSeconds: Math.max(30, countdownSec), // 30s floor
        asset: "BTC",
        isCall: true,
        marketPrice: 0.50,
      });

      expect(Number.isFinite(quantResult.fairProbabilityPercent)).toBe(true);
      expect(Number.isFinite(quantResult.edgeBps!)).toBe(true);
    });

    it("handles extreme orderbook skew safely", () => {
      const emptyBids: [number, number][] = [];
      const emptyAsks: [number, number][] = [];
      const totalBidVol = emptyBids.reduce((sum, [, s]) => sum + s, 0);
      const totalAskVol = emptyAsks.reduce((sum, [, s]) => sum + s, 0);
      const totalDepth = totalBidVol + totalAskVol;
      const imbalanceRatio = totalDepth > 0 ? (totalBidVol - totalAskVol) / totalDepth : 0;

      expect(imbalanceRatio).toBe(0);
      expect(Number.isFinite(imbalanceRatio)).toBe(true);
    });
  });
});
