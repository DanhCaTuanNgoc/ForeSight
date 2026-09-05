// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ForeSightBatchSweeper
 * @author ForeSight Team
 * @notice Institutional-grade batch execution, settlement sweeping, and multi-pool approval router
 *         designed natively for DreamDEX Event Contracts on Somnia L1 (Shannon Testnet).
 *
 * Capabilities:
 *  1. 1-Click Atomic Batch Settlement Sweeper: Claims winnings across multiple resolved pools in a single transaction.
 *  2. 1-Click Multi-Pool Approval: Approves collateral (tUSDC) and configures Operator permissions across dozens of rolling pools.
 */

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

interface IBinarySettlement {
    function redeem(address pool, address to) external returns (uint256 payout);
}

interface IOperatorRegistry {
    function setOperatorApprovalForPool(address pool, address operator, bytes4[] calldata selectors, bool approved) external;
    function setOperatorApprovalGlobal(address operator, bytes4[] calldata selectors, bool approved) external;
    function isApprovedForPool(address pool, address user, address operator, bytes4 selector) external view returns (bool);
}

contract ForeSightBatchSweeper {
    // ------------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------------
    event BatchSweepExecuted(
        address indexed user,
        uint256 indexed poolsProcessed,
        uint256 indexed successCount,
        uint256 totalPayout
    );

    event BatchApprovalExecuted(
        address indexed user,
        address indexed token,
        uint256 indexed poolsCount,
        uint256 amount
    );

    event BatchOperatorDelegated(
        address indexed user,
        address indexed registry,
        address indexed operator,
        uint256 poolsCount
    );

    // ------------------------------------------------------------------------
    // 1. Settlement Sweeper Functions (Atomic Multi-Pool Redemption)
    // ------------------------------------------------------------------------

    /**
     * @notice Batch redeems winning YES/NO shares across multiple resolved DreamDEX pools for the caller.
     * @dev Uses try/catch to ensure individual failed/unresolved pools do not revert the entire batch.
     * @param settlement The DreamDEX BinarySettlement contract address.
     * @param pools Array of resolved binary pool addresses.
     * @return successCount The number of pools successfully redeemed.
     * @return totalPayout The total collateral claimed back to caller's wallet.
     */
    function batchSweep(
        address settlement,
        address[] calldata pools
    ) external returns (uint256 successCount, uint256 totalPayout) {
        require(settlement != address(0), "Invalid settlement address");
        require(pools.length > 0, "No pools provided");

        for (uint256 i = 0; i < pools.length; i++) {
            address pool = pools[i];
            if (pool == address(0)) continue;

            try IBinarySettlement(settlement).redeem(pool, msg.sender) returns (uint256 payout) {
                if (payout > 0) {
                    successCount++;
                    totalPayout += payout;
                }
            } catch {
                // Gracefully ignore unresolved pools, unheld tokens, or zero-payout outcomes
            }
        }

        emit BatchSweepExecuted(msg.sender, pools.length, successCount, totalPayout);
    }

    // ------------------------------------------------------------------------
    // 2. Multi-Pool Approval & Session Delegation Functions
    // ------------------------------------------------------------------------

    /**
     * @notice Batch approves ERC-20 collateral (e.g. tUSDC) across multiple rolling binary pools.
     * @param token ERC-20 collateral contract address.
     * @param pools Array of binary pool addresses to approve.
     * @param amount Approval allowance (e.g. type(uint256).max).
     */
    function batchApprove(
        address token,
        address[] calldata pools,
        uint256 amount
    ) external {
        require(token != address(0), "Invalid token address");
        for (uint256 i = 0; i < pools.length; i++) {
            IERC20(token).approve(pools[i], amount);
        }
        emit BatchApprovalExecuted(msg.sender, token, pools.length, amount);
    }

    /**
     * @notice Batch delegates non-custodial execution rights to an operator across multiple pools.
     * @param registry Somnia OperatorPermissionsRegistry address.
     * @param pools Array of binary pool addresses.
     * @param operator The authorized trading agent address.
     * @param selectors Array of allowed function selectors (e.g. placeOrderFor, cancelOrderFor).
     */
    function batchSetOperatorApproval(
        address registry,
        address[] calldata pools,
        address operator,
        bytes4[] calldata selectors
    ) external {
        require(registry != address(0), "Invalid registry address");
        require(operator != address(0), "Invalid operator address");

        for (uint256 i = 0; i < pools.length; i++) {
            IOperatorRegistry(registry).setOperatorApprovalForPool(pools[i], operator, selectors, true);
        }

        emit BatchOperatorDelegated(msg.sender, registry, operator, pools.length);
    }

    /**
     * @notice Combined 1-click batch approval for both token collateral and operator delegation.
     */
    function batchBoth(
        address token,
        address registry,
        address[] calldata pools,
        address operator,
        bytes4[] calldata selectors,
        uint256 amount
    ) external {
        require(token != address(0), "Invalid token address");
        require(registry != address(0), "Invalid registry address");
        require(operator != address(0), "Invalid operator address");

        for (uint256 i = 0; i < pools.length; i++) {
            IOperatorRegistry(registry).setOperatorApprovalForPool(pools[i], operator, selectors, true);
            IERC20(token).approve(pools[i], amount);
        }

        emit BatchApprovalExecuted(msg.sender, token, pools.length, amount);
        emit BatchOperatorDelegated(msg.sender, registry, operator, pools.length);
    }
}
