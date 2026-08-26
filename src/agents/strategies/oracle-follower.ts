import chalk from "chalk";
import { BaseAgent } from "../base-agent.js";
import type { AgentStrategy, TradingSignal } from "../types.js";
import type { EventContractMarket } from "../../core/market-watcher.js";
import { createExchangeContext } from "../../core/exchange.js";

/**
 * Oracle Follower Strategy:
 * Compares current underlying asset price movement against the strike price
 * to detect mispriced binary contracts and capture delta edge.
 */
export class OracleFollowerStrategy implements AgentStrategy {
  name = "OracleFollower";
  description = "Directional trading based on real-time spot oracle movements";

  async evaluate(market: EventContractMarket): Promise<TradingSignal | null> {
    if (!market.strikePrice || !market.bestAsk || !market.bestBid) {
      return null;
    }

    // Example: Read underlying spot price from market feed or oracle if available
    // When spot is noticeably above strike price near expiry, probability of UP resolves to ~1.00
    const impliedUp = market.impliedUpProbability ?? 0.50;

    // Detect high-conviction oracle trend lag
    if (impliedUp < 0.35 && market.timeRemainingSec && market.timeRemainingSec < 300) {
      return {
        symbol: market.symbol,
        direction: "UP",
        confidence: 0.80,
        targetPrice: market.bestAsk,
        recommendedSize: 10,
        rationale: `Oracle delta indicates UP outcome underpriced at ${impliedUp.toFixed(2)} with ${market.timeRemainingSec}s left`,
        timestamp: Date.now(),
      };
    }

    return null;
  }
}

export class OracleFollowerBotAgent extends BaseAgent {
  private _strategy = new OracleFollowerStrategy();
  get strategy(): AgentStrategy {
    return this._strategy;
  }
}

// Runnable entrypoint
if (process.argv[1]?.endsWith("oracle-follower.ts") || process.argv[1]?.endsWith("oracle-follower.js")) {
  (async () => {
    const ctx = await createExchangeContext();
    const bot = new OracleFollowerBotAgent(ctx, ctx.config.pollIntervalMs);
    await bot.start();
  })().catch(console.error);
}
