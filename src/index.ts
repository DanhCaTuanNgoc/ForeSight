/**
 * Somnia × DreamDEX Event Contracts Copilot & Bot Kit
 * Main Entry Point & Core Module Exports
 */

export * from "./config/constants.js";
export * from "./config/env.js";
export * from "./core/chain.js";
export * from "./core/exchange.js";
export * from "./core/market-watcher.js";
export * from "./core/order-engine.js";
export * from "./core/settlement-sweeper.js";
export * from "./agents/types.js";
export * from "./agents/base-agent.js";
export * from "./agents/strategies/starter-bot.js";
export * from "./agents/strategies/market-maker.js";
export * from "./agents/strategies/oracle-follower.js";
export * from "./agents/strategies/ai-copilot.js";

import chalk from "chalk";
import { createExchangeContext } from "./core/exchange.js";
import { AICopilotAgent } from "./agents/strategies/ai-copilot.js";

// Interactive run when executed via `npm start` or `npm run dev`
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  (async () => {
    console.log(chalk.bold.magenta("\n======================================================="));
    console.log(chalk.bold.magenta("  Somnia × DreamDEX Event Contracts Copilot Engine    "));
    console.log(chalk.bold.magenta("=======================================================\n"));

    const ctx = await createExchangeContext();
    console.log(chalk.cyan(`Network:`), ctx.config.networkName);
    console.log(chalk.cyan(`Venue:`), ctx.config.venueId);
    console.log(chalk.cyan(`Mode:`), ctx.canTrade ? chalk.green("LIVE TRADING") : chalk.yellow("READ-ONLY / SIMULATION"));

    const agent = new AICopilotAgent(ctx, ctx.config.pollIntervalMs);
    await agent.start();
  })().catch(console.error);
}
