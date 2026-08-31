/**
 * ForeSight Quantitative Financial Pricing & Model Edge Engine
 * 
 * Implements:
 * 1. High-precision Abramowitz & Stegun (Formula 7.1.26) Rational Chebyshev Normal CDF Φ(z)
 *    Maximum absolute error: |ε| < 1.5e-7
 * 2. Closed-form Black-Scholes Binary Option Pricing Φ(d₂)
 * 3. Anti-Pin-Risk Short-Horizon Diffusion Regularization
 * 4. Theoretical Model Edge in Basis Points (bps) vs Implied Orderbook Odds
 * 5. Kelly Criterion Optimal Sizing Recommendation
 */

// Asset-specific annualized baseline volatility priors
export const BASELINE_VOLATILITIES: Record<string, number> = {
  BTC: 0.52,
  ETH: 0.62,
  SOL: 0.78,
  SOMI: 0.85,
  DEFAULT: 0.60,
};

// Seconds per non-leap trading year
export const SECONDS_PER_YEAR = 31_557_600;

// Anti-Pin-Risk floor in seconds (prevents division by zero and cliff flips as T -> 0)
export const PIN_RISK_FLOOR_SECONDS = 45;

/**
 * High-precision Abramowitz & Stegun (7.1.26) approximation of Error Function erf(x)
 * Absolute error < 1.5e-7 across entire real line (-∞, +∞)
 */
export function erf(x: number): number {
  if (isNaN(x) || x === 0) return 0;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1.0 / (1.0 + p * absX);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const result = 1.0 - poly * Math.exp(-absX * absX);

  return sign * Math.min(1.0, Math.max(0.0, result));
}

/**
 * Standard Normal Cumulative Distribution Function Φ(z)
 * Maps standardized z-score to probability [0.0001, 0.9999]
 */
export function normalCdf(z: number): number {
  if (isNaN(z)) return 0.5;
  if (z === 0) return 0.5;
  if (z > 8.0) return 0.9999;
  if (z < -8.0) return 0.0001;

  const prob = 0.5 * (1.0 + erf(z / Math.SQRT2));
  return Math.min(0.9999, Math.max(0.0001, prob));
}

export interface BinaryOptionPricingInput {
  currentSpot: number;
  strikePrice: number;
  timeRemainingSeconds: number;
  asset?: string;
  customVol?: number;
  riskFreeRate?: number;
  isCall?: boolean;
  marketPrice?: number;
}

export interface BinaryOptionPricingResult {
  fairProbability: number;
  fairProbabilityPercent: number;
  zScore: number;
  sigmaAnnualized: number;
  tauYears: number;
  tauSecondsClamped: number;
  marketPrice?: number;
  edgeBps?: number;
  edgePercent?: number;
  isFavorable?: boolean;
  halfKellyFraction?: number;
  pricingModel: string;
}

/**
 * Calculates theoretical Black-Scholes fair probability Φ(d₂) for binary event contracts
 */
export function calculateBlackScholesBinaryFairValue(
  input: BinaryOptionPricingInput
): BinaryOptionPricingResult {
  const {
    currentSpot,
    strikePrice,
    timeRemainingSeconds,
    asset = "BTC",
    customVol,
    riskFreeRate = 0.0,
    isCall = true,
    marketPrice,
  } = input;

  const safeSpot = Math.max(0.0001, currentSpot);
  const safeStrike = Math.max(0.0001, strikePrice);

  const tauSecondsClamped = Math.max(PIN_RISK_FLOOR_SECONDS, timeRemainingSeconds);
  const tauYears = tauSecondsClamped / SECONDS_PER_YEAR;

  const assetKey = asset.toUpperCase();
  const sigma = customVol && customVol > 0 
    ? customVol 
    : (BASELINE_VOLATILITIES[assetKey] || BASELINE_VOLATILITIES.DEFAULT);

  const volSqrtTau = sigma * Math.sqrt(tauYears);
  const logMoneyness = Math.log(safeSpot / safeStrike);
  const drift = (riskFreeRate - 0.5 * sigma * sigma) * tauYears;
  const d2 = (logMoneyness + drift) / Math.max(1e-7, volSqrtTau);

  const rawCallProb = normalCdf(d2);
  const fairProbability = isCall ? rawCallProb : (1.0 - rawCallProb);
  const fairProbabilityPercent = Number((fairProbability * 100).toFixed(1));

  let edgeBps: number | undefined;
  let edgePercent: number | undefined;
  let isFavorable: boolean | undefined;
  let halfKellyFraction: number | undefined;

  if (marketPrice !== undefined && marketPrice > 0 && marketPrice < 1) {
    edgeBps = Math.round((fairProbability - marketPrice) * 10_000);
    edgePercent = Number(((fairProbability - marketPrice) * 100).toFixed(1));
    isFavorable = edgeBps > 50;

    if (fairProbability > marketPrice && marketPrice < 0.99) {
      const fullKelly = (fairProbability - marketPrice) / (1.0 - marketPrice);
      halfKellyFraction = Number(Math.max(0.0, Math.min(0.25, fullKelly * 0.5)).toFixed(3));
    } else {
      halfKellyFraction = 0.0;
    }
  }

  return {
    fairProbability: Number(fairProbability.toFixed(4)),
    fairProbabilityPercent,
    zScore: Number(d2.toFixed(4)),
    sigmaAnnualized: sigma,
    tauYears: Number(tauYears.toFixed(6)),
    tauSecondsClamped,
    marketPrice,
    edgeBps,
    edgePercent,
    isFavorable,
    halfKellyFraction,
    pricingModel: "Black-Scholes Binary Φ(d₂) + Abramowitz-Stegun",
  };
}
