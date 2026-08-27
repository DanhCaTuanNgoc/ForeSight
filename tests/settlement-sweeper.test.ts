import { describe, it, expect } from "vitest";
import { SettlementSweeper } from "../src/core/settlement-sweeper.js";
import type { ExchangeContext } from "../src/core/exchange.js";

describe("SettlementSweeper & Batch Claim Automation", () => {
  it("returns empty array safely when trading is disabled", async () => {
    const readOnlyContext: ExchangeContext = {
      exchange: {} as any,
      config: {
        networkName: "Somnia Shannon Testnet",
        chainId: 50312,
        rpcUrl: "https://dream-rpc.somnia.network",
        indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
        venueId: "0x123",
        maxOrderSizeUsdc: 100,
        pollIntervalSec: 10,
        autoClaimIntervalMs: 60000,
        claimScanDepth: 20,
      } as any,
      walletAddress: undefined,
      canTrade: false,
    };

    const sweeper = new SettlementSweeper(readOnlyContext);
    const claims = await sweeper.sweepSettledMarkets();

    expect(claims).toEqual([]);
    const maybeClaims = await sweeper.maybeClaim();
    expect(maybeClaims).toEqual([]);
  });

  it("identifies settled markets and extracts claimable tokens", async () => {
    const mockExchange = {
      fetchMarkets: async () => [
        {
          id: "m1",
          symbol: "BTC-15M-SETTLED",
          type: "binary",
          info: { status: 3, settled: true },
        },
        {
          id: "m2",
          symbol: "ETH-15M-TRADING",
          type: "binary",
          info: { status: 1, settled: false },
        },
      ],
      fetchBalance: async () => ({
        "BTC-15M-SETTLED#YES": { total: 50 },
        "ETH-15M-TRADING#YES": { total: 100 },
      }),
      redeem: async (symbol: string, amount: number) => ({
        hash: "0xabcdef1234567890abcdef1234567890",
      }),
    };

    const activeContext: ExchangeContext = {
      exchange: mockExchange as any,
      config: {
        networkName: "Somnia Shannon Testnet",
        chainId: 50312,
        rpcUrl: "https://dream-rpc.somnia.network",
        indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
        venueId: "0x123",
        maxOrderSizeUsdc: 100,
        pollIntervalSec: 10,
        autoClaimIntervalMs: 60000,
        claimScanDepth: 20,
      } as any,
      walletAddress: "0x1111111111111111111111111111111111111111",
      canTrade: true,
    };

    const sweeper = new SettlementSweeper(activeContext);
    const results = await sweeper.sweepSettledMarkets();

    expect(results.length).toBe(1);
    expect(results[0].symbol).toBe("BTC-15M-SETTLED");
    expect(results[0].claimed).toBe(true);
    expect(results[0].txHash).toBe("0xabcdef1234567890abcdef1234567890");
  });

  it("handles zero balance gracefully when user has no winning outcome shares", async () => {
    const mockExchange = {
      fetchMarkets: async () => [
        {
          id: "m1",
          symbol: "SOL-15M-SETTLED",
          type: "binary",
          info: { status: 3, settled: true },
        },
      ],
      fetchBalance: async () => ({
        "SOL-15M-SETTLED#YES": { total: 0 },
        "SOL-15M-SETTLED#NO": { total: 0 },
      }),
      redeem: async () => ({ hash: "0x123" }),
    };

    const activeContext: ExchangeContext = {
      exchange: mockExchange as any,
      config: {
        networkName: "Somnia Shannon Testnet",
        chainId: 50312,
        rpcUrl: "https://dream-rpc.somnia.network",
        indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
        venueId: "0x123",
        maxOrderSizeUsdc: 100,
        pollIntervalSec: 10,
        autoClaimIntervalMs: 60000,
        claimScanDepth: 20,
      } as any,
      walletAddress: "0x1111111111111111111111111111111111111111",
      canTrade: true,
    };

    const sweeper = new SettlementSweeper(activeContext);
    const results = await sweeper.sweepSettledMarkets();

    expect(results.length).toBe(0); // No non-zero positions to claim
  });

  it("catches and reports on-chain revert errors during batch redemption", async () => {
    const mockExchange = {
      fetchMarkets: async () => [
        {
          id: "m1",
          symbol: "BTC-15M-FAILED-REDEEM",
          type: "binary",
          info: { status: 3, settled: true },
        },
      ],
      fetchBalance: async () => ({
        "BTC-15M-FAILED-REDEEM#YES": { total: 25 },
      }),
      redeem: async () => {
        throw new Error("Execution reverted: PoolNotReadyForSettlement");
      },
    };

    const activeContext: ExchangeContext = {
      exchange: mockExchange as any,
      config: {
        networkName: "Somnia Shannon Testnet",
        chainId: 50312,
        rpcUrl: "https://dream-rpc.somnia.network",
        indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
        venueId: "0x123",
        maxOrderSizeUsdc: 100,
        pollIntervalSec: 10,
        autoClaimIntervalMs: 60000,
        claimScanDepth: 20,
      } as any,
      walletAddress: "0x1111111111111111111111111111111111111111",
      canTrade: true,
    };

    const sweeper = new SettlementSweeper(activeContext);
    const results = await sweeper.sweepSettledMarkets();

    expect(results.length).toBe(1);
    expect(results[0].claimed).toBe(false);
    expect(results[0].error).toContain("PoolNotReadyForSettlement");
  });
});
