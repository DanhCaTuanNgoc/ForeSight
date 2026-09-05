import dotenv from "dotenv";
import { z } from "zod";
import { SOMNIA_NETWORKS, type Address } from "./constants.js";

// Load environment variables from nearest .env file
dotenv.config();

const EnvSchema = z.object({
  NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
  RPC_URL: z.string().optional(),
  WS_RPC_URL: z.string().optional(),
  INDEXER_URL: z.string().optional(),
  PRIVATE_KEY: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim().length === 0) return undefined;
      let clean = v.trim().replace(/^["']|["']$/g, "");
      return clean.startsWith("0x") ? clean : `0x${clean}`;
    })
    .pipe(z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Must be a 64-char hex string starting with 0x").optional()),
  
  // Supabase (Cloud PostgreSQL)
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),

  // News ingestion
  CRYPTOPANIC_TOKEN: z.string().optional(),
  
  // Strategy defaults
  AUTO_CLAIM: z.string().transform((v) => v === "true" || v === "1").default("true"),
  AUTO_CLAIM_INTERVAL_MS: z.string().transform(Number).default("600000"), // 10 mins
  CLAIM_SCAN_DEPTH: z.string().transform(Number).default("25"),
  
  // Risk & Trading constraints
  MAX_ORDER_SIZE_USDC: z.string().transform(Number).default("50"),
  DEFAULT_SLIPPAGE_TOLERANCE: z.string().transform(Number).default("0.02"), // 2%
  POLL_INTERVAL_MS: z.string().transform(Number).default("2000"), // 2 sec
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function getAppConfig() {
  const parsed = EnvSchema.parse(process.env);
  const netKey = parsed.NETWORK as "testnet" | "mainnet";
  const baseNetwork = SOMNIA_NETWORKS[netKey];

  return {
    network: netKey,
    networkName: baseNetwork.name,
    chainId: baseNetwork.chainId,
    rpcUrl: parsed.RPC_URL || baseNetwork.rpcUrl,
    wsRpcUrl: parsed.WS_RPC_URL || baseNetwork.wsRpcUrl,
    indexerUrl: parsed.INDEXER_URL || baseNetwork.indexerUrl,
    venueId: parsed.VENUE_ID || baseNetwork.defaultVenueId,
    privateKey: parsed.PRIVATE_KEY as Address | undefined,
    addresses: baseNetwork.addresses,
    autoClaim: parsed.AUTO_CLAIM,
    autoClaimIntervalMs: parsed.AUTO_CLAIM_INTERVAL_MS,
    claimScanDepth: parsed.CLAIM_SCAN_DEPTH,
    maxOrderSizeUsdc: parsed.MAX_ORDER_SIZE_USDC,
    slippageTolerance: parsed.DEFAULT_SLIPPAGE_TOLERANCE,
    pollIntervalMs: parsed.POLL_INTERVAL_MS,
  };
}

export type AppConfig = ReturnType<typeof getAppConfig>;
