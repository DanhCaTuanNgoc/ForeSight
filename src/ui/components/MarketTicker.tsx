import React from "react";

export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

interface MarketTickerProps {
  markets?: TickerItem[];
}

const DEFAULT_TICKERS: TickerItem[] = [
  { symbol: "BTC/USD", price: 78624.7, change: -0.42 },
  { symbol: "ETH/USD", price: 2450.1, change: -1.36 },
  { symbol: "SOL/USD", price: 182.4, change: 2.05 },
  { symbol: "SOMI/USD", price: 0.1095, change: 4.15 },
  { symbol: "BNB/USD", price: 598.3, change: 0.78 },
  { symbol: "AVAX/USD", price: 34.21, change: -0.91 },
  { symbol: "MATIC/USD", price: 0.412, change: 1.44 },
];

export const MarketTicker: React.FC<MarketTickerProps> = ({
  markets = DEFAULT_TICKERS,
}) => {
  const items = markets.length > 0 ? markets : DEFAULT_TICKERS;

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
