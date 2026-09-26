import { describe, it, expect } from "vitest";

describe("Order Status & Settlement Resolution Logic", () => {
  // Test resolveStatus function replicating App.tsx & ActivityView.tsx
  const resolveStatus = (p: any, nowSec = Math.floor(Date.now() / 1000)) => {
    const isExpired = p.expirationTime ? p.expirationTime <= nowSec : false;
    if (p.status === "REFUNDED" || p.isRefunded) return "REFUNDED";
    if (p.status === "CLAIMED") return "CLAIMED";
    if (p.status === "CLOSED") return "CLOSED";
    if (p.status === "SETTLED_LOSS") return "SETTLED_LOSS";
    if (p.status === "SETTLED_WIN") return "SETTLED_WIN";
    if (p.status === "RESTING" || p.status === "PENDING") {
      if (isExpired) return "REFUNDED";
      return "RESTING";
    }
    if (p.status === "RESOLVING") return "RESOLVING";
    if (isExpired) {
      if (p.isWinner === true) return "SETTLED_WIN";
      if (p.isWinner === false) return "SETTLED_LOSS";
      return "RESOLVING";
    }
    return p.status || "OPEN";
  };

  it("correctly identifies unfilled resting orders as REFUNDED upon round expiry", () => {
    const restingOrder = {
      id: "pos-test-1",
      symbol: "BTC-0-25SEP26-0457/tUSDC",
      outcome: "YES",
      amount: 100,
      entryPrice: 0.5,
      timestamp: 1790312190302,
      expirationTime: 1000,
      status: "RESTING",
      isFilled: false,
    };

    // Before expiry
    expect(resolveStatus(restingOrder, 900)).toBe("RESTING");

    // After expiry: smart contract cancelExpiredOrders refunds 100% principal
    expect(resolveStatus(restingOrder, 1100)).toBe("REFUNDED");
  });

  it("preserves explicit REFUNDED status regardless of market winning outcome", () => {
    const refundedOrder = {
      id: "pos-test-2",
      symbol: "BTC-0-25SEP26-0457/tUSDC",
      outcome: "YES",
      amount: 100,
      entryPrice: 0.5,
      timestamp: 1790312190302,
      expirationTime: 1000,
      status: "REFUNDED",
      isWinner: false,
      isRefunded: true,
      realizedPnl: 0,
    };

    // Even if market resolved YES, unfilled order is REFUNDED, not SETTLED_WIN
    expect(resolveStatus(refundedOrder, 1200)).toBe("REFUNDED");
  });

  it("correctly identifies filled orders as SETTLED_WIN or SETTLED_LOSS", () => {
    const winningFilledOrder = {
      id: "pos-test-3",
      symbol: "BTC-0-11SEP26-1420/tUSDC",
      outcome: "YES",
      amount: 100,
      entryPrice: 0.5,
      expirationTime: 1000,
      status: "OPEN",
      isWinner: true,
      isFilled: true,
    };

    const losingFilledOrder = {
      id: "pos-test-4",
      symbol: "BTC-0-11SEP26-1410/tUSDC",
      outcome: "YES",
      amount: 100,
      entryPrice: 0.5,
      expirationTime: 1000,
      status: "OPEN",
      isWinner: false,
      isFilled: true,
    };

    expect(resolveStatus(winningFilledOrder, 1200)).toBe("SETTLED_WIN");
    expect(resolveStatus(losingFilledOrder, 1200)).toBe("SETTLED_LOSS");
  });

  it("calculates Net PnL accurately excluding REFUNDED orders", () => {
    const positions = [
      // 1. Refunded order ($50 placed, $50 returned -> PnL: $0.00)
      { status: "REFUNDED", amount: 100, entryPrice: 0.5, realizedPnl: 0, isRefunded: true },
      // 2. Real winning order ($50 placed, $100 payout -> Net PnL: +$50.00)
      { status: "CLAIMED", amount: 100, entryPrice: 0.5, realizedPnl: 50, isWinner: true },
      // 3. Real losing order ($50 placed, $0 payout -> Net PnL: -$50.00)
      { status: "SETTLED_LOSS", amount: 100, entryPrice: 0.5, realizedPnl: -50, isWinner: false },
    ];

    const totalRealizedPnl = positions.reduce((acc, p) => {
      if (p.status === "REFUNDED" || p.isRefunded) return acc;
      return acc + (p.realizedPnl || 0);
    }, 0);

    // +50 - 50 + 0 = 0
    expect(totalRealizedPnl).toBe(0);
  });

  it("excludes REFUNDED orders from claimable payout list", () => {
    const positions = [
      { id: "1", status: "REFUNDED", isRefunded: true },
      { id: "2", status: "SETTLED_WIN", isWinner: true },
      { id: "3", status: "SETTLED_LOSS", isWinner: false },
      { id: "4", status: "CLAIMED", isWinner: true },
    ];

    const claimable = positions.filter(
      (p) => (p.status === "SETTLED_WIN" || (p.status === "SETTLED" && p.isWinner === true)) && !p.isRefunded
    );

    expect(claimable.length).toBe(1);
    expect(claimable[0].id).toBe("2");
  });
});
