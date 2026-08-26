import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Coins,
  ChevronUp,
  ChevronDown,
  Activity,
  Gauge,
  Sparkles,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";

export interface PositionRecord {
  id: string;
  symbol: string;
  outcome: string;
  amount: number;
  entryPrice: number;
  timestamp: number;
  status: "OPEN" | "SETTLED";
}

interface ThesisHealthMonitorProps {
  positions: PositionRecord[];
  onClaimAll: () => void;
  isClaiming: boolean;
  activeSymbol: string;
}

export const ThesisHealthMonitor: React.FC<ThesisHealthMonitorProps> = ({
  positions = [],
  onClaimAll,
  isClaiming = false,
  activeSymbol = "BTC",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const openPositions = positions.filter((p) => p.status === "OPEN");
  const settledPositions = positions.filter((p) => p.status === "SETTLED");
  const activePos = openPositions[0] || null;

  // Mocked quantitative health metrics for live position
  const thesisScore = 84;
  const observedVelocity = "+0.041%/m";
  const velocityRatio = "1.28× Req";
  const timeRemaining = "19m";
  const breakLevel = activePos?.outcome === "YES" ? "$108,800" : "$110,200";

  const handleClaim = () => {
    sound.playSuccessChime();
    onClaimAll();
  };

  return (
    <footer className="bg-[#0B0B12] border-t border-[#222234] z-30 font-mono flex flex-col flex-shrink-0">
      {/* ─── Compact Top Dock Bar (Always visible) ──────────────────── */}
      <div className="h-11 px-4 flex items-center justify-between text-xs">
        {/* Left: Active Position & Live Thesis Health Status */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-gray-300 hidden sm:inline">LIVE THESIS MONITOR</span>
          </div>

          <div className="h-4 w-px bg-[#26263B] hidden sm:block shrink-0" />

          {activePos ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="font-bold text-white text-[11px] truncate">
                {activePos.symbol}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  activePos.outcome === "YES"
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/50"
                    : "bg-rose-950/80 text-rose-400 border border-rose-500/50"
                }`}
              >
                {activePos.outcome} {activePos.amount}x @ ${activePos.entryPrice.toFixed(2)}
              </span>

              {/* Thesis Health Pill */}
              <div className="hidden md:flex items-center gap-1.5 bg-[#141822] border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] text-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="font-bold">Health: {thesisScore}% Valid</span>
              </div>

              {/* Velocity Coverage */}
              <div className="hidden lg:flex items-center gap-1 bg-[#141420] border border-[#2A2A3D] px-2 py-0.5 rounded text-[10px] text-gray-300">
                <Gauge className="w-3 h-3 text-violet-400" />
                <span>Pace: {observedVelocity} ({velocityRatio})</span>
              </div>

              {/* Time Remaining */}
              <div className="hidden xl:flex items-center gap-1 bg-[#141420] border border-[#2A2A3D] px-2 py-0.5 rounded text-[10px] text-amber-300">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{timeRemaining} to Expiry</span>
              </div>

              {/* Invalidation Trigger */}
              <div className="hidden 2xl:flex items-center gap-1 text-[10px] text-rose-300/90">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Invalidation: Spot &lt; {breakLevel}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <span className="text-gray-500">No active positions.</span>
              <span className="text-violet-300 hidden sm:inline">
                {activeSymbol} Momentum: <b>+0.041%/m</b> (Sufficient for YES strike)
              </span>
            </div>
          )}
        </div>

        {/* Right: Sweeper & Drawer Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {settledPositions.length > 0 && (
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded hidden sm:inline">
              {settledPositions.length} Settled Ready
            </span>
          )}

          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-violet-950/80 hover:bg-violet-900 border border-violet-500/40 text-violet-300 hover:text-white font-bold text-[11px] transition shadow-[0_0_10px_rgba(124,58,237,0.3)] disabled:opacity-50"
            title="Auto-Claim Winnings on Somnia"
          >
            <Coins className="w-3.5 h-3.5 text-violet-400" />
            <span>{isClaiming ? "Claiming..." : "Sweep All Winnings"}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1A1A28] border border-[#232336] transition flex items-center gap-1 text-[10px]"
            title="Toggle Full Activity History"
          >
            <span>{positions.length} Orders</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ─── Expandable Full Position Drawer ───────────────────────── */}
      {isExpanded && (
        <div className="border-t border-[#232336] p-3 max-h-48 overflow-y-auto bg-[#09090F] animate-fadeIn">
          {positions.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-xs">
              No orders logged yet. Submit a prediction in the simulator above!
            </div>
          ) : (
            <div className="divide-y divide-[#1F1F2E] text-[11px]">
              {positions.map((pos) => {
                const isYes = pos.outcome === "YES";
                const dateStr = new Date(pos.timestamp).toLocaleTimeString();
                return (
                  <div
                    key={pos.id}
                    className="py-1.5 flex items-center justify-between hover:bg-[#13131F] px-2 rounded transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-gray-500 text-[10px]">{dateStr}</span>
                      <span className="text-white font-bold">{pos.symbol}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isYes
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                            : "bg-rose-950 text-rose-400 border border-rose-500/40"
                        }`}
                      >
                        {pos.outcome}
                      </span>
                      <span className="text-gray-300">{pos.amount} Contracts</span>
                      <span className="text-gray-400">@ ${pos.entryPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold ${
                          pos.status === "OPEN" ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {pos.status === "OPEN" ? "● In Flight" : "✓ Settled"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </footer>
  );
};
export default ThesisHealthMonitor;
