import React, { useState } from "react";

interface CryptoIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

// ─── Official High-Res CDN Logos (CoinGecko & TrustWallet Official Repositories) ───
const OFFICIAL_CRYPTO_ICONS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  BITCOIN: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  ETHEREUM: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  SOLANA: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
  TUSDC: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
  USDSO: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
  USD: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  BINANCE: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  AVALANCHE: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  POL: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  POLYGON: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  STT: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
};

export const CryptoIcon: React.FC<CryptoIconProps> = ({
  symbol,
  size = 20,
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  const clean = (symbol || "")
    .toUpperCase()
    .replace(/\/.*$/, "")
    .replace(/-.*$/, "")
    .trim();

  // ─── Special Brand: Somnia Network Official High-Tech Emblem ───────────────
  if (clean === "SOMI" || clean.includes("SOMNIA")) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white flex-shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.6)] border border-cyan-400/50 ${className}`}
        style={{ width: size, height: size }}
        title="Somnia Network (SOMI)"
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            fill="#FFFFFF"
            stroke="#06B6D4"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // ─── Official CDN Image Lookup ─────────────────────────────────────────────
  const iconUrl = OFFICIAL_CRYPTO_ICONS[clean];

  if (iconUrl && !hasError) {
    return (
      <img
        src={iconUrl}
        alt={clean}
        onError={() => setHasError(true)}
        className={`inline-block rounded-full object-contain flex-shrink-0 shadow-sm ${className}`}
        style={{ width: size, height: size }}
        loading="lazy"
        title={clean}
      />
    );
  }

  // ─── Intelligent Fallback Badge ────────────────────────────────────────────
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-violet-950/80 border border-violet-500/50 text-violet-300 font-mono font-bold flex-shrink-0 shadow-sm ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.floor(size * 0.45)) }}
      title={clean}
    >
      {clean.slice(0, 3)}
    </div>
  );
};

export default CryptoIcon;
