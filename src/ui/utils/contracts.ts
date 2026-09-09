import { encodeFunctionData, parseAbi, type Address } from "viem";

export const FORESIGHT_BATCH_SWEEPER_ADDRESS: Address = "0x0df05851d944bfd01e6bc772e27738c23b6e30f9";
export const DREAMDEX_SETTLEMENT_ADDRESS: Address = "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23";
export const SOMNIA_TUSDC_ADDRESS: Address = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

export const BINARY_SETTLEMENT_ABI = parseAbi([
  "function redeem(uint256 outcomeId, uint256 amount, address to) returns (uint256 collateralOut)",
  "function finalizeAndRedeem(address pool, uint256 outcomeId, uint256 amount, address to) returns (uint256 collateralOut)",
  "function isFinalized(uint256 outcomeId) view returns (bool)",
  "function getSettlement(uint256 marketKey) view returns ((address collateralToken, uint128 backing, bool finalized, bool voided, uint256 settlementFeeBpsTimes1k, address feeRecipient, address pool, uint64 nonce, uint256[] payoutNumerators))",
]);

export const BATCH_SWEEPER_ABI = parseAbi([
  "function batchSweep(address settlement, address[] calldata pools) external returns (uint256 successCount, uint256 totalPayout)",
  "function batchApprove(address token, address[] calldata pools, uint256 amount) external",
  "function batchSetOperatorApproval(address registry, address[] calldata pools, address operator, bytes4[] calldata selectors) external",
  "event BatchSweepExecuted(address indexed user, uint256 indexed poolsProcessed, uint256 indexed successCount, uint256 totalPayout)",
  "event BatchApprovalExecuted(address indexed user, address indexed token, uint256 indexed poolsCount, uint256 amount)"
]);

export const BINARY_POOL_ABI = parseAbi([
  "function placeBinaryOrder(uint8 kind, uint256 price, uint256 quantity, uint64 expireTimestampNs, uint8 orderType, uint8 selfMatchingOption, address builder, uint96 builderFeeBpsTimes1k, uint64 userData) external payable returns (bool success, uint128 id)",
  "function marketExpiryNs() external view returns (uint64)",
  "function getOrderBookParameters() external view returns (uint256 tickSize, uint256 lotSize, uint256 minQuantity)"
]);

export const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
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
 * Encode calldata for ERC20 approve
 */
export function encodeErc20Approve(spender: Address, amount: bigint): `0x${string}` {
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "approve",
    args: [spender, amount],
  });
}

/**
 * Encode calldata for trade approval / dispatch (legacy helper for sweeper)
 */
export function encodeTradeApproval(amount: bigint = BigInt("1000000000")): `0x${string}` {
  return encodeErc20Approve(FORESIGHT_BATCH_SWEEPER_ADDRESS, amount);
}

export interface PlaceBinaryOrderArgs {
  kind: 0 | 1 | 2 | 3; // 0: BUY_YES, 1: SELL_YES, 2: BUY_NO, 3: SELL_NO
  priceRaw: bigint; // YES price in collateral units
  quantityRaw: bigint; // Outcome tokens quantity in raw units
  expireTimestampNs: bigint;
  orderType?: number; // 0: Limit, 1: FOK, 2: IOC, 3: PostOnly
}

/**
 * Encode calldata for direct on-chain BinaryPool.placeBinaryOrder on DreamDEX
 */
export function encodePlaceBinaryOrderCall(args: PlaceBinaryOrderArgs): `0x${string}` {
  return encodeFunctionData({
    abi: BINARY_POOL_ABI,
    functionName: "placeBinaryOrder",
    args: [
      args.kind,
      args.priceRaw,
      args.quantityRaw,
      args.expireTimestampNs,
      args.orderType ?? 0,
      0, // selfMatchingOption
      "0x0000000000000000000000000000000000000000", // builder
      0n, // builderFeeBpsTimes1k
      0n, // userData
    ],
  });
}
