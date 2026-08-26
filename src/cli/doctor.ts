import chalk from "chalk";
import { createExchangeContext, shutdownExchange } from "../core/exchange.js";
import { MarketWatcher } from "../core/market-watcher.js";

async function main() {
  console.log(chalk.bold.cyan("\n======================================================="));
  console.log(chalk.bold.cyan("  Somnia × DreamDEX Event Contracts Copilot Doctor  "));
  console.log(chalk.bold.cyan("=======================================================\n"));

  try {
    const ctx = await createExchangeContext();
    console.log(chalk.green(`✔ Network Config:`), ctx.config.networkName);
    console.log(chalk.green(`✔ Chain ID:`), ctx.config.chainId);
    console.log(chalk.green(`✔ RPC Endpoint:`), ctx.config.rpcUrl);
    console.log(chalk.green(`✔ Indexer Endpoint:`), ctx.config.indexerUrl);
    console.log(chalk.green(`✔ Venue ID:`), ctx.config.venueId);

    if (ctx.walletAddress) {
      console.log(chalk.green(`✔ Signer Loaded:`), ctx.walletAddress);

      // Fetch balances
      try {
        const balances = await ctx.exchange.fetchBalance();
        console.log(chalk.cyan(`\n--- Wallet Balances ---`));
        const keys = Object.keys(balances);
        if (keys.length === 0) {
          console.log(chalk.dim("No active token balances recorded."));
        } else {
          for (const k of keys) {
            console.log(chalk.white(`  ${k}:`), balances[k]?.free ?? 0);
          }
        }
      } catch (err: any) {
        console.log(chalk.yellow(`⚠ Could not query balance: ${err?.message || err}`));
      }
    } else {
      console.log(chalk.yellow(`⚠ No PRIVATE_KEY configured (Running in Read-Only / Doctor Mode)`));
    }

    console.log(chalk.cyan(`\n--- Loading Event Contracts ---`));
    const watcher = new MarketWatcher(ctx);
    const markets = await watcher.getActiveEventContracts();

    console.log(chalk.green(`✔ Discovered ${markets.length} total event contracts in venue.`));
    const tradable = markets.filter((m) => m.isTradable);
    console.log(chalk.green(`✔ ${tradable.length} contracts are currently open for trading (Status: Trading).`));

    if (tradable.length > 0) {
      const sample = tradable[0];
      console.log(chalk.cyan(`\nSample active market:`), chalk.bold.yellow(sample.symbol));
      console.log(chalk.white(`  Question:`), sample.question);
      console.log(chalk.white(`  Asset:`), sample.underlyingAsset);
      console.log(chalk.white(`  Cadence:`), sample.interval ?? "N/A");
      console.log(chalk.white(`  Status:`), sample.status);
      console.log(chalk.white(`  Time Remaining:`), sample.timeRemainingSec ? `${sample.timeRemainingSec}s` : "N/A");
      console.log(chalk.white(`  Outcomes:`), sample.outcomes.join(" / "));
    }

    console.log(chalk.bold.green(`\n✔ System health check passed successfully.\n`));
    await shutdownExchange(ctx);
    process.exit(0);
  } catch (err: any) {
    console.error(chalk.bold.red(`\n✖ Health check failed: ${err?.message || err}\n`));
    process.exit(1);
  }
}

main();
