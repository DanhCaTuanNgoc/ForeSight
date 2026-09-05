import React from "react";
import { TrendingUp, BarChart3, ArrowUpDown, Shield, Sparkles } from "lucide-react";
import { CryptoIcon } from "./CryptoIcon.js";

interface MarketStatsProps {
  market: any;
  serverMode?: string;
  onOpenDebate?: () => void;
}

export const MarketStats: React.FC<MarketStatsProps> = ({ market, serverMode, onOpenDebate }) => {
  if (!market) return null;

  const prob = market.probability ?? 50;
  const isYesFavored = prob >= 50;
  const spread =
    market.bestAsk !== undefined && market.bestBid !== undefined
      ? (market.bestAsk - market.bestBid).toFixed(4)
      : "—";

  return (
    <div className="bg-[#08080E] border-b border-white/[0.07] px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
      {/* Market Name & Question */}
      <div className="flex items-center gap-3 min-w-[260px]">
        <CryptoIcon symbol={market.underlyingAsset || market.symbol} size={30} />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-white font-mono font-bold text-sm tracking-wide">
              {market.symbol} / tUSDC
            </h2>
          </div>
          <p className="text-[11px] text-gray-400 max-w-xl truncate mt-0.5 font-sans">
            {market.question || "Binary Event Prediction Market"}
          </p>
        </div>
      </div>

      {/* Grid of Key Numerical Metrics */}
      <div className="flex items-center gap-4 xl:gap-5 flex-wrap divide-x divide-white/[0.06] pl-2">
        {/* Probability */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-violet-400" />
            YES Odds
          </span>
          <span
            className={`text-base font-mono font-bold ${
              isYesFavored ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {prob.toFixed(1)}%
          </span>
        </div>

        {/* Best Bid */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">
            Bid
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            ${market.bestBid !== undefined ? market.bestBid.toFixed(3) : "—"}
          </span>
        </div>

        {/* Best Ask */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">
            Ask
          </span>
          <span className="text-xs font-mono font-bold text-rose-400">
            ${market.bestAsk !== undefined ? market.bestAsk.toFixed(3) : "—"}
          </span>
        </div>

        {/* Spread */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-2.5 h-2.5 text-gray-500" />
            Spread
          </span>
          <span className="text-xs font-mono font-bold text-violet-300">
            ${spread}
          </span>
        </div>

        {/* 24h Vol */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-gray-500" />
            24h Volume
          </span>
          <span className="text-xs font-mono font-bold text-white">
            ${market.volume24h ? `${(market.volume24h / 1000).toFixed(0)}K` : "$100K"}
          </span>
        </div>
      </div>
    </div>
  );
};
export default MarketStats;
