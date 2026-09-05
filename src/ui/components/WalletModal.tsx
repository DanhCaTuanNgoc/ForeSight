import React, { useState } from "react";
import {
  X,
  Wallet,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  LogOut,
  Sparkles,
  Droplets,
  CheckCircle2,
} from "lucide-react";
import { useWallet, SOMNIA_SHANNON_CHAIN_ID } from "../context/WalletContext.js";

// Official MetaMask SVG Fox Icon
const MetaMaskIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M274.1 35.5l-99.5 73.9L194 62.3l80.1-26.8z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M44.5 35.5l98.8 74.5-18.7-47.8-80.1-26.7zM245.4 234.3l-26.6 39.5 56.4 15.6 16.3-54.6-46.1-.5zM27.2 234.8l16.2 54.6 56.4-15.6-26.5-39.5-46.1.5z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M87.3 125.8l-15.8 23.9 56.3 2.5-2-40.3-38.5 13.9zM231.3 125.8l-38.8-14-1.7 40.5 56.3-2.5-15.8-24zM99.9 289.4l34.4-16.8-29.6-23-4.8 39.8zM184.3 272.6l34.4 16.8-4.8-39.8-29.6 23z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M218.7 289.4l-34.4-16.8 2.3 19.3.2 8.3 31.9-10.8zM99.9 289.4l31.9 10.8.3-8.3 2.2-19.3-34.4 16.8z"
      fill="#D7C1B3"
      stroke="#D7C1B3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M133.6 220.7l-28.7-8.4 20.3-9.3 8.4 17.7zM185 220.7l8.4-17.7 20.4 9.3-28.8 8.4z"
      fill="#233447"
      stroke="#233447"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M104.9 212.3l28.7 8.4-2.8 22.7-25.9-31.1zM185 220.7l28.8-8.4-26 31.1-2.8-22.7z"
      fill="#CD6116"
      stroke="#CD6116"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M130.8 243.4l2.8-22.7-8.4-17.7-37.9 11.8 26.5 39.5-2.2 19.3 19.2-30.2zM187.8 220.7l2.8 22.7 19.2 30.2-2.2-19.3 26.5-39.5-37.9-11.8-8.4 17.7z"
      fill="#E4751F"
      stroke="#E4751F"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M190.6 243.4l-2.8-22.7H130.8l-2.8 22.7-19.2 30.2 24.8 13.9 25.7 18 25.7-18 24.8-13.9-19.2-30.2z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const WalletModal: React.FC = () => {
  const {
    address,
    shortAddress,
    chainId,
    isCorrectNetwork,
    isConnected,
    isConnecting,
    balance,
    isWalletModalOpen,
    closeWalletModal,
    connectMetaMask,
    connectInjected,
    disconnect,
    switchToSomnia,
    refreshBalance,
    hasEthereumProvider,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isWalletModalOpen) return null;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    await switchToSomnia();
    setIsSwitching(false);
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setIsRefreshing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={closeWalletModal} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#08080E] border border-white/[0.08] rounded-none p-6 shadow-2xl z-10 space-y-5 text-gray-200 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-violet-950/80 border border-violet-500/40 text-violet-300">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-white text-sm tracking-wide uppercase flex items-center gap-2">
                {isConnected ? "Connected Web3 Wallet" : "Connect Web3 Wallet"}
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">
                {isConnected ? "Somnia Shannon L1 Terminal Session" : "Connect your wallet to sign prediction orders"}
              </p>
            </div>
          </div>

          <button
            onClick={closeWalletModal}
            className="p-1 rounded-none text-gray-400 hover:text-white hover:bg-[#12121C] border border-transparent hover:border-white/[0.07] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── State A: When NOT Connected ───────────────────────────── */}
        {!isConnected ? (
          <div className="space-y-4">
            {!hasEthereumProvider ? (
              <div className="p-3.5 rounded-none bg-amber-950/30 border border-amber-500/40 space-y-2.5 font-mono text-xs text-amber-200">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>MetaMask Not Detected</span>
                </div>
                <p className="text-[11px] text-gray-300 font-sans">
                  Please install MetaMask or a compatible Web3 browser extension to sign on-chain transactions directly on Somnia L1.
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition shadow"
                >
                  <span>Install MetaMask</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : null}

            {/* Wallet Options */}
            <div className="space-y-2.5">
              {/* MetaMask Option */}
              <button
                onClick={() => connectMetaMask()}
                disabled={isConnecting}
                className="w-full p-3.5 rounded-none bg-[#0B0B14] hover:bg-[#12121C] border border-white/[0.07] hover:border-violet-500/50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-none bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                    <MetaMaskIcon />
                  </div>
                  <div className="text-left font-mono">
                    <div className="font-bold text-xs text-white group-hover:text-violet-300 transition-colors">
                      MetaMask
                    </div>
                    <div className="text-[10px] text-gray-400 font-sans">
                      Connect via browser extension
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-violet-400 group-hover:translate-x-1 transition-transform">
                  {isConnecting ? "Connecting..." : "Connect →"}
                </span>
              </button>

              {/* Injected / Other Option */}
              <button
                onClick={() => connectInjected()}
                disabled={isConnecting}
                className="w-full p-3.5 rounded-none bg-[#0B0B14] hover:bg-[#12121C] border border-white/[0.07] hover:border-violet-500/50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-violet-300">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="text-left font-mono">
                    <div className="font-bold text-xs text-white group-hover:text-violet-300 transition-colors">
                      Injected / OKX / Rabby
                    </div>
                    <div className="text-[10px] text-gray-400 font-sans">
                      Auto-detect active EIP-1193 wallet
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-violet-400 group-hover:translate-x-1 transition-transform">
                  {isConnecting ? "Connecting..." : "Connect →"}
                </span>
              </button>
            </div>

            {/* Explanatory Footer */}
            <div className="p-3 rounded-none bg-[#0B0B14] border border-white/[0.06] font-mono text-[10px] text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Somnia Shannon Testnet Ready</span>
              </div>
              <p className="text-gray-500">
                Network: <b className="text-violet-300">Chain ID 50312</b> • RPC: <b>api.infra.testnet.somnia.network</b>
              </p>
            </div>
          </div>
        ) : (
          /* ─── State B: When Connected ───────────────────────────────── */
          <div className="space-y-4">
            {/* Account Card */}
            <div className="p-3.5 rounded-none bg-[#0B0B14] border border-white/[0.07] space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Account Address</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-none bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#08080E] p-2.5 rounded-none border border-white/[0.06]">
                <span className="text-xs font-bold text-violet-300 select-all font-mono truncate mr-2">
                  {address}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded-none hover:bg-[#12121C] text-gray-400 hover:text-white transition cursor-pointer"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`https://shannon-explorer.somnia.network/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-none hover:bg-[#12121C] text-gray-400 hover:text-white transition"
                    title="View in Somnia Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Network Status Card */}
            <div
              className={`p-3 rounded-none border font-mono text-xs transition-all ${
                isCorrectNetwork
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/30 border-rose-500/40 text-rose-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCorrectNetwork ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  />
                  <span className="font-bold text-[11px]">
                    {isCorrectNetwork
                      ? "Somnia Testnet (Shannon)"
                      : `Wrong Network (Chain ${chainId || "Unknown"})`}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">
                  Target: {SOMNIA_SHANNON_CHAIN_ID}
                </span>
              </div>

              {!isCorrectNetwork && (
                <div className="mt-2.5 pt-2 border-t border-rose-900/40 flex items-center justify-between">
                  <span className="text-[10px] text-rose-300">
                    Switch network to sign Somnia trades:
                  </span>
                  <button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitching}
                    className="px-3 py-1 rounded-none bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition shadow cursor-pointer"
                  >
                    {isSwitching ? "Switching..." : "Switch to Somnia"}
                  </button>
                </div>
              )}
            </div>

            {/* Balance Card & Faucet */}
            <div className="p-3.5 rounded-none bg-[#0B0B14] border border-white/[0.07] space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Testnet Balance</span>
                <button
                  onClick={handleRefreshBalance}
                  disabled={isRefreshing}
                  className="text-gray-400 hover:text-white p-1 transition cursor-pointer"
                  title="Refresh Balance"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#08080E] p-2.5 rounded-none border border-white/[0.06]">
                <div>
                  <span className="text-lg font-black text-white block font-mono">
                    {balance !== null ? balance : "Loading..."} STT
                  </span>
                  <span className="text-[10px] text-gray-500 font-light font-sans">Somnia Native Gas Token</span>
                </div>

                <a
                  href="https://testnet.somnia.network/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-violet-950/80 hover:bg-violet-900/90 text-violet-300 border border-violet-500/40 text-[11px] font-bold transition cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5 text-violet-400" />
                  <span>Get Faucet</span>
                </a>
              </div>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={disconnect}
              className="w-full py-2 rounded-none bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default WalletModal;
