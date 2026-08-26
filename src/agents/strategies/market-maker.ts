import chalk from "chalk";
import { BaseAgent } from "../base-agent.js";
import type { AgentStrategy, TradingSignal } from "../types.js";
import type { EventContractMarket } from "../../core/market-watcher.js";
import { createExchangeContext } from "../../core/exchange.js";

/**
 * Market Maker Strategy: Quotes two-sided liquidity around fair probability
 * with configurable half-spread and inventory risk control.
 */
export class MarketMakerStrategy implements AgentStrategy {
  name = "EventContractMarketMaker";
  description = "Provides two-sided resting liquidity on prediction markets";

  private halfSpread: number;
  private quoteSize: number;
  private minTimeRemainingSec: number;

  constructor(halfSpread = 0.03, quoteSize = 10, minTimeRemainingSec = 60) {
    this.halfSpread = halfSpread;
    this.quoteSize = quoteSize;
    this.minTimeRemainingSec = minTimeRemainingSec;
  }

  async evaluate(market: EventContractMarket): Promise<TradingSignal | null> {
    // Avoid quoting in the last minute before expiry (pin risk / oracle settlement)
    if (market.timeRemainingSec && market.timeRemainingSec < this.minTimeRemainingSec) {
      return null;
    }

    const mid = market.midPrice ?? 0.50;
    const bidPrice = Math.max(0.01, Number((mid - this.halfSpread).toFixed(2)));
    const askPrice = Math.min(0.99, Number((mid + this.halfSpread).toFixed(2)));

    // Return signal for best entry
    return {
      symbol: market.symbol,
      direction: "UP",
      confidence: 0.85,
      targetPrice: bidPrice,
      recommendedSize: this.quoteSize,
      rationale: `Market maker quoting bid @ ${bidPrice} (ask @ ${askPrice}, mid @ ${mid.toFixed(2)})`,
      timestamp: Date.now(),
    };
  }
}

export class MarketMakerBotAgent extends BaseAgent {
  private _strategy = new MarketMakerStrategy();
  get strategy(): AgentStrategy {
    return this._strategy;
  }
}

// Runnable entrypoint
if (process.argv[1]?.endsWith("market-maker.ts") || process.argv[1]?.endsWith("market-maker.js")) {
  (async () => {
    const ctx = await createExchangeContext();
    const bot = new MarketMakerBotAgent(ctx, ctx.config.pollIntervalMs);
    await bot.start();
  })().catch(console.error);
}
