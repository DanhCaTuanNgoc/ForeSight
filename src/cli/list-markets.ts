import chalk from "chalk";
import { createExchangeContext, shutdownExchange } from "../core/exchange.js";
import { MarketWatcher } from "../core/market-watcher.js";

async function main() {
  console.log(chalk.bold.cyan("\n--- Scanning Somnia DreamDEX Event Contracts ---"));
  
  const ctx = await createExchangeContext();
  const watcher = new MarketWatcher(ctx);

  const markets = await watcher.getActiveEventContracts();

  if (markets.length === 0) {
    console.log(chalk.yellow("No event contracts found for venue:"), ctx.config.venueId);
    await shutdownExchange(ctx);
    process.exit(0);
  }

  console.log(chalk.bold.white(`\nFound ${markets.length} Event Contracts:\n`));

  console.log(
    chalk.bold(
      "Symbol".padEnd(28) +
      "Asset".padEnd(8) +
      "Cadence".padEnd(10) +
      "Status".padEnd(14) +
      "Expires In".padEnd(14) +
      "Outcomes".padEnd(14)
    )
  );
  console.log("-".repeat(88));

  for (const m of markets.slice(0, 30)) {
    const statusText = m.isTradable ? chalk.green("TRADING") : chalk.gray(String(m.status));
    const expiryText = m.timeRemainingSec ? `${m.timeRemainingSec}s` : "N/A";
    const asset = m.underlyingAsset || "-";
    const cadence = m.interval || "-";
    const outcomes = m.outcomes.join("/");

    console.log(
      chalk.cyan(m.symbol.padEnd(28)) +
      chalk.white(asset.padEnd(8)) +
      chalk.white(cadence.padEnd(10)) +
      statusText.padEnd(23) +
      chalk.white(expiryText.padEnd(14)) +
      chalk.yellow(outcomes.padEnd(14))
    );
  }

  if (markets.length > 30) {
    console.log(chalk.dim(`\n... and ${markets.length - 30} more markets.`));
  }

  console.log("\n");
  await shutdownExchange(ctx);
  process.exit(0);
}

main().catch(console.error);
