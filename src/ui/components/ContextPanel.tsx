import React from "react";
import { Layers, Zap, Brain, ArrowUpRight, ShieldCheck } from "lucide-react";
import { DepthChart } from "./DepthChart.js";
import { sound } from "../utils/sound-fx.js";

interface ContextPanelProps {
  symbol: string;
  midPrice?: number;
  onSetEntryPrice?: (price: number) => void;
  onViewInsights?: () => void;
  // Kept for backward compatibility
  debate?: any;
  debateLoading?: boolean;
  news?: any[];
  onViewDebate?: () => void;
  onSimulate?: (params: { outcome: "YES" | "NO"; capital: number }) => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  symbol,
  midPrice = 0.50,
  onSetEntryPrice,
  onViewInsights,
  onViewDebate,
}) => {
  return (
    <aside className="w-full h-full flex flex-col divide-y divide-[#222234] bg-[#0E0E16] text-gray-300 text-xs overflow-y-auto custom-scrollbar font-mono">
      {/* ─── 1. Header: Somnia CLOB Orderbook ────────────────────────── */}
      <div className="p-3 bg-[#0A0A10] flex items-center justify-between sticky top-0 z-10 border-b border-[#222234]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-violet-950/80 border border-violet-500/40 text-violet-300">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white block">CLOB ORDERBOOK</span>
            <span className="text-[9px] text-gray-500">{symbol}/tUSDC · L2 Depth</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE L1
          </span>
        </div>
      </div>

      {/* ─── 2. Interactive Orderbook Depth Ladder ───────────────────── */}
      <div className="p-2 space-y-2">
        <DepthChart
          symbol={symbol}
          midPrice={midPrice}
          onSelectPrice={onSetEntryPrice}
        />
{/* 
        <div className="text-[10px] text-gray-500 text-center py-1 flex items-center justify-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Click any Bid/Ask row above to prefill Entry Odds</span>
        </div> */}
      </div>

      {/* ─── 3. Microstructure Metrics Card ───────────────────────────── */}
      <div className="p-3 bg-[#0A0A12] space-y-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-bold">Execution Latency</span>
          <span className="text-cyan-400 font-bold">~15ms Sub-Second</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-bold">Matching Engine</span>
          <span className="text-white font-bold">Somnia Shannon CLOB</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-bold">Settlement Protection</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            100% On-Chain
          </span>
        </div>
      </div>

      {/* ─── 4. Quick Portal to Dedicated AI Insights ─────────────────── */}
      <div className="p-3 bg-[#0E0E18] border-t border-[#222234]">
        <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-violet-300 font-bold text-xs">
              <Brain className="w-3.5 h-3.5 text-violet-400" />
              <span>AI Intelligence Hub</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-600/30 text-violet-300 font-mono">
              Debate & RAG
            </span>
          </div>

          <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
            Access the full Bull vs Bear debate, AI Alpha Signals and verified citations in the dedicated AI tab.
          </p>

          <button
            onClick={() => {
              sound.playClick();
              if (onViewInsights) {
                onViewInsights();
              } else if (onViewDebate) {
                onViewDebate();
              }
            }}
            className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
          >
            <span>Open AI Insights</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ContextPanel;
