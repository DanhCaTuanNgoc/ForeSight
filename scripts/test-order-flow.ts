import chalk from "chalk";
import { createPublicClient, http } from "viem";
import { createExchangeContext, shutdownExchange } from "../src/core/exchange.js";
import { MarketWatcher } from "../src/core/market-watcher.js";
import { OrderEngine } from "../src/core/order-engine.js";
import { makeSomniaChain } from "../src/core/chain.js";

async function main() {
  console.log(chalk.bold.cyan("\n======================================================="));
  console.log(chalk.bold.cyan("  DreamDEX CLOB Live On-Chain Order Verification Test  "));
  console.log(chalk.bold.cyan("=======================================================\n"));

  const ctx = await createExchangeContext({ requireSigner: true });
  console.log(chalk.green(`✔ Connected to Network:`), ctx.config.networkName);
  console.log(chalk.green(`✔ Wallet Address:`), ctx.walletAddress);

  const chain = makeSomniaChain(ctx.config);
  const publicClient = createPublicClient({
    chain,
    transport: http(ctx.config.rpcUrl),
  });

  // 1. Check balances
  const balances = await ctx.exchange.fetchBalance();
  const usdcBal = balances["tUSDC"]?.free ?? 0;
  console.log(chalk.green(`✔ Free tUSDC Collateral:`), `${usdcBal} tUSDC`);

  if (usdcBal < 0.5) {
    console.error(chalk.red("✖ Insufficient tUSDC balance for test order (needs at least 0.5 tUSDC)."));
    await shutdownExchange(ctx);
    process.exit(1);
  }

  // 2. Discover active markets
  console.log(chalk.cyan(`\n--- Fetching Active Markets ---`));
  const watcher = new MarketWatcher(ctx);
  const markets = await watcher.getActiveEventContracts();
  
  // Pick an active market with plenty of time remaining (at least 5 minutes)
  const targetMarket = markets.find((m) => m.isTradable && m.timeRemainingSec && m.timeRemainingSec > 300) || markets.find((m) => m.isTradable);

  if (!targetMarket) {
    console.error(chalk.red("✖ No open, tradable event contracts available on DreamDEX right now."));
    await shutdownExchange(ctx);
    process.exit(1);
  }

  console.log(chalk.green(`✔ Selected Active Market:`), chalk.bold.yellow(targetMarket.symbol));
  console.log(chalk.white(`  Question:`), targetMarket.question);
  console.log(chalk.white(`  Asset:`), targetMarket.underlyingAsset);
  console.log(chalk.white(`  Cadence:`), targetMarket.interval);
  console.log(chalk.white(`  Time Remaining:`), `${targetMarket.timeRemainingSec}s`);

  // 3. Place Order via OrderEngine
  console.log(chalk.cyan(`\n--- Submitting Live Limit Order to DreamDEX CLOB ---`));
  const orderEngine = new OrderEngine(ctx);
  const testPrice = 0.50; // 0.50 USDC
  const testAmount = 1;   // 1 outcome token (cost = 0.50 USDC)

  console.log(chalk.white(`  Symbol:`), targetMarket.symbol);
  console.log(chalk.white(`  Side:`), "BUY YES");
  console.log(chalk.white(`  Price:`), `${testPrice} USDC`);
  console.log(chalk.white(`  Amount:`), `${testAmount} token`);
  console.log(chalk.white(`  Total Commitment:`), `${(testPrice * testAmount).toFixed(2)} USDC`);

  const orderResult = await orderEngine.placeLimitOrder({
    symbol: targetMarket.symbol,
    side: "buy",
    outcome: "YES",
    price: testPrice,
    amount: testAmount,
  });

  if (!orderResult.success) {
    console.error(chalk.bold.red(`\n✖ Order Placement Failed: ${orderResult.error}\n`));
    await shutdownExchange(ctx);
    process.exit(1);
  }

  console.log(chalk.bold.green(`\n✔ Order Placed Successfully on DreamDEX CLOB!`));
  console.log(chalk.white(`  Order ID:`), orderResult.orderId || "N/A");
  console.log(chalk.white(`  Tx Hash:`), chalk.bold.cyan(orderResult.txHash));

  // 4. Verify on Somnia Shannon blockchain
  if (orderResult.txHash) {
    console.log(chalk.cyan(`\n--- Verifying On-Chain Transaction Receipt on Somnia L1 ---`));
    console.log(chalk.gray(`Waiting for transaction receipt confirmation...`));

    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: orderResult.txHash as `0x${string}`,
        timeout: 20000,
      });

      console.log(chalk.green(`✔ Block Number:`), Number(receipt.blockNumber));
      console.log(chalk.green(`✔ Status:`), receipt.status === "success" ? chalk.bold.green("SUCCESS (Mined)") : chalk.bold.red("REVERTED"));
      console.log(chalk.green(`✔ Gas Used:`), receipt.gasUsed.toString());
      console.log(chalk.green(`✔ Explorer Link:`), `https://shannon-explorer.somnia.network/tx/${orderResult.txHash}`);

      if (receipt.status === "success") {
        console.log(chalk.bold.green("\n🎉 DREAMDEX ORDER ON-CHAIN EXECUTION FULLY VERIFIED!\n"));
      } else {
        console.log(chalk.bold.red("\n✖ Transaction was mined but reverted on-chain.\n"));
      }
    } catch (err: any) {
      console.warn(chalk.yellow(`⚠ Could not fetch instant receipt: ${err?.message || err}`));
      console.log(chalk.white(`  You can check the tx hash manually on explorer: https://shannon-explorer.somnia.network/tx/${orderResult.txHash}`));
    }
  }

  await shutdownExchange(ctx);
  process.exit(0);
}

main().catch(async (err) => {
  console.error(chalk.bold.red("\n✖ Fatal error during test:"), err);
  process.exit(1);
});
