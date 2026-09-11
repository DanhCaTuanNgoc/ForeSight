import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowUpDown,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BookOpen,
  Scale,
  Gauge,
  Target,
} from "lucide-react";
import { CryptoIcon } from "./CryptoIcon.js";
import { sound } from "../utils/sound-fx.js";
import { apiUrl } from "../utils/api.js";
import { calculateBlackScholesBinaryFairValue } from "../../core/quantitative-pricing.js";

interface AnalyticsViewProps {
  markets?: any[];
  selectedMarket?: any;
  onSelectMarket: (symbol: string) => void;
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
}

// Orderbook row item
const OrderbookRow: React.FC<{ price: number; size: number; side: "bid" | "ask"; maxSize: number }> = ({ price, size, side, maxSize }) => {
  const safePrice = typeof price === "number" && !isNaN(price) ? price : 0.50;
  const safeSize = typeof size === "number" && !isNaN(size) ? size : 100;
  const pct = maxSize > 0 ? Math.min(100, (safeSize / maxSize) * 100) : 20;
  return (
    <div className="relative flex items-center justify-between text-[11px] font-mono py-1 px-2.5 rounded-none overflow-hidden">
      <div
        className={`absolute inset-y-0 ${side === "bid" ? "left-0 bg-emerald-500/15" : "right-0 bg-rose-500/15"}`}
        style={{ width: `${pct}%` }}
      />
      <span className={`relative font-bold ${side === "bid" ? "text-emerald-400" : "text-rose-400"}`}>
        ${safePrice.toFixed(3)}
      </span>
      <span className="relative text-gray-400 font-mono text-[10px]">{Math.round(safeSize).toLocaleString()} shares</span>
    </div>
  );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  markets: propMarkets = [],
  selectedMarket: propSelectedMarket,
  onSelectMarket,
  selectedSymbol: propSymbol,
  onSelectSymbol,
}) => {
  // ─── 1. REAL-TIME ORACLE SPOT DATA STATE ────────────────────────────────────
  const [liveSpotMap, setLiveSpotMap] = useState<Record<string, { price: number; change: number; volume: number }>>({});
  const [liveMarkets, setLiveMarkets] = useState<any[]>([]);
  const [orderbook, setOrderbook] = useState<{
    bids: [number, number][];
    asks: [number, number][];
    bestBid: number;
    bestAsk: number;
    midPrice: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Clean symbol: Extract core token "BTC", "ETH", "SOL", "SOMI"
  const cleanSymbol = useMemo(() => {
    const raw = (propSymbol || "BTC").toUpperCase();
    return raw.replace(/\/.*$/, "").replace(/-.*$/, "").trim() || "BTC";
  }, [propSymbol]);

  const [internalSymbol, setInternalSymbol] = useState<string>(cleanSymbol);
  const activeSymbol = (internalSymbol || cleanSymbol || "BTC").toUpperCase();

  const handleSelectSymbol = (sym: string) => {
    sound.playClick();
    setInternalSymbol(sym);
    if (onSelectSymbol) onSelectSymbol(sym);
  };

  useEffect(() => {
    if (cleanSymbol) setInternalSymbol(cleanSymbol);
  }, [cleanSymbol]);

  // ─── Fetch live spot prices from /api/spot (Binance Oracle) ────────────────
  const fetchLiveSpot = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/spot"));
      if (res.ok) {
        const data = await res.json();
        if (data.tickers && Array.isArray(data.tickers)) {
          const map: Record<string, { price: number; change: number; volume: number }> = {};
          data.tickers.forEach((t: any) => {
            const sym = (t.rawSymbol || t.symbol.replace(/[\/].*$/, "")).toUpperCase();
            map[sym] = {
              price: Number(t.price),
              change: Number(t.change),
              volume: Number(t.volume),
            };
          });
          setLiveSpotMap(map);
        }
      }
    } catch (err) {
      console.warn("[AnalyticsView] Failed to fetch live spot price:", err);
    }
  }, []);

  // ─── Fetch live event contracts from /api/markets ──────────────────────────
  const fetchLiveMarkets = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/markets"));
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.markets;
        if (Array.isArray(list)) {
          setLiveMarkets(list);
        }
      }
    } catch (err) {
      console.warn("[AnalyticsView] Failed to fetch live markets:", err);
    }
  }, []);

  // ─── Fetch live orderbook depth ────────────────────────────────────────────
  const fetchOrderbook = useCallback(async (sym: string) => {
    try {
      const res = await fetch(apiUrl(`/api/markets/${encodeURIComponent(sym)}/orderbook`));
      if (res.ok) {
        const data = await res.json();
        setOrderbook({
          bids: Array.isArray(data.bids) ? data.bids.slice(0, 5) : [],
          asks: Array.isArray(data.asks) ? data.asks.slice(0, 5) : [],
          bestBid: typeof data.bestBid === "number" ? data.bestBid : 0.49,
          bestAsk: typeof data.bestAsk === "number" ? data.bestAsk : 0.51,
          midPrice: typeof data.midPrice === "number" ? data.midPrice : 0.50,
        });
      }
    } catch {
      // Ignore
    }
  }, []);

  // Initial & periodic polling (real-time stream every 3 seconds)
  useEffect(() => {
    fetchLiveSpot();
    fetchLiveMarkets();
    const interval = setInterval(() => {
      fetchLiveSpot();
      fetchLiveMarkets();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchLiveSpot, fetchLiveMarkets]);

  // Combine propMarkets with live fetched markets safely
  const allMarkets = useMemo(() => {
    if (liveMarkets.length > 0) return liveMarkets;
    if (propMarkets && propMarkets.length > 0) return propMarkets;
    return [];
  }, [liveMarkets, propMarkets]);

  useEffect(() => {
    fetchOrderbook(activeSymbol);
    const interval = setInterval(() => fetchOrderbook(activeSymbol), 3000);
    return () => clearInterval(interval);
  }, [activeSymbol, fetchOrderbook]);

  // Find active market for current selected symbol safely
  const activeMarket = useMemo(() => {
    if (propSelectedMarket && (propSelectedMarket.underlyingAsset || propSelectedMarket.symbol || "").toUpperCase().includes(activeSymbol)) {
      return propSelectedMarket;
    }
    if (!allMarkets || allMarkets.length === 0) return null;
    return allMarkets.find((m) => {
      if (!m) return false;
      const mSym = (m.underlyingAsset || m.symbol || "").toUpperCase();
      return mSym.includes(activeSymbol) || activeSymbol.includes(mSym);
    }) || allMarkets[0] || null;
  }, [propSelectedMarket, allMarkets, activeSymbol]);

  // ─── 2. DYNAMIC REAL-TIME VALUES (SAFE GUARDS AGAINST NaN) ──────────────────
  // A. Spot Price: Live from Binance oracle
  const spotPrice = useMemo(() => {
    if (liveSpotMap[activeSymbol]?.price) {
      return liveSpotMap[activeSymbol].price;
    }
    if (activeMarket?.spotPrice && typeof activeMarket.spotPrice === "number") {
      return activeMarket.spotPrice;
    }
    if (activeSymbol === "BTC") return 77590;
    if (activeSymbol === "ETH") return 2420;
    if (activeSymbol === "SOL") return 100;
    return 0.742;
  }, [liveSpotMap, activeSymbol, activeMarket]);

  // B. Implied Probability from contract
  const prob = useMemo(() => {
    if (orderbook?.midPrice && typeof orderbook.midPrice === "number") {
      return Number((orderbook.midPrice * 100).toFixed(1));
    }
    if (activeMarket?.impliedUpProbability && typeof activeMarket.impliedUpProbability === "number") {
      return Number((activeMarket.impliedUpProbability * 100).toFixed(1));
    }
    if (activeMarket?.probability && typeof activeMarket.probability === "number") {
      return Number(activeMarket.probability);
    }
    return 55.0;
  }, [orderbook, activeMarket]);

  const isUp = prob >= 50;

  // C. Strike Price
  const strikePrice = useMemo(() => {
    if (activeMarket?.strikePrice && typeof activeMarket.strikePrice === "number" && activeMarket.strikePrice > 0) {
      return activeMarket.strikePrice;
    }
    const mult = isUp ? 0.996 : 1.004;
    return Number((spotPrice * mult).toFixed(spotPrice > 10 ? 1 : 4));
  }, [activeMarket, spotPrice, isUp]);

  // D. Real-time Live Second-by-Second Countdown & Rollover Transition State
  const initialTimeSec = useMemo(() => {
    return (activeMarket?.timeRemainingSec && typeof activeMarket.timeRemainingSec === "number" && activeMarket.timeRemainingSec > 0)
      ? activeMarket.timeRemainingSec
      : 2100;
  }, [activeMarket]);

  const [countdownSec, setCountdownSec] = useState<number>(initialTimeSec);
  const [rolloverNotice, setRolloverNotice] = useState<{ round: string; durationMin: number } | null>(null);
  const prevMarketRef = useRef<string | null>(null);

  // Round ID extraction
  const roundId = useMemo(() => {
    if (!activeMarket?.symbol) return `${activeSymbol}-5M`;
    const cleanSym = activeMarket.symbol.split("/")[0];
    const parts = cleanSym.split("-");
    if (parts.length >= 4) {
      return `${parts[0]}-${parts[parts.length - 1]}`;
    }
    return cleanSym;
  }, [activeMarket, activeSymbol]);

  useEffect(() => {
    setCountdownSec(initialTimeSec);
  }, [initialTimeSec]);

  // Detect Round Rollover (when market rolls over from end-of-round to new round)
  useEffect(() => {
    const currentSym = activeMarket?.symbol || "";
    if (prevMarketRef.current && prevMarketRef.current !== currentSym) {
      setRolloverNotice({
        round: roundId,
        durationMin: Math.round(initialTimeSec / 60),
      });
      const t = setTimeout(() => setRolloverNotice(null), 8000);
      return () => clearTimeout(t);
    }
    prevMarketRef.current = currentSym;
  }, [activeMarket?.symbol, roundId, initialTimeSec]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSec((prev) => {
        if (prev <= 1) {
          setRolloverNotice({
            round: roundId,
            durationMin: Math.round(initialTimeSec / 60),
          });
          setTimeout(() => setRolloverNotice(null), 8000);
          return initialTimeSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [initialTimeSec, roundId]);

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  };

  const isSettlingPhase = countdownSec <= 60;
  const remainingMinutes = Math.max(0.5, Number((countdownSec / 60).toFixed(2)));

  // E. 24H Volume across active contracts
  const totalVolume = useMemo(() => {
    if (!allMarkets || allMarkets.length === 0) return 385000;
    return allMarkets.reduce((acc, m) => acc + (typeof m?.volume24h === "number" ? m.volume24h : 120000), 0);
  }, [allMarkets]);

  // F. Best bid, best ask, spread
  const bestBid = orderbook?.bestBid ?? (prob > 0 ? (prob / 100) - 0.01 : 0.54);
  const bestAsk = orderbook?.bestAsk ?? (prob > 0 ? (prob / 100) + 0.01 : 0.56);
  const spreadCents = Math.max(0.1, (bestAsk - bestBid) * 100).toFixed(1);

  // G. Quantitative Closed-Form Black-Scholes Pricing Φ(d₂) (Dynamic per second)
  const quantResult = useMemo(() => {
    return calculateBlackScholesBinaryFairValue({
      currentSpot: spotPrice,
      strikePrice,
      timeRemainingSeconds: Math.max(30, countdownSec),
      asset: activeSymbol,
      isCall: true,
      marketPrice: prob / 100,
    });
  }, [spotPrice, strikePrice, countdownSec, activeSymbol, prob]);

  const fairProb = quantResult.fairProbabilityPercent;
  const quantEdgeBps = quantResult.edgeBps ?? 0;
  const isFavorable = quantResult.isFavorable ?? false;
  const kellyPercent = ((quantResult.halfKellyFraction ?? 0.05) * 100).toFixed(1);

  // H. Velocity Physics & Trajectory Math (Dynamic per second)
  const isAboveSpot = spotPrice >= strikePrice;
  const distDollar = Math.abs(strikePrice - spotPrice);
  const distPercent = (distDollar / Math.max(1, spotPrice)) * 100;
  const reqVelocityPerMin = isAboveSpot ? 0 : (distPercent / remainingMinutes);
  const dailyAbsChange = Math.abs(liveSpotMap[activeSymbol]?.change ?? 1.8);
  const observedVelocityPerMin = Math.max(0.015, (dailyAbsChange / 1440) * 18);
  const velocityCoverage = isAboveSpot
    ? Number(Math.max(1.5, 1 + distPercent).toFixed(2))
    : Number((observedVelocityPerMin / Math.max(0.001, reqVelocityPerMin)).toFixed(2));
  const isVcSufficient = velocityCoverage >= 1.0;

  // I. Invalidation Price Level
  const invalidationPrice = isUp
    ? Number((spotPrice * 0.994).toFixed(spotPrice > 10 ? 2 : 4))
    : Number((spotPrice * 1.006).toFixed(spotPrice > 10 ? 2 : 4));

  // Live Orderbook Rows
  const displayBids: [number, number][] = orderbook?.bids?.length
    ? orderbook.bids
    : [[bestBid, 1250], [bestBid - 0.01, 840], [bestBid - 0.02, 620], [bestBid - 0.03, 490], [bestBid - 0.04, 310]];
  const displayAsks: [number, number][] = orderbook?.asks?.length
    ? [...orderbook.asks].sort((a, b) => b[0] - a[0])
    : [[bestAsk + 0.04, 340], [bestAsk + 0.03, 510], [bestAsk + 0.02, 730], [bestAsk + 0.01, 920], [bestAsk, 1400]];

  const maxBidSize = Math.max(...displayBids.map(([, s]) => s), 1);
  const maxAskSize = Math.max(...displayAsks.map(([, s]) => s), 1);

  // J. CLOB Orderbook Microstructure Imbalance (Pure Quantitative Signal)
  const microstructure = useMemo(() => {
    const totalBidVol = displayBids.reduce((sum, [, s]) => sum + s, 0);
    const totalAskVol = displayAsks.reduce((sum, [, s]) => sum + s, 0);
    const totalDepth = totalBidVol + totalAskVol;
    const imbalanceRatio = totalDepth > 0 ? (totalBidVol - totalAskVol) / totalDepth : 0;
    const spreadBps = bestAsk > 0 ? ((bestAsk - bestBid) / bestAsk) * 10000 : 200;

    let bias: "BULLISH_YES" | "BEARISH_NO" | "BALANCED" = "BALANCED";
    if (imbalanceRatio > 0.15) bias = "BULLISH_YES";
    else if (imbalanceRatio < -0.15) bias = "BEARISH_NO";

    return {
      totalBidVol,
      totalAskVol,
      imbalanceRatio: Number(imbalanceRatio.toFixed(3)),
      imbalancePercent: Number((imbalanceRatio * 100).toFixed(1)),
      spreadBps: Math.round(spreadBps),
      bias,
    };
  }, [displayBids, displayAsks, bestBid, bestAsk]);

  // Manual refresh all data streams
  const handleManualRefresh = async () => {
    sound.playClick();
    setIsLoading(true);
    await Promise.all([
      fetchLiveSpot(),
      fetchLiveMarkets(),
      fetchOrderbook(activeSymbol),
    ]);
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#07070A] text-[#E2E8F0] overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3 font-mono">

      {/* ─── 1. ASSET CONTROL & REAL-TIME QUOTE BAR ─────────── */}
      <div className="w-full flex-shrink-0 p-3 sm:p-3.5 bg-[#08080E] border border-white/[0.07] rounded-none flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
        {/* Left: Token Identity & Active Contract Context */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#0E0E17] border border-white/[0.07] rounded-none flex-shrink-0">
            <CryptoIcon symbol={activeSymbol} size={32} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide font-mono">
                {activeSymbol} <span className="text-gray-400 font-normal text-sm">/ tUSDC</span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 bg-[#0E0E17] border border-white/[0.07] text-gray-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Somnia Testnet
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-violet-950/40 text-violet-300 border border-violet-500/30 font-mono font-bold">
                Round: {roundId}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Real-time Quantitative Quote Matrix */}
        <div className="flex items-center gap-3 sm:gap-4 bg-[#0E0E17] border border-white/[0.07] px-3.5 py-1.5 rounded-none flex-wrap sm:flex-nowrap">
          <div>
            <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Implied Odds</span>
            <span className={`text-sm font-bold font-mono ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {prob.toFixed(1)}% YES
            </span>
          </div>
          <div className="w-px h-5 bg-white/[0.07]" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase tracking-wider flex items-center gap-1">
              Spot (Oracle)
            </span>
            <span className="text-sm font-bold font-mono text-white">
              ${spotPrice > 10 ? spotPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : spotPrice.toFixed(4)}
            </span>
          </div>
          <div className="w-px h-5 bg-white/[0.07]" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Strike Target</span>
            <span className="text-sm font-bold font-mono text-violet-300">
              ${strikePrice > 10 ? strikePrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : strikePrice.toFixed(4)}
            </span>
          </div>
          <div className="w-px h-5 bg-white/[0.07]" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Pricing Edge (BS)</span>
            <span className={`text-sm font-bold font-mono ${quantEdgeBps > 0 ? "text-emerald-400" : quantEdgeBps < 0 ? "text-rose-400" : "text-gray-400"}`}>
              {quantEdgeBps > 0 ? `+${quantEdgeBps}` : quantEdgeBps} bps
            </span>
          </div>
        </div>

        {/* Right: Token Switcher, Refresh */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-[#0E0E17] border border-white/[0.07] p-0.5 gap-1 rounded-none">
            {["BTC", "ETH", "SOL", "SOMI"].map((sym) => (
              <button
                key={sym}
                onClick={() => handleSelectSymbol(sym)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-none transition-colors cursor-pointer border ${
                  sym === activeSymbol
                    ? "bg-violet-600 text-white border-violet-400/60"
                    : "bg-[#0B0B14] text-gray-400 border-white/[0.05] hover:text-white hover:bg-[#141422]"
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            title="Refresh live streams"
            className="p-1.5 rounded-none bg-[#0E0E17] border border-white/[0.07] text-gray-400 hover:text-white hover:border-violet-500/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-violet-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── 2. TOP MACRO HEALTH RIBBON ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 flex-shrink-0">
        <div className="p-2.5 rounded-none bg-[#0B0B14] border border-white/[0.07] flex items-center justify-between">
          <div>
            <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">24H Volume</span>
            <span className="text-sm font-bold font-mono text-white">${(totalVolume / 1000).toFixed(1)}K USDC</span>
          </div>
          <div className="p-1.5 rounded-none bg-[#0E0E17] border border-white/[0.07] text-violet-400">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 rounded-none bg-[#0B0B14] border border-white/[0.07] flex items-center justify-between">
          <div>
            <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Active Contracts</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{Math.max(4, allMarkets.length)} Live Pairs</span>
          </div>
          <div className="p-1.5 rounded-none bg-[#0E0E17] border border-white/[0.07] text-emerald-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 rounded-none bg-[#0B0B14] border border-white/[0.07] flex items-center justify-between">
          <div>
            <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Orderbook Imbalance</span>
            <span className={`text-sm font-bold font-mono ${microstructure.imbalancePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {microstructure.imbalancePercent >= 0 ? `+${microstructure.imbalancePercent}% Bid Skew` : `${microstructure.imbalancePercent}% Ask Skew`}
            </span>
          </div>
          <div className="p-1.5 rounded-none bg-[#0E0E17] border border-white/[0.07] text-gray-300">
            {microstructure.imbalancePercent >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
          </div>
        </div>

        <div className="p-2.5 rounded-none bg-[#0B0B14] border border-white/[0.07] flex items-center justify-between">
          <div>
            <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">CLOB Spread</span>
            <span className="text-sm font-bold font-mono text-violet-300">{spreadCents}¢ ({microstructure.spreadBps} bps)</span>
          </div>
          <div className="p-1.5 rounded-none bg-[#0E0E17] border border-white/[0.07] text-violet-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* ─── 3. STRIKE PRICE DYNAMICS & EXECUTION CYCLE ─── */}
      {(() => {
        const deltaPct = strikePrice > 0 ? ((spotPrice - strikePrice) / strikePrice) * 100 : 0;
        const deltaBps = Math.round(deltaPct * 100);
        const isAbove = spotPrice >= strikePrice;
        const isSafe = Math.abs(deltaBps) >= 8;
        const sliderPos = Math.min(95, Math.max(5, 50 + deltaPct * 120));
        const cycleSec = 60 - (countdownSec % 60);

        return (
          <div className="w-full flex-shrink-0 p-3.5 rounded-none border border-white/[0.08] bg-[#08080E] space-y-3 font-mono">
            {/* Strike Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/[0.07] pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-none bg-violet-950/80 border border-violet-500/40 text-violet-300">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <span>STRIKE PRICE DYNAMICS & EXECUTION CYCLE</span>
                  </h3>
                </div>
              </div>
            </div>

            {/* Radar Gauge (Strike Centered, Spot Moving) */}
            <div className="p-3 bg-[#0B0B14] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[10px]">CURRENT SPOT:</span>
                  <span className="text-white font-bold text-sm">
                    ${spotPrice > 10 ? spotPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : spotPrice.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[10px]">TARGET STRIKE:</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    ${strikePrice > 10 ? strikePrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : strikePrice.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-[10px]">DELTA:</span>
                  <span className={`font-bold text-sm ${isAbove ? "text-emerald-400" : "text-rose-400"}`}>
                    {isAbove ? "+" : ""}{deltaPct.toFixed(3)}% ({isAbove ? "+" : ""}{deltaBps} bps)
                  </span>
                </div>
              </div>

              {/* Dynamic Visual Slider */}
              <div className="relative pt-1 pb-2">
                <div className="flex justify-between text-[9px] text-gray-400 font-bold mb-1">
                  <span className="text-rose-400">BELOW STRIKE (NO OUTCOME)</span>
                  <span className="text-cyan-300">STRIKE PIN (${strikePrice > 10 ? strikePrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : strikePrice.toFixed(4)})</span>
                  <span className="text-emerald-400">ABOVE STRIKE (YES OUTCOME)</span>
                </div>

                <div className="w-full h-4 bg-[#07070A] border border-white/[0.1] relative overflow-hidden">
                  {/* Danger Zone Band around Strike */}
                  <div className="absolute top-0 bottom-0 left-[45%] right-[45%] bg-amber-500/10 border-x border-amber-500/30" />
                  {/* Center Strike Line */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-cyan-400 z-10" />
                  {/* Spot Marker */}
                  <div
                    className={`absolute top-0 bottom-0 w-3 transition-all duration-300 ${
                      isAbove
                        ? "bg-emerald-400"
                        : "bg-rose-500"
                    }`}
                    style={{
                      left: `${sliderPos}%`,
                      transform: "translateX(-50%)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 60-Second Round Expiry Phase Bar */}
            <div className="p-2.5 bg-[#0B0B14] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400 font-bold uppercase flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-violet-400" />
                  60-SECOND ROUND EXECUTION CYCLE
                </span>
                <span className="text-violet-300 font-bold">
                  Phase Tick: {cycleSec}s / 60s
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                <div className={`p-1.5 border transition-all ${
                  cycleSec <= 30
                    ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold"
                    : "bg-[#07070A] border-white/[0.04] text-gray-500"
                }`}>
                  <div className="text-[9px]">PHASE 1 (0s-30s)</div>
                  <div className="text-[10px]">Accumulation & Depth</div>
                </div>

                <div className={`p-1.5 border transition-all ${
                  cycleSec > 30 && cycleSec <= 45
                    ? "bg-violet-950/40 border-violet-500/60 text-violet-300 font-bold"
                    : "bg-[#07070A] border-white/[0.04] text-gray-500"
                }`}>
                  <div className="text-[9px]">PHASE 2 (30s-45s)</div>
                  <div className="text-[10px]">Momentum Lock-in</div>
                </div>

                <div className={`p-1.5 border transition-all ${
                  cycleSec > 45
                    ? "bg-rose-950/40 border-rose-500/60 text-rose-300 font-bold"
                    : "bg-[#07070A] border-white/[0.04] text-gray-500"
                }`}>
                  <div className="text-[9px]">PHASE 3 (45s-60s)</div>
                  <div className="text-[10px]">Pin-Risk / Cutoff</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── 4. MID-TIER FORENSIC MATRIX (2 BALANCED CARDS) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-shrink-0">

        {/* ── Card A: Order Flow & Liquidity Depth ─────────── */}
        <div className="lg:col-span-6 rounded-none border border-white/[0.07] bg-[#08080E] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.07] bg-[#0E0E17]">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-none bg-violet-950/80 border border-violet-500/40 text-violet-300">
                <BookOpen className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">ORDER FLOW & CLOB DEPTH</span>
            </div>
            <span className="text-[9px] text-gray-400 font-mono">DreamDEX CLOB</span>
          </div>

          <div className="p-3 space-y-3">
            {/* Conviction Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  YES Conviction ({prob.toFixed(1)}%)
                </span>
                <span className="text-rose-400">
                  NO Conviction ({(100 - prob).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-[#0E0E17] rounded-none overflow-hidden flex border border-white/[0.06]">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${prob}%` }}
                />
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${100 - prob}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Order Pressure: <b className={isUp ? "text-emerald-300" : "text-rose-300"}>{isUp ? "Bid Accumulation" : "Ask Distribution"}</b></span>
                <span>Spread: <b className="text-white">{spreadCents}¢ USDC</b></span>
              </div>
            </div>

            {/* Live Depth Snapshot */}
            <div className="rounded-none bg-[#0B0B14] border border-white/[0.06] p-1.5 space-y-0.5">
              <div className="flex items-center justify-between text-[9px] text-gray-400 uppercase px-2 font-bold font-mono">
                <span>Contract Price (YES)</span>
                <span>Depth Volume</span>
              </div>
              {/* Asks */}
              {displayAsks.map(([price, size], i) => (
                <OrderbookRow key={`ask-${i}`} price={price} size={size} side="ask" maxSize={maxAskSize} />
              ))}
              {/* Mid Price Divider */}
              <div className="flex items-center justify-center gap-2 py-0.5 my-0.5 bg-[#0E0E17] rounded-none border border-white/[0.06] text-mono">
                <span className="text-[10px] text-gray-400 font-mono">Mid Equilibrium:</span>
                <span className="text-xs font-bold text-white font-mono">${((orderbook?.midPrice ?? activeMarket?.midPrice ?? (prob / 100)) || 0.50).toFixed(3)}</span>
                <span className={`text-[9px] font-bold font-mono ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                  ({prob.toFixed(1)}% Implied)
                </span>
              </div>
              {/* Bids */}
              {displayBids.map(([price, size], i) => (
                <OrderbookRow key={`bid-${i}`} price={price} size={size} side="bid" maxSize={maxBidSize} />
              ))}
            </div>

            {/* Microstructure Metrics Bar */}
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
              <div className="p-1.5 rounded-none bg-[#0B0B14] border border-white/[0.06]">
                <span className="text-[9px] text-gray-400 block uppercase">BOOK IMBALANCE</span>
                <span className={`text-xs font-bold ${microstructure.imbalancePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {microstructure.imbalancePercent >= 0 ? `+${microstructure.imbalancePercent}%` : `${microstructure.imbalancePercent}%`}
                </span>
                <span className="text-[8px] text-gray-500 block">
                  {microstructure.bias === "BULLISH_YES" ? "Buy Pressure" : microstructure.bias === "BEARISH_NO" ? "Sell Pressure" : "Balanced"}
                </span>
              </div>
              <div className="p-1.5 rounded-none bg-[#0B0B14] border border-white/[0.06]">
                <span className="text-[9px] text-gray-400 block uppercase">CLOB SPREAD</span>
                <span className="text-xs font-bold text-violet-300">{microstructure.spreadBps} bps</span>
                <span className="text-[8px] text-gray-500 block">${(bestAsk - bestBid).toFixed(3)} USDC</span>
              </div>
              <div className="p-1.5 rounded-none bg-[#0B0B14] border border-white/[0.06]">
                <span className="text-[9px] text-gray-400 block uppercase">RESTING DEPTH</span>
                <span className="text-xs font-bold text-white">{(microstructure.totalBidVol + microstructure.totalAskVol).toLocaleString()}</span>
                <span className="text-[8px] text-gray-500 block">Active Shares</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card B: Quantitative Valuation & Settlement Trajectory ─────── */}
        <div className="lg:col-span-6 rounded-none border border-white/[0.07] bg-[#08080E] overflow-hidden flex flex-col font-mono">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.07] bg-[#0E0E17]">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-none bg-violet-950/80 border border-violet-500/40 text-violet-300">
                <Scale className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">QUANTITATIVE VALUATION & TRAJECTORY</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400">Round: <b className="text-violet-300">{roundId}</b></span>
            </div>
          </div>

          <div className="p-3 space-y-2.5">
            {/* 1. Three Core Financial KPIs */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-none bg-[#0B0B14] border border-white/[0.06]">
                <span className="text-[9px] text-gray-400 uppercase block">MARKET ODDS</span>
                <span className="text-sm font-bold text-white">{prob.toFixed(1)}%</span>
                <span className="text-[9px] text-gray-500 block">${(prob / 100).toFixed(2)} Implied</span>
              </div>
              <div className="p-2 rounded-none bg-[#0B0B14] border border-violet-500/30">
                <span className="text-[9px] text-violet-300 uppercase font-bold block">MODEL FAIR VALUE</span>
                <span className="text-sm font-bold text-violet-200">{fairProb.toFixed(1)}%</span>
                <span className="text-[9px] text-violet-400/80 block">Black-Scholes Φ(d2)</span>
              </div>
              <div className="p-2 rounded-none bg-[#0B0B14] border border-white/[0.06]">
                <span className="text-[9px] text-gray-400 uppercase block">THEORETICAL EDGE</span>
                <span className={`text-sm font-bold ${quantEdgeBps >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {quantEdgeBps >= 0 ? `+${quantEdgeBps} bps` : `${quantEdgeBps} bps`}
                </span>
                <span className="text-[9px] text-gray-500 block">
                  {quantEdgeBps > 0 ? `+${(quantEdgeBps / 100).toFixed(1)}% Model Edge` : `${Math.abs(quantEdgeBps / 100).toFixed(1)}% Discount`}
                </span>
              </div>
            </div>

            {/* 2. Trajectory & Velocity Feasibility */}
            <div className="p-2.5 rounded-none bg-[#0B0B14] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-bold flex items-center gap-1.5 text-[11px]">
                  <Gauge className="w-3.5 h-3.5 text-violet-400" />
                  VELOCITY COVERAGE (VC)
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-none font-bold border ${
                  isVcSufficient
                    ? "text-emerald-300 bg-emerald-950/60 border-emerald-500/40"
                    : "text-rose-300 bg-rose-950/60 border-rose-500/40"
                }`}>
                  {velocityCoverage}× {isVcSufficient ? "Sufficient Pace" : "Lagging Pace"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-[#07070A] rounded-none overflow-hidden border border-white/[0.06]">
                <div
                  className={`h-full transition-all duration-300 ${isVcSufficient ? "bg-emerald-500" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(100, Math.max(8, velocityCoverage * 60))}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 pt-0.5 border-t border-white/[0.04]">
                <div>
                  Strike Distance: <b className="text-white">${distDollar > 10 ? distDollar.toFixed(1) : distDollar.toFixed(4)}</b> <span className="text-gray-500">({distPercent.toFixed(2)}%)</span>
                </div>
                <div className="text-right">
                  Window: <b className="text-violet-300">{formatCountdown(countdownSec)}</b>
                </div>
              </div>
            </div>

            {/* 3. Execution Guardrails (Half-Kelly & Invalidation) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-none bg-[#0B0B14] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase block">OPTIMAL SIZING</span>
                  <span className="text-xs font-bold text-violet-300">Max {kellyPercent}% Bankroll</span>
                </div>
                <span className="text-[9px] text-gray-500 border border-white/[0.06] px-1.5 py-0.5">Half-Kelly</span>
              </div>

              <div className="p-2 rounded-none bg-[#0B0B14] border border-rose-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase block">INVALIDATION LEVEL</span>
                  <span className="text-xs font-bold text-rose-400">
                    ${invalidationPrice > 10 ? invalidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : invalidationPrice.toFixed(4)}
                  </span>
                </div>
                <span className="text-[9px] text-rose-400/80 bg-rose-950/40 border border-rose-500/30 px-1.5 py-0.5 font-bold">Stop</span>
              </div>
            </div>

            {/* Direct Quantitative Action Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectMarket(activeSymbol);
              }}
              className="w-full mt-2 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 border border-violet-400/40 cursor-pointer"
            >
              <span>TRADE CONTRACT (EDGE: {quantEdgeBps >= 0 ? `+${quantEdgeBps} bps` : `${quantEdgeBps} bps`})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
