import React from "react";
import { Coins, Activity } from "lucide-react";
import { CryptoIcon } from "./CryptoIcon.js";

export interface PositionRecord {
  id: string;
  symbol: string;
  outcome: string;
  amount: number;
  entryPrice: number;
  timestamp: number;
  status: "OPEN" | "SETTLED" | "RESOLVED" | "CLAIMED" | "CLOSED" | string;
  orderId?: string;
  txHash?: string;
  isLiveOnChain?: boolean;
  walletAddress?: string;
  exitPrice?: number;
  realizedPnl?: number;
  realizedRoiPercent?: number;
}

interface ActivityTableProps {
  positions?: PositionRecord[];
  onClaim?: () => void;
  isClaiming?: boolean;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  positions = [],
  onClaim,
  isClaiming = false,
}) => {
  const list = positions;

  return (
    <div className="rounded-none bg-[#0A0A12] border border-white/[0.08] flex flex-col font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.08] bg-[#0E0E17]">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">RECENT ACTIVITY LOG</span>
        </div>
      </div>

      {/* Table Header */}
      <div
        className="grid px-3 py-1.5 border-b border-white/[0.08] text-[9px] text-gray-400 font-mono uppercase tracking-wider bg-[#0E0E17]"
        style={{ gridTemplateColumns: "80px 1fr 60px 75px 110px" }}
      >
        <span>TIME</span>
        <span>MARKET</span>
        <span>SIDE</span>
        <span>ENTRY</span>
        <span className="text-right whitespace-nowrap">STATUS</span>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto max-h-[220px]">
        {list.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-xs font-mono">
            No active on-chain positions recorded yet.
          </div>
        ) : (
          list.slice(0, 8).map((pos) => {
          const d = new Date(pos.timestamp);
          const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
          ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

          return (
            <div
              key={pos.id}
              className="grid px-3 py-2 border-b border-white/[0.04] hover:bg-[#12121C] transition-colors text-xs font-mono items-center"
              style={{ gridTemplateColumns: "80px 1fr 60px 75px 110px" }}
            >
              <span className="text-gray-400 text-[11px] font-mono">{timeStr}</span>
              <span className="text-gray-300 font-medium truncate pr-2 flex items-center gap-1.5">
                <CryptoIcon symbol={pos.symbol} size={14} />
                <span>{pos.symbol}</span>
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-none border w-fit ${
                  pos.outcome === "YES"
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                    : "bg-rose-950/60 text-rose-400 border-rose-500/40"
                }`}
              >
                {pos.outcome}
              </span>
              <span className="text-gray-300 font-mono">
                ${pos.entryPrice ? pos.entryPrice.toFixed(3) : "0.500"}
              </span>
              <span
                className={`text-right text-[9px] font-bold whitespace-nowrap flex items-center justify-end gap-1 ${
                  pos.status === "OPEN" ? "text-emerald-400" : "text-gray-500"
                }`}
                title={pos.orderId ? `Order: ${pos.orderId}` : undefined}
              >
                {pos.status === "OPEN" ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>IN FLIGHT</span>
                  </>
                ) : (
                  pos.status
                )}
              </span>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
export default ActivityTable;
