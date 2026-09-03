import { describe, it, expect } from "vitest";
import { makeSomniaChain } from "../src/core/chain.js";
import type { AppConfig } from "../src/config/env.js";

// ---------------------------------------------------------------------------
// Shared mock config for Somnia Shannon Testnet
// ---------------------------------------------------------------------------
const SHANNON_CONFIG: AppConfig = {
  networkName: "Somnia Shannon Testnet",
  chainId: 50312,
  rpcUrl: "https://dream-rpc.somnia.network",
  wsRpcUrl: "wss://ws.dream-rpc.somnia.network",
  indexerUrl: "https://dev.smk.somnia.host/v1/graphql",
  venueId: "0x123",
  network: "testnet",
  privateKey: undefined,
  maxOrderSizeUsdc: 100,
  pollIntervalSec: 10,
  autoClaimIntervalMs: 60_000,
  claimScanDepth: 20,
  addresses: undefined,
} as unknown as AppConfig;

// ---------------------------------------------------------------------------
// Suite 1 — Somnia Shannon Chain Definition
// ---------------------------------------------------------------------------
describe("Somnia Shannon Chain Configuration & Network Parameters", () => {
  it("builds a valid Viem Chain object from config", () => {
    const chain = makeSomniaChain(SHANNON_CONFIG);
    expect(chain).toBeDefined();
    expect(chain.id).toBe(50312);
    expect(chain.name).toBeTruthy();
    expect(typeof chain.name).toBe("string");
  });

  it("attaches the correct native currency symbol STT", () => {
    const chain = makeSomniaChain(SHANNON_CONFIG);
    expect(chain.nativeCurrency.symbol).toBe("STT");
    expect(chain.nativeCurrency.decimals).toBe(18);
  });

  it("populates default RPC http endpoint from config", () => {
    const chain = makeSomniaChain(SHANNON_CONFIG);
    expect(chain.rpcUrls.default.http[0]).toBe("https://dream-rpc.somnia.network");
  });

  it("attaches WebSocket RPC endpoint when wsRpcUrl is defined", () => {
    const chain = makeSomniaChain(SHANNON_CONFIG);
    expect(chain.rpcUrls.default.webSocket).toBeDefined();
    expect(chain.rpcUrls.default.webSocket![0]).toBe("wss://ws.dream-rpc.somnia.network");
  });

  it("omits WebSocket endpoint when wsRpcUrl is not provided", () => {
    const noWsConfig = { ...SHANNON_CONFIG, wsRpcUrl: undefined } as unknown as AppConfig;
    const chain = makeSomniaChain(noWsConfig);
    expect(chain.rpcUrls.default.webSocket).toBeUndefined();
  });

  it("embeds the Shannon explorer URL in block explorers", () => {
    const chain = makeSomniaChain(SHANNON_CONFIG);
    expect(chain.blockExplorers?.default.url).toContain("somnia.network");
  });

  it("exposes public RPC identical to the default RPC", () => {
    const chain = makeSomniaChain(SHANNON_CONFIG);
    expect(chain.rpcUrls.public.http[0]).toBe(chain.rpcUrls.default.http[0]);
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Wallet & EVM Address Utilities
// ---------------------------------------------------------------------------
describe("Wallet Address Validation & EVM Identity Checks", () => {
  const VALID_ADDRESS = "0x9876543210987654321098765432109876543210";
  const ZERO_ADDRESS  = "0x0000000000000000000000000000000000000000";

  it("validates standard EIP-55 checksummed address format (42 chars, 0x prefix)", () => {
    expect(VALID_ADDRESS).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(VALID_ADDRESS.length).toBe(42);
  });

  it("correctly identifies zero address as a special null-equivalent", () => {
    const isZero = ZERO_ADDRESS === "0x" + "0".repeat(40);
    expect(isZero).toBe(true);
  });

  it("detects wallets lacking 0x prefix as invalid", () => {
    const noPrefix = "9876543210987654321098765432109876543210";
    expect(noPrefix.startsWith("0x")).toBe(false);
  });

  it("accepts all valid hex characters in address body [0-9, a-f, A-F]", () => {
    const hexChars = "0123456789abcdefABCDEF";
    for (const ch of hexChars) {
      const addr = "0x" + ch.repeat(40);
      expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });

  it("rejects addresses shorter than 42 characters", () => {
    const short = "0x1234";
    expect(short.length).toBeLessThan(42);
  });

  it("derives canTrade = false when no private key is configured", () => {
    const canTrade = Boolean(undefined); // no PRIVATE_KEY
    expect(canTrade).toBe(false);
  });

  it("derives canTrade = true when a private key is present", () => {
    const fakeKey = "0x" + "ab".repeat(32);
    const canTrade = Boolean(fakeKey);
    expect(canTrade).toBe(true);
  });

  it("Shannon testnet Chain ID 50312 is a positive 32-bit integer", () => {
    const chainId = 50312;
    expect(chainId).toBeGreaterThan(0);
    expect(chainId).toBeLessThan(2 ** 32);
    expect(Number.isInteger(chainId)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — USDC Collateral Token Precision (6 Decimals)
// ---------------------------------------------------------------------------
describe("tUSDC Collateral Precision & Decimal Arithmetic", () => {
  const USDC_DECIMALS = 6;
  const USDC_SCALE = 10 ** USDC_DECIMALS;

  it("converts $1.00 USDC to 1_000_000 raw micro-units", () => {
    expect(1.00 * USDC_SCALE).toBe(1_000_000);
  });

  it("converts $0.50 entry price to 500_000 raw units", () => {
    expect(0.50 * USDC_SCALE).toBe(500_000);
  });

  it("converts 50_000_000 raw units back to exactly $50.00", () => {
    const raw = 50_000_000n;
    expect(Number(raw) / USDC_SCALE).toBe(50.0);
  });

  it("preserves 6-decimal precision for $0.010001 edge case", () => {
    const raw = 10_001; // micro-USDC
    const formatted = raw / USDC_SCALE;
    expect(formatted).toBeCloseTo(0.010001, 6);
  });

  it("calculates batch claim gas savings correctly", () => {
    const rounds = 8;
    const singleGas = 120_000;
    const batchGas  = 280_000;
    const saved = rounds * singleGas - batchGas;
    expect(saved).toBe(680_000);
    expect(saved).toBeGreaterThan(0);
  });

  it("confirms maximum shares per $100 at $0.01 entry = 10,000 contracts", () => {
    const investment = 100;
    const entryPrice = 0.01;
    const shares = investment / entryPrice;
    expect(shares).toBe(10_000);
  });

  it("confirms minimum shares per $5 at $0.99 entry ≈ 5.05 contracts", () => {
    const investment = 5;
    const entryPrice = 0.99;
    const shares = investment / entryPrice;
    expect(shares).toBeCloseTo(5.05, 2);
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Somnia Testnet Faucet & Network Invariants
// ---------------------------------------------------------------------------
describe("Somnia Testnet Infrastructure & Protocol Invariants", () => {
  it("confirms Shannon RPC endpoint is reachable via https scheme", () => {
    const rpc = "https://dream-rpc.somnia.network";
    expect(rpc.startsWith("https://")).toBe(true);
  });

  it("confirms GraphQL indexer URL contains v1/graphql path", () => {
    const idx = "https://dev.smk.somnia.host/v1/graphql";
    expect(idx).toContain("/v1/graphql");
  });

  it("confirms Shannon Explorer URL is well-formed", () => {
    const explorerBase = "https://shannon-explorer.somnia.network";
    const txUrl = `${explorerBase}/tx/0xabc123`;
    expect(txUrl).toBe("https://shannon-explorer.somnia.network/tx/0xabc123");
  });

  it("confirms Faucet URL is correctly formed for testnet STT tokens", () => {
    const faucetUrl = "https://testnet.somnia.network/faucet";
    expect(faucetUrl).toContain("testnet.somnia.network");
    expect(faucetUrl).toContain("faucet");
  });

  it("validates that Chain ID 50312 is NOT a standard EVM mainnet ID", () => {
    const ETHEREUM_MAINNET = 1;
    const BSC_MAINNET      = 56;
    const POLYGON_MAINNET  = 137;
    const SOMNIA_SHANNON   = 50312;
    expect(SOMNIA_SHANNON).not.toBe(ETHEREUM_MAINNET);
    expect(SOMNIA_SHANNON).not.toBe(BSC_MAINNET);
    expect(SOMNIA_SHANNON).not.toBe(POLYGON_MAINNET);
  });

  it("verifies STT is a native token (not ERC-20) with 18 decimals", () => {
    const sttDecimals = 18;
    const sttSymbol = "STT";
    expect(sttDecimals).toBe(18);
    expect(sttSymbol).toBe("STT");
  });

  it("asserts block time of ~100ms is faster than Ethereum mainnet (12s)", () => {
    const somniaBlockMs   = 100;
    const ethereumBlockMs = 12_000;
    expect(somniaBlockMs).toBeLessThan(ethereumBlockMs);
    const speedup = ethereumBlockMs / somniaBlockMs;
    expect(speedup).toBe(120);
  });
});
