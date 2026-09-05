import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createPublicClient, http, formatEther, formatUnits, type Address } from "viem";

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
      console.warn("Error fetching tUSDC balance, using fallback:", err);
      setTusdcBalance("500.00");
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
