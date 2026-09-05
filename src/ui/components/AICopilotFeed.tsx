import React from "react";
import { Bot, Sparkles, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { CryptoIcon } from "./CryptoIcon.js";

interface Signal {
  symbol: string;
  question: string;
  asset?: string;
  cadence?: string;
  direction: "UP" | "DOWN" | "NEUTRAL";
  confidence: number;
  suggestedPrice: number;
  reasoning: string;
  timestamp: number;
}

interface AICopilotFeedProps {
  signals: Signal[];
  onSelectMarket: (symbol: string) => void;
}

export const AICopilotFeed: React.FC<AICopilotFeedProps> = ({ signals, onSelectMarket }) => {
  return (
    <div className="bg-[#08080E] border border-white/[0.07] rounded-none p-3.5 h-full flex flex-col font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-violet-950/60 border border-violet-500/30 text-violet-300">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              REAL-TIME SIGNALS
            </h3>
          </div>
        </div>
        <span className="text-[9px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-none font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Signal Stream */}
      <div className="space-y-2 overflow-y-auto max-h-[520px] pr-0.5 flex-1 custom-scrollbar">
        {signals.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 rounded-none border border-violet-500/40 border-t-violet-400 animate-spin flex items-center justify-center">
              <Bot className="w-3 h-3 text-violet-400" />
            </div>
            <div>
              <p className="font-bold text-white text-[11px]">SCANNING SOMNIA CLOB...</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Evaluating volatility & orderbook asymmetry</p>
            </div>
          </div>
        ) : (
          signals.map((sig, idx) => {
            const isUp = sig.direction === "UP";
            const confPercent = Math.round(sig.confidence * 100);
            const assetName = sig.asset || sig.symbol.split("/")[0].split("-")[0] || "BTC";

            return (
              <div
                key={idx}
                onClick={() => onSelectMarket(sig.symbol)}
                className="p-2.5 rounded-none bg-[#0B0B14] border border-white/[0.06] hover:border-violet-500/40 hover:bg-[#12121C] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-white group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                    <CryptoIcon symbol={assetName} size={15} />
                    <span>{assetName} · {sig.cadence || "1h"}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-none flex items-center gap-1 border ${
                        isUp
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                          : "bg-rose-950/60 text-rose-400 border-rose-500/40"
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {sig.direction} ({confPercent}%)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 leading-snug mb-1.5 font-sans">
                  {sig.reasoning}
                </p>

                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/[0.06] font-mono">
                  <span>
                    Entry: <span className="font-bold text-white font-mono">${(sig.suggestedPrice <= 1 ? sig.suggestedPrice : sig.suggestedPrice / 100).toFixed(2)}</span>
                  </span>
                  <span className="text-violet-400 font-bold group-hover:text-violet-300 transition-colors flex items-center gap-1">
                    <span>LOAD</span>
                    <Sparkles className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
