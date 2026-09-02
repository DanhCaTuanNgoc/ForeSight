import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart,
  Area,
  Line,
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
  X,
  Volume2,
  CandlestickChart,
  Split,
  RotateCcw,
  Crosshair,
  MoveHorizontal,
  Activity,
  Timer,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";

type TimeRange = "15m" | "1H" | "4H" | "1D";
export type CanvasVisualMode = "probability" | "montecarlo";
type VolatilityLevel = "low" | "normal" | "high";
type CurveMode = "yes-only" | "dual";
type RenderType = "area" | "candles";

export interface ChartDataPoint {
  time: string;
  price: number;
  priceNo?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  isSpike?: boolean;
  ema9?: number;
  ema21?: number;
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

// ─── Deterministic Exponential Moving Average (EMA) Calculation ───────────────
function computeEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  const k = 2 / (period + 1);
  const emaValues: number[] = [];
  let prevEMA = prices[0];
  emaValues.push(parseFloat(prevEMA.toFixed(4)));

  for (let i = 1; i < prices.length; i++) {
    const currentEMA = prices[i] * k + prevEMA * (1 - k);
    emaValues.push(parseFloat(currentEMA.toFixed(4)));
    prevEMA = currentEMA;
  }
  return emaValues;
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
  { mode: "probability", icon: TrendingUp, label: "Price Chart", activeClass: "bg-violet-600 text-white shadow-sm" },
  { mode: "montecarlo", icon: Sparkles, label: "Monte Carlo", activeClass: "bg-cyan-600 text-white shadow-sm" },
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
  const [showEMA, setShowEMA] = useState<boolean>(true); // Pro Indicator Toggle

