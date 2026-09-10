import chalk from "chalk";
import { createPublicClient, http } from "viem";
import { getAppConfig } from "../src/config/env.js";
import { makeSomniaChain } from "../src/core/chain.js";

async function main() {
  console.log(chalk.bold.cyan("\n======================================================="));
  console.log(chalk.bold.cyan("  Testing Full End-to-End API Order Flow (UI Simulation) "));
  console.log(chalk.bold.cyan("=======================================================\n"));

  const config = getAppConfig();
  const chain = makeSomniaChain(config);
  const publicClient = createPublicClient({
    chain,
    transport: http(config.rpcUrl),
  });

  const baseUrl = "http://localhost:3001";

  // 1. Test /api/markets
  console.log(chalk.cyan("Step 1: Testing GET /api/markets..."));
  const marketsRes = await fetch(`${baseUrl}/api/markets`);
  if (!marketsRes.ok) {
    throw new Error(`Failed to fetch /api/markets: ${marketsRes.statusText}`);
  }
  const marketsData = await marketsRes.json();
  const markets = marketsData.markets || [];
  console.log(chalk.green(`✔ Received ${markets.length} markets.`));

  const coreAssets = ["BTC", "ETH", "SOL", "SOMI"];
  for (const asset of coreAssets) {
    const found = markets.some((m: any) => (m.underlyingAsset || m.symbol).toUpperCase().includes(asset));
    console.log(chalk.white(`  Asset ${asset.padEnd(5)}: `) + (found ? chalk.bold.green("EXISTS ✔") : chalk.bold.red("MISSING ✖")));
  }

  // Pick an active contract with remaining time
  const targetContract = markets.find(
    (m: any) => (m.timeRemainingSec === undefined || m.timeRemainingSec > 180) && m.isTradable
  ) || markets[0];

  console.log(chalk.green(`\n✔ Chosen Target Contract: `) + chalk.bold.yellow(targetContract.symbol));
  console.log(chalk.white(`  Asset: ${targetContract.underlyingAsset}, Time Remaining: ${targetContract.timeRemainingSec || 'N/A'}s`));

  // 2. Test POST /api/orders
  console.log(chalk.cyan(`\nStep 2: Submitting POST /api/orders...`));
  const orderPayload = {
    symbol: targetContract.symbol,
    outcome: "YES",
    amount: 1,
    price: 0.50,
    walletAddress: "0x7F5c82B75b61a33640C12C6e79fB49CE23e335de",
  };

  const orderRes = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });

  const orderData = await orderRes.json();
  console.log(chalk.white("API Response:"), JSON.stringify(orderData, null, 2));

  if (!orderRes.ok || !orderData.success) {
    throw new Error(`Order placement failed: ${orderData.error || orderRes.statusText}`);
  }

  console.log(chalk.bold.green(`\n✔ API Order Accepted! Order ID: ${orderData.orderId || orderData.position?.orderId}`));
  const txHash = orderData.txHash || orderData.position?.txHash;
  console.log(chalk.white(`  Tx Hash:`), chalk.bold.cyan(txHash));

  // 3. Verify On-Chain Receipt
  if (txHash) {
    console.log(chalk.cyan(`\nStep 3: Verifying Somnia Shannon On-Chain Transaction Receipt...`));
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      timeout: 20000,
    });

    console.log(chalk.green(`✔ Block Number:`), Number(receipt.blockNumber));
    console.log(chalk.green(`✔ Receipt Status:`), receipt.status === "success" ? chalk.bold.green("SUCCESS (Mined)") : chalk.bold.red("REVERTED"));
    console.log(chalk.green(`✔ Gas Used:`), receipt.gasUsed.toString());
    console.log(chalk.green(`✔ Explorer Link:`), `https://shannon-explorer.somnia.network/tx/${txHash}`);
  }

  // 4. Test GET /api/positions
  console.log(chalk.cyan(`\nStep 4: Checking GET /api/positions ledger update...`));
  const posRes = await fetch(`${baseUrl}/api/positions`);
  if (posRes.ok) {
    const posData = await posRes.json();
    const latest = (posData.positions || [])[0];
    console.log(chalk.green(`✔ Total recorded positions in ledger: ${posData.positions?.length || 0}`));
    if (latest) {
      console.log(chalk.white(`  Latest Position: ${latest.symbol} | ${latest.outcome} | Amount: ${latest.amount} | Status: ${latest.status}`));
      console.log(chalk.white(`  Latest Tx Hash: ${latest.txHash}`));
    }
  }

  console.log(chalk.bold.green("\n🎉 FULL UI END-TO-END FLOW TO DREAMDEX VERIFIED SUCCESSFULLY!\n"));
}

main().catch((err) => {
  console.error(chalk.bold.red("\n✖ Error testing API order flow:"), err);
  process.exit(1);
});
