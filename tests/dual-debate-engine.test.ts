import { describe, it, expect } from "vitest";
import { generateDualDebate } from "../src/agents/strategies/dual-debate-engine.js";
import type { EventContractMarket } from "../src/core/market-watcher.js";

describe("Dual AI Agent Arena & RAG News Grounding", () => {
  const mockMarket: EventContractMarket = {
    id: "btc-15m-mock",
    symbol: "BTC-15M-100K",
    poolAddress: "0x1234567890123456789012345678901234567890",
    underlyingAsset: "BTC",
    interval: "15m",
    strikePrice: 100500,
    currentProbability: 0.65,
    midPrice: 0.65,
    isTrading: true,
    outcomes: ["YES", "NO"],
  };

  it("generates balanced dual perspective (Alpha Bull and Macro Bear)", async () => {
    const debate = await generateDualDebate({
      market: mockMarket,
      spikeMagnitude: 0.12,
    });

    expect(debate).toBeDefined();
    expect(debate.symbol).toBe("BTC-15M-100K");
    expect(debate.asset).toBe("BTC");
    expect(debate.bullCase.agentName).toBe("Alpha Bull AI");
    expect(debate.bearCase.agentName).toBe("Macro Bear AI");

    // Bull case checks
    expect(debate.bullCase.confidence).toBeGreaterThan(0);
    expect(debate.bullCase.confidence).toBeLessThanOrEqual(1.0);
    expect(debate.bullCase.keyArguments.length).toBeGreaterThan(0);
    expect(debate.bullCase.catalysts.length).toBeGreaterThan(0);

    // Bear case checks
    expect(debate.bearCase.confidence).toBeGreaterThan(0);
    expect(debate.bearCase.confidence).toBeLessThanOrEqual(1.0);
    expect(debate.bearCase.keyArguments.length).toBeGreaterThan(0);
    expect(debate.bearCase.riskFactors.length).toBeGreaterThan(0);
  });

  it("attaches verified RAG news sources with valid URLs", async () => {
    const debate = await generateDualDebate({
      market: mockMarket,
    });

    expect(debate.sources).toBeDefined();
    expect(debate.sources.length).toBeGreaterThan(0);
    debate.sources.forEach((source) => {
      expect(source.title).toBeTruthy();
      expect(source.url).toMatch(/^https?:\/\//);
      expect(source.source).toBeTruthy();
    });
  });

  it("adjusts Bull and Bear confidence dynamically based on mid-market odds", async () => {
    const highProbMarket: EventContractMarket = {
      ...mockMarket,
      midPrice: 0.85,
    };
    const lowProbMarket: EventContractMarket = {
      ...mockMarket,
      midPrice: 0.20,
    };

    const highDebate = await generateDualDebate({ market: highProbMarket });
    const lowDebate = await generateDualDebate({ market: lowProbMarket });

    // Bull should have higher target and confidence on high midPrice
    expect(highDebate.bullCase.confidence).toBeGreaterThan(lowDebate.bullCase.confidence);
    // Bear should have higher confidence on low midPrice
    expect(lowDebate.bearCase.confidence).toBeGreaterThan(highDebate.bearCase.confidence);
  });

  it("handles altcoin asset prediction contracts (ETH, SOL, SOMI)", async () => {
    const solMarket: EventContractMarket = {
      ...mockMarket,
      symbol: "SOL-1H-200",
      underlyingAsset: "SOL",
      interval: "1h",
      midPrice: 0.50,
    };

    const debate = await generateDualDebate({ market: solMarket });
    expect(debate.asset).toBe("SOL");
    expect(debate.bullCase.headline).toContain("SOL");
    expect(debate.bearCase.headline).toContain("SOL");
  });

  it("reports the active engine mode (live_llm or heuristic_rag)", async () => {
    const debate = await generateDualDebate({ market: mockMarket });
    expect(["live_llm", "heuristic_rag"]).toContain(debate.engineUsed);
  });
});
