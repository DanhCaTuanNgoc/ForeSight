import React, { useState } from "react";
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ExternalLink,
  Droplets,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { PositionsTable } from "./PositionsTable.js";
import { ActivityTable } from "./ActivityTable.js";
import { AlphaCardModal } from "./AlphaCardModal.js";
import { useWallet } from "../context/WalletContext.js";
import { sound } from "../utils/sound-fx.js";

interface ActivityViewProps {
  positions: any[];
  publicPositions?: any[];
  onClaimAll: () => void;
  isClaiming: boolean;
  onTradeNew: () => void;
  walletAddress?: string;
  walletBalance?: string;
  onEarlyExit?: (positionId: string, exitPrice?: number) => void;
  onResetPositions?: () => void;
}

export function parseExpiryFromSymbol(sym?: string, createdAtMs?: number): number | null {
  if (!sym) return null;
  // 1. Format: DDMMMYY-HHMM (e.g. 09SEP26-1640)
  const m1 = sym.match(/(\d{2})([A-Z]{3})(\d{2})-(\d{2})(\d{2})/);
  if (m1) {
    const [_, day, mon, yr, hr, min] = m1;
    const months: Record<string, number> = {
      JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
      JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
    };
    const month = months[mon];
    if (month !== undefined) {
      const year = 2000 + parseInt(yr, 10);
      return Math.floor(Date.UTC(year, month, parseInt(day, 10), parseInt(hr, 10), parseInt(min, 10)) / 1000);
    }
  }
  // 2. Format: DDMMMYY (e.g. 10SEP26)
  const m2 = sym.match(/(\d{2})([A-Z]{3})(\d{2})/);
  if (m2) {
    const [_, day, mon, yr] = m2;
    const months: Record<string, number> = {
      JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
      JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
    };
    const month = months[mon];
    if (month !== undefined) {
      const year = 2000 + parseInt(yr, 10);
      return Math.floor(Date.UTC(year, month, parseInt(day, 10), 23, 59, 59) / 1000);
    }
  }
  // 3. Cadence format: 15M, 1H
  if (sym.includes("-15M-") && createdAtMs) {
    return Math.floor(createdAtMs / 1000) + 900;
  }
  if (sym.includes("-1H-") && createdAtMs) {
    return Math.floor(createdAtMs / 1000) + 3600;
  }
  return null;
}

