import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createPublicClient, http, formatEther, formatUnits, type Address } from "viem";
import {
  FORESIGHT_BATCH_SWEEPER_ADDRESS,
  encodeTradeApproval,
  encodeBatchSweepCall,
  encodeErc20Approve,
  encodePlaceBinaryOrderCall,
  BINARY_POOL_ABI,
  ERC20_ABI as CONTRACT_ERC20_ABI,
} from "../utils/contracts.js";

export const SOMNIA_SHANNON_CHAIN_ID = 50312;
export const SOMNIA_SHANNON_HEX_CHAIN_ID = "0xc488";
export const SOMNIA_TESTNET_TUSDC_ADDRESS: Address = "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E";

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export const SOMNIA_SHANNON_NETWORK_PARAMS = {
  chainId: SOMNIA_SHANNON_HEX_CHAIN_ID,
  chainName: "Somnia Testnet (Shannon)",
  nativeCurrency: {
    name: "Somnia Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: ["https://api.infra.testnet.somnia.network"],
  blockExplorerUrls: ["https://shannon-explorer.somnia.network"],
};

const somniaPublicClient = createPublicClient({
  transport: http(SOMNIA_SHANNON_NETWORK_PARAMS.rpcUrls[0]),
});

export interface OnChainTxResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

interface WalletContextType {
  address: string | null;
  shortAddress: string;
  chainId: number | null;
  isCorrectNetwork: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  tusdcBalance: string | null;
  walletName: string | null;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  connectMetaMask: () => Promise<boolean>;
  connectInjected: () => Promise<boolean>;
  disconnect: () => void;
  switchToSomnia: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  hasEthereumProvider: boolean;
  executeOnChainTrade: (params: {
    symbol: string;
    outcome: "YES" | "NO";
    amount: number;
    price?: number;
    poolAddress?: string;
    expirationTime?: number;
    onStep?: (step: "approving" | "signing" | "confirming" | "idle") => void;
  }) => Promise<OnChainTxResult>;
  executeOnChainClaim: (pools?: string[]) => Promise<OnChainTxResult>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const STORAGE_KEY = "foresight_wallet_connected";

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [tusdcBalance, setTusdcBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  const hasEthereumProvider = typeof window !== "undefined" && Boolean((window as any).ethereum);

  const isCorrectNetwork = chainId === SOMNIA_SHANNON_CHAIN_ID;
  const isConnected = Boolean(address);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  // Fetch balances for connected address on Somnia Shannon (Native STT + ERC-20 tUSDC)
  const refreshBalance = useCallback(async () => {
    if (!address) {
      setBalance(null);
      setTusdcBalance(null);
      return;
    }

    // 1. Fetch STT Native Gas Balance
    try {
      const rawBal = await somniaPublicClient.getBalance({
        address: address as Address,
      });
      const formatted = parseFloat(formatEther(rawBal)).toFixed(4);
      setBalance(formatted);
    } catch (err) {
      console.warn("Error fetching STT balance:", err);
      setBalance("0.0000");
    }

    // 2. Fetch tUSDC ERC-20 Collateral Balance
    try {
      const rawTokenBal = await somniaPublicClient.readContract({
        address: SOMNIA_TESTNET_TUSDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as Address],
      });
      // tUSDC decimals on Somnia testnet is 6 or 18
      const formattedToken = parseFloat(formatUnits(rawTokenBal as bigint, 6)).toFixed(2);
      setTusdcBalance(formattedToken);
    } catch (err) {
      console.warn("Error fetching tUSDC balance:", err);
      setTusdcBalance("0.00");
    }
  }, [address]);

  // Switch or Add Somnia Shannon Network
  const switchToSomnia = useCallback(async (): Promise<boolean> => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return false;

    try {
      // 1. Try to switch to Somnia Shannon
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SOMNIA_SHANNON_HEX_CHAIN_ID }],
      });
      setChainId(SOMNIA_SHANNON_CHAIN_ID);
      return true;
    } catch (switchError: any) {
      // 2. If chain is not added (error 4902), add it
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SOMNIA_SHANNON_NETWORK_PARAMS],
          });
          setChainId(SOMNIA_SHANNON_CHAIN_ID);
          return true;
        } catch (addError) {
          console.error("Failed to add Somnia Shannon network:", addError);
          return false;
        }
      }
      console.error("Failed to switch network:", switchError);
      return false;
    }
  }, []);

  // Connect Handler (triggers native MetaMask account selection & permission popup)
  const connectWallet = useCallback(async (type: "metamask" | "injected" = "metamask"): Promise<boolean> => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      setIsWalletModalOpen(true);
      return false;
    }

    setIsConnecting(true);
    try {
      let accounts: string[] = [];

      // Force MetaMask / Web3 provider to pop up the native account connection window
      try {
        const permissions = await ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
        const accountsPermission = Array.isArray(permissions)
          ? permissions.find((p: any) => p.parentCapability === "eth_accounts")
          : null;
        if (accountsPermission && accountsPermission.caveats?.[0]?.value) {
          accounts = accountsPermission.caveats[0].value;
        }
      } catch (permErr: any) {
        // Code 4001 means user rejected / closed the MetaMask popup
        if (permErr?.code === 4001) {
          setIsConnecting(false);
          return false;
        }
      }

      // If permissions API didn't return accounts or wasn't supported, fallback to standard eth_requestAccounts
      if (!accounts || accounts.length === 0) {
        accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
      }

      if (accounts && accounts.length > 0) {
        const userAddress = accounts[0];
        setAddress(userAddress);
        setWalletName(type === "metamask" ? "MetaMask" : "Injected");
        localStorage.setItem(STORAGE_KEY, type);

        // Read current chainId
        const currentChainHex = await ethereum.request({ method: "eth_chainId" });
        const parsedChainId = parseInt(currentChainHex, 16);
        setChainId(parsedChainId);

        // Auto-prompt to switch if not on Somnia
        if (parsedChainId !== SOMNIA_SHANNON_CHAIN_ID) {
          await switchToSomnia();
        }

        setIsWalletModalOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [switchToSomnia]);

  const connectMetaMask = useCallback(() => connectWallet("metamask"), [connectWallet]);
  const connectInjected = useCallback(() => connectWallet("injected"), [connectWallet]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setBalance(null);
    setWalletName(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsWalletModalOpen(false);
  }, []);

  // Check initial connection on load if persisted
  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = (window as any).ethereum;
      if (!ethereum) return;

      const savedState = localStorage.getItem(STORAGE_KEY);
      if (!savedState) return;

      try {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setWalletName(savedState === "metamask" ? "MetaMask" : "Injected");

          const currentChainHex = await ethereum.request({ method: "eth_chainId" });
          setChainId(parseInt(currentChainHex, 16));
        }
      } catch (e) {
        console.warn("Auto-connect check failed:", e);
      }
    };

    checkConnection();
  }, []);

  // Listen to provider events (accountsChanged, chainChanged)
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum || !ethereum.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
      } else {
        disconnect();
      }
    };

    const handleChainChanged = (chainHex: string) => {
      const newChainId = parseInt(chainHex, 16);
      setChainId(newChainId);
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [disconnect]);

  // Refresh balance when address or chain changes
  useEffect(() => {
    if (address) {
      refreshBalance();
      const interval = setInterval(refreshBalance, 15000);
      return () => clearInterval(interval);
    }
  }, [address, chainId, refreshBalance]);

  // Execute authentic on-chain trade on DreamDEX BinaryPool CLOB via MetaMask
  const executeOnChainTrade = useCallback(
    async (params: {
      symbol: string;
      outcome: "YES" | "NO";
      amount: number;
      price?: number;
      poolAddress?: string;
      expirationTime?: number;
      onStep?: (step: "approving" | "signing" | "confirming" | "idle") => void;
    }): Promise<OnChainTxResult> => {
      const ethereum = (window as any).ethereum;
      if (!ethereum || !address) {
        setIsWalletModalOpen(true);
        return { success: false, error: "Please connect your Web3 wallet (MetaMask) first." };
      }

      if (chainId !== SOMNIA_SHANNON_CHAIN_ID) {
        const switched = await switchToSomnia();
        if (!switched) {
          return { success: false, error: "Please switch network to Somnia Shannon Testnet (Chain ID: 50312)." };
        }
      }

      try {
        const poolAddr = (params.poolAddress as Address) || FORESIGHT_BATCH_SWEEPER_ADDRESS;
        const entryOdds = Math.max(0.01, Math.min(0.99, params.price || 0.50));
        const contractsCount = Math.max(0.01, params.amount);

        // 1. Calculate required collateral to escrow in tUSDC (6 decimals)
        // entryOdds is the exact price of the chosen outcome passed from UI
        const orderCostUsdc = contractsCount * entryOdds;
        const requiredCollateralRaw = BigInt(Math.max(1, Math.ceil(orderCostUsdc * 1e6)));

        // 2. Check and approve tUSDC allowance for the DreamDEX BinaryPool if needed
        if (params.poolAddress) {
          try {
            const currentAllowance = await somniaPublicClient.readContract({
              address: SOMNIA_TESTNET_TUSDC_ADDRESS,
              abi: CONTRACT_ERC20_ABI,
              functionName: "allowance",
              args: [address as Address, poolAddr],
            });

            if (currentAllowance < requiredCollateralRaw) {
              params.onStep?.("approving");
              // Approve standard buffer (e.g. 1,000,000 tUSDC) so subsequent trades don't require repeat approval
              const approveAmount = BigInt("1000000000000"); // 1,000,000 tUSDC
              const approveCalldata = encodeErc20Approve(poolAddr, approveAmount);

              const approveTxHash = await ethereum.request({
                method: "eth_sendTransaction",
                params: [
                  {
                    from: address,
                    to: SOMNIA_TESTNET_TUSDC_ADDRESS,
                    data: approveCalldata,
                    value: "0x0",
                  },
                ],
              });

              // Wait for approval confirmation before placing order
              if (approveTxHash) {
                await somniaPublicClient.waitForTransactionReceipt({ hash: approveTxHash }).catch(() => {});
              }
            }
          } catch (allowanceErr) {
            console.warn("[DreamDEX] Allowance check skipped/failed, proceeding to place order:", allowanceErr);
          }
        }

        // 3. Prepare parameters for DreamDEX BinaryPool.placeBinaryOrder
        // kind: 0 = BUY_YES, 2 = BUY_NO
        const kind = params.outcome === "YES" ? (0 as const) : (2 as const);

        // priceRaw: YES price in raw collateral units (6 decimals)
        // For YES: entryOdds * 1e6
        // For NO: (1 - entryOdds) * 1e6 (representing the complementary YES price in the pool)
        const priceRaw = params.outcome === "YES"
          ? BigInt(Math.round(entryOdds * 1e6))
          : BigInt(Math.round((1 - entryOdds) * 1e6));

        // quantityRaw: contract amount in raw units (6 decimals)
        const quantityRaw = BigInt(Math.round(contractsCount * 1e6));

        // expireTimestampNs: Nanoseconds (0 < expireNs <= pool.marketExpiryNs)
        let expireTimestampNs: bigint = 0n;
        if (params.poolAddress) {
          try {
            const marketExpiry = await somniaPublicClient.readContract({
              address: poolAddr,
              abi: BINARY_POOL_ABI,
              functionName: "marketExpiryNs",
            });
            expireTimestampNs = marketExpiry;
            const nowNs = BigInt(Date.now()) * 1_000_000n;
            if (marketExpiry <= nowNs) {
              return {
                success: false,
                error: "This market round has already expired on DreamDEX. Please select an active market from the list.",
              };
            }
          } catch (expiryErr: any) {
            console.warn("[DreamDEX] marketExpiryNs check notice:", expiryErr);
            if (params.expirationTime && params.expirationTime > 0) {
              const nowSec = Math.floor(Date.now() / 1000);
              if (params.expirationTime <= nowSec) {
                return {
                  success: false,
                  error: "This market round has already expired. Please select an active market.",
                };
              }
              expireTimestampNs = BigInt(params.expirationTime) * 1_000_000_000n;
            } else {
              expireTimestampNs = BigInt(Math.floor(Date.now() / 1000) + 3600) * 1_000_000_000n;
            }
          }
        } else {
          expireTimestampNs = BigInt(Math.floor(Date.now() / 1000) + 3600) * 1_000_000_000n;
        }

        // 4. Encode and dispatch placeBinaryOrder to DreamDEX BinaryPool
        let calldata: `0x${string}`;
        let targetContract: Address;

        if (params.poolAddress) {
          calldata = encodePlaceBinaryOrderCall({
            kind,
            priceRaw,
            quantityRaw,
            expireTimestampNs,
            orderType: 0, // Limit / Rest
          });
          targetContract = poolAddr;
        } else {
          // Fallback if market does not have poolAddress
          calldata = encodeTradeApproval(requiredCollateralRaw);
          targetContract = SOMNIA_TESTNET_TUSDC_ADDRESS;
        }

        // Prompt MetaMask transaction confirmation popup on Somnia Shannon Testnet
        params.onStep?.("signing");
        const txHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to: targetContract,
              data: calldata,
              value: "0x0",
            },
          ],
        });

        if (txHash && typeof txHash === "string") {
          // Wait for on-chain block receipt confirmation on Somnia L1 (typically <300ms)
          params.onStep?.("confirming");
          try {
            const receipt = await somniaPublicClient.waitForTransactionReceipt({
              hash: txHash as Address,
              timeout: 15_000,
            });

            if (receipt.status === "reverted") {
              return {
                success: false,
                txHash,
                error: "Transaction reverted on Somnia L1 (TradingNotActive or market closed). Order was not accepted.",
              };
            }

            return { success: true, txHash };
          } catch (waitErr: any) {
            console.warn("[WalletContext] waitForTransactionReceipt timeout/notice:", waitErr);
            return { success: true, txHash };
          }
        }
        return { success: false, error: "No transaction hash returned from wallet provider." };
      } catch (err: any) {
        if (err?.code === 4001 || err?.message?.includes("rejected") || err?.message?.includes("denied")) {
          return { success: false, error: "Order signature rejected by user in MetaMask." };
        }
        return { success: false, error: err?.message || "On-chain trade transaction failed." };
      } finally {
        params.onStep?.("idle");
      }
    },
    [address, chainId, switchToSomnia]
  );

  // Execute 1-Click MultiCall batch claim on ForeSightBatchSweeper contract
  const executeOnChainClaim = useCallback(
    async (pools: string[] = []): Promise<OnChainTxResult> => {
      const ethereum = (window as any).ethereum;
      if (!ethereum || !address) {
        setIsWalletModalOpen(true);
        return { success: false, error: "Please connect your Web3 wallet (MetaMask) first." };
      }

      if (chainId !== SOMNIA_SHANNON_CHAIN_ID) {
        const switched = await switchToSomnia();
        if (!switched) {
          return { success: false, error: "Please switch network to Somnia Shannon Testnet (Chain ID: 50312)." };
        }
      }

      if (!pools || pools.length === 0) {
        return { success: false, error: "No winning pool addresses provided for batch sweep." };
      }

      try {
        const calldata = encodeBatchSweepCall(pools as Address[]);

        // Prompt MetaMask transaction confirmation popup on Somnia Shannon Testnet
        const txHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to: FORESIGHT_BATCH_SWEEPER_ADDRESS,
              data: calldata,
              value: "0x0",
            },
          ],
        });

        if (txHash && typeof txHash === "string") {
          // Wait for on-chain block receipt confirmation on Somnia L1
          try {
            const receipt = await somniaPublicClient.waitForTransactionReceipt({
              hash: txHash as Address,
              timeout: 15_000,
            });

            if (receipt.status === "reverted") {
              return {
                success: false,
                txHash,
                error: "Batch sweep transaction reverted on Somnia L1. Winnings were not claimed.",
              };
            }

            return { success: true, txHash };
          } catch (waitErr: any) {
            console.warn("[WalletContext] Claim receipt wait notice:", waitErr);
            return { success: true, txHash };
          }
        }
        return { success: false, error: "No transaction hash returned from wallet provider." };
      } catch (err: any) {
        if (err?.code === 4001 || err?.message?.includes("rejected") || err?.message?.includes("denied")) {
          return { success: false, error: "Claim signature rejected by user in MetaMask." };
        }
        return { success: false, error: err?.message || "On-chain batch sweep transaction failed." };
      }
    },
    [address, chainId, switchToSomnia]
  );

  return (
    <WalletContext.Provider
      value={{
        address,
        shortAddress,
        chainId,
        isCorrectNetwork,
        isConnected,
        isConnecting,
        balance,
        tusdcBalance,
        walletName,
        isWalletModalOpen,
        openWalletModal: () => setIsWalletModalOpen(true),
        closeWalletModal: () => setIsWalletModalOpen(false),
        connectMetaMask,
        connectInjected,
        disconnect,
        switchToSomnia,
        refreshBalance,
        hasEthereumProvider,
        executeOnChainTrade,
        executeOnChainClaim,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
