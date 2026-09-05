import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactPath = path.resolve(__dirname, "../contracts/ForeSightBatchSweeper.json");

if (!fs.existsSync(artifactPath)) {
  console.error("Artifact not found! Run `npx tsx contracts/compile.ts` first.");
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

// Somnia Shannon Testnet definition
const somniaShannon = {
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_URL || "https://dream-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: { name: "Somnia Explorer", url: "https://shannon-explorer.somnia.network" },
  },
} as const;

async function main() {
  console.log("========================================================");
  console.log("       FORESIGHT SMART CONTRACT DEPLOYMENT SCRIPT       ");
  console.log("========================================================");

  let rawKey = process.env.PRIVATE_KEY?.trim() || "";
  rawKey = rawKey.replace(/^["']|["']$/g, ""); // strip quotes if any

  if (!rawKey || rawKey.length < 32 || rawKey.startsWith("0x0000000000000000000000000000000000000000")) {
    console.log("⚠️ No valid PRIVATE_KEY configured in .env. Running Dry-Run Simulation mode.");
    console.log(`✅ Bytecode Verified: ${artifact.bytecode.length} hex chars`);
    console.log(`✅ ABI Methods: ${artifact.abi.length} functions & events`);
    console.log(`📍 Target Network: ${somniaShannon.name} (Chain ID: ${somniaShannon.id})`);
    console.log("💡 To deploy live on Shannon Testnet, add your funded PRIVATE_KEY to .env and re-run.");
    return;
  }

  const formattedKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;

  let account;
  try {
    account = privateKeyToAccount(formattedKey);
  } catch (err: any) {
    console.error("❌ Invalid Private Key format. Private Key must be 64 hexadecimal characters (with or without 0x).");
    console.error(`Received length: ${rawKey.length} characters.`);
    process.exit(1);
  }

  console.log(`🔑 Deployer Address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: somniaShannon,
    transport: http(somniaShannon.rpcUrls.default.http[0]),
  });

  const walletClient = createWalletClient({
    account,
    chain: somniaShannon,
    transport: http(somniaShannon.rpcUrls.default.http[0]),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Deployer Balance: ${Number(balance) / 1e18} STT`);

  if (balance === 0n) {
    console.error("❌ Insufficient STT gas balance. Request STT from Somnia Telegram faucet.");
    process.exit(1);
  }

  console.log("🚀 Broadcasting deployment transaction to Somnia L1...");
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode as `0x${string}`,
  });

  console.log(`📜 Tx Hash: ${hash}`);
  console.log("⏳ Waiting for Shannon Testnet block confirmation (sub-second finality)...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`🎉 ForeSightBatchSweeper deployed successfully at: ${receipt.contractAddress}`);
  console.log(`🔗 Shannon Explorer: https://shannon-explorer.somnia.network/address/${receipt.contractAddress}`);

  // Save deployment info
  const deploymentRecord = {
    contractName: "ForeSightBatchSweeper",
    address: receipt.contractAddress,
    transactionHash: hash,
    blockNumber: receipt.blockNumber.toString(),
    network: somniaShannon.name,
    chainId: somniaShannon.id,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.resolve(__dirname, "../contracts/deployment.json"),
    JSON.stringify(deploymentRecord, null, 2),
    "utf8"
  );
  console.log("✅ Saved deployment details to contracts/deployment.json");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
