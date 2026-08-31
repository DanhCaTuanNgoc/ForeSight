import React, { useState } from "react";
import { Award, Wallet, CheckCircle2, Clock, Coins, ArrowUpRight, TrendingUp, ShieldAlert } from "lucide-react";
import { PositionsTable } from "./PositionsTable.js";
import { ActivityTable, type PositionRecord } from "./ActivityTable.js";

interface ActivityViewProps {
  positions: any[];
  onClaimAll: () => void;
  isClaiming: boolean;
  onTradeNew: () => void;
  walletAddress?: string;
  walletBalance?: string;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  positions,
  onClaimAll,
  isClaiming,
  onTradeNew,
  walletAddress,
  walletBalance,
}) => {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "SETTLED">("ALL");

  const openPositions = positions.filter((p) => p.status === "OPEN");
  const settledPositions = positions.filter((p) => p.status === "SETTLED");

  const totalInvested = positions.reduce(
    (acc, p) => acc + (p.amount || 0) * (p.entryPrice || 0.5),
    0
  );

  const totalClaimable = settledPositions.reduce((acc, p) => {
    // Settled winner pays $1.00 per contract
    return acc + (p.amount || 0);
  }, 0);

  const filteredPositions =
    filter === "OPEN"
      ? openPositions
      : filter === "SETTLED"
      ? settledPositions
      : positions;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0F] text-[#E2E8F0] overflow-y-auto custom-scrollbar p-4 space-y-4">
      {/* ─── Top Portfolio Ribbon ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Total Invested
            </span>
            <span className="text-base font-bold font-mono text-white">
              ${totalInvested.toFixed(2)} USDC
            </span>
          </div>
          <div className="p-2 rounded bg-violet-600/10 border border-violet-500/30 text-violet-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Open Predictions
            </span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {openPositions.length} Contracts
            </span>
          </div>
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Settled & Claimable
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              ${totalClaimable.toFixed(2)} USDC
            </span>
          </div>
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Wallet Balance
            </span>
            <span className="text-base font-bold font-mono text-amber-300">
              {walletAddress ? (walletBalance ? `${walletBalance} STT` : "0.0000 STT") : "Not Connected"}
            </span>
          </div>
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ─── Action Ribbon & Filters ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E0E16] p-3 rounded-lg border border-[#222234]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {(["ALL", "OPEN", "SETTLED"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded font-bold transition ${
                filter === t
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-[#141420] text-gray-400 hover:text-white border border-[#222234]"
              }`}
            >
              {t === "ALL" && `All Positions (${positions.length})`}
              {t === "OPEN" && `Open (${openPositions.length})`}
              {t === "SETTLED" && `Settled (${settledPositions.length})`}
            </button>
          ))}
        </div>

        {/* Claim / Sweep Action */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={onClaimAll}
            disabled={isClaiming || settledPositions.length === 0}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center gap-1.5 transition disabled:opacity-40 shadow-sm"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{isClaiming ? "Redeeming Winnings..." : "Sweep & Claim All Winnings"}</span>
          </button>
          <button
            onClick={onTradeNew}
            className="px-3 py-1.5 bg-[#141420] hover:bg-[#1B1B2A] text-violet-300 border border-violet-500/40 rounded font-bold flex items-center gap-1 transition"
          >
            <span>+ Open New Position</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Positions Detailed Table ─────────────────────────────────── */}
      <div className="w-full">
        <PositionsTable
          positions={filteredPositions}
          onClaim={onClaimAll}
          isClaiming={isClaiming}
        />
      </div>

      {/* ─── Recent Execution Ledger ──────────────────────────────────── */}
      <div className="w-full">
        <ActivityTable
          positions={positions.map((p) => ({
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
          onClaim={onClaimAll}
          isClaiming={isClaiming}
        />
      </div>
    </div>
  );
};
export default ActivityView;
