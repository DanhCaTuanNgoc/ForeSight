import React from "react";
import { Coins, Activity } from "lucide-react";

export interface PositionRecord {
  id: string;
  symbol: string;
  outcome: string;
  amount: number;
  entryPrice: number;
  timestamp: number;
  status: "OPEN" | "SETTLED";
}

interface ActivityTableProps {
  positions?: PositionRecord[];
  onClaim?: () => void;
  isClaiming?: boolean;
}

const DEFAULT_ACTIVITY: PositionRecord[] = [
  {
    id: "p1",
    symbol: "BTC-0-26AUG26",
    outcome: "YES",
    amount: 25,
    entryPrice: 0.62,
    timestamp: Date.now() - 120000,
    status: "OPEN",
  },
  {
    id: "p2",
    symbol: "ETH-0-26AUG26",
    outcome: "NO",
    amount: 10,
    entryPrice: 0.38,
    timestamp: Date.now() - 300000,
    status: "SETTLED",
  },
  {
    id: "p3",
    symbol: "SOL-0-26AUG26",
    outcome: "YES",
    amount: 50,
    entryPrice: 0.55,
    timestamp: Date.now() - 720000,
    status: "SETTLED",
  },
];

export const ActivityTable: React.FC<ActivityTableProps> = ({
  positions = [],
  onClaim,
  isClaiming = false,
}) => {
  const list = positions.length > 0 ? positions : DEFAULT_ACTIVITY;

  return (
    <div className="panel rounded-[4px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2A2A3D]">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span className="stat-label">RECENT ACTIVITY</span>
        </div>
        {onClaim && (
          <button
            onClick={onClaim}
            disabled={isClaiming}
            className="flex items-center gap-1 text-[11px] font-mono font-medium text-violet-400 border border-violet-600/40 hover:border-violet-400 hover:bg-violet-600/10 px-2.5 py-0.5 rounded transition disabled:opacity-50"
          >
            <Coins className="w-3 h-3" />
            <span>{isClaiming ? "Claiming..." : "Sweep & Claim"}</span>
          </button>
        )}
      </div>

      {/* Table Header */}
      <div
        className="grid px-3 py-1.5 border-b border-[#2A2A3D]/40 text-[10px] text-gray-500 font-sans uppercase font-medium bg-[#111118]"
        style={{ gridTemplateColumns: "70px 1fr 55px 70px 65px" }}
      >
        <span>TIME</span>
        <span>MARKET</span>
        <span>SIDE</span>
        <span>ENTRY</span>
        <span className="text-right">STATUS</span>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto max-h-[220px]">
        {list.slice(0, 8).map((pos) => {
          const d = new Date(pos.timestamp);
          const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
          ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

          return (
            <div
              key={pos.id}
              className="grid px-3 py-2 border-b border-[#2A2A3D]/20 hover:bg-[#1C1C28]/60 transition-colors text-xs font-mono items-center"
              style={{ gridTemplateColumns: "70px 1fr 55px 70px 65px" }}
            >
              <span className="text-gray-500 text-[11px]">{timeStr}</span>
              <span className="text-gray-300 font-medium truncate pr-2">
                {pos.symbol}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded w-fit ${
                  pos.outcome === "YES"
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-700/40"
                    : "bg-rose-950/60 text-rose-400 border border-rose-700/40"
                }`}
              >
                {pos.outcome}
              </span>
              <span className="text-gray-300">
                ${pos.entryPrice ? pos.entryPrice.toFixed(3) : "0.500"}
              </span>
              <span
                className={`text-right text-[10px] font-semibold ${
                  pos.status === "OPEN" ? "text-violet-400" : "text-gray-500"
                }`}
              >
                {pos.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ActivityTable;
