import { BaseAgent } from "../base-agent.js";
import type { AgentStrategy, TradingSignal } from "../types.js";
import type { EventContractMarket } from "../../core/market-watcher.js";
import { createExchangeContext } from "../../core/exchange.js";

/**
 * Starter Strategy: A lightweight example strategy that inspects the orderbook
 * and enters positions when spread is wide or probability skews.
 */
export class StarterStrategy implements AgentStrategy {
  name = "StarterBot";
  description = "Basic rule-based event contract trader";

  async evaluate(market: EventContractMarket): Promise<TradingSignal | null> {
    if (!market.bestBid || !market.bestAsk) {
      return null;
    }

    const mid = market.midPrice ?? (market.bestBid + market.bestAsk) / 2;

    // Simple rule: If UP price is heavily discounted (< 0.40), signal UP with moderate size
    if (mid < 0.40) {
      return {
        symbol: market.symbol,
        direction: "UP",
        confidence: 0.70,
        targetPrice: market.bestAsk,
        recommendedSize: 5,
        rationale: `Implied UP probability (${mid.toFixed(2)}) appears undervalued.`,
        timestamp: Date.now(),
      };
    }

    // If UP price is high (> 0.60), implied DOWN probability is undervalued (< 0.40)
    if (mid > 0.60) {
      return {
        symbol: market.symbol,
        direction: "DOWN",
        confidence: 0.70,
        targetPrice: market.bestAsk,
        recommendedSize: 5,
        rationale: `Implied DOWN probability (${(1 - mid).toFixed(2)}) appears undervalued.`,
        timestamp: Date.now(),
      };
    }

    return null;
  }
}

export class StarterBotAgent extends BaseAgent {
  private _strategy = new StarterStrategy();
  get strategy(): AgentStrategy {
    return this._strategy;
  }
}

// Runnable entrypoint if executed directly
if (process.argv[1]?.endsWith("starter-bot.ts") || process.argv[1]?.endsWith("starter-bot.js")) {
  (async () => {
    const ctx = await createExchangeContext();
    const bot = new StarterBotAgent(ctx, ctx.config.pollIntervalMs);
    await bot.start();
  })().catch(console.error);
}
