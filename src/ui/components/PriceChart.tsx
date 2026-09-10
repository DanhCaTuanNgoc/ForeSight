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
  Target,
  ArrowUpRight,
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
  strikePrice?: number;
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

// ─── Realistic Mock Data Generator with Continuous OHLC Candles ────────────────
function generateMockData(range: TimeRange, baseProbability: number, symbol: string = "BTC"): ChartDataPoint[] {
  const pointsMap: Record<TimeRange, number> = { "15m": 45, "1H": 75, "4H": 120, "1D": 60 };
  const points = pointsMap[range];
  let base = baseProbability > 1 ? baseProbability / 100 : baseProbability;
  base = Math.max(0.08, Math.min(0.92, base));

  // Deterministic seed
  let seed = 0;
  for (let c = 0; c < symbol.length; c++) {
    seed = (seed << 5) - seed + symbol.charCodeAt(c);
    seed |= 0;
  }
  seed += points + Math.round(base * 100);

  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const now = Date.now();
  const msMap: Record<TimeRange, number> = { "15m": 900_000, "1H": 3600_000, "4H": 14400_000, "1D": 86400_000 };
  const spanMs = msMap[range];
  const stepMs = spanMs / points;

  let currentClose = base;
  return Array.from({ length: points }, (_, i) => {
    const open = currentClose;
    const delta = (pseudoRandom() - 0.49) * 0.022;
    currentClose = Math.max(0.05, Math.min(0.95, open + delta));

    const wickTop = pseudoRandom() * 0.012;
    const wickBot = pseudoRandom() * 0.012;
    const high = Math.min(0.98, Math.max(open, currentClose) + wickTop);
    const low = Math.max(0.02, Math.min(open, currentClose) - wickBot);

    const ptTime = new Date(now - (points - 1 - i) * stepMs);
    const timeStr = ptTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const isSpike = i === Math.floor(points * 0.72);

    return {
      time: timeStr,
      price: parseFloat(currentClose.toFixed(4)),
      priceNo: parseFloat((1 - currentClose).toFixed(4)),
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(currentClose.toFixed(4)),
      volume: Math.floor(pseudoRandom() * 6000 + 800),
      isSpike,
    };
  });
}

// ─── Mode tab config ─────────────────────────────────────────────────────────
const MODE_TABS: { mode: CanvasVisualMode; icon: React.ElementType; label: string; activeClass: string }[] = [
];

