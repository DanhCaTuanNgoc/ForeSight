import React, { useState, useEffect } from "react";
import { CryptoIcon } from "./CryptoIcon.js";
import { apiUrl } from "../utils/api.js";

export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

interface MarketTickerProps {
  markets?: TickerItem[];
}

// Fallback symbols to query real prices from Binance if local indexer has no contracts
const FALLBACK_BINANCE_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "AVAXUSDT", "SUIUSDT", "DOGEUSDT"];

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
        // 1. Try fetching from Somnia backend CLOB/Event contracts
        const res = await fetch(apiUrl("/api/tickers"));
        if (res.ok) {
          const data = await res.json();
          if (data.tickers && data.tickers.length > 0) {
            const mapped: TickerItem[] = data.tickers.map((t: any) => ({
              symbol: t.symbol,
              price: Number(t.price),
              change: Number(t.change),
            }));
            if (isMounted) {
              setTickers(mapped);
              return;
            }
          }
        }
      } catch {
        // Fall through to live public crypto spot API
      }

      // 2. Fetch real live spot prices from Binance API if backend is empty/offline
      try {
        const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(
          JSON.stringify(FALLBACK_BINANCE_SYMBOLS)
        )}`;
        const res = await fetch(binanceUrl);
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw) && raw.length > 0) {
            const liveData: TickerItem[] = raw.map((item: any) => {
              const base = item.symbol.replace("USDT", "");
              return {
                symbol: `${base}/USDT`,
                price: parseFloat(item.lastPrice),
                change: parseFloat(item.priceChangePercent),
              };
            });
            if (isMounted) {
              setTickers(liveData);
              return;
            }
          }
        }
      } catch {
        // Fall through
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 8000);

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
        { symbol: "BTC/USDT", price: 80000, change: 1.25 },
        { symbol: "ETH/USDT", price: 2500, change: -0.45 },
        { symbol: "SOL/USDT", price: 175, change: 3.8 },
        { symbol: "BNB/USDT", price: 620, change: 0.9 },
        { symbol: "SOMI/USDso", price: 0.738, change: 4.15 },
      ];

  // Repeat enough items so each half fills even 4K screens seamlessly before looping
  const repeatMultiplier = Math.max(1, Math.ceil(12 / (items.length || 1)));
  const repeatedList = Array(repeatMultiplier).fill(items).flat();

  // Calculate constant smooth velocity: ~25-30 pixels per second (calm terminal tape pace)
  // Each ticker badge is approx 185px wide
  const totalStripWidthPx = repeatedList.length * 185;
  const durationSec = Math.max(60, Math.round(totalStripWidthPx / 25));

  return (
    <div className="h-9 border-b border-[#2A2A3D]/70 bg-[#0D0D14] overflow-hidden flex items-center select-none relative">
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
              const formattedPrice =
                t.price >= 1000
                  ? t.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : t.price >= 1
                  ? t.price.toFixed(2)
                  : t.price.toFixed(4);

              return (
                <div
                  key={`${stripIdx}-${idx}`}
                  className="flex items-center gap-2 px-4 text-xs font-mono whitespace-nowrap border-r border-[#2A2A3D]/40 transition-colors hover:bg-white/[0.04]"
                >
                  <CryptoIcon symbol={t.symbol} size={15} />
                  <span className="text-gray-300 font-semibold">{t.symbol}</span>
                  <span className="text-gray-100 font-medium">${formattedPrice}</span>
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                      isUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isUp ? "▲ +" : "▼ "}
                    {Math.abs(t.change).toFixed(2)}%
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
