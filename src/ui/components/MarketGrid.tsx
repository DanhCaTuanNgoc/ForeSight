import React from "react";
import { Filter, Play } from "lucide-react";

interface Market {
  id: string;
  symbol: string;
  underlyingAsset?: string;
  interval?: string;
  question?: string;
  status: string | number;
  isTradable: boolean;
  timeRemainingSec?: number;
  impliedUpProbability?: number;
}

interface MarketGridProps {
  markets: Market[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  selectedCadence: string;
  setSelectedCadence: (cadence: string) => void;
}

export const MarketGrid: React.FC<MarketGridProps> = ({
  markets,
  selectedSymbol,
  onSelect,
  selectedAsset,
  setSelectedAsset,
  selectedCadence,
  setSelectedCadence,
}) => {
  const assets = ["ALL", "BTC", "ETH"];
  const cadences = ["ALL", "1m", "5m", "15m", "1h", "4h", "24h"];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-brand-border/80">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-orange-400" />
          <h3 className="font-bold text-white text-base">DreamDEX Prediction Markets</h3>
          <span className="text-xs text-gray-400 font-mono">({markets.length} live)</span>
        </div>

        {/* Asset & Cadence Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#0A0E17] border border-brand-border rounded-lg p-0.5">
            {assets.map((a) => (
              <button
                key={a}
                onClick={() => setSelectedAsset(a)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  selectedAsset === a ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="flex bg-[#0A0E17] border border-brand-border rounded-lg p-0.5">
            {cadences.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCadence(c)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  selectedCadence === c ? "bg-cyan-500 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Markets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-brand-border text-gray-400 uppercase font-mono text-[11px]">
              <th className="py-3 px-3">Asset / Cadence</th>
              <th className="py-3 px-3">Question</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Expires</th>
              <th className="py-3 px-3">Odds (UP/DOWN)</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {markets.slice(0, 15).map((m) => {
              const isSelected = m.symbol === selectedSymbol;
              const upOdds = m.impliedUpProbability ? Math.round(m.impliedUpProbability * 100) : 50;

              return (
                <tr
                  key={m.id}
                  onClick={() => onSelect(m.symbol)}
                  className={`hover:bg-[#131B2C] transition cursor-pointer ${
                    isSelected ? "bg-orange-500/10 border-l-2 border-orange-500" : ""
                  }`}
                >
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{m.underlyingAsset || "BTC"}</span>
                      <span className="bg-[#182030] text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {m.interval || "15m"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 max-w-xs truncate text-gray-200">
                    {m.question}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      TRADING
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-gray-300">
                    {m.timeRemainingSec ? `${m.timeRemainingSec}s` : "Live"}
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="text-emerald-400">{upOdds}%</span>
                    <span className="text-gray-500"> / </span>
                    <span className="text-rose-400">{100 - upOdds}%</span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(m.symbol);
                      }}
                      className="inline-flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 px-3 py-1 rounded-lg text-xs font-semibold transition"
                    >
                      <Play className="w-3 h-3" />
                      <span>Trade</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
