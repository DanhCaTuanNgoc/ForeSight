/**
 * Somnia Network & DreamDEX Event Contracts Configuration Constants
 */

import {
  SOMNIA_TESTNET_ADDRESSES,
  SOMNIA_MAINNET_ADDRESSES,
  SOMNIA_TESTNET_PRICE_FEED,
} from "@somnia-chain/markets-sdk";

export type Address = `0x${string}`;

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  wsRpcUrl?: string;
  indexerUrl: string;
  explorerUrl: string;
  defaultVenueId: string;
  addresses: typeof SOMNIA_TESTNET_ADDRESSES;
}

export const SOMNIA_NETWORKS: Record<"testnet" | "mainnet", NetworkConfig> = {
  testnet: {
    name: "Somnia Testnet (Shannon)",
    chainId: 50312,
    rpcUrl: "https://api.infra.testnet.somnia.network",
    wsRpcUrl: "wss://api.infra.testnet.somnia.network/ws",
    indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
    explorerUrl: "https://shannon-explorer.somnia.network",
    defaultVenueId: "0x679795a0195a1b76cdebb7c51d74e058aee92919b8c3389af86ef24535e8a28c",
    addresses: {
      ...SOMNIA_TESTNET_ADDRESSES,
      marketCreator: "0x5Ce69567dB39C8fBAd7e048bEfdbcCdfE67B44e6",
    },
  },
  mainnet: {
    name: "Somnia Mainnet",
    chainId: 5031,
    rpcUrl: "https://api.infra.mainnet.somnia.network",
    wsRpcUrl: "wss://api.infra.mainnet.somnia.network/ws",
    indexerUrl: "https://prd.smk.somnia.host/v1/graphql",
    explorerUrl: "https://explorer.somnia.network",
    defaultVenueId: "0x458b30c2d72bfd2c6317304a4594ecbafe5f729d3111b65fdc3a33bd48e5432d",
    addresses: {
      ...SOMNIA_MAINNET_ADDRESSES,
      marketCreator: "0x62627805965705Cc303A7F6282DD5059921980aD",
    },
  },
};

export enum MarketStatus {
  Unknown = 0,
  Trading = 1,
  Paused = 2,
  Settled = 3,
  Cancelled = 4,
  Expired = 5,
}

export const OUTCOME_NAMES = {
  UP: "UP",
  DOWN: "DOWN",
  YES: "YES",
  NO: "NO",
} as const;

export { SOMNIA_TESTNET_PRICE_FEED };