export const PriceChart: React.FC<PriceChartProps> = ({
  symbol,
  data: propData,
  timeRange,
  onTimeRangeChange,
  currentPrice = 60,
  strikePrice,
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
  const [showEMA, setShowEMA] = useState<boolean>(true); // Trend Indicators Toggle
  const [clickTargetMode, setClickTargetMode] = useState<"entry" | "tp">("entry");

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
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<number>(0);
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

  // ─── Compute Invariant EMAs on Full Raw Dataset First ────────────────────────
  const enrichedRawData = useMemo(() => {
    const prices = rawData.map((d) => d.close ?? d.price);
    const ema9Arr = computeEMA(prices, 9);
    const ema21Arr = computeEMA(prices, 21);

    return rawData.map((d, idx) => ({
      ...d,
      ema9: ema9Arr[idx],
      ema21: ema21Arr[idx],
    }));
  }, [rawData]);

  // ─── Slicing Data Based on Zoom and Pan Offset ──────────────────────────────
  const data = useMemo(() => {
    if (zoomLevel <= 1 && panOffset === 0) return enrichedRawData;
    const visibleCount = Math.max(8, Math.floor(enrichedRawData.length / zoomLevel));
    const maxOffset = Math.max(0, enrichedRawData.length - visibleCount);
    const clampedOffset = Math.max(0, Math.min(maxOffset, panOffset));
    const end = enrichedRawData.length - clampedOffset;
    const start = Math.max(0, end - visibleCount);
    return enrichedRawData.slice(start, end);
  }, [enrichedRawData, zoomLevel, panOffset]);

  const first = data[0]?.price ?? 0;
  const last = data[data.length - 1]?.price ?? 0;
  const lastNo = 1 - last;
  const change = first > 0 ? ((last - first) / first) * 100 : 0;
  const isUp = change >= 0;

  // Expected upside from Entry to Target Exit
  const upsidePct =
    entryPrice > 0 && targetExitPrice > entryPrice
      ? (((targetExitPrice - entryPrice) / entryPrice) * 100).toFixed(1)
      : null;

  const isSpotMode = useMemo(() => {
    return data.some((d) => (d.close ?? d.price) > 1.5);
  }, [data]);

  const yDomain = useMemo(() => {
    if (isSpotMode) {
      const prices = data.map((d) => d.close ?? d.price);
      if (strikePrice && strikePrice > 0) prices.push(strikePrice);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const pad = (max - min) * 0.08 || min * 0.02;
      return [Math.max(0, Number((min - pad).toFixed(2))), Number((max + pad).toFixed(2))];
    }
    return [0, 1];
  }, [isSpotMode, data, strikePrice]);

  const formatY = (v: number) => {
    if (isSpotMode) {
      if (v >= 1000) return `$${Math.round(v).toLocaleString()}`;
      if (v >= 1) return `$${v.toFixed(2)}`;
      return `$${v.toFixed(4)}`;
    }
    return `${(v * 100).toFixed(0)}%`;
  };

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

  // ─── Interactive Click: Syncs clicked price to Entry or TP in Simulator ──────
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDragged) {
      setHasDragged(false);
      return;
    }

    const rect = chartWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickY = e.clientY - rect.top;
    const plotTop = 10;
    const plotBottom = rect.height - 35;
    const plotHeight = Math.max(1, plotBottom - plotTop);

    const normalizedPrice = Math.max(0.01, Math.min(0.99, 1 - (clickY - plotTop) / plotHeight));
    const roundedPrice = Number(normalizedPrice.toFixed(2));

    sound.playClick();
    const isTP = e.shiftKey || clickTargetMode === "tp";

    if (isTP) {
      if (onSetTargetExitPrice) onSetTargetExitPrice(roundedPrice);
      if (showToast) {
        showToast(`Target Exit (TP) synced: $${roundedPrice.toFixed(2)} (${Math.round(roundedPrice * 100)}%)`, "success");
      }
    } else {
      if (onSetEntryPrice) onSetEntryPrice(roundedPrice);
      if (showToast) {
        showToast(`Entry Price synced: $${roundedPrice.toFixed(2)} (${Math.round(roundedPrice * 100)}%)`, "success");
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

  // Active Point for the TradingView-style Legend (defaults to latest bar)
  const activePoint = hoveredPoint || data[data.length - 1] || data[0];
  const activeChange = activePoint?.open
    ? (((activePoint.close ?? activePoint.price) - activePoint.open) / activePoint.open) * 100
    : 0;

  // Crosshair Price & Probability projection
  const currentHoverPrice = useMemo(() => {
    if (!crosshairPos || !chartWrapperRef.current) return null;
    const h = chartWrapperRef.current.clientHeight || 240;
    const normalized = Math.max(0, Math.min(1, 1 - (crosshairPos.y - 10) / (h - 40)));
    return {
      pct: (normalized * 100).toFixed(1),
      price: normalized.toFixed(2),
    };
  }, [crosshairPos]);

  // ─── Mini Strike Radar Calculation (0ms Math Reflex) ────────────────────────
  const radarMetrics = useMemo(() => {
    if (!strikePrice || strikePrice <= 0) return null;
    const spotVal = last;
    let delta = 0;
    let deltaPct = 0;
    let bps = 0;
    let isAbove = false;
    let isSafe = false;

    if (isSpotMode) {
      delta = spotVal - strikePrice;
      deltaPct = (delta / strikePrice) * 100;
      bps = Math.round(deltaPct * 100);
      isAbove = spotVal >= strikePrice;
      isSafe = Math.abs(deltaPct) >= 0.05; // 5 bps safety margin
    } else {
      const prob = spotVal * 100;
      deltaPct = prob - 50;
      bps = Math.round(deltaPct * 10);
      isAbove = prob >= 50;
      isSafe = Math.abs(deltaPct) >= 5;
    }

    const sliderPos = Math.max(5, Math.min(95, 50 + (isSpotMode ? deltaPct * 150 : deltaPct)));

    return {
      spotVal,
      strikePrice,
      delta,
      deltaPct,
      bps,
      isAbove,
      isSafe,
      sliderPos,
    };
  }, [strikePrice, last, isSpotMode]);

  return (
    <div className="rounded-none border border-white/[0.08] bg-[#09090F] flex flex-col overflow-hidden font-mono relative select-none shadow-xl">
      {/* ─── 1. Top Control Toolbar (Clean, Pro & Uncluttered) ─────────── */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 border-b border-white/[0.07] bg-[#07070C] gap-2">
        {/* Left: Mode Tabs & Live Odds */}
        <div className="flex items-center gap-1">
          {MODE_TABS.map(({ mode, icon: Icon, label, activeClass }) => {
            const isActive = visualMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                title={label}
                className={`flex items-center gap-1 px-2 py-1 rounded-none transition-all text-[11px] font-bold cursor-pointer ${
                  isActive ? activeClass : "text-gray-400 hover:text-gray-200 hover:bg-[#12121C]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {isActive && <span>{label}</span>}
              </button>
            );
          })}

          <div className="w-px h-3.5 bg-white/[0.08] mx-1" />

          {/* Live Price Readout with Bar Countdown Timer */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white font-black text-sm">
              {isSpotMode
                ? (last >= 1000
                    ? `$${last.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `$${last.toFixed(3)}`)
                : `${(last * 100).toFixed(1)}%`}
            </span>
            <span className={`text-[10px] font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isUp ? "+" : ""}{change.toFixed(1)}%
            </span>

            {strikePrice && strikePrice > 0 && (
              <span className="text-cyan-300 text-[10px] hidden sm:inline border border-cyan-500/30 px-1 py-0.2 bg-cyan-950/30">
                Strike: ${strikePrice.toLocaleString()}
              </span>
            )}

            {/* Countdown Badge */}
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-none bg-[#0E0E17] border border-white/[0.08] text-[10px] text-violet-300 font-mono"
              title="Time left in current candle"
            >
              <Timer className="w-3 h-3 text-violet-400 animate-pulse" />
              <span>{countdown}</span>
            </div>

            {!isSpotMode && curveMode === "dual" && visualMode === "probability" && (
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
              className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#0E0E17] text-violet-300 hover:text-white hover:bg-violet-600/30 border border-violet-500/40 rounded-none transition flex items-center gap-1 cursor-pointer"
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
              className={`px-2 py-0.5 rounded-none text-[10px] font-bold flex items-center gap-1 border transition cursor-pointer ${
                showEMA
                  ? "bg-violet-950/50 border-violet-500/40 text-violet-300"
                  : "bg-[#0E0E17] border-white/[0.06] text-gray-500 hover:text-gray-300"
              }`}
            >
              <Activity className="w-3 h-3 text-violet-400" />
              <span>EMA</span>
            </button>
          )}
        

          <div className="w-px h-3.5 bg-white/[0.08]" />

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
                className={`px-1.5 py-0.5 rounded-none font-bold transition cursor-pointer ${
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
        <div className="px-3 py-1 bg-[#07070C] border-b border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-gray-400 overflow-x-auto select-none">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-bold text-white flex items-center gap-1">
              <span className="text-violet-400 font-black">{symbol}/tUSDC</span>
              <span className="text-[9px] px-1 py-0.2 rounded-none bg-[#0E0E17] text-gray-400">{timeRange}</span>
            </span>

            <span className="text-gray-600">|</span>

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
              <span className="hidden sm:inline text-violet-400/90">
                EMA9 <b className="text-violet-300">{(activePoint.ema9 * 100).toFixed(1)}%</b>
              </span>
            )}
            {showEMA && activePoint?.ema21 && (
              <span className="hidden sm:inline text-purple-400/90">
                EMA21 <b className="text-purple-300">{(activePoint.ema21 * 100).toFixed(1)}%</b>
              </span>
            )}
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
              className="pointer-events-none absolute left-0 right-10 border-b border-dashed border-gray-500/40 z-20"
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
                className="pointer-events-none absolute right-1 px-1.5 py-0.5 bg-violet-600 text-white font-mono text-[9px] font-bold rounded shadow-lg z-30 transform -translate-y-1/2 transition-transform flex items-center gap-1"
                style={{ top: crosshairPos.y }}
              >
                <span>{currentHoverPrice.pct}%</span>
                <span className="text-violet-200 text-[8px]">(${currentHoverPrice.price})</span>
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

        {/* Mode 1A: Probability Area with Dual YES/NO & Distinct Colors */}
        {visualMode === "probability" && renderType === "area" && (
          <div>
            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                  onMouseMove={(state: any) => {
                    if (state && state.activePayload && state.activePayload[0]) {
                      setHoveredPoint(state.activePayload[0].payload);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#161624" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatX}
                    tick={{ fill: "#4B5563", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    interval={step - 1}
                  />
                  <YAxis
                    domain={yDomain}
                    tickFormatter={formatY}
                    tick={{ fill: "#6B7280", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    width={isSpotMode ? 55 : 36}
                    orientation="right"
                  />

                  {/* Strike Price Target Line */}
                  {strikePrice && strikePrice > 0 && (
                    <ReferenceLine
                      y={isSpotMode ? strikePrice : 0.5}
                      stroke="#06B6D4"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      strokeOpacity={0.9}
                      label={{
                        value: `STRIKE: $${strikePrice.toLocaleString()}`,
                        fill: "#06B6D4",
                        fontSize: 9,
                        position: "insideTopLeft",
                      }}
                    />
                  )}

                  {/* Live Current Price Horizontal Ray */}
                  <ReferenceLine
                    y={last}
                    stroke={isUp ? "#10B981" : "#F43F5E"}
                    strokeDasharray="2 2"
                    strokeWidth={1.2}
                    strokeOpacity={0.85}
                    label={{
                      value: isSpotMode
                        ? `SPOT: $${last >= 1000 ? Math.round(last).toLocaleString() : last.toFixed(2)}`
                        : `LIVE: $${last.toFixed(2)} (${(last * 100).toFixed(1)}%)`,
                      fill: isUp ? "#34D399" : "#FB7185",
                      fontSize: 8.5,
                      position: "insideTopRight",
                    }}
                  />

                  {/* YES Curve (Emerald Green Area) */}
                  <Area
                    type="monotone"
                    dataKey="price"
                    name="YES"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#yesGrad)"
                    isAnimationActive={false}
                    dot={(props: any) => {
                      const { cx, cy, payload, index } = props;
                      const isLast = index === data.length - 1;

                      if (payload?.isSpike) {
                        return (
                          <g
                            key={`spike-${payload.time}`}
                            className="cursor-pointer"
                            onClick={() => handleInspectSpike(payload)}
                          >
                            <circle cx={cx} cy={cy} r={4.5} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.5} />
                            <text
                              x={cx + 7}
                              y={cy - 5}
                              fill="#10B981"
                              fontSize={8}
                              fontFamily="JetBrains Mono"
                              fontWeight="bold"
                            >
                              ⚡ Spike
                            </text>
                          </g>
                        );
                      }

                      if (isLast && panOffset === 0) {
                        return (
                          <g key="live-dot">
                            <circle cx={cx} cy={cy} r={4} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.5} />
                            <circle cx={cx} cy={cy} r={7} fill="none" stroke="#10B981" strokeWidth={1} opacity={0.6} />
                          </g>
                        );
                      }

                      return null;
                    }}
                    activeDot={{ r: 5, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
                  />

                  {/* NO Curve (Clean Rose Line without opaque fill overlap) */}
                  {curveMode === "dual" && (
                    <Line
                      type="monotone"
                      dataKey="priceNo"
                      name="NO"
                      stroke="#F43F5E"
                      strokeWidth={1.4}
                      strokeDasharray="3 3"
                      isAnimationActive={false}
                      dot={false}
                      activeDot={{ r: 4, fill: "#F43F5E", stroke: "#fff", strokeWidth: 1.5 }}
                    />
                  )}

                  {/* Trend Indicator: EMA 9 (Warm Orange) */}
                  {showEMA && (
                    <Line
                      type="monotone"
                      dataKey="ema9"
                      name="EMA 9"
                      stroke="#FB923C"
                      strokeWidth={1.2}
                      strokeOpacity={0.8}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}

                  {/* Trend Indicator: EMA 21 (Soft Indigo) */}
                  {showEMA && (
                    <Line
                      type="monotone"
                      dataKey="ema21"
                      name="EMA 21"
                      stroke="#818CF8"
                      strokeWidth={1.2}
                      strokeOpacity={0.8}
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
                      background: isGreen ? "rgba(16,185,129,0.32)" : "rgba(244,63,94,0.28)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 1B: Normalized Candlestick OHLC with Pro Y Coordinates */}
        {visualMode === "probability" && renderType === "candles" && (
          <div>
            <div className="h-48 sm:h-56 w-full bg-[#07070C] rounded-none border border-white/[0.06] p-2 relative">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* SVG Coordinate Scaling: plot Top = 16, Bottom = 180, Height = 164 */}
                {/* Grid Line 75% (y = 180 - 0.75 * 164 = 57) */}
                <line x1="0" y1={57} x2="470" y2={57} stroke="#161624" strokeDasharray="3 3" />
                <text x="495" y={60} fill="#4B5563" fontSize="8" textAnchor="end">75% ($0.75)</text>

                {/* Grid Line 50% (y = 180 - 0.50 * 164 = 98) */}
                <line x1="0" y1={98} x2="470" y2={98} stroke="#2D2D42" strokeDasharray="3 3" strokeWidth="1" />
                <text x="495" y={101} fill="#6B7280" fontSize="8" fontWeight="bold" textAnchor="end">50% ($0.50)</text>

                {/* Grid Line 25% (y = 180 - 0.25 * 164 = 139) */}
                <line x1="0" y1={139} x2="470" y2={139} stroke="#161624" strokeDasharray="3 3" />
                <text x="495" y={142} fill="#4B5563" fontSize="8" textAnchor="end">25% ($0.25)</text>

                {/* TP Line Overlay on SVG */}
                {targetExitPrice && (
                  <line
                    x1="0"
                    y1={180 - targetExitPrice * 164}
                    x2="500"
                    y2={180 - targetExitPrice * 164}
                    stroke="#F59E0B"
                    strokeDasharray="6 3"
                    strokeWidth="1.2"
                    strokeOpacity={0.8}
                  />
                )}

                {/* Entry Line Overlay on SVG */}
                {entryPrice && (
                  <line
                    x1="0"
                    y1={180 - entryPrice * 164}
                    x2="500"
                    y2={180 - entryPrice * 164}
                    stroke="#06B6D4"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                    strokeOpacity={0.8}
                  />
                )}

                {/* Candles */}
                {data.map((d, i) => {
                  const stepX = 460 / Math.max(1, data.length);
                  const x = i * stepX + stepX * 0.15;
                  const candleW = Math.max(3.5, stepX * 0.7);

                  const openVal = d.open ?? d.price;
                  const closeVal = d.close ?? d.price;
                  const highVal = d.high ?? Math.max(openVal, closeVal);
                  const lowVal = d.low ?? Math.min(openVal, closeVal);

                  const openY = 180 - openVal * 164;
                  const closeY = 180 - closeVal * 164;
                  const highY = 180 - highVal * 164;
                  const lowY = 180 - lowVal * 164;
                  const up = closeVal >= openVal;
                  const color = up ? "#10B981" : "#F43F5E";

                  return (
                    <g
                      key={i}
                      className="cursor-pointer hover:opacity-80"
                      onMouseEnter={() => setHoveredPoint(d)}
                    >
                      {/* Wick */}
                      <line x1={x + candleW / 2} y1={highY} x2={x + candleW / 2} y2={lowY} stroke={color} strokeWidth="1.2" />
                      {/* Body */}
                      <rect
                        x={x}
                        y={Math.min(openY, closeY)}
                        width={candleW}
                        height={Math.max(2.5, Math.abs(closeY - openY))}
                        fill={color}
                        rx="0.5"
                      />
                    </g>
                  );
                })}

                {/* EMA 9 Curve Overlay on SVG */}
                {showEMA && (
                  <path
                    d={data.reduce((acc, d, i) => {
                      const stepX = 460 / Math.max(1, data.length);
                      const x = i * stepX + stepX * 0.5;
                      const y = 180 - (d.ema9 || d.price) * 164;
                      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, "")}
                    fill="none"
                    stroke="#FB923C"
                    strokeWidth="1.3"
                    strokeOpacity="0.85"
                  />
                )}

                {/* EMA 21 Curve Overlay on SVG */}
                {showEMA && (
                  <path
                    d={data.reduce((acc, d, i) => {
                      const stepX = 460 / Math.max(1, data.length);
                      const x = i * stepX + stepX * 0.5;
                      const y = 180 - (d.ema21 || d.price) * 164;
                      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, "")}
                    fill="none"
                    stroke="#818CF8"
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
                      background: up ? "rgba(16,185,129,0.32)" : "rgba(244,63,94,0.28)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Panning / Time Horizon Indicator */}
        {(zoomLevel > 1 || panOffset > 0) && (
          <div className="absolute top-2 left-3 bg-[#0E0E16]/90 border border-violet-500/40 rounded-none px-2 py-0.5 text-[9px] text-violet-300 font-mono flex items-center gap-1.5 shadow-sm z-30">
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
            className="absolute top-10 right-3 w-72 bg-[#0E0E17]/95 border border-white/[0.08] rounded-none p-3 shadow-xl backdrop-blur-xl z-30 space-y-2 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {selectedSpike.time} UTC · {selectedSpike.magnitude}
              </span>
              <button onClick={() => setSelectedSpike(null)} className="text-gray-500 hover:text-white cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>

            <p className="text-gray-300 text-[11px] font-sans leading-relaxed">{selectedSpike.summary}</p>

            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span>
                Velocity: <b className="text-emerald-400">{selectedSpike.velocity}</b>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  sound.speakBriefing(`Spike on ${symbol}. ${selectedSpike.summary}`);
                }}
                className="py-1.5 rounded-none bg-[#12121C] hover:bg-[#181824] border border-white/[0.08] text-violet-300 font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Volume2 className="w-3 h-3" /> Voice
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  if (onSetEntryPrice) onSetEntryPrice(Number(selectedSpike.price.toFixed(2)));
                  if (showToast) showToast(`Synced Spike Entry: $${selectedSpike.price.toFixed(2)} to Simulator`, "success");
                  setSelectedSpike(null);
                }}
                className="py-1.5 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Zap className="w-3 h-3" /> Trade Spike
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 4. Bottom Mini Strike Radar & Real-Time Distance Ribbon (0.5s Comprehension) ─── */}
      {radarMetrics && (
        <div className="px-3 py-1.5 bg-[#07070C] border-t border-white/[0.08] flex flex-wrap items-center justify-between text-[10px] font-mono select-none gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5">
              <Target className="w-3 h-3 text-cyan-400" />
              STRIKE RADAR
            </span>

            <span className="text-gray-400">
              Strike: <b className="text-cyan-300 font-bold">${radarMetrics.strikePrice.toLocaleString()}</b>
            </span>

            <span className="text-gray-600">|</span>

            <span className="text-gray-400">
              Spot: <b className={radarMetrics.isAbove ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                ${radarMetrics.spotVal >= 1000 ? radarMetrics.spotVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : radarMetrics.spotVal.toFixed(3)}
              </b>
            </span>

            <span className={`px-1.5 py-0.5 font-bold text-[9px] ${
              radarMetrics.isAbove
                ? "text-emerald-300 bg-emerald-950/50 border border-emerald-500/40"
                : "text-rose-300 bg-rose-950/50 border border-rose-500/40"
            }`}>
              {radarMetrics.isAbove ? "+" : ""}{radarMetrics.deltaPct.toFixed(3)}% ({radarMetrics.isAbove ? "+" : ""}{radarMetrics.bps} bps)
            </span>
          </div>

          {/* Mini Visual Gauge (Strike in center) */}
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-gray-500 font-bold">BEAR (NO)</span>
            <div className="w-28 sm:w-36 h-2.5 bg-[#0E0E17] border border-white/[0.1] relative rounded-none overflow-hidden">
              {/* Center Strike Marker */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-cyan-400 z-10" />
              {/* Dynamic Spot Pointer */}
              <div
                className={`absolute top-0 bottom-0 w-2.5 ${
                  radarMetrics.isAbove ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                } transition-all duration-300`}
                style={{
                  left: `${radarMetrics.sliderPos}%`,
                  transform: "translateX(-50%)",
                }}
              />
            </div>
            <span className="text-[8px] text-gray-500 font-bold">BULL (YES)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceChart;
