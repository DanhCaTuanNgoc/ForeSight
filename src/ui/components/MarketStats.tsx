import React from "react";
import { TrendingUp, BarChart3, ArrowUpDown, ChevronDown } from "lucide-react";
import { CryptoIcon } from "./CryptoIcon.js";

interface MarketStatsProps {
  market: any;
  serverMode?: string;
  onOpenDebate?: () => void;
  onOpenMarketsDrawer?: () => void;
}

export const MarketStats: React.FC<MarketStatsProps> = ({ market, serverMode, onOpenDebate, onOpenMarketsDrawer }) => {
  if (!market) return null;

  const prob = market.probability ?? 50;
  const isYesFavored = prob >= 50;
  const spread =
    market.bestAsk !== undefined && market.bestBid !== undefined
      ? (market.bestAsk - market.bestBid).toFixed(4)
      : "—";

  return (
    <div className="bg-[#08080E] border-b border-white/[0.07] px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex items-center justify-between gap-2.5 flex-shrink-0 min-w-0">
      {/* Market Name & Question */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <CryptoIcon symbol={market.underlyingAsset || market.symbol} size={28} />
        <div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenMarketsDrawer && onOpenMarketsDrawer()}
              className={`flex items-center gap-1 font-mono font-bold text-xs sm:text-sm tracking-wide text-white transition-colors cursor-pointer group text-left ${
                onOpenMarketsDrawer ? "hover:text-violet-300" : ""
              }`}
              title={onOpenMarketsDrawer ? "Open Markets Navigator (Switch Pair)" : undefined}
            >
              <span>{market.symbol}</span>
              {onOpenMarketsDrawer && (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-300 transition-transform" />
              )}
              <span className="text-[9px] font-mono text-violet-400 bg-violet-950/60 border border-violet-500/40 px-1 py-0.2 rounded-none lg:hidden font-bold">
                PAIRS
              </span>
            </button>
          </div>
          <p className="text-[10px] sm:text-[11px] text-gray-400 max-w-[170px] xs:max-w-xs sm:max-w-md lg:max-w-xl truncate mt-0.5 font-sans">
            {market.question || "Binary Event Prediction Market"}
          </p>
        </div>
      </div>

      {/* Grid of Key Numerical Metrics (Scrollable on small screens like Binance) */}
      <div className="flex items-center gap-3 sm:gap-4 xl:gap-5 overflow-x-auto custom-scrollbar divide-x divide-white/[0.06] pl-2 py-0.5 shrink min-w-0">
        {/* Probability */}
        <div className="flex flex-col shrink-0">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400" />
            YES Odds
          </span>
          <span
            className={`text-base font-mono font-black tabular-nums ${
              isYesFavored ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {prob.toFixed(1)}%
          </span>
        </div>

        {/* Best Bid */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Bid
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400/90 tabular-nums">
            ${market.bestBid !== undefined ? market.bestBid.toFixed(3) : "—"}
          </span>
        </div>

        {/* Best Ask */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Ask
          </span>
          <span className="text-xs font-mono font-bold text-rose-400/90 tabular-nums">
            ${market.bestAsk !== undefined ? market.bestAsk.toFixed(3) : "—"}
          </span>
        </div>

        {/* Spread */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-2.5 h-2.5 text-zinc-600" />
            Spread
          </span>
          <span className="text-xs font-mono font-bold text-zinc-200 tabular-nums">
            ${spread}
          </span>
        </div>

        {/* Strike Target Price - Highlighted by bold white weight, not rainbow color */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Strike Target
          </span>
          <span className="text-xs font-mono font-black text-white tabular-nums tracking-tight">
            {market.strikePrice && market.strikePrice > 0 ? `$${market.strikePrice.toLocaleString()}` : "Open Price"}
          </span>
        </div>

        {/* Cadence / Round */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Round
          </span>
          <span className="text-xs font-mono font-bold text-zinc-300">
            {market.interval || "5m"}
          </span>
        </div>

        {/* 24h Vol */}
        <div className="flex flex-col pl-3 xl:pl-4">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-zinc-600" />
            24h Volume
          </span>
          <span className="text-xs font-mono font-bold text-zinc-300 tabular-nums">
            ${market.volume24h ? `${(market.volume24h / 1000).toFixed(0)}K` : "$100K"}
          </span>
        </div>
      </div>
    </div>
  );
};
export default MarketStats;
