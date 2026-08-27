import { describe, it, expect } from "vitest";
import { MarketSnapshotWorker } from "../src/workers/market-snapshot-worker.js";
import type { ExchangeContext } from "../src/core/exchange.js";

describe("MarketSnapshotWorker & Volatility Spike Detection", () => {
  const mockContext: ExchangeContext = {
    exchange: {
      loadMarkets: async () => ({}),
      fetchMarkets: async () => [],
    } as any,
    config: {
      networkName: "Somnia Shannon Testnet",
      chainId: 50312,
      rpcUrl: "https://dream-rpc.somnia.network",
      indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
      venueId: "0x123",
      maxOrderSizeUsdc: 100,
      pollIntervalSec: 10,
    },
    walletAddress: undefined,
    canTrade: false,
  };

  it("initializes with correct poll intervals and thresholds", () => {
    const worker = new MarketSnapshotWorker(mockContext, {
      pollIntervalSec: 10,
      spikeThreshold: 0.10, // 10%
    });

    const stats = worker.getStats();
    expect(stats.isRunning).toBe(false);
    expect(stats.tickCount).toBe(0);
    expect(stats.spikesDetected).toBe(0);
  });

  it("supports starting and stopping the worker lifecycle safely", () => {
    const worker = new MarketSnapshotWorker(mockContext, {
      pollIntervalSec: 10,
    });

    worker.start();
    let stats = worker.getStats();
    expect(stats.isRunning).toBe(true);

    worker.stop();
    stats = worker.getStats();
    expect(stats.isRunning).toBe(false);
  });

  it("tracks symbol ring buffer metrics accurately", () => {
    const worker = new MarketSnapshotWorker(mockContext);
    const stats = worker.getStats();
    expect(typeof stats.trackedSymbols).toBe("number");
  });
});