  // ─── Crosshair & Interactive Hover State ─────────────────────────────────────
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);

  // ─── Real-time Bar Countdown Timer (TradingView style ⏱ 02:45) ─────────────
  const [countdown, setCountdown] = useState<string>("00:00");
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const intervalMsMap: Record<TimeRange, number> = {
        "15m": 15 * 60 * 1000,
        "1H": 60 * 60 * 1000,
        "4H": 4 * 60 * 60 * 1000,
        "1D": 24 * 60 * 60 * 1000,
      };
      const intervalMs = intervalMsMap[timeRange] || 15 * 60 * 1000;
      const remainingMs = intervalMs - (now % intervalMs);
      const totalSec = Math.floor(remainingMs / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      setCountdown(`${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

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
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) {
          setZoomLevel((prev) => Math.min(5, Number((prev + 0.3).toFixed(2))));
        } else if (e.deltaY > 0) {
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
  const slicedData = useMemo(() => {
    if (zoomLevel <= 1 && panOffset === 0) return rawData;
    const visibleCount = Math.max(8, Math.floor(rawData.length / zoomLevel));
    const maxOffset = Math.max(0, rawData.length - visibleCount);
    const clampedOffset = Math.max(0, Math.min(maxOffset, panOffset));
    const end = rawData.length - clampedOffset;
    const start = Math.max(0, end - visibleCount);
    return rawData.slice(start, end);
  }, [rawData, zoomLevel, panOffset]);

  // ─── Enrich Data with EMA 9 and EMA 21 ──────────────────────────────────────
  const data = useMemo(() => {
    const prices = slicedData.map((d) => d.close ?? d.price);
    const ema9Arr = computeEMA(prices, 9);
    const ema21Arr = computeEMA(prices, 21);

    return slicedData.map((d, idx) => ({
      ...d,
      ema9: ema9Arr[idx],
      ema21: ema21Arr[idx],
    }));
  }, [slicedData]);

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

  // ─── Drag to Pan Handlers (Active when Ctrl / Meta is held) ─────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || visualMode !== "probability") return;
    if (!e.ctrlKey && !e.metaKey) return;

    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartPan(panOffset);
    setHasDragged(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Crosshair coordinates calculation
    const rect = chartWrapperRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setCrosshairPos({ x: mouseX, y: mouseY });
    }

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

  const handleMouseLeave = () => {
    setIsDragging(false);
    setCrosshairPos(null);
    setHoveredPoint(null);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ─── Unified Chart Click Handler: Syncs ANY clicked price point to Simulator ───
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If user was dragging to pan history, don't trigger click
    if (hasDragged) {
      setHasDragged(false);
      return;
    }

    const rect = chartWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickY = e.clientY - rect.top;
    // Chart plot area height: top margin ~6px, bottom margin ~30px for volume
    const plotTop = 6;
    const plotBottom = rect.height - 30;
    const plotHeight = Math.max(1, plotBottom - plotTop);

    // Calculate normalized price from click Y: 0 (bottom) to 1.0 (top)
    const normalizedPrice = Math.max(0.05, Math.min(0.95, 1 - (clickY - plotTop) / plotHeight));
    const roundedPrice = Number(normalizedPrice.toFixed(2));

    sound.playClick();
    if (onSetEntryPrice) {
      onSetEntryPrice(roundedPrice);
    }
    if (showToast) {
      showToast(
        `⚡ Synced Entry Price $${roundedPrice.toFixed(2)} (${Math.round(roundedPrice * 100)}%) to Decision Simulator!`,
        "success"
      );
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

  // Active Point for the TradingView-style Legend (defaults to latest bar)
  const activePoint = hoveredPoint || data[data.length - 1] || data[0];
  const activeChange = activePoint?.open
    ? (((activePoint.close ?? activePoint.price) - activePoint.open) / activePoint.open) * 100
    : 0;

  // Crosshair Price & Time projection
  const currentHoverPrice = useMemo(() => {
    if (!crosshairPos || !chartWrapperRef.current) return null;
    const h = chartWrapperRef.current.clientHeight || 240;
    // Map Y coordinate (0 at top, h at bottom) to 0.00 -> 1.00 domain
    const normalized = Math.max(0, Math.min(1, 1 - (crosshairPos.y - 10) / (h - 40)));
    return (normalized * 100).toFixed(1);
  }, [crosshairPos]);

  return (
    <div className="rounded-xl border border-[#222234] bg-[#0C0C14] flex flex-col overflow-hidden font-mono relative select-none shadow-xl">
      {/* ─── 1. Top Control Toolbar (Clean, Pro & Uncluttered) ─────────── */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-[#1A1A28] bg-[#09090F] gap-2">
        {/* Left: Mode Tabs & Live Odds */}
        <div className="flex items-center gap-1">
          {MODE_TABS.map(({ mode, icon: Icon, label, activeClass }) => {
            const isActive = visualMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                title={label}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all text-[11px] font-bold ${
                  isActive ? activeClass : "text-gray-400 hover:text-gray-200 hover:bg-[#161620]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {isActive && <span>{label}</span>}
              </button>
            );
          })}

          <div className="w-px h-4 bg-[#262638] mx-1" />

          {/* Live Price Readout with Bar Countdown Timer */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white font-black text-sm">{(last * 100).toFixed(1)}%</span>
            <span className={`text-[10px] font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isUp ? "+" : ""}{change.toFixed(1)}%
            </span>

            {/* Countdown Badge (⏱ 02:45) */}
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#161626] border border-[#282840] text-[10px] text-violet-300 font-mono"
              title="Time left in current candle"
            >
              <Timer className="w-3 h-3 text-violet-400 animate-pulse" />
              <span>{countdown}</span>
            </div>

            {curveMode === "dual" && visualMode === "probability" && (
              <span className="text-rose-400/80 text-[10px] hidden sm:inline">NO {(lastNo * 100).toFixed(0)}%</span>
            )}
          </div>
        </div>

        {/* Right: Pro Toggles (EMA, Render, Timeframe) */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Reset */}
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

          {/* EMA 9/21 Indicator Toggle */}
          {visualMode === "probability" && (
            <button
              onClick={() => {
                sound.playClick();
                setShowEMA(!showEMA);
              }}
              title="Toggle Trend EMA 9 / EMA 21"
              className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border transition ${
                showEMA
                  ? "bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                  : "bg-[#12121B] border-[#222234] text-gray-500 hover:text-gray-300"
              }`}
            >
              <Activity className="w-3 h-3 text-amber-400" />
              <span>EMA</span>
            </button>
          )}

          {/* Area vs Candle Switcher */}
          {visualMode === "probability" && (
            <div className="flex items-center bg-[#111118] rounded-md border border-[#222234] text-[10px]">
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
                title={renderType === "area" ? "Switch to Candlesticks" : "Switch to Area"}
                className={`px-1.5 py-1 rounded-r-md transition ${
                  renderType === "candles" ? "text-amber-400 bg-amber-950/50" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <CandlestickChart className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Monte Carlo Volatility */}
          {visualMode === "montecarlo" && (
            <div className="flex items-center bg-[#111118] rounded-md border border-[#222234] text-[9px]">
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

          <div className="w-px h-4 bg-[#262638]" />

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-0.5 text-[10px]">
            {(["15m", "1H", "4H", "1D"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  sound.playClick();
                  handleResetZoom();
                  onTimeRangeChange(r);
                }}
                className={`px-1.5 py-0.5 rounded font-bold transition ${
                  timeRange === r ? "text-violet-300 bg-violet-600/30 border border-violet-500/40" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 2. TradingView-Grade OHLC Legend Ribbon ──────────────────── */}
      {visualMode === "probability" && (
        <div className="px-3 py-1 bg-[#090911] border-b border-[#1A1A28] flex items-center justify-between text-[10px] font-mono text-gray-400 overflow-x-auto select-none">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-bold text-white flex items-center gap-1">
              <span className="text-violet-400 font-black">{symbol}/tUSDC</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#161622] text-gray-400">{timeRange}</span>
            </span>

            <span className="text-gray-500">|</span>

            <span>O <b className="text-gray-200">{(activePoint?.open ?? activePoint?.price ?? 0.5).toFixed(2)}</b></span>
            <span>H <b className="text-emerald-400">{(activePoint?.high ?? activePoint?.price ?? 0.5).toFixed(2)}</b></span>
            <span>L <b className="text-rose-400">{(activePoint?.low ?? activePoint?.price ?? 0.5).toFixed(2)}</b></span>
            <span>C <b className={(activePoint?.close ?? activePoint?.price ?? 0) >= (activePoint?.open ?? activePoint?.price ?? 0) ? "text-emerald-400" : "text-rose-400"}>{(activePoint?.close ?? activePoint?.price ?? 0.5).toFixed(2)}</b></span>
            
            <span className={`font-bold ${activeChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {activeChange >= 0 ? "+" : ""}{activeChange.toFixed(1)}%
            </span>

            {activePoint?.volume && (
              <span className="hidden md:inline text-gray-400">
                Vol <b className="text-gray-200">{((activePoint.volume ?? 1000) / 1000).toFixed(1)}K</b>
              </span>
            )}

            {/* EMA Readout when active */}
            {showEMA && activePoint?.ema9 && (
              <span className="hidden sm:inline text-amber-400/90">
                EMA9 <b className="text-amber-300">{(activePoint.ema9 * 100).toFixed(1)}%</b>
              </span>
            )}
            {showEMA && activePoint?.ema21 && (
              <span className="hidden sm:inline text-purple-400/90">
                EMA21 <b className="text-purple-300">{(activePoint.ema21 * 100).toFixed(1)}%</b>
              </span>
            )}
          </div>

          <div className="text-[9px] text-gray-500 hidden xl:flex items-center gap-1.5">
            <Crosshair className="w-3 h-3 text-violet-400" />
            <span>Click chart to set Entry · Ctrl+Scroll to zoom</span>
          </div>
        </div>
      )}

      {/* ─── 3. Main Chart Canvas with Crosshair & Pan Engine ─────────── */}
      <div
        ref={chartWrapperRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`px-2 pt-1 pb-0 relative min-h-[220px] ${
          isDragging ? "cursor-grabbing" : zoomLevel > 1 ? "cursor-grab" : "cursor-crosshair"
        }`}
      >
        {/* Full TradingView Crosshair Overlay Lines */}
        {crosshairPos && visualMode === "probability" && (
          <>
            {/* Horizontal Line */}
            <div
              className="pointer-events-none absolute left-0 right-8 border-b border-dashed border-gray-500/40 z-20"
              style={{ top: crosshairPos.y }}
            />
            {/* Vertical Line */}
            <div
              className="pointer-events-none absolute top-0 bottom-6 border-r border-dashed border-gray-500/40 z-20"
              style={{ left: crosshairPos.x }}
            />
            {/* Right Y-Axis Dynamic Price Badge */}
            {currentHoverPrice && (
              <div
                className="pointer-events-none absolute right-1 px-1.5 py-0.5 bg-violet-600 text-white font-mono text-[9px] font-bold rounded shadow-lg z-30 transform -translate-y-1/2 transition-transform"
                style={{ top: crosshairPos.y }}
              >
                {currentHoverPrice}%
              </div>
            )}
            {/* Bottom X-Axis Dynamic Time Badge */}
            {hoveredPoint?.time && (
              <div
                className="pointer-events-none absolute bottom-1 px-1.5 py-0.5 bg-[#171726] border border-violet-500/60 text-violet-300 font-mono text-[8px] font-bold rounded shadow-lg z-30 transform -translate-x-1/2"
                style={{ left: crosshairPos.x }}
              >
                {hoveredPoint.time} UTC
              </div>
            )}
          </>
        )}

        {/* Mode 1A: Probability Area with Dual YES/NO & EMA Overlays */}
        {visualMode === "probability" && renderType === "area" && (
          <div>
            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 6, right: 14, left: 0, bottom: 0 }}
                  onMouseMove={(state: any) => {
                    if (state && state.activePayload && state.activePayload[0]) {
                      setHoveredPoint(state.activePayload[0].payload);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="noGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#1A1A28" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" tickFormatter={formatX} tick={{ fill: "#4B5563", fontSize: 9 }} axisLine={false} tickLine={false} interval={step - 1} />
                  <YAxis domain={[0, 1]} tickFormatter={formatY} tick={{ fill: "#4B5563", fontSize: 9 }} axisLine={false} tickLine={false} width={32} orientation="right" />

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
                    strokeOpacity={0.8}
                    label={{ value: `TP ${Math.round(targetExitPrice * 100)}%`, fill: "#10B981", fontSize: 9, position: "right" }}
                  />
                  <ReferenceLine
                    y={entryPrice}
                    stroke="#A78BFA"
                    strokeDasharray="4 4"
                    strokeWidth={1.2}
                    strokeOpacity={0.8}
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

                  {/* Trend Indicator: EMA 9 (Amber) */}
                  {showEMA && (
                    <Line
                      type="monotone"
                      dataKey="ema9"
                      name="EMA 9"
                      stroke="#F59E0B"
                      strokeWidth={1.2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}

                  {/* Trend Indicator: EMA 21 (Purple) */}
                  {showEMA && (
                    <Line
                      type="monotone"
                      dataKey="ema21"
                      name="EMA 21"
                      stroke="#A855F7"
                      strokeWidth={1.2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Volume Histogram Bars */}
            <div className="flex items-end gap-px h-5 px-1 -mt-0.5">
              {data.map((d, i) => {
                const h = ((d.volume ?? 0) / maxVol) * 100;
                const isGreen = (d.close ?? d.price) >= (d.open ?? d.price);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[1px] transition-all"
                    style={{
                      height: `${Math.max(8, h)}%`,
                      background: isGreen ? "rgba(16,185,129,0.28)" : "rgba(244,63,94,0.24)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 1B: Candlestick OHLC with EMA Trend Overlay */}
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

                {/* Candles */}
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
                      onMouseEnter={() => setHoveredPoint(d)}
                    >
                      {/* Wick */}
                      <line x1={x + candleW / 2} y1={highY} x2={x + candleW / 2} y2={lowY} stroke={color} strokeWidth="1" />
                      {/* Body */}
                      <rect x={x} y={Math.min(openY, closeY)} width={candleW} height={Math.max(2, Math.abs(closeY - openY))} fill={color} rx="0.5" />
                    </g>
                  );
                })}

                {/* EMA 9 Curve Overlay on SVG */}
                {showEMA && (
                  <path
                    d={data.reduce((acc, d, i) => {
                      const stepX = 500 / Math.max(1, data.length);
                      const x = i * stepX + stepX * 0.5;
                      const y = 180 - (d.ema9 || d.price) * 170;
                      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, "")}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.3"
                    strokeOpacity="0.85"
                  />
                )}

                {/* EMA 21 Curve Overlay on SVG */}
                {showEMA && (
                  <path
                    d={data.reduce((acc, d, i) => {
                      const stepX = 500 / Math.max(1, data.length);
                      const x = i * stepX + stepX * 0.5;
                      const y = 180 - (d.ema21 || d.price) * 170;
                      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, "")}
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="1.3"
                    strokeOpacity="0.85"
                  />
                )}
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
                      background: up ? "rgba(16,185,129,0.28)" : "rgba(244,63,94,0.24)",
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
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.35} />
                </linearGradient>
                <linearGradient id="mcDn" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.04} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.2} />
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

        {/* Panning / Time Horizon Indicator */}
        {(zoomLevel > 1 || panOffset > 0) && (
          <div className="absolute top-2 left-3 bg-[#0E0E16]/90 border border-violet-500/40 rounded px-2 py-0.5 text-[9px] text-violet-300 font-mono flex items-center gap-1.5 shadow-sm z-30">
            <MoveHorizontal className="w-2.5 h-2.5 text-violet-400" />
            <span>
              Window: {data[0]?.time} → {data[data.length - 1]?.time} ({zoomLevel.toFixed(1)}x)
            </span>
            {panOffset > 0 && <span className="text-amber-400">· Historical</span>}
          </div>
        )}

        {/* ─── Spike HUD Popover ──────────────────────────────────────── */}
        {selectedSpike && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-10 right-3 w-72 bg-[#111118]/95 border border-[#2A2A3D] rounded-xl p-3 shadow-xl backdrop-blur-xl z-30 space-y-2 animate-fadeIn"
          >
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
