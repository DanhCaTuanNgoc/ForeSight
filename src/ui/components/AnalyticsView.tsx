import React, { useState } from "react";
import { BarChart3, TrendingUp, Zap, Activity, Layers, ArrowUpRight } from "lucide-react";
import { Heatmap } from "./Heatmap.js";
import { DepthChart } from "./DepthChart.js";
import { EventTimeline } from "./EventTimeline.js";
import { CryptoIcon } from "./CryptoIcon.js";

interface AnalyticsViewProps {
  markets: any[];
  onSelectMarket: (symbol: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  markets,
  onSelectMarket,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    markets[0]?.underlyingAsset || markets[0]?.symbol || "BTC"
  );

  const activeMarket = markets.find(
    (m) => (m.underlyingAsset || m.symbol) === selectedSymbol
  ) || markets[0];

  const totalVolume = markets.reduce(
    (acc, m) => acc + (m.volume24h || 125000),
    0
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0F] text-[#E2E8F0] overflow-y-auto custom-scrollbar p-4 space-y-4">
      {/* ─── Top Stats Ribbon ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              24H CLOB Volume
            </span>
            <span className="text-base font-bold font-mono text-white">
              ${(totalVolume / 1000).toFixed(1)}K USDC
            </span>
          </div>
          <div className="p-2 rounded bg-violet-600/10 border border-violet-500/30 text-violet-400">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Active Contracts
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {markets.length} Live Pairs
            </span>
          </div>
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Selected Market
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CryptoIcon symbol={selectedSymbol} size={18} />
              <span className="text-base font-bold font-mono text-violet-300">
                {selectedSymbol}/tUSDC
              </span>
            </div>
          </div>
          <div className="p-2 rounded bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Shannon Sub-Second Latency
            </span>
            <span className="text-base font-bold font-mono text-cyan-400">
              ~15ms Fast Path
            </span>
          </div>
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ─── Market Selector Bar ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <span className="text-xs text-gray-400 font-mono font-bold pr-2 flex items-center gap-1 flex-shrink-0">
          <Layers className="w-3.5 h-3.5 text-violet-400" /> Focus Market:
        </span>
        {markets.map((m) => {
          const sym = m.underlyingAsset || m.symbol;
          const isSelected = sym === selectedSymbol;
          return (
            <button
              key={m.id || sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                isSelected
                  ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)] border border-violet-400"
                  : "bg-[#111118] text-gray-400 hover:text-white border border-[#222234]"
              }`}
            >
              <CryptoIcon symbol={sym} size={15} />
              <span>{sym}</span>
              <span className={m.probability >= 50 ? "text-emerald-400 text-[10px]" : "text-rose-400 text-[10px]"}>
                {m.probability ? `${m.probability.toFixed(0)}%` : "50%"}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => onSelectMarket(selectedSymbol)}
          className="ml-auto px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded text-xs font-mono font-bold transition flex items-center gap-1 flex-shrink-0"
        >
          <span>Trade {selectedSymbol} in Terminal</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* ─── Main 2-Column Analytics Matrix ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Market Heatmap & Activity */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <Heatmap />
        </div>

        {/* Right: Live Orderbook Depth */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <DepthChart
            symbol={selectedSymbol}
            midPrice={activeMarket?.midPrice || 0.612}
          />
        </div>
      </div>

      {/* ─── Bottom: Comprehensive Event & Spike Timeline ─────────────── */}
      <div className="w-full">
        <EventTimeline symbol={selectedSymbol} />
      </div>
    </div>
  );
};
export default AnalyticsView;
