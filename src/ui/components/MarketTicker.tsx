import React, { useState, useEffect } from "react";
import { CryptoIcon } from "./CryptoIcon.js";
import { apiUrl } from "../utils/api.js";

export interface TickerItem {
  symbol: string;
  spotPrice?: number;
  price?: number;
  change: number;
  poolPercent?: number;
  probability?: number;
  strikePrice?: number;
  underlyingAsset?: string;
  source?: string;
}

interface MarketTickerProps {
  markets?: TickerItem[];
}

export const MarketTicker: React.FC<MarketTickerProps> = ({
  markets: propMarkets,
}) => {
  const [tickers, setTickers] = useState<TickerItem[]>([]);

  useEffect(() => {
    if (propMarkets && propMarkets.length > 0) {
      setTickers(propMarkets);
      return;
    }

    let isMounted = true;

    const fetchRealData = async () => {
      try {
        const res = await fetch(apiUrl("/api/tickers"));
        if (res.ok) {
          const data = await res.json();
          if (data.tickers && data.tickers.length > 0) {
            const mapped: TickerItem[] = data.tickers.map((t: any) => ({
              symbol: t.symbol,
              spotPrice: Number(t.spotPrice || t.price || 0),
              price: Number(t.price || t.spotPrice || 0),
              change: Number(t.change || 0),
              poolPercent: t.poolPercent !== undefined ? Number(t.poolPercent) : (t.probability !== undefined ? Number(t.probability) : 50.0),
              strikePrice: t.strikePrice !== undefined ? Number(t.strikePrice) : undefined,
              underlyingAsset: t.underlyingAsset,
              source: t.source,
            }));
            if (isMounted) {
              setTickers(mapped);
              return;
            }
          }
        }
      } catch {
        // Fall through
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [propMarkets]);

  const items = propMarkets && propMarkets.length > 0
    ? propMarkets
    : tickers.length > 0
    ? tickers
    : [
        { symbol: "BTC/tUSDC", spotPrice: 78750, price: 78750, poolPercent: 50.1, change: 0.25, underlyingAsset: "BTC" },
        { symbol: "ETH/tUSDC", spotPrice: 2495, price: 2495, poolPercent: 50.1, change: 0.15, underlyingAsset: "ETH" },
        { symbol: "SOMI/USDso", spotPrice: 0.742, price: 0.742, poolPercent: 52.8, change: 3.85, underlyingAsset: "SOMI" },
      ];

  // Repeat enough items so each half fills even 4K screens seamlessly before looping
  const repeatMultiplier = Math.max(1, Math.ceil(14 / (items.length || 1)));
  const repeatedList = Array(repeatMultiplier).fill(items).flat();

  // Calculate constant smooth velocity: ~25-30 pixels per second
  const totalStripWidthPx = repeatedList.length * 220;
  const durationSec = Math.max(60, Math.round(totalStripWidthPx / 26));

  return (
    <div className="h-8 border-b border-white/[0.06] bg-[#090910] overflow-hidden flex items-center select-none relative">
      <div
        className="ticker-track flex items-center gap-0"
        style={{
          animation: `ticker ${durationSec}s linear infinite`,
          willChange: "transform",
        }}
      >
        {/* Render 2 continuous identical strips for seamless 0% -> -50% marquee */}
        {[0, 1].map((stripIdx) => (
          <div key={stripIdx} className="flex items-center gap-0 flex-shrink-0">
            {repeatedList.map((t, idx) => {
              const isUp = t.change >= 0;
              const assetSym = t.underlyingAsset || t.symbol.split("/")[0].split(" ")[0].split("-")[0];
              const spot = t.spotPrice || t.price || 0;
              const poolPct = t.poolPercent !== undefined ? t.poolPercent : (t.probability !== undefined ? t.probability : 50.0);

              const formattedSpotPrice =
                spot >= 1000
                  ? spot.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : spot >= 1
                  ? spot.toFixed(2)
                  : spot.toFixed(4);

              return (
                <div
                  key={`${stripIdx}-${idx}`}
                  className="flex items-center gap-2.5 px-3.5 text-[11px] font-mono whitespace-nowrap border-r border-white/[0.05] transition-colors hover:bg-white/[0.03]"
                >
                  <CryptoIcon symbol={assetSym} size={14} />
                  <span className="text-gray-300 font-medium">{t.symbol}</span>
                  
                  {/* Real-time Spot Price */}
                  <span className="text-gray-100 font-bold">${formattedSpotPrice}</span>

                  {/* Real-time Pool % from DreamDEX */}
                  <span className="text-violet-300 bg-violet-950/60 border border-violet-500/30 px-1.5 py-0.2 rounded-none text-[10px] font-mono">
                    Pool: {poolPct.toFixed(1)}%
                  </span>

                  {/* 24h Trend / Change */}
                  <span
                    className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                      isUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {t.change.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
