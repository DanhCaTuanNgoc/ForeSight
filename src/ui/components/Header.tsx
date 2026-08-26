import React from "react";
import { Settings, Menu, X, Coins, Wallet, AlertCircle } from "lucide-react";
import { ForeSightLogo } from "./ForeSightLogo.js";
import { useWallet, SOMNIA_SHANNON_CHAIN_ID } from "../context/WalletContext.js";

interface HeaderProps {
  health?: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  walletAddress?: string;
  onConnectWallet?: () => void;
  onClaimAll?: () => void;
  isClaiming?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  activeTab,
  onTabChange,
  walletAddress,
  onConnectWallet,
  onClaimAll,
  isClaiming = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const wallet = useWallet();

  const activeAddress = wallet.address || walletAddress;
  const isConnected = Boolean(activeAddress);
  const isWrongNetwork = isConnected && wallet.chainId !== null && wallet.chainId !== SOMNIA_SHANNON_CHAIN_ID;

  const shortAddr = activeAddress
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : "";

  const handleWalletClick = () => {
    if (onConnectWallet && !wallet.openWalletModal) {
      onConnectWallet();
    } else {
      wallet.openWalletModal();
    }
  };

  const tabs = [
    { id: "landing", label: "Overview" },
    { id: "markets", label: "Terminal" },
    { id: "analytics", label: "Analytics" },
    { id: "insights", label: "AI Insights" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <header className="sticky top-0 z-50 h-13 bg-[#111118]/95 backdrop-blur-md border-b border-[#2A2A3D] px-4 flex items-center justify-between">
      {/* Left: Brand / Logo */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => onTabChange("landing")}
          className="flex items-center gap-2.5 hover:opacity-90 transition text-left group"
        >
          <ForeSightLogo size={34} animated={true} />
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-[15px] text-white tracking-widest group-hover:text-violet-300 transition-colors">
              FORESIGHT
            </span>
            <span className="text-[10px] font-mono text-violet-300 bg-violet-950/80 border border-violet-500/40 px-1.5 py-0.5 rounded font-semibold shadow-[0_0_8px_rgba(124,58,237,0.3)]">
              TERMINAL
            </span>
          </div>
        </button>
        <div className="flex items-center gap-1.5 pl-3 border-l border-[#2A2A3D]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">LIVE</span>
        </div>
      </div>

      {/* Center: Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded transition-all duration-150 ${
                isActive
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 font-semibold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#1A1A24]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Actions & Wallet */}
      <div className="flex items-center gap-2.5">
        {/* Network Badge */}
        {isWrongNetwork ? (
          <button
            onClick={() => wallet.switchToSomnia()}
            className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/50 hover:bg-rose-900/90 text-rose-300 px-2.5 py-1 rounded text-[11px] font-mono transition animate-pulse"
            title="Click to Switch to Somnia Testnet (50312)"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Switch to Somnia</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 bg-[#161622] border border-[#2A2A3D] px-2.5 py-1 rounded text-[11px] font-mono text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
            <span>Somnia Shannon</span>
            <span className="text-gray-500 text-[10px]">50312</span>
          </div>
        )}

        {/* Claim Winnings */}
        {onClaimAll && (
          <button
            onClick={onClaimAll}
            disabled={isClaiming}
            className="flex items-center gap-1 bg-violet-900/30 border border-violet-600/40 hover:bg-violet-800/40 text-violet-300 text-xs px-2.5 py-1 rounded transition disabled:opacity-50 font-mono"
            title="Sweep & Claim Settled Positions"
          >
            <Coins className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isClaiming ? "Sweeping..." : "Sweep"}</span>
          </button>
        )}

        {/* Wallet Connect / Account Button */}
        {isConnected ? (
          <button
            onClick={handleWalletClick}
            className="bg-[#181824] hover:bg-[#202030] border border-violet-500/40 hover:border-violet-500/70 text-violet-300 text-xs font-mono px-3 py-1 rounded flex items-center gap-2 transition shadow-[0_0_12px_rgba(124,58,237,0.2)]"
            title="Manage Connected Wallet"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{shortAddr}</span>
            {wallet.balance !== null && (
              <span className="hidden lg:inline text-gray-400 text-[10px] pl-1.5 border-l border-[#2A2A3D]">
                {wallet.balance} STT
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={handleWalletClick}
            className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-3.5 py-1.5 rounded transition shadow-sm shadow-violet-600/30 font-mono flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Connect Wallet</span>
          </button>
        )}

        {/* Settings button */}
        <button
          className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-[#1A1A24] rounded border border-transparent hover:border-[#2A2A3D] transition"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-gray-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-12 left-0 right-0 bg-[#111118] border-b border-[#2A2A3D] p-3 flex flex-col gap-2 md:hidden z-50">
          <div className="flex items-center justify-between pb-2 border-b border-[#2A2A3D]/40 font-mono text-xs">
            <span className="text-gray-400">Network: Somnia Shannon (50312)</span>
            {isConnected && wallet.balance && (
              <span className="text-violet-300 font-bold">{wallet.balance} STT</span>
            )}
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 text-left text-xs font-medium rounded ${
                activeTab === tab.id
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-gray-400 hover:bg-[#1A1A24]"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {!isConnected && (
            <button
              onClick={() => {
                handleWalletClick();
                setMobileMenuOpen(false);
              }}
              className="mt-1 w-full py-2 bg-violet-600 text-white rounded font-mono text-xs font-bold"
            >
              Connect MetaMask
            </button>
          )}
        </div>
      )}
    </header>
  );
};
export default Header;
