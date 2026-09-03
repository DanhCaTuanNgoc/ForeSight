import React, { useState } from "react";

export interface TechIconProps {
  name: string;
  size?: number;
  className?: string;
}

// ─── Real Official Brand Assets (Local Static Files with CDN Fallback) ──────
const OFFICIAL_TECH_ASSETS: Record<string, { local: string; cdn: string; label: string; bg?: string }> = {
  somnia: {
    local: "/tech/somnia.png",
    cdn: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
    label: "Somnia L1",
    bg: "bg-[#141226]",
  },
  dreamdex: {
    local: "/tech/dreamdex.png",
    cdn: "/tech/dreamdex.png",
    label: "DreamDEX",
    bg: "bg-[#091524]",
  },
  typescript: {
    local: "/tech/typescript.svg",
    cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    label: "TypeScript",
    bg: "bg-[#18263E]",
  },
  viem: {
    local: "/tech/viem.png",
    cdn: "https://avatars.githubusercontent.com/u/104278065?s=200&v=4",
    label: "Viem",
    bg: "bg-[#12121A]",
  },
  oracle: {
    local: "/tech/chainlink.png",
    cdn: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    label: "Chainlink Oracle",
    bg: "bg-[#0A1832]",
  },
  sweeper: {
    local: "/tech/ethereum.png",
    cdn: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    label: "Ethereum MultiCall",
    bg: "bg-[#0F1E2A]",
  },
  "dual ai": {
    local: "/tech/openai.svg",
    cdn: "https://api.iconify.design/logos:openai-icon.svg",
    label: "OpenAI Dual AI",
    bg: "bg-[#152520]",
  },
  rag: {
    local: "/tech/rss.svg",
    cdn: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/rss.svg",
    label: "RAG RSS Feed",
    bg: "bg-[#271708]",
  },
  scenario: {
    local: "/tech/python.svg",
    cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    label: "Python Greeks Math",
    bg: "bg-[#101D2D]",
  },
  supabase: {
    local: "/tech/supabase.svg",
    cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
    label: "Supabase Postgres",
    bg: "bg-[#0C2219]",
  },
  react: {
    local: "/tech/react.svg",
    cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    label: "React 19 & Vite 6",
    bg: "bg-[#081F2C]",
  },
  bot: {
    local: "/tech/docker.svg",
    cdn: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    label: "Docker Bot Worker",
    bg: "bg-[#0B1E2E]",
  },
};

export const TechIcon: React.FC<TechIconProps> = ({
  name,
  size = 24,
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);
  const normalized = name.toLowerCase().trim();
  const asset = OFFICIAL_TECH_ASSETS[normalized] || OFFICIAL_TECH_ASSETS[
    Object.keys(OFFICIAL_TECH_ASSETS).find((k) => normalized.includes(k)) || "typescript"
  ];

  if (!asset) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-none bg-violet-950/80 border border-violet-500/40 text-violet-300 font-mono text-[10px] ${className}`}
        style={{ width: size, height: size }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  const imageSrc = hasError ? asset.cdn : asset.local;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-none p-1 flex-shrink-0 ${asset.bg || "bg-black/40"} ${className}`}
      style={{ width: size, height: size }}
      title={asset.label}
    >
      <img
        src={imageSrc}
        alt={asset.label}
        onError={() => {
          if (!hasError && asset.cdn !== asset.local) {
            setHasError(true);
          }
        }}
        className="w-full h-full object-contain filter drop-shadow-sm select-none"
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};

export default TechIcon;
