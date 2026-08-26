import { SomniaMarkets, SOMNIA_TESTNET_PRICE_FEED } from "@somnia-chain/markets-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { getAppConfig, type AppConfig } from "../config/env.js";
import { makeSomniaChain } from "./chain.js";

export interface ExchangeContext {
  exchange: SomniaMarkets;
  config: AppConfig;
  canTrade: boolean;
  walletAddress?: `0x${string}`;
}

/**
 * Initializes and hydrates a SomniaMarkets instance for DreamDEX Event Contracts
 */
export async function createExchangeContext(options: { requireSigner?: boolean } = {}): Promise<ExchangeContext> {
  const config = getAppConfig();

  if (options.requireSigner && !config.privateKey) {
    throw new Error(
      "PRIVATE_KEY is required for trading operations. Please define PRIVATE_KEY in .env file."
    );
  }

  let walletAddress: `0x${string}` | undefined;
  if (config.privateKey) {
    const account = privateKeyToAccount(config.privateKey);
    walletAddress = account.address;
  }

  const chain = makeSomniaChain(config);

  const exchange = new SomniaMarkets({
    indexerUrl: config.indexerUrl,
    chain,
    wsRpcUrl: config.wsRpcUrl,
    addresses: config.addresses,
    privateKey: config.privateKey,
    priceFeed: config.network === "testnet" ? SOMNIA_TESTNET_PRICE_FEED : undefined,
  });

  return {
    exchange,
    config,
    canTrade: Boolean(config.privateKey),
    walletAddress,
  };
}

/**
 * Safely tear down and close open WebSocket / indexer connections
 */
export async function shutdownExchange(context: ExchangeContext): Promise<void> {
  try {
    await context.exchange.close();
  } catch {
    // Ignore teardown errors
  }
}
