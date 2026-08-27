import { describe, it, expect } from "vitest";
import { OrderEngine } from "../src/core/order-engine.js";
import type { ExchangeContext } from "../src/core/exchange.js";

describe("OrderEngine & Execution Safeguards", () => {
  const mockContext: ExchangeContext = {
    exchange: {
      market: (symbol: string) => (symbol === "BTC-15M" ? { id: "m-btc", symbol: "BTC-15M" } : null),
      createOrder: async (symbol: string, type: string, side: string, amount: number, price: number) => ({
        id: "ord-12345",
        filled: amount,
      }),
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
    canTrade: false, // Read-only mode
  };

  it("blocks order execution when trading is disabled / no private key", async () => {
    const engine = new OrderEngine(mockContext);

    const result = await engine.placeLimitOrder({
      symbol: "BTC-15M",
      side: "buy",
      price: 0.50,
      amount: 10,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Trading disabled");
  });

  it("rejects orders exceeding the MAX_ORDER_SIZE_USDC ceiling", async () => {
    const authorizedContext: ExchangeContext = {
      ...mockContext,
      canTrade: true,
      walletAddress: "0x9876543210987654321098765432109876543210",
    };

    const engine = new OrderEngine(authorizedContext);

    // 0.80 * 200 = 160 USDC > 100 USDC limit
    const result = await engine.placeLimitOrder({
      symbol: "BTC-15M",
      side: "buy",
      price: 0.80,
      amount: 200,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("exceeds MAX_ORDER_SIZE_USDC limit");
  });

  it("validates that market symbol exists before dispatching order", async () => {
    const authorizedContext: ExchangeContext = {
      ...mockContext,
      canTrade: true,
      walletAddress: "0x9876543210987654321098765432109876543210",
    };

    const engine = new OrderEngine(authorizedContext);

    const result = await engine.placeLimitOrder({
      symbol: "NON-EXISTENT-MARKET",
      side: "buy",
      price: 0.50,
      amount: 10,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Market not found");
  });

  it("executes valid limit order when parameters are compliant", async () => {
    const authorizedContext: ExchangeContext = {
      ...mockContext,
      canTrade: true,
      walletAddress: "0x9876543210987654321098765432109876543210",
    };

    const engine = new OrderEngine(authorizedContext);

    const result = await engine.placeLimitOrder({
      symbol: "BTC-15M",
      side: "buy",
      price: 0.50,
      amount: 50, // 25 USDC <= 100 USDC
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("ord-12345");
    expect(result.filledAmount).toBe(50);
  });

  it("blocks market orders when trading is disabled", async () => {
    const engine = new OrderEngine(mockContext);

    const result = await engine.placeMarketOrder("BTC-15M", "buy", 10);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Trading disabled");
  });
});
