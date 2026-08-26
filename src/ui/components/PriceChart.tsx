import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
type TimeRange = '15m' | '1H' | '4H' | '1D';

interface ChartDataPoint {
  time: string;
  price: number;
  volume?: number;
}

interface PriceChartProps {
  symbol: string;
  data?: ChartDataPoint[];
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
  currentPrice?: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
function generateMockData(range: TimeRange, baseProbability: number): ChartDataPoint[] {
  const pointsMap: Record<TimeRange, number> = { '15m': 30, '1H': 60, '4H': 96, '1D': 48 };
  const points = pointsMap[range];
  let base = baseProbability / 100;

  return Array.from({ length: points }, (_, i) => {
    base += (Math.random() - 0.48) * 0.015;
    base = Math.max(0.05, Math.min(0.97, base));
    const h = Math.floor(i / 4);
    const m = (i % 4) * 15;
    return {
      time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      price: parseFloat(base.toFixed(4)),
      volume: Math.floor(Math.random() * 5000 + 500),
    };
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const price = payload[0]?.value as number;
  const vol = payload[1]?.value as number | undefined;
  return (
    <div
      style={{
        background: '#16161F',
        border: '1px solid #2A2A3D',
        borderRadius: '3px',
        padding: '8px 10px',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      <div style={{ color: '#6B7280', marginBottom: '4px' }}>{label} UTC</div>
      <div style={{ color: '#ffffff', fontWeight: 600 }}>
        Prob{' '}
        <span style={{ color: '#A78BFA' }}>
          {(price * 100).toFixed(2)}%
        </span>
      </div>
      {vol !== undefined && (
        <div style={{ color: '#4B5563', marginTop: '2px' }}>
          Vol {vol.toLocaleString()}
        </div>
      )}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export const PriceChart: React.FC<PriceChartProps> = ({
  symbol,
  data: propData,
  timeRange,
  onTimeRangeChange,
  currentPrice = 60,
}) => {
  const data = useMemo(
    () => propData && propData.length > 0 ? propData : generateMockData(timeRange, currentPrice),
    [propData, timeRange, currentPrice, symbol]
  );

  const first = data[0]?.price ?? 0;
  const last = data[data.length - 1]?.price ?? 0;
  const change = first > 0 ? ((last - first) / first * 100) : 0;
  const isUp = change >= 0;

  const yMin = Math.max(0, Math.min(...data.map(d => d.price)) - 0.03);
  const yMax = Math.min(1, Math.max(...data.map(d => d.price)) + 0.03);

  // Format Y axis tick as percentage
  const formatY = (v: number) => `${(v * 100).toFixed(0)}%`;
  // Format X axis: show every Nth label
  const step = Math.ceil(data.length / 6);
  const formatX = (_: any, idx: number) => idx % step === 0 ? data[idx]?.time ?? '' : '';

  return (
    <div className="panel rounded-[4px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2A2A3D]">
        <div className="flex items-center gap-3">
          <span className="stat-label">{symbol} PROBABILITY</span>
          <div className="flex items-baseline gap-1.5">
            <span className="mono text-[20px] font-bold text-white">
              {(last * 100).toFixed(2)}%
            </span>
            <span className={`mono text-[11px] font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        </div>
        {/* Time range tabs */}
        <div className="flex gap-1">
          {(['15m', '1H', '4H', '1D'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={`px-2 py-0.5 text-[10px] mono font-medium rounded-[3px] transition-colors ${
                timeRange === r
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-600/40'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pt-3 pb-2">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#2A2A3D"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tickFormatter={formatX}
              tick={{ fill: '#4B5563', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              interval={step - 1}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={formatY}
              tick={{ fill: '#4B5563', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              width={36}
              orientation="right"
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7C3AED', strokeWidth: 1, strokeDasharray: '3 3' }} />

            <Area
              type="monotone"
              dataKey="price"
              stroke="#7C3AED"
              strokeWidth={1.5}
              fill="url(#probGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#7C3AED', stroke: '#A78BFA', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume mini bar */}
      <div className="px-2 pb-3">
        <div className="flex items-end gap-px h-8">
          {data.map((d, i) => {
            const maxVol = Math.max(...data.map(x => x.volume ?? 0));
            const h = maxVol > 0 ? ((d.volume ?? 0) / maxVol) * 100 : 20;
            return (
              <div
                key={i}
                className="flex-1 rounded-[1px] transition-all"
                style={{
                  height: `${h}%`,
                  background: 'rgba(124,58,237,0.25)',
                  minHeight: '2px',
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="mono text-[8px] text-gray-700">VOL</span>
          <span className="mono text-[8px] text-gray-700">{data[data.length - 1]?.volume?.toLocaleString()} tUSDC</span>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
