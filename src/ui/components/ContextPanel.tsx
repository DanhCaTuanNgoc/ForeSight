import React from "react";
import { Layers, Brain, ArrowUpRight, ShieldCheck } from "lucide-react";
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
    <aside className="w-full h-full flex flex-col divide-y divide-white/[0.05] bg-[#0A0A10] text-gray-300 text-xs overflow-y-auto custom-scrollbar font-mono">
      {/* ─── 1. Header: Orderbook ─── */}
      <div className="p-3 bg-[#08080E] flex items-center justify-between sticky top-0 z-10 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-none bg-violet-950/60 border border-violet-500/40 text-violet-300">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white block tracking-wider uppercase">ORDERBOOK</span>
            <span className="text-[9px] text-gray-400">{symbol}/tUSDC · L2 Depth</span>
          </div>
        </div>
      </div>

      {/* ─── 2. Interactive Orderbook Depth Ladder ─── */}
      <div className="p-2 space-y-2 bg-[#0A0A10]">
        <DepthChart
          symbol={symbol}
          midPrice={midPrice}
          onSelectPrice={onSetEntryPrice}
        />
      </div>

      {/* ─── 3. Microstructure Metrics Card ─── */}
      <div className="p-3 bg-[#08080E] space-y-2 border-t border-white/[0.06]">
        <div className="text-[9px] font-mono uppercase tracking-widest text-gray-500 font-bold">
          ENGINE METRICS
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-medium">Latency</span>
          <span className="text-violet-300 font-bold font-mono">~15ms</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-medium">Matching Engine</span>
          <span className="text-white font-medium">Somnia CLOB</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-medium">Settlement</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            On-Chain
          </span>
        </div>
      </div>

      {/* ─── 4. Quick Portal to Dedicated Insights ─── */}
      <div className="p-3 bg-[#0A0A10] border-t border-white/[0.07]">
        <div className="p-3 rounded-none bg-[#0E0E17] border border-white/[0.07] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-200 font-bold text-xs">
              <Brain className="w-3.5 h-3.5 text-violet-400" />
              <span>RESEARCH & SIGNALS</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
            Multi-agent thesis debate, directional models, and real-time sentiment data.
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
            className="w-full py-2 bg-[#12121C] hover:bg-[#161624] text-violet-300 hover:text-white rounded-none font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/[0.07] cursor-pointer"
          >
            <span>VIEW DUAL AREA</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ContextPanel;
