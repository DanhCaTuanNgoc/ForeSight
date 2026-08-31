import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Zap, Activity, Layers, ArrowUpRight } from "lucide-react";
import { Heatmap } from "./Heatmap.js";
import { DepthChart } from "./DepthChart.js";
import { EventTimeline } from "./EventTimeline.js";
import { CryptoIcon } from "./CryptoIcon.js";
import { sound } from "../utils/sound-fx.js";

interface AnalyticsViewProps {
  markets?: any[];
  onSelectMarket: (symbol: string) => void;
}

const DEFAULT_ANALYTICS_MARKETS = [
  { id: "btc-hourly-1", symbol: "BTC", underlyingAsset: "BTC", probability: 62.4, midPrice: 0.62, volume24h: 342900 },
  { id: "eth-hourly-1", symbol: "ETH", underlyingAsset: "ETH", probability: 45.1, midPrice: 0.45, volume24h: 189400 },
  { id: "sol-hourly-1", symbol: "SOL", underlyingAsset: "SOL", probability: 54.0, midPrice: 0.54, volume24h: 98150 },
  { id: "somi-hourly-1", symbol: "SOMI", underlyingAsset: "SOMI", probability: 73.8, midPrice: 0.735, volume24h: 51240 },
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  markets = [],
  onSelectMarket,
}) => {
  // Ensure we always have active markets to render even during initial loading or fallback
  const activeMarkets = markets && markets.length > 0 ? markets : DEFAULT_ANALYTICS_MARKETS;

  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    activeMarkets[0]?.underlyingAsset || activeMarkets[0]?.symbol || "BTC"
  );

  useEffect(() => {
    if (activeMarkets.length > 0 && !activeMarkets.some((m) => (m.underlyingAsset || m.symbol) === selectedSymbol)) {
      setSelectedSymbol(activeMarkets[0].underlyingAsset || activeMarkets[0].symbol || "BTC");
    }
  }, [activeMarkets, selectedSymbol]);

  const activeMarket =
    activeMarkets.find((m) => (m.underlyingAsset || m.symbol) === selectedSymbol) || activeMarkets[0];

  const totalVolume = activeMarkets.reduce(
    (acc, m) => acc + (m.volume24h || 125000),
    0
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0F] text-[#E2E8F0] overflow-y-auto custom-scrollbar p-4 space-y-4 font-mono">
      {/* ─── 1. Top Stats Ribbon ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        <div className="p-3.5 rounded-xl bg-[#0E0E16] border border-[#222234] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              24H CLOB Volume
            </span>
            <span className="text-base font-bold font-mono text-white">
              ${(totalVolume / 1000).toFixed(1)}K USDC
            </span>
          </div>
          <div className="p-2 rounded-lg bg-violet-600/10 border border-violet-500/30 text-violet-400">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0E0E16] border border-[#222234] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Active Contracts
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {activeMarkets.length} Live Pairs
            </span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0E0E16] border border-[#222234] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Selected Focus
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CryptoIcon symbol={selectedSymbol} size={18} />
              <span className="text-base font-bold font-mono text-violet-300">
                {selectedSymbol}/tUSDC
              </span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0E0E16] border border-[#222234] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Shannon Testnet
            </span>
            <span className="text-base font-bold font-mono text-cyan-400">
              ~15ms Sub-Second
            </span>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ─── 2. Dedicated Market Selector Bar (Always Guaranteed Visible) ──── */}
      <div className="w-full flex-shrink-0 p-2.5 rounded-xl bg-[#0E0E16] border border-[#222234] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar flex-1 min-w-0 py-0.5">
          <span className="text-xs text-gray-400 font-bold pr-1 flex items-center gap-1.5 flex-shrink-0">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Focus Market:</span>
          </span>

          {activeMarkets.map((m) => {
            const sym = m.underlyingAsset || m.symbol;
            const isSelected = sym === selectedSymbol;
            const prob = m.probability ?? 50;

            return (
              <button
                key={m.id || sym}
                onClick={() => {
                  sound.playClick();
                  setSelectedSymbol(sym);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-violet-600 text-white shadow-[0_0_14px_rgba(124,58,237,0.6)] border border-violet-400 scale-[1.02]"
                    : "bg-[#141420] text-gray-400 hover:text-white hover:bg-[#1C1C2C] border border-[#26263C]"
                }`}
              >
                <CryptoIcon symbol={sym} size={16} />
                <span>{sym}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                    prob >= 50
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-950/80 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {prob.toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onSelectMarket(selectedSymbol);
          }}
          className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm cursor-pointer ml-auto"
        >
          <span>Trade {selectedSymbol} in Terminal</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── 3. Main 2-Column Analytics Matrix (50/50 Balanced) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-shrink-0">
        {/* Left: Compact Market Heatmap (Clean & Focused 4-Grid) */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <Heatmap />
        </div>

        {/* Right: Live Orderbook Depth */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <DepthChart
            symbol={selectedSymbol}
            midPrice={activeMarket?.midPrice || 0.612}
          />
        </div>
      </div>

      {/* ─── 4. Bottom: Comprehensive Event & Spike Timeline ──────────── */}
      <div className="w-full flex-shrink-0">
        <EventTimeline symbol={selectedSymbol} />
      </div>
    </div>
  );
};

export default AnalyticsView;
