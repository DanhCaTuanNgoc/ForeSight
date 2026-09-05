import React from "react";
import { Settings, Menu, X, Wallet, AlertCircle } from "lucide-react";
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
    { id: "activity", label: "Portfolio" },
  ];

  return (
    <header className="sticky top-0 z-50 h-12 bg-[#08080E] border-b border-white/[0.07] px-3.5 flex items-center justify-between flex-shrink-0">
      {/* Left: Brand / Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onTabChange("landing")}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity text-left group cursor-pointer"
        >
          <ForeSightLogo size={34} animated={false} />
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-sm text-white tracking-widest group-hover:text-violet-300 transition-colors">
              FORESIGHT
            </span>
            <span className="text-[9px] font-mono text-violet-300 bg-violet-950/50 border border-violet-500/30 px-1 py-0.2 rounded-none font-bold">
              TERMINAL
            </span>
          </div>
        </button>
        <div className="flex items-center gap-1.5 pl-2.5 border-l border-white/[0.07]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] text-gray-400 font-mono hidden sm:inline-block">LIVE</span>
        </div>
      </div>

      {/* Center: Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1 text-xs font-mono rounded-none transition-colors cursor-pointer ${
                isActive
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/40 font-semibold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#12121C] border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Actions & Wallet */}
      <div className="flex items-center gap-2">
        {/* Network Badge */}
        {isWrongNetwork ? (
          <button
            onClick={() => wallet.switchToSomnia()}
            className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/50 hover:bg-rose-900/90 text-rose-300 px-2.5 py-1 rounded-none text-[11px] font-mono transition animate-pulse cursor-pointer"
            title="Switch to Somnia Testnet (50312)"
          >
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Switch Network</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 bg-[#0E0E17] border border-white/[0.07] px-2 py-1 rounded-none text-[10px] font-mono text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
            <span>Somnia Shannon</span>
            <span className="text-gray-500 text-[9px]">50312</span>
          </div>
        )}

        {/* Wallet Connect / Account Button */}
        {isConnected ? (
          <button
            onClick={handleWalletClick}
            className="bg-[#0E0E17] hover:bg-[#141420] border border-white/[0.08] text-gray-200 text-xs font-mono px-2.5 py-1 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Manage Connected Wallet"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{shortAddr}</span>
            {wallet.balance !== null && (
              <span className="hidden lg:inline text-gray-400 text-[10px] pl-1.5 border-l border-white/[0.07]">
                {wallet.balance} STT
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={handleWalletClick}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 py-1 rounded-none transition-colors font-mono font-bold flex items-center gap-1.5 border border-violet-400/30 cursor-pointer"
          >
            <Wallet className="w-3 h-3" />
            <span>Connect Wallet</span>
          </button>
        )}

        {/* Settings button */}
        <button
          className="p-1 text-gray-400 hover:text-gray-200 hover:bg-[#12121C] rounded-none border border-transparent hover:border-white/[0.07] transition-colors"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1 text-gray-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-12 left-0 right-0 bg-[#0A0A12] border-b border-white/[0.08] p-3 flex flex-col gap-2 md:hidden z-50">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] font-mono text-xs">
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
              className={`px-3 py-2 text-left text-xs font-mono rounded-none ${
                activeTab === tab.id
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-gray-400 hover:bg-[#161622]"
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
              className="mt-1 w-full py-2 bg-violet-600 text-white rounded-none font-mono text-xs font-bold"
            >
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </header>
  );
};
export default Header;
