import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
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
  Clock,
  X,
  Volume2,
  CandlestickChart,
  Split,
  RotateCcw,
  Crosshair,
  MoveHorizontal,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";
import { DepthChart } from "./DepthChart.js";
import { Heatmap } from "./Heatmap.js";
import { EventTimeline } from "./EventTimeline.js";

type TimeRange = "15m" | "1H" | "4H" | "1D";
export type CanvasVisualMode = "probability" | "montecarlo" | "depth" | "heatmap" | "timeline";
type VolatilityLevel = "low" | "normal" | "high";
type CurveMode = "yes-only" | "dual";
type RenderType = "area" | "candles";

interface ChartDataPoint {
  time: string;
  price: number;
  priceNo?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
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
  entryPrice?: number;
  targetExitPrice?: number;
  onSetEntryPrice?: (p: number) => void;
  onSetTargetExitPrice?: (p: number) => void;
  showToast?: (msg: string, type?: "success" | "error") => void;
}

function generateMockData(range: TimeRange, baseProbability: number, symbol: string = "BTC"): ChartDataPoint[] {
  const pointsMap: Record<TimeRange, number> = { "15m": 40, "1H": 75, "4H": 120, "1D": 60 };
  const points = pointsMap[range];
  let base = baseProbability / 100;

  // Compute a deterministic seed from symbol and range
  let seed = 0;
  for (let c = 0; c < symbol.length; c++) {
    seed = (seed << 5) - seed + symbol.charCodeAt(c);
    seed |= 0;
  }
  seed += points + Math.round(baseProbability * 10);

  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const now = Date.now();
  const msMap: Record<TimeRange, number> = { "15m": 900_000, "1H": 3600_000, "4H": 14400_000, "1D": 86400_000 };
  const spanMs = msMap[range];
  const stepMs = spanMs / points;

  return Array.from({ length: points }, (_, i) => {
    const prev = base;
    base += (pseudoRandom() - 0.48) * 0.015;
    base = Math.max(0.05, Math.min(0.97, base));
    const ptTime = new Date(now - (points - 1 - i) * stepMs);
    const timeStr = ptTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isSpike = i === Math.floor(points * 0.72);

    const high = Math.min(0.98, Math.max(prev, base) + pseudoRandom() * 0.015);
    const low = Math.max(0.02, Math.min(prev, base) - pseudoRandom() * 0.015);

    return {
      time: timeStr,
      price: parseFloat(base.toFixed(4)),
      priceNo: parseFloat((1 - base).toFixed(4)),
      open: parseFloat(prev.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(base.toFixed(4)),
      volume: Math.floor(pseudoRandom() * 5000 + 500),
      isSpike,
    };
  });
}

// ─── Mode tab config ─────────────────────────────────────────────────────────
const MODE_TABS: { mode: CanvasVisualMode; icon: React.ElementType; label: string; activeClass: string }[] = [
  { mode: "probability", icon: TrendingUp, label: "Probability", activeClass: "bg-violet-600 text-white" },
  { mode: "montecarlo", icon: Sparkles, label: "Monte Carlo", activeClass: "bg-cyan-600 text-white" },
  { mode: "heatmap", icon: Flame, label: "Heatmap", activeClass: "bg-amber-600 text-white" },
  { mode: "depth", icon: Layers, label: "Depth", activeClass: "bg-indigo-600 text-white" },
  { mode: "timeline", icon: Clock, label: "Timeline", activeClass: "bg-emerald-600 text-white" },
];

export const PriceChart: React.FC<PriceChartProps> = ({
  symbol,
  data: propData,
  timeRange,
  onTimeRangeChange,
  currentPrice = 60,
  activeVisualMode: externalMode,
  onVisualModeChange,
  entryPrice = 0.55,
  targetExitPrice = 0.85,
  onSetEntryPrice,
  onSetTargetExitPrice,
  showToast,
}) => {
  const [internalMode, setInternalMode] = useState<CanvasVisualMode>("probability");
  const visualMode = externalMode || internalMode;

  const [curveMode, setCurveMode] = useState<CurveMode>("dual");
  const [renderType, setRenderType] = useState<RenderType>("area");
  const [selectedSpike, setSelectedSpike] = useState<any | null>(null);
  const [mcVolatility, setMcVolatility] = useState<VolatilityLevel>("normal");

  // ─── Pro Zoom & Pan Dragging Engine (Binance / MEXC style) ───────────────────
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 1x (full), up to 5x
  const [panOffset, setPanOffset] = useState<number>(0); // 0 = latest data on right
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartPan, setDragStartPan] = useState<number>(0);
  const [hasDragged, setHasDragged] = useState<boolean>(false);

  const chartWrapperRef = useRef<HTMLDivElement>(null);

  // ─── Native Wheel Listener (Ctrl + Wheel Zoom without Browser Page Zoom) ───
  useEffect(() => {
    const el = chartWrapperRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      // Zoom with Ctrl / Meta + Wheel
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) {
          // Zoom in
          setZoomLevel((prev) => Math.min(5, Number((prev + 0.3).toFixed(2))));
        } else if (e.deltaY > 0) {
          // Zoom out
          setZoomLevel((prev) => {
            const next = Math.max(1, Number((prev - 0.3).toFixed(2)));
            if (next === 1) setPanOffset(0);
            return next;
          });
        }
      }
    };

    el.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => el.removeEventListener("wheel", onNativeWheel);
  }, []);

  // Hint text fadeout
  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleModeChange = (mode: CanvasVisualMode) => {
    sound.playClick();
    if (onVisualModeChange) onVisualModeChange(mode);
    else setInternalMode(mode);
  };

  const rawData = useMemo(
    () => (propData && propData.length > 0 ? propData : generateMockData(timeRange, currentPrice, symbol)),
    [propData, timeRange, currentPrice, symbol]
  );

  // ─── Slicing Data Based on Zoom and Pan Offset ──────────────────────────────
  const data = useMemo(() => {
    if (zoomLevel <= 1 && panOffset === 0) return rawData;
    const visibleCount = Math.max(8, Math.floor(rawData.length / zoomLevel));
    const maxOffset = Math.max(0, rawData.length - visibleCount);
    const clampedOffset = Math.max(0, Math.min(maxOffset, panOffset));
    const end = rawData.length - clampedOffset;
    const start = Math.max(0, end - visibleCount);
    return rawData.slice(start, end);
  }, [rawData, zoomLevel, panOffset]);

  const first = data[0]?.price ?? 0;
  const last = data[data.length - 1]?.price ?? 0;
  const lastNo = 1 - last;
  const change = first > 0 ? ((last - first) / first) * 100 : 0;
  const isUp = change >= 0;

  const formatY = (v: number) => `${(v * 100).toFixed(0)}%`;
  const step = Math.max(1, Math.ceil(data.length / 6));
  const formatX = (_: any, idx: number) => (idx % step === 0 ? data[idx]?.time ?? "" : "");

  const handleResetZoom = () => {
    sound.playClick();
    setZoomLevel(1);
    setPanOffset(0);
  };

  // ─── Drag to Pan Handlers (ONLY active when Ctrl is pressed) ────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || visualMode !== "probability") return;
    // Pan historical data ONLY when Ctrl / Cmd key is held!
    if (!e.ctrlKey && !e.metaKey) return;

    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartPan(panOffset);
    setHasDragged(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || visualMode !== "probability") return;
    const deltaX = e.clientX - dragStartX;

    if (Math.abs(deltaX) > 4) {
      setHasDragged(true);
      const visibleCount = rawData.length / zoomLevel;
      const chartWidth = chartWrapperRef.current?.clientWidth || 500;
      const pointsPerPixel = visibleCount / chartWidth;

      const shiftPoints = Math.round(deltaX * pointsPerPixel * 1.5);
      const maxOffset = Math.max(0, rawData.length - Math.max(8, Math.floor(visibleCount)));
      const newPan = Math.max(0, Math.min(maxOffset, dragStartPan + shiftPoints));
      setPanOffset(newPan);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ─── Chart Click Handler: Directly passes clicked price to Simulator ───────
  const handleChartClick = (e: any) => {
    if (hasDragged) {
      setHasDragged(false);
      return;
    }

    if (e && e.activePayload && e.activePayload[0]) {
      const clickedPrice = Number(e.activePayload[0].value.toFixed(2));
      sound.playClick();

      if (onSetEntryPrice) {
        onSetEntryPrice(clickedPrice);
      }
      if (showToast) {
        showToast(
          `⚡ Synced Entry Price $${clickedPrice.toFixed(2)} (${Math.round(clickedPrice * 100)}%) to Decision Simulator!`,
          "success"
        );
      }
    }
  };

  const handleInspectSpike = (d: ChartDataPoint) => {
    sound.playSpikeAlert();
    setSelectedSpike({
      time: d.time,
      price: d.price,
      magnitude: "+14.2%",
      velocity: "+0.142%/min",
      summary: `Unusual repricing event on ${symbol}. Institutional spot bid walls on Somnia CLOB followed ETF net inflow reports.`,
    });
  };

  const mcStats = useMemo(() => {
    if (mcVolatility === "low") return { feasibility: 88.4, spread: 25, label: "Low Vol" };
    if (mcVolatility === "high") return { feasibility: 61.2, spread: 55, label: "Stress" };
    return { feasibility: 78.4, spread: 40, label: "Normal" };
  }, [mcVolatility]);

  const maxVol = Math.max(...data.map((d) => d.volume ?? 0), 1);

  return (
    <div className="rounded-xl border border-[#1F1F2E] bg-[#0C0C14] flex flex-col overflow-hidden font-mono relative select-none">
      {/* ─── Top Control Toolbar ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 border-b border-[#1A1A28] bg-[#09090F] gap-1.5">
        {/* Left: Mode Tabs & Live Odds */}
        <div className="flex items-center gap-0.5">
          {MODE_TABS.map(({ mode, icon: Icon, label, activeClass }) => {
            const isActive = visualMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                title={label}
                className={`flex items-center gap-1 px-1.5 py-1 rounded-md transition-all text-[11px] font-bold ${
                  isActive ? activeClass : "text-gray-500 hover:text-gray-300 hover:bg-[#161620]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {isActive && <span>{label}</span>}
              </button>
            );
          })}

          <div className="w-px h-4 bg-[#222234] mx-1.5" />

          {/* Live Price Readout */}
          <div className="flex items-baseline gap-1.5 text-xs">
            <span className="text-white font-bold">{(last * 100).toFixed(1)}%</span>
            <span className={`text-[10px] font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isUp ? "+" : ""}{change.toFixed(1)}%
            </span>
            {curveMode === "dual" && visualMode === "probability" && (
              <span className="text-rose-400/70 text-[10px]">NO {(lastNo * 100).toFixed(0)}%</span>
            )}
          </div>
        </div>

        {/* Right: Pro Zoom & Pan Indicator + Toggles + Timeframe */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Level Indicator & Reset */}
          {visualMode === "probability" && (zoomLevel > 1 || panOffset > 0) && (
            <button
              onClick={handleResetZoom}
              title="Reset Zoom & Pan (1x)"
              className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#141420] text-violet-300 hover:text-white hover:bg-violet-600/30 border border-violet-500/40 rounded transition flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{zoomLevel.toFixed(1)}x Reset</span>
            </button>
          )}

          {/* Dual / Candle switchers */}
          {visualMode === "probability" && (
            <div className="flex items-center bg-[#111118] rounded-md border border-[#1F1F2E] text-[10px]">
              <button
                onClick={() => { sound.playClick(); setCurveMode(curveMode === "dual" ? "yes-only" : "dual"); }}
                title={curveMode === "dual" ? "YES Only" : "Dual YES/NO"}
                className={`px-1.5 py-1 rounded-l-md transition ${
                  curveMode === "dual" ? "text-emerald-400 bg-emerald-950/50" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Split className="w-3 h-3" />
              </button>
              <div className="w-px h-3.5 bg-[#222234]" />
              <button
                onClick={() => { sound.playClick(); setRenderType(renderType === "area" ? "candles" : "area"); }}
                title={renderType === "area" ? "Candles" : "Area"}
                className={`px-1.5 py-1 rounded-r-md transition ${
                  renderType === "candles" ? "text-amber-400 bg-amber-950/50" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <CandlestickChart className="w-3 h-3" />
              </button>
            </div>
          )}

          {visualMode === "montecarlo" && (
            <div className="flex items-center bg-[#111118] rounded-md border border-[#1F1F2E] text-[9px]">
              {(["low", "normal", "high"] as VolatilityLevel[]).map((v) => (
                <button
                  key={v}
                  onClick={() => { sound.playClick(); setMcVolatility(v); }}
                  className={`px-1.5 py-1 capitalize font-bold transition ${
                    mcVolatility === v
                      ? v === "high" ? "text-rose-400 bg-rose-950/50" : "text-cyan-400 bg-cyan-950/50"
                      : "text-gray-500 hover:text-gray-300"
                  } ${v === "low" ? "rounded-l-md" : v === "high" ? "rounded-r-md" : ""}`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          <div className="w-px h-4 bg-[#222234]" />

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-px text-[10px]">
            {(["15m", "1H", "4H", "1D"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  sound.playClick();
                  handleResetZoom();
                  onTimeRangeChange(r);
                }}
                className={`px-1.5 py-0.5 rounded font-bold transition ${
                  timeRange === r ? "text-violet-300 bg-violet-600/20" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Chart Canvas with Drag & Pan Handlers ────────────────────── */}
      <div
        ref={chartWrapperRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`px-2 pt-1 pb-0 relative ${
          isDragging ? "cursor-grabbing" : zoomLevel > 1 ? "cursor-grab" : "cursor-crosshair"
        }`}
      >
        {/* Mode 1A: Probability Area with Dual YES/NO */}
        {visualMode === "probability" && renderType === "area" && (
          <div>
            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }} onClick={handleChartClick}>
                  <defs>
                    <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="noGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#1A1A28" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" tickFormatter={formatX} tick={{ fill: "#4B5563", fontSize: 9 }} axisLine={false} tickLine={false} interval={step - 1} />
                  <YAxis domain={[0, 1]} tickFormatter={formatY} tick={{ fill: "#4B5563", fontSize: 9 }} axisLine={false} tickLine={false} width={32} orientation="right" />

                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length || isDragging) return null;
                      const pYes = payload[0]?.value as number;
                      const vol = payload[0]?.payload?.volume;
                      return (
                        <div className="bg-[#0E0E16]/95 border border-[#2A2A3D] rounded-lg px-2.5 py-2 text-[11px] font-mono backdrop-blur-md shadow-lg min-w-[140px] pointer-events-none">
                          <div className="text-gray-500 text-[9px] mb-1 flex items-center justify-between">
                            <span>{label} UTC</span>
                            <span className="text-[8px] text-violet-400">Click to sync price</span>
                          </div>
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>YES</span><span>{(pYes * 100).toFixed(1)}%</span>
                          </div>
                          {curveMode === "dual" && (
                            <div className="flex justify-between text-rose-400 font-bold">
                              <span>NO</span><span>{((1 - pYes) * 100).toFixed(1)}%</span>
                            </div>
                          )}
                          {vol && <div className="text-gray-500 text-[9px] mt-1 border-t border-[#1F1F2E] pt-1">{vol.toLocaleString()} tUSDC</div>}
                        </div>
                      );
                    }}
                  />

                  {/* 50% Battleground Line */}
                  <ReferenceLine
                    y={0.5}
                    stroke="#4B5563"
                    strokeDasharray="2 4"
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    label={{ value: "50%", fill: "#6B7280", fontSize: 8, position: "insideTopRight" }}
                  />

                  {/* TP & Entry reference lines */}
                  <ReferenceLine
                    y={targetExitPrice}
                    stroke="#10B981"
                    strokeDasharray="6 3"
                    strokeWidth={1.2}
                    strokeOpacity={0.75}
                    label={{ value: `TP ${Math.round(targetExitPrice * 100)}%`, fill: "#10B981", fontSize: 9, position: "right" }}
                  />
                  <ReferenceLine
                    y={entryPrice}
                    stroke="#A78BFA"
                    strokeDasharray="4 4"
                    strokeWidth={1.2}
                    strokeOpacity={0.75}
                    label={{ value: `Entry ${Math.round(entryPrice * 100)}%`, fill: "#A78BFA", fontSize: 9, position: "right" }}
                  />

                  {/* YES Curve */}
                  <Area
                    type="monotone"
                    dataKey="price"
                    name="YES"
                    stroke="#10B981"
                    strokeWidth={1.8}
                    fill="url(#yesGrad)"
                    dot={(props: any) => {
                      const { cx, cy, payload, index } = props;
                      const isLast = index === data.length - 1;

                      if (payload?.isSpike) {
                        return (
                          <g key={`spike-${payload.time}`} className="cursor-pointer" onClick={() => handleInspectSpike(payload)}>
                            <circle cx={cx} cy={cy} r={4} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.5} />
                            <text x={cx + 7} y={cy - 5} fill="#10B981" fontSize={8} fontFamily="JetBrains Mono" fontWeight="bold">⚡ Spike</text>
                          </g>
                        );
                      }

                      if (isLast && panOffset === 0) {
                        return (
                          <g key="live-dot">
                            <circle cx={cx} cy={cy} r={3.5} fill="#10B981" stroke="#FFFFFF" strokeWidth={1} />
                          </g>
                        );
                      }

                      return null;
                    }}
                    activeDot={{ r: 4.5, fill: "#10B981", stroke: "#fff", strokeWidth: 1.5 }}
                  />

                  {/* NO Curve */}
                  {curveMode === "dual" && (
                    <Area
                      type="monotone"
                      dataKey="priceNo"
                      name="NO"
                      stroke="#F43F5E"
                      strokeWidth={1.2}
                      strokeDasharray="3 3"
                      fill="url(#noGrad)"
                      dot={false}
                      activeDot={{ r: 3.5, fill: "#F43F5E", stroke: "#fff", strokeWidth: 1 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Volume Bars */}
            <div className="flex items-end gap-px h-5 px-1 -mt-0.5">
              {data.map((d, i) => {
                const h = ((d.volume ?? 0) / maxVol) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[1px]"
                    style={{
                      height: `${Math.max(8, h)}%`,
                      background: (d.close ?? d.price) >= (d.open ?? d.price)
                        ? "rgba(16,185,129,0.25)"
                        : "rgba(244,63,94,0.2)",
                    }}
                  />
                );
              })}
            </div>

            {/* Panning / Time Horizon Indicator */}
            {(zoomLevel > 1 || panOffset > 0) && (
              <div className="absolute top-2 left-3 bg-[#0E0E16]/90 border border-violet-500/40 rounded px-2 py-0.5 text-[9px] text-violet-300 font-mono flex items-center gap-1.5 shadow-sm">
                <MoveHorizontal className="w-2.5 h-2.5 text-violet-400" />
                <span>
                  Window: {data[0]?.time} → {data[data.length - 1]?.time} ({zoomLevel.toFixed(1)}x)
                </span>
                {panOffset > 0 && <span className="text-amber-400">· Historical</span>}
              </div>
            )}

            {/* Interaction Hint */}
            {showHint && (
              <div className="absolute bottom-8 right-3 text-[9px] text-gray-400 font-mono transition-opacity duration-1000 bg-[#0E0E16]/80 px-2 py-0.5 rounded border border-[#232336] flex items-center gap-1">
                <Crosshair className="w-2.5 h-2.5 text-violet-400" />
                <span>Ctrl + Scroll to Zoom · Drag chart to Pan · Click to set Entry/TP</span>
              </div>
            )}
          </div>
        )}

        {/* Mode 1B: Candlestick OHLC */}
        {visualMode === "probability" && renderType === "candles" && (
          <div>
            <div className="h-48 sm:h-56 w-full bg-[#08080E] rounded-lg border border-[#161620] p-2 relative">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                {[36, 72, 108, 144].map((y) => (
                  <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#141420" strokeDasharray="3 3" />
                ))}
                {/* 50% Battleground Line */}
                <line x1="0" y1={90} x2="500" y2={90} stroke="#4B5563" strokeDasharray="2 4" strokeOpacity={0.5} />
                <text x="480" y={87} fill="#6B7280" fontSize="7" textAnchor="end">50%</text>

                {data.map((d, i) => {
                  const stepX = 500 / Math.max(1, data.length);
                  const x = i * stepX + stepX * 0.15;
                  const candleW = Math.max(3, stepX * 0.7);
                  const openY = 180 - (d.open || d.price) * 170;
                  const closeY = 180 - (d.close || d.price) * 170;
                  const highY = 180 - (d.high || Math.max(d.open || d.price, d.close || d.price) + 0.01) * 170;
                  const lowY = 180 - (d.low || Math.min(d.open || d.price, d.close || d.price) - 0.01) * 170;
                  const up = (d.close || d.price) >= (d.open || d.price);
                  const color = up ? "#10B981" : "#F43F5E";
                  return (
                    <g
                      key={i}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => handleChartClick({ activePayload: [{ value: d.price, payload: d }] })}
                    >
                      <line x1={x + candleW / 2} y1={highY} x2={x + candleW / 2} y2={lowY} stroke={color} strokeWidth="1" />
                      <rect x={x} y={Math.min(openY, closeY)} width={candleW} height={Math.max(2, Math.abs(closeY - openY))} fill={color} rx="0.5" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Volume bars for candle mode */}
            <div className="flex items-end gap-px h-5 px-1 mt-1">
              {data.map((d, i) => {
                const h = ((d.volume ?? 0) / maxVol) * 100;
                const up = (d.close ?? d.price) >= (d.open ?? d.price);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[1px]"
                    style={{
                      height: `${Math.max(8, h)}%`,
                      background: up ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.2)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 2: Monte Carlo Cone */}
        {visualMode === "montecarlo" && (
          <div className="h-52 sm:h-60 w-full bg-[#08080E] rounded-lg border border-[#161620] relative overflow-hidden p-2">
            <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mcUp" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="mcDn" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              <path d={`M 0 100 Q 250 ${90 - mcStats.spread / 2} 500 ${30 - mcStats.spread / 3} L 500 100 L 0 100 Z`} fill="url(#mcUp)" />
              <path d={`M 0 100 Q 250 ${110 + mcStats.spread / 2} 500 ${150 + mcStats.spread / 3} L 500 100 L 0 100 Z`} fill="url(#mcDn)" />

              {[
                `M 0 100 Q 150 ${85 - mcStats.spread / 4} 500 ${25 - mcStats.spread / 4}`,
                `M 0 100 Q 220 70 500 45`,
                `M 0 100 Q 180 95 500 55`,
                `M 0 100 Q 240 90 500 68`,
                `M 0 100 Q 250 105 500 82`,
                `M 0 100 Q 200 110 500 95`,
                `M 0 100 Q 300 115 500 112`,
                `M 0 100 Q 180 ${130 + mcStats.spread / 4} 500 ${138 + mcStats.spread / 4}`,
              ].map((d, i) => (
                <path key={i} d={d} fill="none" stroke={i < 4 ? "#22D3EE" : "#FB7185"} strokeWidth="1" strokeOpacity={0.35} strokeDasharray={i % 2 === 0 ? "3 3" : undefined} />
              ))}

              <path d="M 0 100 Q 250 80 500 48" fill="none" stroke="#38BDF8" strokeWidth="2" />
              <line x1="0" y1="30" x2="500" y2="30" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#F43F5E" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            <div className="absolute top-2 right-2 text-[9px] font-mono space-y-0.5">
              <div className="text-emerald-400/80">Strike ↑</div>
              <div className="text-cyan-300 font-bold">{mcStats.feasibility}% feasible</div>
              <div className="text-rose-400/80">Break ↓</div>
            </div>
          </div>
        )}

        {/* Mode 3–5 */}
        {visualMode === "heatmap" && <div className="h-56 overflow-y-auto"><Heatmap /></div>}
        {visualMode === "depth" && <div className="h-56 overflow-y-auto"><DepthChart symbol={symbol} midPrice={last || 0.5} /></div>}
        {visualMode === "timeline" && <div className="h-56 overflow-y-auto"><EventTimeline symbol={symbol} /></div>}

        {/* ─── Spike HUD Popover ──────────────────────────────────────── */}
        {selectedSpike && (
          <div className="absolute top-10 right-3 w-72 bg-[#111118]/95 border border-[#2A2A3D] rounded-xl p-3 shadow-xl backdrop-blur-xl z-30 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1F1F2E]">
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {selectedSpike.time} UTC · {selectedSpike.magnitude}
              </span>
              <button onClick={() => setSelectedSpike(null)} className="text-gray-500 hover:text-white"><X className="w-3 h-3" /></button>
            </div>

            <p className="text-gray-300 text-[11px] font-sans leading-relaxed">{selectedSpike.summary}</p>

            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span>Velocity: <b className="text-emerald-400">{selectedSpike.velocity}</b></span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => { sound.playClick(); sound.speakBriefing(`Spike on ${symbol}. ${selectedSpike.summary}`); }}
                className="py-1.5 rounded bg-[#161620] hover:bg-[#1E1E2E] border border-[#2A2A3D] text-violet-300 font-bold text-[10px] flex items-center justify-center gap-1 transition"
              >
                <Volume2 className="w-3 h-3" /> Voice
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  if (onSetEntryPrice) onSetEntryPrice(Number(selectedSpike.price.toFixed(2)));
                  if (showToast) showToast(`⚡ Synced Spike Entry $${selectedSpike.price.toFixed(2)} to Simulator!`, "success");
                  setSelectedSpike(null);
                }}
                className="py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition"
              >
                <Zap className="w-3 h-3" /> Trade Spike
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PriceChart;
