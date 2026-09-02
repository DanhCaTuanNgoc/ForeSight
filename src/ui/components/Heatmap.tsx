import React, { useState, useEffect } from "react";
import { apiUrl } from "../utils/api.js";
import { CryptoIcon } from "./CryptoIcon.js";
import { Flame, TrendingUp, TrendingDown, Check } from "lucide-react";
import { sound } from "../utils/sound-fx.js";

export interface HeatmapCell {
  category: string;
  label: string;
  intensity: number; // 0-100 (Probability)
  change: number;    // % change
}

interface HeatmapProps {
  cells?: HeatmapCell[];
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
}

const DEFAULT_HEATMAP_CELLS: HeatmapCell[] = [
  { category: "SOMNIA CLOB", label: "BTC", intensity: 62.4, change: 14.2 },
  { category: "SOMNIA CLOB", label: "ETH", intensity: 45.1, change: -3.5 },
  { category: "SOMNIA CLOB", label: "SOL", intensity: 54.0, change: 6.8 },
  { category: "SOMNIA CLOB", label: "SOMI", intensity: 73.8, change: 4.15 },
];

export const Heatmap: React.FC<HeatmapProps> = ({
  cells: propCells,
  selectedSymbol = "BTC",
  onSelectSymbol,
}) => {
  const [apiCells, setApiCells] = useState<HeatmapCell[]>([]);

  useEffect(() => {
    if (propCells && propCells.length > 0) return;
    let isMounted = true;

    const fetchHeatmap = async () => {
      try {
        const res = await fetch(apiUrl("/api/tickers"));
        if (res.ok) {
          const data = await res.json();
          if (data.tickers && data.tickers.length > 0) {
            // Keep top 4 core Somnia focus assets to prevent UI clutter
            const primarySymbols = ["BTC", "ETH", "SOL", "SOMI"];
            const filtered = data.tickers
              .filter((t: any) => {
                const sym = (t.rawSymbol || t.symbol.split("/")[0]).toUpperCase();
                return primarySymbols.includes(sym);
              })
              .map((t: any) => ({
                category: "SOMNIA CLOB",
                label: (t.rawSymbol || t.symbol.split("/")[0]).toUpperCase(),
                intensity: Math.min(98, Math.max(10, Math.round(t.probability || 50))),
                change: Number((t.change || 0).toFixed(1)),
              }));

            if (isMounted && filtered.length > 0) {
              setApiCells(filtered.slice(0, 4));
            }
          }
        }
      } catch {
        // Fallback to default
      }
    };

    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [propCells]);

  const rawCells = propCells && propCells.length > 0 ? propCells : (apiCells.length > 0 ? apiCells : DEFAULT_HEATMAP_CELLS);
  // Ensure strict maximum of 4 assets to keep UI tidy and prevent clutter
  const cells = rawCells.slice(0, 4);

  return (
    <div className="panel rounded-xl border border-[#222234] bg-[#0E0E16] overflow-hidden flex flex-col font-mono shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F2E] bg-[#0A0A10]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">CORE MARKETS HEATMAP</span>
            {/* <span className="text-[9px] text-gray-500">Click any tile to focus Depth & Timeline</span> */}
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold">
          INTERACTIVE TILES
        </span>
      </div>

      {/* 2x2 Compact Clean Interactive Grid */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {cells.map((cell) => {
          const isUp = cell.change >= 0;
          const prob = cell.intensity;
          const isHighProb = prob >= 50;
          const isSelected = selectedSymbol.toUpperCase() === cell.label.toUpperCase();

          return (
            <div
              key={cell.label}
              onClick={() => {
                sound.playClick();
                if (onSelectSymbol) onSelectSymbol(cell.label);
              }}
              className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 group ${
                isSelected
                  ? "bg-[#18142A] border-violet-500 shadow-[0_0_16px_rgba(124,58,237,0.5)] ring-1 ring-violet-400 scale-[1.02]"
                  : "bg-[#12121D] border-[#232336] hover:border-violet-500/50 hover:bg-[#151522]"
              }`}
            >
              {/* Top Row: Symbol & Change */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CryptoIcon symbol={cell.label} size={18} />
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">{cell.label}/tUSDC</span>
                    {isSelected ? (
                      <span className="text-[9px] text-violet-300 font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 text-violet-400" /> Active Focus
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-500 group-hover:text-gray-300">Click to focus</span>
                    )}
                  </div>
                </div>

                <div
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isUp
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                      : "bg-rose-950/80 text-rose-400 border border-rose-500/40"
                  }`}
                >
                  {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  <span>{isUp ? "+" : ""}{cell.change.toFixed(1)}%</span>
                </div>
              </div>

              {/* Progress Bar & Probability Odds */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Implied Odds:</span>
                  <span className={`font-black ${isHighProb ? "text-emerald-400" : "text-rose-400"}`}>
                    {prob}% YES
                  </span>
                </div>
                <div className="w-full bg-[#1A1A28] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighProb
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : "bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    }`}
                    style={{ width: `${prob}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#1A1A28] bg-[#0A0A10] text-[9px] text-gray-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>High Odds (≥50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Low Odds (&lt;50%)</span>
          </div>
        </div>
        <span className="text-violet-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Focus: {selectedSymbol}
        </span>
      </div>
    </div>
  );
};

export default Heatmap;
