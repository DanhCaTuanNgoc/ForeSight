import React from "react";
import { Layers } from "lucide-react";

interface DepthChartProps {
  symbol?: string;
  midPrice?: number;
}

interface DepthLevel {
  price: number;
  size: number;
  total: number;
}

export const DepthChart: React.FC<DepthChartProps> = ({
  symbol = "BTC",
  midPrice = 0.612,
}) => {
  // Generate realistic orderbook depth levels
  const bids: DepthLevel[] = React.useMemo(() => {
    let currentTotal = 0;
    return Array.from({ length: 6 }, (_, i) => {
      const price = midPrice - (i + 1) * 0.015;
      const size = Math.floor(800 + Math.sin(i * 1.5) * 400 + Math.random() * 200);
      currentTotal += size;
      return { price: Math.max(0.01, price), size, total: currentTotal };
    });
  }, [midPrice]);

  const asks: DepthLevel[] = React.useMemo(() => {
    let currentTotal = 0;
    return Array.from({ length: 6 }, (_, i) => {
      const price = midPrice + (i + 1) * 0.015;
      const size = Math.floor(750 + Math.cos(i * 1.2) * 350 + Math.random() * 200);
      currentTotal += size;
      return { price: Math.min(0.99, price), size, total: currentTotal };
    });
  }, [midPrice]);

  const maxTotal = Math.max(
    bids[bids.length - 1]?.total || 1,
    asks[asks.length - 1]?.total || 1
  );

  return (
    <div className="panel rounded-[4px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2A2A3D]">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-violet-400" />
          <span className="stat-label">ORDER BOOK DEPTH</span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">
          Visual Analytics Only
        </span>
      </div>

      {/* Main Grid: Bids Left | Asks Right */}
      <div className="p-3 grid grid-cols-2 gap-3 text-xs font-mono">
        {/* BUY DEPTH */}
        <div>
          <div className="flex justify-between text-[10px] text-gray-500 border-b border-[#2A2A3D]/40 pb-1 mb-1.5 font-sans uppercase font-medium">
            <span>Size</span>
            <span>Bid ($)</span>
          </div>
          <div className="flex flex-col gap-1">
            {bids.map((b, idx) => {
              const widthPct = Math.min(100, Math.round((b.total / maxTotal) * 100));
              return (
                <div
                  key={idx}
                  className="relative flex justify-between items-center py-0.5 px-1 rounded overflow-hidden"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 rounded-sm"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="text-gray-400 relative z-10 text-[11px]">
                    {b.size.toLocaleString()}
                  </span>
                  <span className="text-emerald-400 font-semibold relative z-10 text-[11px]">
                    ${b.price.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SELL DEPTH */}
        <div>
          <div className="flex justify-between text-[10px] text-gray-500 border-b border-[#2A2A3D]/40 pb-1 mb-1.5 font-sans uppercase font-medium">
            <span>Ask ($)</span>
            <span>Size</span>
          </div>
          <div className="flex flex-col gap-1">
            {asks.map((a, idx) => {
              const widthPct = Math.min(100, Math.round((a.total / maxTotal) * 100));
              return (
                <div
                  key={idx}
                  className="relative flex justify-between items-center py-0.5 px-1 rounded overflow-hidden"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-rose-500/15 rounded-sm"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="text-rose-400 font-semibold relative z-10 text-[11px]">
                    ${a.price.toFixed(3)}
                  </span>
                  <span className="text-gray-400 relative z-10 text-[11px]">
                    {a.size.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mid Price Footer */}
      <div className="bg-[#111118] border-t border-[#2A2A3D] px-4 py-2 flex items-center justify-between text-xs font-mono">
        <span className="text-gray-500 uppercase text-[10px]">Spread Mid-Price</span>
        <span className="text-violet-400 font-bold text-sm">
          ${midPrice.toFixed(4)}
        </span>
      </div>
    </div>
  );
};
export default DepthChart;
