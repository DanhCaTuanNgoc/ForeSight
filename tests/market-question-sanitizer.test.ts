import { describe, it, expect } from "vitest";
import { sanitizeMarketQuestion } from "../src/core/market-watcher.js";

describe("DreamDEX Raw Market Question Sanitization", () => {
  it("cleans raw pricefeed test text with unix timestamp into professional trader question", () => {
    const raw = "Pricefeed test: will ETH/USDC's price be at or above 2505.80 at unix time 1789133520?";
    const result = sanitizeMarketQuestion(raw, "ETH", 2505.80);
    expect(result).toBe("Will ETH/USDC settle at or above $2,505.80 at expiry?");
  });

  it("cleans BTC pricefeed test strings with high dollar numbers", () => {
    const raw = "Pricefeed test: will BTC/USDC's price be at or above 78945.50 at unix time 1789133400?";
    const result = sanitizeMarketQuestion(raw, "BTC", 78945.50);
    expect(result).toBe("Will BTC/USDC settle at or above $78,945.50 at expiry?");
  });

  it("handles missing question by generating structured strike question", () => {
    const result = sanitizeMarketQuestion(undefined, "SOL", 145.20);
    expect(result).toBe("Will SOL settle at or above $145.20 at expiry?");
  });

  it("preserves already clean professional questions without corrupting them", () => {
    const clean = "Will ETH settle at or above $2,500.00 at expiry?";
    const result = sanitizeMarketQuestion(clean, "ETH", 2500);
    expect(result).toBe("Will ETH settle at or above $2,500.00 at expiry?");
  });
});
