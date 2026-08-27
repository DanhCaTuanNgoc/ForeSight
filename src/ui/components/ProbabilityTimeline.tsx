import React, { useState, useEffect, useMemo } from "react";
import { Zap, TrendingUp, TrendingDown, Clock, Activity, ExternalLink, Sparkles } from "lucide-react";

interface TimelinePoint {
  id?: string;
  timestamp: string;
  mid_price: number;
  best_bid?: number;
  best_ask?: number;
  isSpike?: boolean;
  spikeMagnitude?: number;
}

interface ProbabilityTimelineProps {
  symbol: string;
  asset: string;
  currentMidPrice: number;
  onSelectSpike: (spike: any) => void;
}

export const ProbabilityTimeline: React.FC<ProbabilityTimelineProps> = ({
  symbol,
  asset,
  currentMidPrice,
  onSelectSpike,
}) => {
  const [dataPoints, setDataPoints] = useState<TimelinePoint[]>([]);
  const [spikes, setSpikes] = useState<any[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<TimelinePoint | null>(null);
  const [timeRange, setTimeRange] = useState<"15m" | "1h" | "4h">("1h");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch timeline data from DB or generate live synthesized baseline
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchTimeline = async () => {
      try {
        const from = new Date(Date.now() - (timeRange === "15m" ? 900_000 : timeRange === "1h" ? 3600_000 : 14400_000)).toISOString();
        const res = await fetch(`/api/timeline/${encodeURIComponent(symbol)}?from=${from}`);
        const spikeRes = await fetch(`/api/spikes?symbol=${encodeURIComponent(symbol)}&limit=10`);

        let fetchedSpikes: any[] = [];
        if (spikeRes.ok) {
          const sJson = await spikeRes.json();
          fetchedSpikes = sJson.spikes || [];
        }

        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 5) {
            if (isMounted) {
              setDataPoints(json.data);
              setSpikes(fetchedSpikes);
              setIsLoading(false);
              return;
            }
          }
        }

        // Generate deterministic timeline simulation based on current price if empty
        const count = timeRange === "15m" ? 25 : timeRange === "1h" ? 40 : 60;
        const now = Date.now();
        const stepMs = (timeRange === "15m" ? 900_000 : timeRange === "1h" ? 3600_000 : 14400_000) / count;
        
        let p = Math.max(0.2, Math.min(0.8, currentMidPrice || 0.5));
        const synthetic: TimelinePoint[] = [];

        let seed = 0;
        for (let c = 0; c < symbol.length; c++) {
          seed = (seed << 5) - seed + symbol.charCodeAt(c);
          seed |= 0;
        }
        seed += count;
        const pseudoRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        for (let i = count; i >= 0; i--) {
          const t = new Date(now - i * stepMs).toISOString();
          const noise = (pseudoRandom() - 0.49) * 0.04;
          p = Math.max(0.1, Math.min(0.9, p + noise));

          // Introduce a visible spike for demonstration
          const isSpikePoint = i === Math.floor(count * 0.4);
          const spikeMag = isSpikePoint ? (pseudoRandom() > 0.5 ? 0.18 : -0.15) : 0;
          if (isSpikePoint) {
            p = Math.max(0.1, Math.min(0.9, p + spikeMag));
          }

          synthetic.push({
            timestamp: t,
            mid_price: Number(p.toFixed(3)),
            best_bid: Number((p - 0.02).toFixed(3)),
            best_ask: Number((p + 0.02).toFixed(3)),
            isSpike: isSpikePoint,
            spikeMagnitude: spikeMag,
          });
        }

        if (isMounted) {
          setDataPoints(synthetic);
          setSpikes([
            {
              id: "spike-live-demo",
              symbol,
              detected_at: synthetic[Math.floor(count * 0.4)]?.timestamp || new Date().toISOString(),
              price_before: Number((currentMidPrice - 0.16).toFixed(3)),
              price_after: currentMidPrice,
              magnitude: 0.16,
              direction: "SURGE_UP",
              asset,
            },
          ]);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Timeline error:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTimeline();
    const interval = setInterval(fetchTimeline, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol, timeRange, currentMidPrice]);

  // Compute SVG Area Chart coordinates
  const svgMetrics = useMemo(() => {
    if (dataPoints.length < 2) return null;
    const width = 800;
    const height = 220;
    const padding = { top: 20, right: 30, bottom: 30, left: 40 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const minP = 0;
    const maxP = 1.0;

    const points = dataPoints.map((d, idx) => {
      const x = padding.left + (idx / (dataPoints.length - 1)) * chartW;
      const y = padding.top + chartH - ((d.mid_price - minP) / (maxP - minP)) * chartH;
      return { x, y, data: d };
    });

    const linePath = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.y}`, "");
    const areaPath = `${linePath} L ${points[points.length - 1].x},${padding.top + chartH} L ${points[0].x},${padding.top + chartH} Z`;

    return { width, height, padding, points, linePath, areaPath, chartW, chartH };
  }, [dataPoints]);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-brand-border/80 relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base">Probability Timeline</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> What Happened?
              </span>
            </div>
            <p className="text-xs text-gray-400">Historical implied odds on Somnia DreamDEX CLOB</p>
          </div>
        </div>

        {/* Time range selectors */}
        <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-xl border border-brand-border">
          {(["15m", "1h", "4h"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === r ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full aspect-[800/220] max-h-[260px] bg-[#070A11] rounded-xl border border-brand-border/40 overflow-hidden flex items-center justify-center">
        {svgMetrics ? (
          <svg
            viewBox={`0 0 ${svgMetrics.width} ${svgMetrics.height}`}
            className="w-full h-full select-none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0.25, 0.5, 0.75, 1.0].map((level) => {
              const y = svgMetrics.padding.top + svgMetrics.chartH - level * svgMetrics.chartH;
              return (
                <g key={level}>
                  <line
                    x1={svgMetrics.padding.left}
                    y1={y}
                    x2={svgMetrics.width - svgMetrics.padding.right}
                    y2={y}
                    stroke="#1E293B"
                    strokeDasharray={level === 0.5 ? "4 4" : "2 2"}
                    strokeWidth="1"
                  />
                  <text
                    x={svgMetrics.padding.left - 8}
                    y={y + 3}
                    fill="#64748B"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {Math.round(level * 100)}%
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={svgMetrics.areaPath} fill="url(#areaGradient)" />

            {/* Price Line */}
            <path
              d={svgMetrics.linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Render Data Points & Spike Markers */}
            {svgMetrics.points.map((pt, i) => {
              if (pt.data.isSpike) {
                return (
                  <g
                    key={i}
                    className="cursor-pointer group"
                    onClick={() =>
                      onSelectSpike({
                        id: `spike-${pt.data.timestamp}`,
                        symbol,
                        asset,
                        detected_at: pt.data.timestamp,
                        price_after: pt.data.mid_price,
                        magnitude: pt.data.spikeMagnitude || 0.15,
                      })
                    }
                  >
                    {/* Static Spike Marker */}
                    <circle cx={pt.x} cy={pt.y} r="6" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      fill="#F97316"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-mono bg-black"
                    >
                      ⚡ SPIKE
                    </text>
                  </g>
                );
              }

              // Invisible hover targets
              return (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill="transparent"
                  className="hover:fill-cyan-400/80 cursor-crosshair transition-all"
                  onMouseEnter={() => setHoveredPoint(pt.data)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>
        ) : (
          <div className="text-gray-400 text-xs flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin text-orange-400" />
            <span>Loading Probability Stream...</span>
          </div>
        )}

        {/* Hover info tooltip */}
        {hoveredPoint && (
          <div className="absolute top-3 right-4 bg-[#0F172A]/90 backdrop-blur-md border border-brand-border px-3 py-1.5 rounded-lg text-xs font-mono text-white shadow-xl pointer-events-none">
            <span className="text-orange-400 font-bold">Odds: {Math.round(hoveredPoint.mid_price * 100)}%</span>
            <span className="text-gray-400 ml-2">({new Date(hoveredPoint.timestamp).toLocaleTimeString()})</span>
          </div>
        )}
      </div>

      {/* Spikes Quick Action Bar */}
      {spikes.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400 animate-bounce" />
            <span className="text-xs text-orange-200">
              <strong className="text-white font-bold">{spikes.length} Probability Spike(s)</strong> detected. Click below to analyze why odds shifted:
            </span>
          </div>
          <button
            onClick={() => onSelectSpike(spikes[0])}
            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Open Dual AI Debate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
