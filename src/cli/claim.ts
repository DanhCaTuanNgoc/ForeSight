import chalk from "chalk";
import { createExchangeContext, shutdownExchange } from "../core/exchange.js";
import { SettlementSweeper } from "../core/settlement-sweeper.js";

async function main() {
  console.log(chalk.bold.cyan("\n--- Sweeping Settled Event Contracts ---"));

  const ctx = await createExchangeContext({ requireSigner: true });
  const sweeper = new SettlementSweeper(ctx);

  console.log(chalk.white(`Connected wallet:`), chalk.green(ctx.walletAddress));
  console.log(chalk.white(`Scanning up to ${ctx.config.claimScanDepth} recently settled markets...`));

  const results = await sweeper.sweepSettledMarkets();

  if (results.length === 0) {
    console.log(chalk.yellow(`No claimable settled positions found or all claimed.`));
  } else {
    for (const res of results) {
      if (res.claimed) {
        console.log(chalk.green(`✔ Claimed payout for ${res.symbol} (TX: ${res.txHash || "Success"})`));
      } else {
        console.log(chalk.red(`✖ Failed to claim ${res.symbol}: ${res.error}`));
      }
    }
  }

  console.log("\n");
  await shutdownExchange(ctx);
}

main().catch((err) => {
  console.error(chalk.red(`\nError: ${err.message || err}\n`));
  process.exit(1);
});
