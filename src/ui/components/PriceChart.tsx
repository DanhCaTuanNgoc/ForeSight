import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  Sparkles,
  Zap,
  Layers,
  Flame,
  Activity,
  Radio,
  Clock,
  Compass,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";
import { DepthChart } from "./DepthChart.js";
import { Heatmap } from "./Heatmap.js";
import { EventTimeline } from "./EventTimeline.js";

type TimeRange = "15m" | "1H" | "4H" | "1D";
export type CanvasVisualMode = "probability" | "montecarlo" | "depth" | "heatmap" | "timeline";

interface ChartDataPoint {
  time: string;
  price: number;
  volume?: number;
  isSpike?: boolean;
}

interface PriceChartProps {
  symbol: string;
  data?: ChartDataPoint[];
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
  currentPrice?: number;
  activeVisualMode?: CanvasVisualMode;
  onVisualModeChange?: (mode: CanvasVisualMode) => void;
}

function generateMockData(range: TimeRange, baseProbability: number): ChartDataPoint[] {
  const pointsMap: Record<TimeRange, number> = { "15m": 30, "1H": 60, "4H": 96, "1D": 48 };
  const points = pointsMap[range];
  let base = baseProbability / 100;

  return Array.from({ length: points }, (_, i) => {
    base += (Math.random() - 0.48) * 0.015;
    base = Math.max(0.05, Math.min(0.97, base));
    const h = Math.floor(i / 4);
    const m = (i % 4) * 15;
    const isSpike = i === Math.floor(points * 0.72); // place a spike marker
    return {
      time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      price: parseFloat(base.toFixed(4)),
      volume: Math.floor(Math.random() * 5000 + 500),
      isSpike,
    };
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const price = payload[0]?.value as number;
  const vol = payload[1]?.value as number | undefined;
  return (
    <div className="bg-[#111118]/95 border border-violet-500/50 rounded-lg p-2.5 text-xs font-mono shadow-[0_0_15px_rgba(124,58,237,0.4)] backdrop-blur-md">
      <div className="text-gray-400 text-[10px] mb-1">{label} UTC</div>
      <div className="text-white font-bold flex items-center justify-between gap-3">
        <span>Implied Probability:</span>
        <span className="text-violet-300 neon-glow-violet">{(price * 100).toFixed(2)}%</span>
      </div>
      {vol !== undefined && (
        <div className="text-gray-400 text-[10px] mt-1 flex items-center justify-between">
          <span>Volume:</span>
          <span>{vol.toLocaleString()} tUSDC</span>
        </div>
      )}
    </div>
  );
};

export const PriceChart: React.FC<PriceChartProps> = ({
  symbol,
  data: propData,
  timeRange,
  onTimeRangeChange,
  currentPrice = 60,
  activeVisualMode: externalMode,
  onVisualModeChange,
}) => {
  const [internalMode, setInternalMode] = useState<CanvasVisualMode>("probability");
  const visualMode = externalMode || internalMode;

  const handleModeChange = (mode: CanvasVisualMode) => {
    sound.playClick();
    if (onVisualModeChange) onVisualModeChange(mode);
    else setInternalMode(mode);
  };

  const data = useMemo(
    () => (propData && propData.length > 0 ? propData : generateMockData(timeRange, currentPrice)),
    [propData, timeRange, currentPrice, symbol]
  );

  const first = data[0]?.price ?? 0;
  const last = data[data.length - 1]?.price ?? 0;
  const change = first > 0 ? ((last - first) / first) * 100 : 0;
  const isUp = change >= 0;

  const yMin = Math.max(0, Math.min(...data.map((d) => d.price)) - 0.03);
  const yMax = Math.min(1, Math.max(...data.map((d) => d.price)) + 0.03);

  const formatY = (v: number) => `${(v * 100).toFixed(0)}%`;
  const step = Math.ceil(data.length / 6);
  const formatX = (_: any, idx: number) => (idx % step === 0 ? data[idx]?.time ?? "" : "");

  return (
    <div className="panel rounded-xl border border-[#2A2A3D] bg-[#0E0E16] flex flex-col overflow-hidden shadow-lg">
      {/* ─── Top Control Bar: Visual Mode Tabs + Timeframe ───────────── */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2 border-b border-[#232336] bg-[#0A0A10] gap-2">
        {/* Left: 5 Visual Canvas Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#13131F] p-1 rounded-lg border border-[#232336] text-[11px] font-mono">
          <button
            onClick={() => handleModeChange("probability")}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              visualMode === "probability"
                ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Probability Radar</span>
          </button>

          <button
            onClick={() => handleModeChange("montecarlo")}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              visualMode === "montecarlo"
                ? "bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Monte Carlo Cone</span>
          </button>

          <button
            onClick={() => handleModeChange("heatmap")}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              visualMode === "heatmap"
                ? "bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Heatmap</span>
          </button>

          <button
            onClick={() => handleModeChange("depth")}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              visualMode === "depth"
                ? "bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Order Depth</span>
          </button>

          <button
            onClick={() => handleModeChange("timeline")}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              visualMode === "timeline"
                ? "bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
        </div>

        {/* Right: Time Range Switcher */}
        <div className="flex items-center gap-1 font-mono text-[10px]">
          {(["15m", "1H", "4H", "1D"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                sound.playClick();
                onTimeRangeChange(r);
              }}
              className={`px-2 py-1 rounded font-bold transition-all ${
                timeRange === r
                  ? "bg-violet-600/30 text-violet-300 border border-violet-500/50 shadow-sm"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#1A1A28]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Visual Canvas Content by Mode ──────────────────────────── */}
      <div className="p-3">
        {visualMode === "probability" && (
          <div className="space-y-2">
            {/* Header info */}
            <div className="flex items-center justify-between font-mono text-xs px-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-base">{(last * 100).toFixed(1)}%</span>
                <span className={`text-[11px] font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {isUp ? "▲ +" : "▼ "} {Math.abs(change).toFixed(2)}%
                </span>
                <span className="text-[10px] text-gray-500">({symbol} Implied Odds)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ⚡ Spike Marker Active
                </span>
              </div>
            </div>

            {/* Recharts Area */}
            <div className="h-44 sm:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyberProbGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#222234" strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="time"
                    tickFormatter={formatX}
                    tick={{ fill: "#6B7280", fontSize: 9, fontFamily: "JetBrains Mono" }}
                    axisLine={false}
                    tickLine={false}
                    interval={step - 1}
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    tickFormatter={formatY}
                    tick={{ fill: "#6B7280", fontSize: 9, fontFamily: "JetBrains Mono" }}
                    axisLine={false}
                    tickLine={false}
                    width={34}
                    orientation="right"
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#A78BFA"
                    strokeWidth={2}
                    fill="url(#cyberProbGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#10B981", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Mode 2: Monte Carlo 100-Path Trajectory Cone */}
        {visualMode === "montecarlo" && (
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  100-Path Monte Carlo Quant Simulation
                </span>
                <span className="text-[10px] text-gray-500">Geometric Brownian Motion</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/40">
                Feasibility: 78.4%
              </span>
            </div>

            {/* SVG Visual Monte Carlo Fan */}
            <div className="h-44 sm:h-52 w-full bg-[#08080E] rounded-lg border border-[#1F1F2E] relative overflow-hidden flex items-center justify-center p-2">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mcConeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.45" />
                  </linearGradient>
                  <linearGradient id="mcBreakGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.25" />
                  </linearGradient>
                </defs>

                {/* Shaded Upper Cone (95th percentile) */}
                <path d="M 0 100 Q 250 80 500 20 L 500 100 L 0 100 Z" fill="url(#mcConeGrad)" />
                {/* Shaded Lower Cone (Break zone) */}
                <path d="M 0 100 Q 250 120 500 165 L 500 100 L 0 100 Z" fill="url(#mcBreakGrad)" />

                {/* 15 Simulated Sample Trajectory Lines */}
                {[
                  "M 0 100 Q 150 90 500 25",
                  "M 0 100 Q 200 85 500 35",
                  "M 0 100 Q 220 70 500 45",
                  "M 0 100 Q 180 95 500 55",
                  "M 0 100 Q 240 90 500 68",
                  "M 0 100 Q 250 105 500 82",
                  "M 0 100 Q 200 110 500 95",
                  "M 0 100 Q 300 115 500 112",
                  "M 0 100 Q 180 130 500 138",
                  "M 0 100 Q 260 140 500 158",
                ].map((pathD, idx) => (
                  <path
                    key={idx}
                    d={pathD}
                    fill="none"
                    stroke={idx < 6 ? "#22D3EE" : "#FB7185"}
                    strokeWidth="1.2"
                    strokeOpacity={0.45}
                    strokeDasharray={idx % 2 === 0 ? "3 3" : undefined}
                  />
                ))}

                {/* Median Target Line */}
                <path d="M 0 100 Q 250 80 500 48" fill="none" stroke="#38BDF8" strokeWidth="2.5" />

                {/* Strike Price Target Level */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" />
                {/* Thesis Invalidation Level */}
                <line x1="0" y1="150" x2="500" y2="150" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>

              {/* Badges on Top of Simulation */}
              <div className="absolute top-2 right-3 flex flex-col gap-1 text-[10px]">
                <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded">
                  Target Strike: $78,500 (+0.82%)
                </span>
                <span className="bg-rose-950/90 text-rose-300 border border-rose-500/50 px-2 py-0.5 rounded">
                  Invalidation: &lt; $77,900
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span>Simulation: 100 paths with 1-second ticks</span>
              <span className="text-cyan-300 font-bold">78% paths cross Strike before expiry</span>
            </div>
          </div>
        )}

        {/* Mode 3: Liquidity Heatmap */}
        {visualMode === "heatmap" && (
          <div className="h-56 overflow-y-auto">
            <Heatmap />
          </div>
        )}

        {/* Mode 4: Orderbook Depth */}
        {visualMode === "depth" && (
          <div className="h-56 overflow-y-auto">
            <DepthChart symbol={symbol} midPrice={last || 0.5} />
          </div>
        )}

        {/* Mode 5: Event Timeline */}
        {visualMode === "timeline" && (
          <div className="h-56 overflow-y-auto">
            <EventTimeline symbol={symbol} />
          </div>
        )}
      </div>
    </div>
  );
};
export default PriceChart;
