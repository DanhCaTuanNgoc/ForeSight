import React from "react";
import { Clock, TrendingUp, ShieldAlert, BarChart3 } from "lucide-react";

interface MarketStatsProps {
  market: any;
  serverMode?: string;
}

export const MarketStats: React.FC<MarketStatsProps> = ({ market, serverMode }) => {
  if (!market) return null;

  const prob = market.probability ?? 50;
  const isYesFavored = prob >= 50;
  const spread =
    market.bestAsk !== undefined && market.bestBid !== undefined
      ? (market.bestAsk - market.bestBid).toFixed(3)
      : "—";

  return (
    <div className="bg-[#111118] border-b border-[#2A2A3D] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Market Name & Question */}
      <div className="flex items-center gap-3 min-w-[280px]">
        <div className="w-9 h-9 rounded bg-violet-950/40 border border-violet-700/40 flex items-center justify-center text-violet-400 font-mono font-bold text-sm">
          {market.symbol?.slice(0, 3) || "EVT"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-white font-mono font-bold text-sm tracking-wide">
              {market.symbol} / tUSDC
            </h2>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold border ${
                market.status === "TRADING"
                  ? "bg-emerald-950/50 text-emerald-400 border-emerald-700/40"
                  : "bg-gray-800/60 text-gray-400 border-gray-700/40"
              }`}
            >
              {market.status || "TRADING"}
            </span>
          </div>
          <p className="text-xs text-gray-400 max-w-xl truncate mt-0.5">
            {market.question || "Binary Event Prediction Market"}
          </p>
        </div>
      </div>

      {/* Grid of Key Numerical Metrics */}
      <div className="flex items-center gap-5 flex-wrap divide-x divide-[#2A2A3D]/60 pl-2">
        {/* Probability */}
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-violet-400" />
            YES Implied Prob
          </span>
          <span
            className={`text-lg font-mono font-bold ${
              isYesFavored ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {prob.toFixed(1)}%
          </span>
        </div>

        {/* Best Bid */}
        <div className="flex flex-col pl-4">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            Best Bid
          </span>
          <span className="text-sm font-mono font-semibold text-gray-200">
            ${market.bestBid !== undefined ? market.bestBid.toFixed(4) : "—"}
          </span>
        </div>

        {/* Best Ask */}
        <div className="flex flex-col pl-4">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            Best Ask
          </span>
          <span className="text-sm font-mono font-semibold text-gray-200">
            ${market.bestAsk !== undefined ? market.bestAsk.toFixed(4) : "—"}
          </span>
        </div>

        {/* Spread */}
        <div className="flex flex-col pl-4">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            Spread
          </span>
          <span className="text-sm font-mono font-semibold text-violet-400">
            ${spread}
          </span>
        </div>

        {/* 24h Vol / Server */}
        <div className="flex flex-col pl-4">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-gray-500" />
            24h Volume
          </span>
          <span className="text-sm font-mono font-semibold text-gray-300">
            ${market.volume24h ? market.volume24h.toLocaleString() : "142,580"}
          </span>
        </div>
      </div>
    </div>
  );
};
export default MarketStats;
