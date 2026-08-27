import React, { useState, useEffect } from "react";

export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

interface MarketTickerProps {
  markets?: TickerItem[];
}

export const MarketTicker: React.FC<MarketTickerProps> = ({
  markets: propMarkets,
}) => {
  const [apiTickers, setApiTickers] = useState<TickerItem[]>([]);

  useEffect(() => {
    if (propMarkets && propMarkets.length > 0) return;
    let isMounted = true;
    const fetchTickers = async () => {
      try {
        const res = await fetch("/api/tickers");
        if (res.ok) {
          const data = await res.json();
          if (data.tickers && data.tickers.length > 0) {
            const mapped: TickerItem[] = data.tickers.map((t: any) => ({
              symbol: t.symbol,
              price: t.price,
              change: t.change,
            }));
            if (isMounted) setApiTickers(mapped);
          }
        }
      } catch {
        // Ignore
      }
    };
    fetchTickers();
    const interval = setInterval(fetchTickers, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [propMarkets]);

  const items = propMarkets && propMarkets.length > 0 ? propMarkets : (apiTickers.length > 0 ? apiTickers : [
    { symbol: "BTC/tUSDC", price: 0.624, change: 14.2 },
    { symbol: "ETH/tUSDC", price: 0.451, change: -3.5 },
    { symbol: "SOL/tUSDC", price: 0.540, change: 6.8 },
    { symbol: "SOMI/USDso", price: 0.738, change: 4.15 },
  ]);

  return (
    <div className="h-9 border-b border-[#2A2A3D]/70 bg-[#0D0D14] overflow-hidden flex items-center select-none">
      <div className="ticker-track flex items-center gap-0">
        {/* Render 2 sets for endless continuous marquee */}
        {[...Array(2)].map((_, rep) => (
          <React.Fragment key={rep}>
            {items.map((t, idx) => {
              const isUp = t.change >= 0;
              return (
                <div
                  key={`${rep}-${idx}`}
                  className="flex items-center gap-2.5 px-4 text-xs font-mono whitespace-nowrap border-r border-[#2A2A3D]/40"
                >
                  <span className="text-gray-400 font-semibold">{t.symbol}</span>
                  <span className="text-gray-100 font-medium">
                    ${t.price < 1 ? t.price.toFixed(4) : t.price.toLocaleString("en-US", { minimumFractionDigits: 1 })}
                  </span>
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                      isUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isUp ? "▲ +" : "▼ "}
                    {t.change.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
export default MarketTicker;
