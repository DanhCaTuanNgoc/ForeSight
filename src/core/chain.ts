import { defineChain, type Chain } from "viem";
import { SOMNIA_NETWORKS } from "../config/constants.js";
import type { AppConfig } from "../config/env.js";

/**
 * Creates a Viem Chain definition for Somnia network
 */
export function makeSomniaChain(config: AppConfig): Chain {
  const net = SOMNIA_NETWORKS[config.network];

  return defineChain({
    id: config.chainId,
    name: net.name,
    nativeCurrency: {
      name: "Somnia Token",
      symbol: "STT",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [config.rpcUrl],
        webSocket: config.wsRpcUrl ? [config.wsRpcUrl] : undefined,
      },
      public: {
        http: [config.rpcUrl],
        webSocket: config.wsRpcUrl ? [config.wsRpcUrl] : undefined,
      },
    },
    blockExplorers: {
      default: {
        name: "Somnia Explorer",
        url: net.explorerUrl,
      },
    },
  });
}
