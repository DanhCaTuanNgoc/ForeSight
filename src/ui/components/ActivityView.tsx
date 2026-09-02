import React, { useState } from "react";
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ExternalLink,
  Droplets,
  ShieldCheck,
} from "lucide-react";
import { PositionsTable } from "./PositionsTable.js";
import { ActivityTable } from "./ActivityTable.js";
import { useWallet } from "../context/WalletContext.js";

interface ActivityViewProps {
  positions: any[];
  onClaimAll: () => void;
  isClaiming: boolean;
  onTradeNew: () => void;
  walletAddress?: string;
  walletBalance?: string;
  onEarlyExit?: (positionId: string, exitPrice?: number) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  positions,
  onClaimAll,
  isClaiming,
  onTradeNew,
  walletAddress: propAddress,
  walletBalance: propBalance,
  onEarlyExit,
}) => {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "SETTLED">("ALL");
  const wallet = useWallet();

  const activeAddress = wallet.address || propAddress;
  const activeBalance = wallet.balance || propBalance;
  const isConnected = Boolean(activeAddress);

  // Strictly filter positions belonging to connected wallet only (clean phantom guest data)
  const userPositions = isConnected
    ? positions.filter(
        (p) => p.walletAddress && activeAddress && p.walletAddress.toLowerCase() === activeAddress.toLowerCase()
      )
    : [];

  const openPositions = userPositions.filter((p) => p.status === "OPEN");
  const settledPositions = userPositions.filter((p) => p.status === "SETTLED" || p.status === "RESOLVED");

  const totalInvested = userPositions.reduce(
    (acc, p) => acc + (p.amount || 0) * (p.entryPrice || 0.5),
    0
  );

  const totalClaimable = settledPositions.reduce((acc, p) => {
    // Settled winning contracts pay $1.00 per share
    return acc + (p.amount || 0);
  }, 0);

  const filteredPositions =
    filter === "OPEN"
      ? openPositions
      : filter === "SETTLED"
      ? settledPositions
      : userPositions;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0F] text-[#E2E8F0] overflow-y-auto custom-scrollbar p-4 space-y-4 font-mono">
      {/* ─── CYPHERPUNK LUXURY HEADER: STREAMLINED & MINIMAL ─────────── */}
      <div className="w-full flex-shrink-0 px-4 py-3 rounded-xl bg-[#09090F] border border-[#1C1C28] flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Cypher Identity & Network */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#12121C] border border-[#222234] flex items-center justify-center text-violet-400 flex-shrink-0">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white tracking-wider">
              PORTFOLIO
            </span>
            <span className="text-[10px] text-gray-500 font-normal">
              //
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Somnia Shannon
            </span>
            <span className="text-gray-600 text-[10px]">•</span>
            {isConnected ? (
              <span className="text-gray-300 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>{wallet.shortAddress || (activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : "")}</span>
              </span>
            ) : (
              <button
                onClick={wallet.openWalletModal}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer text-[11px]"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Center: High-Definition Cypher Ticker Matrix */}
        <div className="flex items-center gap-4 sm:gap-7 bg-[#05050A] border border-[#1E1E2C] px-5 py-2 rounded-xl shadow-inner">
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-widest font-semibold">
              Invested
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-white tracking-tight block">
              ${totalInvested.toFixed(2)}
            </span>
          </div>
          <div className="w-px h-7 bg-[#1F1F30]" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-widest font-semibold">
              In Flight
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-cyan-400 tracking-tight block">
              {openPositions.length}
            </span>
          </div>
          <div className="w-px h-7 bg-[#1F1F30]" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-widest font-semibold">
              Claimable
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-400 tracking-tight block">
              ${totalClaimable.toFixed(2)}
            </span>
          </div>
          <div className="w-px h-7 bg-[#1F1F30]" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 block uppercase font-mono tracking-widest font-semibold">
              STT Gas
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-amber-300 tracking-tight block">
              {isConnected ? (activeBalance ? `${activeBalance} STT` : "0.0000 STT") : "—"}
            </span>
          </div>
        </div>

        {/* Right: Low-profile Cypher Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://testnet.somnia.network/"
            target="_blank"
            rel="noopener noreferrer"
            title="Claim free testnet STT tokens for gas fees"
            className="px-2.5 py-1 rounded-lg bg-[#11111A] border border-[#222234] hover:border-amber-500/50 text-gray-300 hover:text-amber-300 flex items-center gap-1.5 transition text-[11px]"
          >
            <Droplets className="w-3 h-3 text-amber-400" />
            <span>Faucet ↗</span>
          </a>

          {activeAddress && (
            <a
              href={`https://shannon-explorer.somnia.network/address/${activeAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View on Somnia Shannon Explorer"
              className="p-1.5 rounded-lg bg-[#11111A] border border-[#222234] hover:border-violet-500/50 text-gray-400 hover:text-white transition"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={onTradeNew}
            className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm cursor-pointer"
          >
            <span>+ Trade</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ─── 3. ACTION CONTROLS & FILTER PILLS ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E0E18] p-3 rounded-xl border border-[#222238]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          {(["ALL", "OPEN", "SETTLED"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filter === t
                  ? "bg-violet-600 text-white shadow-md border border-violet-400 scale-[1.02]"
                  : "bg-[#141422] text-gray-400 hover:text-white border border-[#252538]"
              }`}
            >
              {t === "ALL" && `All Positions (${userPositions.length})`}
              {t === "OPEN" && `In Flight (${openPositions.length})`}
              {t === "SETTLED" && `Settled (${settledPositions.length})`}
            </button>
          ))}
        </div>

        {/* Claim / Sweep Action Button */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onClaimAll}
            disabled={isClaiming || settledPositions.length === 0}
            title={
              settledPositions.length === 0
                ? "No settled payouts available yet. Contracts must reach round expiry to be claimed."
                : `Sweep and redeem ${settledPositions.length} winning contract(s) directly to your wallet`
            }
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow-md ${
              settledPositions.length > 0
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer"
                : "bg-[#141420] text-gray-500 border border-[#252538] cursor-not-allowed opacity-50"
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>
              {isClaiming
                ? "Redeeming On-Chain..."
                : settledPositions.length > 0
                ? `Sweep & Claim Payouts (${settledPositions.length})`
                : "No Settled Payouts Yet"}
            </span>
          </button>
        </div>
      </div>

      {/* ─── 4. DETAILED POSITIONS TABLE (VERIFIABLE ON-CHAIN DATA) ──────── */}
      <div className="w-full">
        <PositionsTable
          positions={filteredPositions}
          onClaim={onClaimAll}
          isClaiming={isClaiming}
          onEarlyExit={onEarlyExit}
        />
      </div>

      {/* ─── 5. RECENT ON-CHAIN EXECUTION LEDGER ───────────────────────────── */}
      <div className="w-full">
        <ActivityTable
          positions={userPositions.map((p) => ({
            id: p.id,
            symbol: p.symbol,
            outcome: p.outcome,
            amount: p.amount,
            entryPrice: p.entryPrice,
            timestamp: p.timestamp || Date.now(),
            status: p.status,
            orderId: p.orderId,
            txHash: p.txHash,
            isLiveOnChain: p.isLiveOnChain,
          }))}
        />
      </div>
    </div>
  );
};

export default ActivityView;
