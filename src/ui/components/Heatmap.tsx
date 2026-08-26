import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface HeatmapCell {
  category: string;
  label: string;
  intensity: number; // 0-100
  change: number;    // % change
}

interface HeatmapProps {
  cells?: HeatmapCell[];
}

// ─── Default mock data ────────────────────────────────────────────────────────
const DEFAULT_CELLS: HeatmapCell[] = [
  { category: 'CRYPTO',  label: 'BTC',   intensity: 88, change: -0.42 },
  { category: 'CRYPTO',  label: 'ETH',   intensity: 74, change: -1.36 },
  { category: 'CRYPTO',  label: 'SOL',   intensity: 52, change:  2.05 },
  { category: 'CRYPTO',  label: 'SOMI',  intensity: 61, change:  2.05 },
  { category: 'MACRO',   label: 'MACRO', intensity: 79, change: -0.10 },
  { category: 'TECH',    label: 'TECH',  intensity: 43, change:  0.90 },
  { category: 'SPORTS',  label: 'SPORT', intensity: 28, change:  0.00 },
  { category: 'OTHER',   label: 'OTHER', intensity: 15, change: -0.25 },
];

// ─── Intensity color ──────────────────────────────────────────────────────────
function intensityColor(intensity: number, change: number): string {
  if (change > 0) {
    // green tones
    const alpha = 0.1 + (intensity / 100) * 0.55;
    return `rgba(34,197,94,${alpha.toFixed(2)})`;
  } else if (change < 0) {
    const alpha = 0.1 + (intensity / 100) * 0.55;
    return `rgba(239,68,68,${alpha.toFixed(2)})`;
  }
  const alpha = 0.08 + (intensity / 100) * 0.3;
  return `rgba(124,58,237,${alpha.toFixed(2)})`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Heatmap: React.FC<HeatmapProps> = ({ cells = DEFAULT_CELLS }) => {
  return (
    <div className="panel rounded-[4px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2A2A3D]">
        <span className="stat-label">MARKET HEATMAP</span>
        <span className="text-[10px] text-gray-600 mono">ACTIVITY LEVEL</span>
      </div>

      {/* Grid */}
      <div className="p-3 flex flex-col gap-1.5">
        {cells.map((cell) => {
          const barWidth = `${cell.intensity}%`;
          const color = intensityColor(cell.intensity, cell.change);
          const changeColor = cell.change > 0 ? 'text-green-400' : cell.change < 0 ? 'text-red-400' : 'text-gray-500';
          const changePrefix = cell.change > 0 ? '+' : '';

          return (
            <div key={cell.label} className="flex items-center gap-2 group cursor-pointer">
              {/* Label */}
              <span className="mono text-[10px] text-gray-500 w-12 text-right uppercase">{cell.label}</span>

              {/* Bar track */}
              <div className="flex-1 h-4 bg-[#111118] rounded-[2px] overflow-hidden relative">
                <div
                  className="h-full rounded-[2px] transition-all duration-500"
                  style={{ width: barWidth, background: color }}
                />
                {/* intensity label */}
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 mono text-[9px] text-gray-600">
                  {cell.intensity}
                </span>
              </div>

              {/* Change */}
              <span className={`mono text-[10px] w-12 text-right ${changeColor}`}>
                {changePrefix}{cell.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer legend */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-sm bg-green-500/60" />
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Rising</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-sm bg-red-500/60" />
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Falling</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-sm bg-violet-500/40" />
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Neutral</span>
          </div>
        </div>
        <span className="text-[9px] text-gray-700 mono">LIVE</span>
      </div>
    </div>
  );
};

export default Heatmap;
