import { encodeFunctionData, parseAbi, type Address } from "viem";

export const FORESIGHT_BATCH_SWEEPER_ADDRESS: Address = "0x0df05851d944bfd01e6bc772e27738c23b6e30f9";
export const DREAMDEX_SETTLEMENT_ADDRESS: Address = "0x5Ce69567dB39C8fBAd7e048bEfdbcCdfE67B44e6";
export const SOMNIA_TUSDC_ADDRESS: Address = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

export const BATCH_SWEEPER_ABI = parseAbi([
  "function batchSweep(address settlement, address[] calldata pools) external returns (uint256 successCount, uint256 totalPayout)",
  "function batchApprove(address token, address[] calldata pools, uint256 amount) external",
  "function batchSetOperatorApproval(address registry, address[] calldata pools, address operator, bytes4[] calldata selectors) external",
  "event BatchSweepExecuted(address indexed user, uint256 indexed poolsProcessed, uint256 indexed successCount, uint256 totalPayout)",
  "event BatchApprovalExecuted(address indexed user, address indexed token, uint256 indexed poolsCount, uint256 amount)"
]);

export const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)"
]);

/**
 * Encode calldata for 1-Click MultiCall Batch Sweeper
 */
export function encodeBatchSweepCall(pools: Address[] = []): `0x${string}` {
  const targetPools = pools.length > 0 ? pools : [DREAMDEX_SETTLEMENT_ADDRESS];
  return encodeFunctionData({
    abi: BATCH_SWEEPER_ABI,
    functionName: "batchSweep",
    args: [DREAMDEX_SETTLEMENT_ADDRESS, targetPools],
  });
}

/**
 * Encode calldata for trade approval / dispatch
 */
export function encodeTradeApproval(amount: bigint = BigInt("1000000000")): `0x${string}` {
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "approve",
    args: [FORESIGHT_BATCH_SWEEPER_ADDRESS, amount],
  });
}
