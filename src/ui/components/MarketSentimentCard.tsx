import React from "react";
import { PieChart, TrendingUp, BarChart2, ArrowUpRight } from "lucide-react";
import { sound } from "../utils/sound-fx.js";

interface MarketSentimentCardProps {
  symbol: string;
  probability: number;
  volume24h?: number;
  onTrade: (symbol: string) => void;
}

export const MarketSentimentCard: React.FC<MarketSentimentCardProps> = ({
  symbol = "BTC",
  probability = 62.4,
  volume24h = 342900,
  onTrade,
}) => {
  const yesProb = Math.min(99, Math.max(1, probability));
  const noProb = Number((100 - yesProb).toFixed(1));
  const isBullish = yesProb >= 50;

  // Distinct distribution metrics based on symbol
  const volumeShares: Record<string, { share: number; color: string }> = {
    BTC: { share: 52.4, color: "bg-violet-500" },
    ETH: { share: 26.8, color: "bg-cyan-400" },
    SOL: { share: 13.5, color: "bg-amber-400" },
    SOMI: { share: 7.3, color: "bg-emerald-400" },
  };

  const currentShare = volumeShares[symbol.toUpperCase()]?.share || 25.0;

  return (
    <div className="panel rounded-xl border border-[#222234] bg-[#0E0E16] overflow-hidden flex flex-col font-mono shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F2E] bg-[#0A0A10]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-violet-600/20 border border-violet-500/40 text-violet-400">
            <PieChart className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">MARKET SENTIMENT & LIQUIDITY SHARE</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onTrade(symbol);
          }}
          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
        >
          <span>Trade in Cockpit</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 space-y-4">
        {/* 1. YES vs NO Sentiment Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>YES Sentiment ({yesProb.toFixed(1)}%)</span>
            </span>
            <span className="text-rose-400">
              <span>NO Sentiment ({noProb}%)</span>
            </span>
          </div>

          <div className="h-3 w-full bg-[#1A1A28] rounded-full overflow-hidden flex p-0.5 border border-[#26263A]">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              style={{ width: `${yesProb}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-r-full transition-all duration-700 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
              style={{ width: `${noProb}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
            <span>Market Bias: <b className={isBullish ? "text-emerald-300" : "text-rose-300"}>{isBullish ? "Bullish Conviction" : "Bearish Skew"}</b></span>
            <span>Total 24H Volume: <b className="text-white">${(volume24h / 1000).toFixed(1)}K USDC</b></span>
          </div>
        </div>

        {/* 2. Key Microstructure Indicators */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-lg bg-[#12121E] border border-[#222234] space-y-1">
            <span className="text-[10px] text-gray-500 block uppercase">CLOB Asymmetry</span>
            <span className="text-sm font-bold text-white block">
              {isBullish ? "1.82× Bids Depth" : "1.45× Asks Wall"}
            </span>
            <span className="text-[9px] text-emerald-400 block">Strong support floor</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#12121E] border border-[#222234] space-y-1">
            <span className="text-[10px] text-gray-500 block uppercase">Est. Slippage ($100)</span>
            <span className="text-sm font-bold text-emerald-300 block">~0.12%</span>
            <span className="text-[9px] text-gray-400 block">Deep liquidity on Shannon</span>
          </div>
        </div>

        {/* 3. Somnia 24H Volume Share Breakdown */}
        <div className="space-y-2 pt-1 border-t border-[#1F1F2E]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-bold flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Somnia Volume Share by Pair</span>
            </span>
            <span className="text-violet-300 font-bold text-[11px]">{symbol} holds {currentShare}%</span>
          </div>

          <div className="h-2 w-full bg-[#181824] rounded-full overflow-hidden flex gap-0.5">
            <div style={{ width: "52.4%" }} className="h-full bg-violet-500" title="BTC: 52.4%" />
            <div style={{ width: "26.8%" }} className="h-full bg-cyan-400" title="ETH: 26.8%" />
            <div style={{ width: "13.5%" }} className="h-full bg-amber-400" title="SOL: 13.5%" />
            <div style={{ width: "7.3%" }} className="h-full bg-emerald-400" title="SOMI: 7.3%" />
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-500">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> BTC 52.4%</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> ETH 26.8%</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> SOL 13.5%</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> SOMI 7.3%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketSentimentCard;
