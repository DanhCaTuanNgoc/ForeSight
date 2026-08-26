import type { SomniaMarkets } from "@somnia-chain/markets-sdk";
import type { ExchangeContext } from "./exchange.js";
import { MarketStatus } from "../config/constants.js";

export interface ClaimResult {
  marketId: string;
  symbol: string;
  claimed: boolean;
  txHash?: string;
  error?: string;
}

/**
 * SettlementSweeper automates claiming winnings from settled Event Contracts
 */
export class SettlementSweeper {
  private exchange: SomniaMarkets;
  private canTrade: boolean;
  private lastClaimTimestamp = 0;
  private claimIntervalMs: number;
  private scanDepth: number;

  constructor(context: ExchangeContext) {
    this.exchange = context.exchange;
    this.canTrade = context.canTrade;
    this.claimIntervalMs = context.config.autoClaimIntervalMs;
    this.scanDepth = context.config.claimScanDepth;
  }

  /**
   * Sweeps recently settled event contracts and redeems winning positions
   */
  async sweepSettledMarkets(maxMarkets?: number): Promise<ClaimResult[]> {
    if (!this.canTrade) {
      return [];
    }

    const results: ClaimResult[] = [];
    const limit = maxMarkets || this.scanDepth;

    try {
      const allMarkets = await this.exchange.fetchMarkets();
      const balances = await this.exchange.fetchBalance();

      const settled = allMarkets.filter((m) => {
        const info = m.info as any;
        return m.type === "binary" && (info?.status === MarketStatus.Settled || info?.status === 3 || info?.settled === true);
      }).slice(0, limit);

      for (const market of settled) {
        // Find if user holds outcome tokens for this market
        const outcomeSymbols = [
          `${market.symbol}#YES`,
          `${market.symbol}#NO`,
          `${market.symbol}#UP`,
          `${market.symbol}#DOWN`,
        ];

        let claimAmount = 0;
        for (const sym of outcomeSymbols) {
          const bal = balances[sym]?.total ?? 0;
          if (bal > 0) {
            claimAmount = bal;
            break;
          }
        }

        if (claimAmount > 0) {
          try {
            const tx = await this.exchange.redeem(market.symbol, claimAmount);
            results.push({
              marketId: market.id,
              symbol: market.symbol,
              claimed: true,
              txHash: (tx as any)?.hash,
            });
          } catch (err: any) {
            results.push({
              marketId: market.id,
              symbol: market.symbol,
              claimed: false,
              error: err?.message || String(err),
            });
          }
        }
      }
    } catch {
      // Ignore scan failure
    }

    this.lastClaimTimestamp = Date.now();
    return results;
  }

  /**
   * Periodically called inside an agent loop to sweep if interval elapsed
   */
  async maybeClaim(): Promise<ClaimResult[]> {
    if (!this.canTrade) return [];
    const now = Date.now();
    if (now - this.lastClaimTimestamp < this.claimIntervalMs) {
      return [];
    }
    return await this.sweepSettledMarkets();
  }
}
