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
    <div className="glass-panel rounded-2xl p-6 border border-brand-border/80 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              AI Copilot Reasoning Feed <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            </h3>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          Live Agent
        </span>
      </div>

      {/* Signal Stream */}
      <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1 flex-1 custom-scrollbar">
        {signals.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="font-bold text-white">Scanning Somnia CLOB Sockets...</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Evaluating micro-volatility & orderbook asymmetry</p>
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
                className="p-3.5 rounded-xl bg-[#0E1422] border border-brand-border hover:border-violet-500/60 hover:bg-[#131B2E] transition cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-white group-hover:text-violet-300 transition flex items-center gap-1.5">
                    <CryptoIcon symbol={assetName} size={16} />
                    <span>{assetName} • {sig.cadence || "1h"}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        isUp
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {sig.direction} ({confPercent}%)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-2">
                  {sig.reasoning}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1.5 border-t border-brand-border/40 font-mono">
                  <span>
                    Entry Target: <span className="font-bold text-white">{Math.round((sig.suggestedPrice <= 1 ? sig.suggestedPrice : sig.suggestedPrice / 100) * 100)}% (${(sig.suggestedPrice <= 1 ? sig.suggestedPrice : sig.suggestedPrice / 100).toFixed(2)})</span>
                  </span>
                  <span className="text-violet-400 font-bold group-hover:underline flex items-center gap-1">
                    <span>Trade Signal</span>
                    <Sparkles className="w-3 h-3" />
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