export function isPositionExpired(pos: any, nowSec = Math.floor(Date.now() / 1000)): boolean {
  if (!pos) return false;
  if (
    pos.status === "SETTLED" ||
    pos.status === "RESOLVED" ||
    pos.status === "CLAIMED" ||
    pos.status === "CLOSED" ||
    pos.status === "REFUNDED"
  ) {
    return true;
  }
  if (pos.expirationTime && pos.expirationTime > 0) {
    return nowSec >= pos.expirationTime;
  }
  const parsed = parseExpiryFromSymbol(pos.symbol, pos.timestamp);
  if (parsed && parsed > 0) {
    return nowSec >= parsed;
  }
  if (pos.timestamp && (nowSec - Math.floor(pos.timestamp / 1000)) > 900) {
    return true;
  }
  return false;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  positions,
  publicPositions = [],
  onClaimAll,
  isClaiming,
  onTradeNew,
  walletAddress: propAddress,
  walletBalance: propBalance,
  onEarlyExit,
  onResetPositions,
}) => {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "SETTLED">("ALL");
  const [showAlphaCard, setShowAlphaCard] = useState<boolean>(false);
  const [cardPosition, setCardPosition] = useState<any | null>(null);
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

  // Dynamic settlement evaluation: Distinguish OPEN, RESTING, RESOLVING, SETTLED_WIN, SETTLED_LOSS, and REFUNDED
  const nowSec = Math.floor(Date.now() / 1000);
  const enrichedPositions = userPositions.map((p) => {
    const expired = isPositionExpired(p, nowSec);
    let effectiveStatus = p.status;
    if (p.status === "CLAIMED") {
      effectiveStatus = "CLAIMED";
    } else if (p.status === "CLOSED") {
      effectiveStatus = "CLOSED";
    } else if (p.status === "REFUNDED") {
      effectiveStatus = "REFUNDED";
    } else if (p.status === "RESTING" || p.status === "PENDING") {
      effectiveStatus = "RESTING";
    } else if (p.status === "SETTLED_WIN" || p.status === "SETTLED_LOSS" || p.status === "RESOLVING") {
      effectiveStatus = p.status;
    } else if (expired) {
      if (p.isWinner === true) effectiveStatus = "SETTLED_WIN";
      else if (p.isWinner === false) effectiveStatus = "SETTLED_LOSS";
      else effectiveStatus = "RESOLVING"; // Awaiting oracle resolution
    } else {
      effectiveStatus = "OPEN";
    }

    return {
      ...p,
      status: effectiveStatus,
      isExpired: expired,
    };
  });

  const openPositions = enrichedPositions.filter((p) => p.status === "OPEN" || p.status === "RESTING");
  const claimablePositions = enrichedPositions.filter((p) => p.status === "SETTLED_WIN" || (p.status === "SETTLED" && p.isWinner === true));
  const settledPositions = enrichedPositions.filter(
    (p) =>
      p.status === "SETTLED_WIN" ||
      p.status === "SETTLED_LOSS" ||
      p.status === "CLAIMED" ||
      p.status === "RESOLVING" ||
      p.status === "SETTLED" ||
      p.status === "RESOLVED" ||
      p.status === "REFUNDED" ||
      p.status === "CLOSED"
  );

  const totalInvested = enrichedPositions.reduce(
    (acc, p) => acc + (p.amount || 0) * (p.entryPrice || 0.5),
    0
  );

  const totalClaimable = claimablePositions.reduce((acc, p) => {
    // Settled winning contracts pay $1.00 per share
    return acc + (p.amount || 0);
  }, 0);

  const filteredPositions =
    filter === "OPEN"
      ? openPositions
      : filter === "SETTLED"
      ? settledPositions
      : enrichedPositions;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#07070B] text-[#E2E8F0] overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3 font-mono">
      {/* ─── 1. TOP PORTFOLIO STATS & WALLET BAR ─────────── */}
      <div className="w-full flex-shrink-0 px-3.5 py-2.5 rounded-none bg-[#0A0A12] border border-white/[0.08] flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Identity & Network */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-none bg-[#12121C] border border-white/[0.08] flex items-center justify-center text-violet-300 flex-shrink-0">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white tracking-wider uppercase">
              PORTFOLIO
            </span>
            <span className="text-[10px] text-gray-500 font-normal font-mono">
              //
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Somnia Shannon
            </span>
            <span className="text-gray-600 text-[10px]">•</span>
            {isConnected ? (
              <span className="text-gray-300 flex items-center gap-1 text-[11px] font-mono">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>{wallet.shortAddress || (activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : "")}</span>
              </span>
            ) : (
              <button
                onClick={wallet.openWalletModal}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer text-[11px] font-mono"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Center: High-Definition Ticker Matrix */}
        <div className="flex items-center gap-3 sm:gap-6 bg-[#0E0E17] border border-white/[0.08] px-4 py-1.5 rounded-none shadow-inner">
          <div className="space-y-0.5">
            <span className="text-[9px] text-gray-400 block uppercase font-mono tracking-wider">
              Invested
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-white tracking-tight block">
              ${totalInvested.toFixed(2)}
            </span>
          </div>
          <div className="w-px h-6 bg-white/[0.08]" />
          <div className="space-y-0.5">
            <span className="text-[9px] text-gray-400 block uppercase font-mono tracking-wider">
              In Flight
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-cyan-400 tracking-tight block">
              {openPositions.length}
            </span>
          </div>
          <div className="w-px h-6 bg-white/[0.08]" />
          <div className="space-y-0.5">
            <span className="text-[9px] text-gray-400 block uppercase font-mono tracking-wider">
              Claimable
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 tracking-tight block">
              ${totalClaimable.toFixed(2)}
            </span>
          </div>
          <div className="w-px h-6 bg-white/[0.08]" />
          <div className="space-y-0.5">
            <span className="text-[9px] text-gray-400 block uppercase font-mono tracking-wider">
              tUSDC Wallet
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-300 tracking-tight block">
              {isConnected ? (wallet.tusdcBalance ? `${wallet.tusdcBalance} tUSDC` : "0.00 tUSDC") : "—"}
            </span>
          </div>
          <div className="w-px h-6 bg-white/[0.08]" />
          <div className="space-y-0.5">
            <span className="text-[9px] text-gray-400 block uppercase font-mono tracking-wider">
              STT Gas
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-amber-300 tracking-tight block">
              {isConnected ? (activeBalance ? `${activeBalance} STT` : "0.0000 STT") : "—"}
            </span>
          </div>
        </div>

        {/* Right: Low-profile Actions */}
        <div className="flex items-center gap-1.5">
          <a
            href="https://testnet.somnia.network/"
            target="_blank"
            rel="noopener noreferrer"
            title="Claim free testnet STT tokens for gas fees"
            className="px-2.5 py-1 rounded-none bg-[#0E0E17] border border-white/[0.08] hover:border-amber-500/50 text-gray-300 hover:text-amber-300 flex items-center gap-1.5 transition-colors text-[10px] font-mono"
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
              className="p-1.5 rounded-none bg-[#0E0E17] border border-white/[0.08] hover:border-violet-500/50 text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={onTradeNew}
            className="px-2.5 py-1 rounded-none bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors border border-violet-400/40 cursor-pointer font-mono"
          >
            <span>+ TRADE</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ─── 2. ACTION CONTROLS & FILTER PILLS ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#0A0A12] p-2.5 rounded-none border border-white/[0.08]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-xs font-mono">
          {(["ALL", "OPEN", "SETTLED"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2.5 py-1 text-xs font-bold rounded-none transition-colors cursor-pointer border ${
                filter === t
                  ? "bg-violet-600/30 text-violet-300 border-violet-500/50"
                  : "bg-[#0E0E17] text-gray-400 hover:text-white border-white/[0.06] hover:bg-[#12121C]"
              }`}
            >
              {t === "ALL" && `ALL (${userPositions.length})`}
              {t === "OPEN" && `IN FLIGHT (${openPositions.length})`}
              {t === "SETTLED" && `SETTLED (${settledPositions.length})`}
            </button>
          ))}
        </div>

        {/* Claim / Sweep Action Button */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={onClaimAll}
            disabled={isClaiming || claimablePositions.length === 0}
            title={
              claimablePositions.length === 0
                ? "No winning payouts ready to claim. Contracts that expired with a loss have $0 payout."
                : `Sweep and redeem ${claimablePositions.length} winning contract(s) directly to your wallet`
            }
            className={`px-3 py-1.5 rounded-none font-bold text-xs flex items-center gap-1.5 transition-colors border ${
              claimablePositions.length > 0
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 cursor-pointer"
                : "bg-[#0E0E17] text-gray-500 border-white/[0.06] cursor-not-allowed opacity-50"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isClaiming
                ? "CLAIMING ON-CHAIN..."
                : claimablePositions.length > 0
                ? `CLAIM PAYOUTS (${claimablePositions.length})`
                : "NO CLAIMABLE PAYOUTS"}
            </span>
          </button>

          {onResetPositions && userPositions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Clear all recorded positions from ledger memory?")) {
                  onResetPositions();
                }
              }}
              title="Clear all recorded test positions from ledger"
              className="px-2.5 py-1.5 rounded-none font-bold text-xs flex items-center gap-1.5 transition-colors border bg-[#0E0E17] hover:bg-rose-950/40 text-gray-400 hover:text-rose-300 border-white/[0.08] hover:border-rose-500/40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>CLEAR LEDGER</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 3. DETAILED POSITIONS TABLE (VERIFIABLE ON-CHAIN DATA) ──────── */}
      <div className="w-full">
        <PositionsTable
          positions={filteredPositions}
          onClaim={onClaimAll}
          isClaiming={isClaiming}
          onShareAlphaCard={(pos) => {
            sound.playClick();
            setCardPosition(pos);
            setShowAlphaCard(true);
          }}
        />
      </div>

      {/* ─── 4. RECENT ON-CHAIN EXECUTION LEDGER ───────────────────────────── */}
      <div className="w-full">
        {(() => {
          const ledgerList = publicPositions && publicPositions.length > 0 ? publicPositions : enrichedPositions;
          return (
            <ActivityTable
              positions={ledgerList.map((p) => ({
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
                isWinner: p.isWinner,
              }))}
            />
          );
        })()}
      </div>

      {/* ─── 5. SETTLED / IN-FLIGHT ALPHA CARD MODAL ───────────────────────── */}
      {showAlphaCard && cardPosition && (
        <AlphaCardModal
          isOpen={showAlphaCard}
          onClose={() => {
            setShowAlphaCard(false);
            setCardPosition(null);
          }}
          mode="SETTLED"
          position={cardPosition}
          assetName={cardPosition.symbol}
        />
      )}
    </div>
  );
};

export default ActivityView;
