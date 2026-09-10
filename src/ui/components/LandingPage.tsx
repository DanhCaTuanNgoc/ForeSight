import React, { useState, useRef, useCallback, useEffect } from "react";
import { CyberBackground } from "./CyberBackground.js";
import { ForeSightLogo } from "./ForeSightLogo.js";
import { CryptoIcon } from "./CryptoIcon.js";
import { TechIcon } from "./TechIcon.js";
import { MarketTicker } from "./MarketTicker.js";
import { apiUrl } from "../utils/api.js";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  BarChart3,
  ExternalLink,
  Code2,
  CheckCircle2,
  Terminal,
  Activity,
  Bot,
  Sliders,
  Radio,
  Boxes,
  Copy,
  Check,
  Wallet,
  Gauge,
  Share2,
} from "lucide-react";
import { RevealOnScroll } from "./RevealOnScroll.js";

interface LandingPageProps {
  onLaunchTerminal: () => void;
}

interface MarketItem {
  symbol: string;
  question?: string;
  underlyingAsset?: string;
  midPrice?: number;
  priceChange?: number;
  strikePrice?: number;
}

const TECH_STACK_ROW_1 = [
  {
    name: "Somnia L1 Blockchain",
    techKey: "somnia",
    badge: "Shannon 50312",
    desc: "Sub-second finality with high-throughput reactive EVM execution",
    badgeBg: "bg-violet-950/80 text-violet-300 border-violet-500/30",
  },
  {
    name: "DreamDEX Event Contracts",
    techKey: "dreamdex",
    badge: "CLOB & BinaryPool",
    desc: "Decentralized on-chain binary prediction with Market & Limit order execution",
    badgeBg: "bg-cyan-950/80 text-cyan-300 border-cyan-500/30",
  },
  {
    name: "Quantitative Greeks Core",
    techKey: "scenario",
    badge: "Black-Scholes",
    desc: "Client-side binary fair value Φ(d2), theoretical edge bps & Kelly sizing",
    badgeBg: "bg-rose-950/80 text-rose-300 border-rose-500/30",
  },
  {
    name: "Tactical Strike Radar",
    techKey: "typescript",
    badge: "60s Cycle",
    desc: "3-phase execution cycle with real-time Velocity Coverage (VC) physics",
    badgeBg: "bg-blue-950/80 text-blue-300 border-blue-500/30",
  },
  {
    name: "Prophecy Spot Oracles",
    techKey: "oracle",
    badge: "Sub-Second",
    desc: "Low-latency Binance and Pyth spot feeds for transparent strike settlements",
    badgeBg: "bg-orange-950/80 text-orange-300 border-orange-500/30",
  },
  {
    name: "ForeSight Batch Sweeper",
    techKey: "sweeper",
    badge: "1-Click Claim",
    desc: "Custom smart contract claiming multiple expired winning pools in a single batch",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/30",
  },
];

const TECH_STACK_ROW_2 = [
  {
    name: "Dual AI Thesis Arena",
    techKey: "dual ai",
    badge: "Bull vs Bear",
    desc: "Alpha Momentum vs Mean Reversal agents with Consensus Bias metrics",
    badgeBg: "bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/30",
  },
  {
    name: "RAG Evidence Pipeline",
    techKey: "rag",
    badge: "Source-Cited",
    desc: "Real-time Crypto RSS ingestion with verifiable source citations",
    badgeBg: "bg-amber-950/80 text-amber-300 border-amber-500/30",
  },
  {
    name: "AI Auto-Pilot Runner",
    techKey: "bot",
    badge: "Autonomous",
    desc: "Browser-driven multi-round session runner executing automated trades with live logs",
    badgeBg: "bg-teal-950/80 text-teal-300 border-teal-500/30",
  },
  {
    name: "Activity Ledger & Studio",
    techKey: "supabase",
    badge: "6-State Lifecycle",
    desc: "Real-time order tracking with 1200×675 HD Alpha Card export",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/30",
  },
  {
    name: "React 19 & Vite 6",
    techKey: "react",
    badge: "Tailwind CSS",
    desc: "Sharp, pro-terminal responsive UI with zero-latency state transitions",
    badgeBg: "bg-sky-950/80 text-sky-300 border-sky-500/30",
  },
  {
    name: "Autonomous Bot Loops",
    techKey: "bot",
    badge: "4 Strategies",
    desc: "Market Maker, Oracle Follower, Starter Bot, and Take-Profit Auto Execution",
    badgeBg: "bg-indigo-950/80 text-indigo-300 border-indigo-500/30",
  },
];

const DECISION_WORKFLOW = [
  {
    step: "01",
    phase: "MARKETS",
    subtitle: "Discovery & Order Terminal",
    title: "Real-Time Market Scanner",
    desc: "Track active Somnia binary pools with sub-second price updates, interactive charts, and direct Market or Limit order execution on DreamDEX CLOB.",
    highlights: ["Sub-Second Market Ticker", "Market & Limit CLOB Orders", "Interactive Multi-Timeframe Chart"],
    accentColor: "text-cyan-400",
    badgeBg: "bg-cyan-950/60 border-cyan-500/30 text-cyan-300",
  },
  {
    step: "02",
    phase: "ANALYTICS",
    subtitle: "Quantitative Physics",
    title: "Tactical Strike & Greeks Radar",
    desc: "Analyze the 60-second 3-phase execution cycle (Accumulation, Momentum, Cutoff), Black-Scholes binary fair value Φ(d2), and Velocity Coverage (VC).",
    highlights: ["60s 3-Phase Execution Cycle", "Black-Scholes Φ(d2) Edge bps", "Velocity Coverage (VC) Gauge"],
    accentColor: "text-rose-400",
    badgeBg: "bg-rose-950/60 border-rose-500/30 text-rose-300",
  },
  {
    step: "03",
    phase: "INSIGHTS",
    subtitle: "Adversarial AI & Automation",
    title: "Dual Thesis & Auto-Pilot",
    desc: "Cross-examine Alpha Momentum vs Mean Reversal theses with cited RAG evidence, or run automated multi-round sessions with the AI Auto-Pilot Runner.",
    highlights: ["Dual-Model Consensus Bias", "Cited News RSS Citations", "Autonomous Session Auto-Pilot"],
    accentColor: "text-fuchsia-400",
    badgeBg: "bg-fuchsia-950/60 border-fuchsia-500/30 text-fuchsia-300",
  },
  {
    step: "04",
    phase: "ACTIVITY",
    subtitle: "Ledger & Batch Sweeper",
    title: "Portfolio Management & Settlement",
    desc: "Monitor your 6-state order lifecycle, share verified performance with 1200×675 HD Alpha Cards, and batch claim winnings via ForeSightBatchSweeper.",
    highlights: ["6-State Order Lifecycle", "1-Click Batch Settlement", "HD Alpha Card Studio"],
    accentColor: "text-emerald-400",
    badgeBg: "bg-emerald-950/60 border-emerald-500/30 text-emerald-300",
  },
];

const CODE_SNIPPET_TEXT = `import { SomniaMarkets } from "@somnia-chain/markets-sdk";

// 1. Initialize ForeSight client on Somnia Shannon L1
const exchange = new SomniaMarkets({
  chainId: 50312,
  venueId: process.env.VITE_DREAMDEX_VENUE_ID || "0x679795a0195a1b76cdebb7c51d74e0a4f5",
});

// 2. Submit deterministic scenario limit order to DreamDEX CLOB
const order = await exchange.createOrder({
  marketId: "BTC-0-26AUG26",
  side: "BUY_YES",
  price: 0.62,
  amount: 80.64,
});`;

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchTerminal }) => {
  // ─── 3D Mouse Parallax State for Live Cockpit ───────────────────────
  const cockpitRef = useRef<HTMLDivElement>(null);
  const [cockpitRotate, setCockpitRotate] = useState({ x: 0, y: 0 });
  const [cockpitGlare, setCockpitGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isCockpitHovered, setIsCockpitHovered] = useState(false);

  const handleCockpitMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cockpitRef.current) return;
    const rect = cockpitRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCockpitRotate({
      x: -y * 18, // 18 deg max tilt on X (increased from 8)
      y: x * 22,  // 22 deg max tilt on Y (increased from 10)
    });
    setCockpitGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.28,
    });
  }, []);

  const handleCockpitMouseEnter = useCallback(() => {
    setIsCockpitHovered(true);
  }, []);

  const handleCockpitMouseLeave = useCallback(() => {
    setIsCockpitHovered(false);
    setCockpitRotate({ x: 0, y: 0 });
    setCockpitGlare((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  // ─── 3D Mouse Parallax State for SDK Code Snippet ───────────────────
  const snippetRef = useRef<HTMLDivElement>(null);
  const [snippetRotate, setSnippetRotate] = useState({ x: 0, y: 0 });
  const [snippetGlare, setSnippetGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isSnippetHovered, setIsSnippetHovered] = useState(false);

  const handleSnippetMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!snippetRef.current) return;
    const rect = snippetRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setSnippetRotate({
      x: -y * 18, // 18 deg max tilt on X
      y: x * 22,  // 22 deg max tilt on Y
    });
    setSnippetGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.28,
    });
  }, []);

  const handleSnippetMouseEnter = useCallback(() => {
    setIsSnippetHovered(true);
  }, []);

  const handleSnippetMouseLeave = useCallback(() => {
    setIsSnippetHovered(false);
    setSnippetRotate({ x: 0, y: 0 });
    setSnippetGlare((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  // ─── State Management ──────────────────────────────────────────────
  const [heroMarket, setHeroMarket] = useState<MarketItem | null>(null);
  const [activeCockpitTab, setActiveCockpitTab] = useState<"curve" | "debate" | "scenario">("curve");
  const [activeDebateSide, setActiveDebateSide] = useState<"bull" | "bear">("bull");
  const [simCapital, setSimCapital] = useState<number>(100);
  const [simEntryPrice, setSimEntryPrice] = useState<number>(0.62);
  const [simExitPrice, setSimExitPrice] = useState<number>(0.88);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // ─── Fetch Real Live Data from APIs ─────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchLiveLandingData = async () => {
      try {
        const marketRes = await fetch(apiUrl("/api/markets?limit=10"));

        if (marketRes.ok) {
          const mData = await marketRes.json();
          const list: any[] = mData.markets || [];
          if (list.length > 0 && isMounted) {
            const btc = list.find((m) => m.underlyingAsset === "BTC") || list[0];
            setHeroMarket({
              symbol: btc.symbol || "BTC-0-29AUG26/tUSDC",
              question: btc.question || "Will BTC close at or above strike price at settlement?",
              underlyingAsset: btc.underlyingAsset || "BTC",
              midPrice: btc.midPrice ?? 0.62,
              priceChange: btc.priceChange ?? 0.128,
              strikePrice: btc.strikePrice,
            });
            if (btc.midPrice) {
              setSimEntryPrice(Number(btc.midPrice.toFixed(2)));
              setSimExitPrice(Number(Math.min(0.95, btc.midPrice + 0.25).toFixed(2)));
            }
          }
        }
      } catch {
        // Fallback cleanly to built-in presets
      }
    };

    fetchLiveLandingData();
    const interval = setInterval(fetchLiveLandingData, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ─── Mathematical Simulation Values ────────────────────────────────
  const safeEntry = simEntryPrice > 0 ? simEntryPrice : 0.62;
  const shares = simCapital / safeEntry;
  const exitValue = shares * simExitPrice;
  const pnl = exitValue - simCapital;
  const roiNum = (pnl / simCapital) * 100;
  const roi = roiNum.toFixed(1);

  const handleCopySnippet = useCallback(() => {
    navigator.clipboard.writeText(CODE_SNIPPET_TEXT);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-[#07070B] text-[#E2E8F0] font-sans selection:bg-violet-600 selection:text-white relative overflow-hidden flex flex-col antialiased">
      {/* ─── Layered Ambient Atmosphere ─────────────────────────────── */}
      <CyberBackground />

      {/* ─── Institutional Header ───────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#07070B]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <ForeSightLogo size={38} animated={false} />
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm sm:text-base text-white tracking-wider">
              FORESIGHT
            </span>
            <span className="text-[10px] font-mono text-violet-300 bg-violet-950/80 border border-violet-500/40 px-2 py-0.5 font-medium rounded-none">
              TERMINAL
            </span>
          </div>
        </div>

        {/* Network State & Primary CTA */}
        <div className="flex items-center gap-3 font-mono">
          <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3 py-1 text-[11px] text-zinc-300 rounded-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Somnia Shannon (50312)</span>
          </div>

          <button
            onClick={onLaunchTerminal}
            className="rounded-none bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-4 py-2 transition-all border border-violet-500/50 hover:border-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center gap-1.5 active:scale-[0.98]"
          >
            <span>Launch Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ─── Live Market Tape (Unified Somnia L1 Tape) ─────────────── */}
      <div className="mt-14 z-40 relative">
        <MarketTicker />
      </div>

      {/* ─── Hero Section: Asymmetric Terminal Cockpit ───────────────── */}
      <section className="relative pt-12 lg:pt-16 pb-16 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full z-10">
        {/* Dynamic Volumetric Ambient Backlight behind Hero Cockpit */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.16)_0%,rgba(6,182,212,0.08)_40%,transparent_70%)] blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left 6 Cols: Institutional Value Proposition */}
          <div className="lg:col-span-6 flex flex-col text-left space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.08] text-zinc-300 text-xs font-mono w-fit rounded-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-zinc-400">Target Protocol:</span>
              <span className="text-white font-medium">DreamDEX CLOB</span>
              <span className="text-zinc-600">•</span>
              <span className="text-violet-300">Somnia Shannon (50312)</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.12]">
              Understand the market{" "}
              <span className="bg-gradient-to-r from-violet-300 via-violet-100 to-white bg-clip-text text-transparent">
                before you trade it.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-xl">
              An interactive decision & execution terminal for Somnia binary markets. Analyze 60s tactical cycles, evaluate Black-Scholes Greeks, cross-examine dual AI theses, and execute CLOB orders with 1-click batch settlement.
            </p>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 font-mono text-xs">
              <button
                onClick={onLaunchTerminal}
                className="rounded-none px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all border border-violet-500/50 hover:border-violet-400 shadow-[0_0_20px_rgba(124,58,237,0.35)] flex items-center gap-2 group active:scale-[0.98]"
              >
                <span>ENTER FORESIGHT TERMINAL</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <a
                href="https://github.com/DanhCaTuanNgoc/ForeSight"
                target="_blank"
                rel="noreferrer"
                className="rounded-none px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 border border-white/[0.08] hover:border-white/[0.16] transition-colors flex items-center gap-2"
              >
                <Code2 className="w-4 h-4 text-violet-400" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </a>
            </div>

            {/* Technical Chips */}
            <div className="pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-3 text-[11px] font-mono text-zinc-400">
              <div className="bg-[#0B0B14] p-2.5 border border-white/[0.06] rounded-none">
                <div className="text-white font-semibold">Market & Limit</div>
                <div className="text-zinc-500 text-[10px]">Dual-mode CLOB</div>
              </div>
              <div className="bg-[#0B0B14] p-2.5 border border-white/[0.06] rounded-none">
                <div className="text-white font-semibold">Tactical Radar</div>
                <div className="text-zinc-500 text-[10px]">60s cycle & VC math</div>
              </div>
              <div className="bg-[#0B0B14] p-2.5 border border-white/[0.06] rounded-none">
                <div className="text-white font-semibold">Batch Sweeper</div>
                <div className="text-zinc-500 text-[10px]">1-click payout claim</div>
              </div>
            </div>
          </div>

          {/* Right 6 Cols: Live Interactive Market Stage with 3D Tilt & Fixed Height */}
          <div
            ref={cockpitRef}
            onMouseMove={handleCockpitMouseMove}
            onMouseEnter={handleCockpitMouseEnter}
            onMouseLeave={handleCockpitMouseLeave}
            className="lg:col-span-6 w-full perspective-[750px] select-none relative z-10"
          >
            <div
              style={{
                transform: `perspective(750px) rotateX(${cockpitRotate.x}deg) rotateY(${cockpitRotate.y}deg)`,
                transformStyle: "preserve-3d",
                transition: "transform 0.12s ease-out, box-shadow 0.2s ease-out",
                boxShadow: isCockpitHovered
                  ? `${-cockpitRotate.y * 2.2}px ${cockpitRotate.x * 2.2 + 28}px 65px rgba(0,0,0,0.85), ${-cockpitRotate.y * 0.8}px ${cockpitRotate.x * 0.8}px 35px rgba(124,58,237,0.35)`
                  : "0 15px 50px rgba(0,0,0,0.6)",
              }}
              className="terminal-panel rounded-none overflow-hidden border border-white/[0.16] bg-[#0A0A12]/95 backdrop-blur-2xl transform-3d relative"
            >
              {/* Dynamic Specular Glare Reflection */}
              <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-none"
                style={{
                  background: `radial-gradient(circle 420px at ${cockpitGlare.x}% ${cockpitGlare.y}%, rgba(255,255,255,${cockpitGlare.opacity}), rgba(139,92,246,${cockpitGlare.opacity * 0.5}) 40%, transparent 80%)`,
                }}
              />
              
              {/* Terminal Window Header (3D Elevated Layer) */}
              <div
                style={{ transform: "translateZ(18px)" }}
                className="h-10 bg-[#07070C] border-b border-white/[0.08] px-4 flex items-center justify-between text-xs font-mono text-zinc-400"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/90 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                  <span className="ml-2 text-zinc-300 font-medium text-[11px]">
                    foresight-terminal :: live-radar
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span className="font-semibold">CHAIN 50312</span>
                </div>
              </div>

              {/* Sub-Header & Navigation Tabs (3D Elevated Layer) */}
              <div
                style={{ transform: "translateZ(28px)" }}
                className="p-3.5 border-b border-white/[0.08] bg-[#0C0C14] flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 font-mono">
                  <CryptoIcon symbol={heroMarket?.underlyingAsset || "BTC"} size={22} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {heroMarket?.symbol || "BTC-0-29AUG26/tUSDC"}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 font-medium rounded-none">
                        CLOB ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate max-w-[260px]">
                      {heroMarket?.question || "Will BTC close at or above opening price?"}
                    </p>
                  </div>
                </div>

                {/* Switcher Tabs with Sharp Rectangular Borders */}
                <div
                  style={{ transform: "translateZ(34px)" }}
                  className="flex items-center bg-[#07070B] p-0.5 border border-white/[0.08] text-[11px] font-mono rounded-none shadow-sm"
                >
                  <button
                    onClick={() => setActiveCockpitTab("curve")}
                    className={`px-3 py-1 rounded-none transition-all ${
                      activeCockpitTab === "curve"
                        ? "bg-violet-600/30 text-violet-200 border border-violet-500/50 font-semibold shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Probability
                  </button>
                  <button
                    onClick={() => setActiveCockpitTab("debate")}
                    className={`px-3 py-1 rounded-none transition-all ${
                      activeCockpitTab === "debate"
                        ? "bg-violet-600/30 text-violet-200 border border-violet-500/50 font-semibold shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Thesis
                  </button>
                  <button
                    onClick={() => setActiveCockpitTab("scenario")}
                    className={`px-3 py-1 rounded-none transition-all ${
                      activeCockpitTab === "scenario"
                        ? "bg-violet-600/30 text-violet-200 border border-violet-500/50 font-semibold shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Simulator
                  </button>
                </div>
              </div>

              {/* ─── FIXED HEIGHT TAB CONTAINER (270px) - ZERO JUMPING ─── */}
              <div className="h-[270px] p-4 flex flex-col justify-between overflow-hidden">
                {/* Tab 1: Probability Curve */}
                {activeCockpitTab === "curve" && (
                  <div className="flex flex-col justify-between h-full space-y-2">
                    <div
                      style={{ transform: "translateZ(42px)" }}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <div className="text-[11px] font-mono text-zinc-400">Current Implied Odds</div>
                        <div className="text-3xl font-bold font-mono text-white tabular-nums tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
                          {heroMarket?.midPrice ? `${(heroMarket.midPrice * 100).toFixed(1)}%` : "62.4%"}
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <div className="text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                          <span>▲</span>
                          <span className="tabular-nums">
                            +{heroMarket?.priceChange ? (heroMarket.priceChange * 100).toFixed(1) : "12.8"}%
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500">Anomaly Spike Detected</div>
                      </div>
                    </div>

                    {/* SVG Curve */}
                    <div
                      style={{ transform: "translateZ(26px)" }}
                      className="h-32 w-full relative flex items-end"
                    >
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                        <defs>
                          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 85 Q 80 80 160 65 T 280 75 T 390 28 L 500 22 L 500 120 L 0 120 Z"
                          fill="url(#curveGradient)"
                        />
                        <path
                          d="M 0 85 Q 80 80 160 65 T 280 75 T 390 28 L 500 22"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="2.5"
                        />
                        <circle cx="390" cy="28" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                      </svg>

                      <div
                        style={{ transform: "translateZ(48px)" }}
                        className="absolute top-2 right-12 bg-[#141420] border border-violet-500/70 px-2.5 py-0.5 text-[10px] font-mono text-violet-200 flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.5)] rounded-none"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="font-semibold">SPIKE POINT (+12.8%)</span>
                      </div>
                    </div>

                    {/* Timeline labels */}
                    <div
                      style={{ transform: "translateZ(20px)" }}
                      className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/[0.06] pt-2"
                    >
                      <span>-3h</span>
                      <span>-2h</span>
                      <span>-1h</span>
                      <span className="text-zinc-300 font-medium">NOW</span>
                      <span className="text-violet-400 font-medium">SETTLEMENT</span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Dual AI Debate */}
                {activeCockpitTab === "debate" && (
                  <div
                    style={{ transform: "translateZ(30px)" }}
                    className="flex flex-col justify-between h-full space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveDebateSide("bull")}
                          className={`px-3 py-1 text-[11px] font-medium transition-all rounded-none ${
                            activeDebateSide === "bull"
                              ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/50"
                              : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                          }`}
                        >
                          Alpha Bull Thesis
                        </button>
                        <button
                          onClick={() => setActiveDebateSide("bear")}
                          className={`px-3 py-1 text-[11px] font-medium transition-all rounded-none ${
                            activeDebateSide === "bear"
                              ? "bg-rose-950/70 text-rose-300 border border-rose-500/50"
                              : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                          }`}
                        >
                          Macro Bear Thesis
                        </button>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">SAMPLE PREVIEW</span>
                    </div>

                    <div className="p-3 bg-[#0E0E17] border border-white/[0.08] text-xs leading-relaxed flex-1 flex flex-col justify-between rounded-none shadow-inner">
                      {activeDebateSide === "bull" ? (
                        <p className="text-zinc-300 font-sans text-xs">
                          <strong className="text-emerald-400 font-mono font-medium">Bull Case:</strong> Aggressive spot bid absorbing CLOB liquidity walls after positive ETF flow reports. Implied volatility premium suggests momentum continuation toward strike level.
                        </p>
                      ) : (
                        <p className="text-zinc-300 font-sans text-xs">
                          <strong className="text-rose-400 font-mono font-medium">Bear Case:</strong> Open interest concentration near resistance creates execution overhang. Macro uncertainty ahead of settlement hours limits further upside momentum.
                        </p>
                      )}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2">
                        <span>Source: On-Chain Indexer + CoinDesk RSS</span>
                        <span className="text-violet-400 hover:underline cursor-pointer">
                          [View Grounded Citations]
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Interactive Scenario Simulator */}
                {activeCockpitTab === "scenario" && (
                  <div
                    style={{ transform: "translateZ(32px)" }}
                    className="flex flex-col justify-between h-full space-y-3 font-mono text-xs"
                  >
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-[#0E0E17] p-2.5 border border-white/[0.08] flex items-center justify-between rounded-none">
                        <span className="text-zinc-400">Velocity Coverage:</span>
                        <span className="font-semibold text-emerald-400 tabular-nums">1.28× Req (Pass)</span>
                      </div>
                      <div className="bg-[#0E0E17] p-2.5 border border-white/[0.08] flex items-center justify-between rounded-none">
                        <span className="text-zinc-400">Break Level:</span>
                        <span className="font-semibold text-rose-300 tabular-nums">&lt; $108.8K</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-[#0A0A10] p-2.5 border border-white/[0.06] rounded-none">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Simulated Capital: <strong className="text-white">${simCapital}</strong></span>
                        <span>Target Exit: <strong className="text-white">${simExitPrice.toFixed(2)}</strong></span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={simCapital}
                        onChange={(e) => setSimCapital(Number(e.target.value))}
                        className="w-full accent-violet-500 h-1.5 bg-[#1B1B26] cursor-pointer rounded-none"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-[#0E0E17] p-2.5 border border-white/[0.08] rounded-none shadow-inner">
                      <span className="text-zinc-400 text-xs">Scenario PnL:</span>
                      <span className="font-bold text-emerald-400 text-sm tabular-nums">
                        +${pnl.toFixed(2)} ({roiNum > 0 ? `+${roi}%` : `${roi}%`} ROI)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Widget Footer CTA */}
              <div
                style={{ transform: "translateZ(24px)" }}
                className="p-3 bg-[#07070C] border-t border-white/[0.08]"
              >
                <button
                  onClick={onLaunchTerminal}
                  className="rounded-none w-full py-2.5 bg-violet-600/25 hover:bg-violet-600/40 text-violet-200 border border-violet-500/50 text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.25)] active:scale-[0.99]"
                >
                  <span>Open Full Cockpit in Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Protocol Proof Metrics (Honest Technical Reality) ───────── */}
      <section className="py-12 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto w-full relative z-10">
        <RevealOnScroll direction="up" delayMs={60}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="terminal-panel-subtle p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between rounded-none">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Somnia L1 Finality
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                Sub-Second
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 font-normal">Shannon Testnet (50312) EVM</p>
            </div>

            <div className="terminal-panel-subtle p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between rounded-none">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Order Execution
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                Market & Limit
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 font-normal">DreamDEX CLOB BinaryPool</p>
            </div>

            <div className="terminal-panel-subtle p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between rounded-none">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Quantitative Greeks
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-violet-300 tabular-nums">
                &lt;1 ms
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 font-normal">Black-Scholes Φ(d2) & VC physics</p>
            </div>

            <div className="terminal-panel-subtle p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between rounded-none">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Batch Settlement
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                1-Click MultiCall
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 font-normal">ForeSightBatchSweeper contract</p>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ─── The 4-Stage Decision Architecture ───────────────────────── */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto border-t border-white/[0.08] w-full relative z-10">
        <RevealOnScroll direction="up" delayMs={50}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
              PRODUCT PHILOSOPHY & WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
              The 4-Stage Decision Architecture
            </h2>
            <p className="text-sm text-zinc-400 mt-3 font-normal max-w-2xl mx-auto leading-relaxed">
              ForeSight converts volatile prediction market noise into an institutional decision loop before committing capital.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {DECISION_WORKFLOW.map((item, idx) => (
            <RevealOnScroll key={item.step} direction="up" delayMs={idx * 60}>
              <div className="terminal-panel-subtle p-5 border border-white/[0.08] hover:border-violet-500/50 transition-all flex flex-col justify-between h-full space-y-4 rounded-none">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 font-semibold">{item.step}</span>
                    <span className={`text-[10px] px-2 py-0.5 border font-medium rounded-none ${item.badgeBg}`}>
                      {item.phase}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white pt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-[10px] font-mono text-zinc-400">
                  {item.highlights.map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ─── Tech Stack Infinite Running Carousel ─────────────────────── */}
      <section className="py-16 border-t border-white/[0.08] w-full relative z-10 overflow-hidden">
        <RevealOnScroll direction="up" delayMs={50}>
          <div className="text-center max-w-3xl mx-auto mb-10 px-4">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
              HYBRID INFRASTRUCTURE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              The ForeSight Technology Stack
            </h2>
          </div>
        </RevealOnScroll>

        {/* Row 1 */}
        <div className="w-full overflow-hidden marquee-mask py-1">
          <div className="animate-marquee flex items-center gap-3.5 whitespace-nowrap">
            {[...TECH_STACK_ROW_1, ...TECH_STACK_ROW_1].map((tech, idx) => (
              <div
                key={idx}
                onClick={onLaunchTerminal}
                className="inline-flex items-center gap-3 px-3.5 py-2.5 bg-[#0E0E17] border border-white/[0.08] hover:border-violet-500/50 transition-all cursor-pointer select-none rounded-none"
              >
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-none border border-white/[0.1] overflow-hidden bg-[#0E0E17]">
                  <TechIcon name={tech.techKey} size={32} />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-white font-mono">{tech.name}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 border font-medium rounded-none ${tech.badgeBg}`}>
                      {tech.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-normal truncate max-w-[260px]">
                    {tech.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="w-full overflow-hidden marquee-mask py-1 mt-2.5">
          <div className="animate-marquee-reverse flex items-center gap-3.5 whitespace-nowrap">
            {[...TECH_STACK_ROW_2, ...TECH_STACK_ROW_2].map((tech, idx) => (
              <div
                key={idx}
                onClick={onLaunchTerminal}
                className="inline-flex items-center gap-3 px-3.5 py-2.5 bg-[#0E0E17] border border-white/[0.08] hover:border-violet-500/50 transition-all cursor-pointer select-none rounded-none"
              >
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-none border border-white/[0.1] overflow-hidden bg-[#0E0E17]">
                  <TechIcon name={tech.techKey} size={32} />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-white font-mono">{tech.name}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 border font-medium rounded-none ${tech.badgeBg}`}>
                      {tech.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-normal truncate max-w-[260px]">
                    {tech.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benchmarks: ForeSight vs Generic Prediction Market UIs ──── */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto border-t border-white/[0.08] w-full relative z-10">
        <RevealOnScroll direction="up" delayMs={60}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
              TRANSPARENCY BENCHMARK
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              ForeSight vs Generic Prediction UIs
            </h2>
          </div>

          <div className="overflow-x-auto border border-white/[0.08] bg-[#0A0A10]/90 backdrop-blur-md rounded-none">
            <table className="w-full text-left text-xs font-mono divide-y divide-white/[0.06]">
              <thead className="bg-[#07070C] text-zinc-400 uppercase text-[11px]">
                <tr>
                  <th className="p-3.5 sm:p-4">Capability</th>
                  <th className="p-3.5 sm:p-4 text-violet-400 font-bold">ForeSight Terminal</th>
                  <th className="p-3.5 sm:p-4 text-zinc-500">Standard Prediction DEXs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-200">Order Execution</td>
                  <td className="p-3.5 sm:p-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    Market & Limit orderbook on DreamDEX CLOB
                  </td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">AMM swap only, high slippage</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-200">Quantitative Modeling</td>
                  <td className="p-3.5 sm:p-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    Black-Scholes Φ(d2), VC physics & Edge bps (&lt;1ms)
                  </td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">No math modeling or risk curves</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-200">AI Validation</td>
                  <td className="p-3.5 sm:p-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    Dual Momentum vs Reversal debate + Verified RSS citations
                  </td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">Ungrounded sentiment or zero analysis</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-200">Autonomous Execution</td>
                  <td className="p-3.5 sm:p-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    Browser-driven Multi-Round Auto-Pilot Runner + 4 Bot loops
                  </td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">Manual clicking per round only</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-200">Payout Recovery</td>
                  <td className="p-3.5 sm:p-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    1-Click ForeSightBatchSweeper smart contract
                  </td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">Tedious round-by-round manual claiming</td>
                </tr>
              </tbody>
            </table>
          </div>
        </RevealOnScroll>
      </section>

      {/* ─── Developer Native SDK Section ───────────────────────────── */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto border-t border-white/[0.08] w-full relative z-10">
        <RevealOnScroll direction="up" delayMs={70}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
                DEVELOPER NATIVE
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Built on Somnia & DreamDEX SDK
              </h2>
              <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                ForeSight natively integrates with <code className="text-violet-300 font-mono">@somnia-chain/markets-sdk</code>,
                supporting indexer hydration, CLOB limit orders, and automated bot loops.
              </p>
              <div className="pt-2">
                <button
                  onClick={onLaunchTerminal}
                  className="rounded-none px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs font-mono transition flex items-center gap-1.5 border border-violet-500/50 hover:border-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                >
                  <span>Test on Shannon</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              ref={snippetRef}
              onMouseMove={handleSnippetMouseMove}
              onMouseEnter={handleSnippetMouseEnter}
              onMouseLeave={handleSnippetMouseLeave}
              className="lg:col-span-7 w-full perspective-[750px] select-none relative z-10"
            >
              <div
                style={{
                  transform: `perspective(750px) rotateX(${snippetRotate.x}deg) rotateY(${snippetRotate.y}deg)`,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.12s ease-out, box-shadow 0.2s ease-out",
                  boxShadow: isSnippetHovered
                    ? `${-snippetRotate.y * 2.2}px ${snippetRotate.x * 2.2 + 28}px 65px rgba(0,0,0,0.85), ${-snippetRotate.y * 0.8}px ${snippetRotate.x * 0.8}px 35px rgba(124,58,237,0.35)`
                    : "0 15px 50px rgba(0,0,0,0.6)",
                }}
                className="terminal-panel rounded-none border border-white/[0.16] bg-[#07070F]/95 p-4 sm:p-5 font-mono text-[11px] text-zinc-300 overflow-hidden text-left transform-3d relative"
              >
                {/* Dynamic Specular Glare Reflection */}
                <div
                  className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-none"
                  style={{
                    background: `radial-gradient(circle 420px at ${snippetGlare.x}% ${snippetGlare.y}%, rgba(255,255,255,${snippetGlare.opacity}), rgba(139,92,246,${snippetGlare.opacity * 0.5}) 40%, transparent 80%)`,
                  }}
                />

                {/* Snippet Header (3D Elevated Layer) */}
                <div
                  style={{ transform: "translateZ(22px)" }}
                  className="flex items-center justify-between text-zinc-400 border-b border-white/[0.08] pb-3 mb-3.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/90 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    <span className="ml-2 text-zinc-300 font-medium text-[11px]">
                      somnia-execution-snippet.ts
                    </span>
                  </div>
                  <div
                    style={{ transform: "translateZ(34px)" }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-950/80 text-violet-300 border border-violet-500/40 font-medium rounded-none shadow-sm">
                      TypeScript
                    </span>
                    <button
                      onClick={handleCopySnippet}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-[10px] transition-all cursor-pointer rounded-none active:scale-[0.97]"
                      title="Copy full code"
                    >
                      {copiedSnippet ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Snippet Code Pre Block (3D Elevated Layer) */}
                <pre
                  style={{ transform: "translateZ(32px)" }}
                  className="leading-relaxed text-zinc-300 font-mono text-[11px] overflow-hidden drop-shadow-sm"
                >
                  <span className="text-purple-400">import</span> {"{ SomniaMarkets }"} <span className="text-purple-400">from</span> <span className="text-emerald-400">"@somnia-chain/markets-sdk"</span>;{"\n\n"}
                  <span className="text-zinc-500">// 1. Initialize ForeSight client on Somnia Shannon L1</span>{"\n"}
                  <span className="text-purple-400">const</span> exchange = <span className="text-purple-400">new</span> <span className="text-yellow-300">SomniaMarkets</span>({"{\n"}
                  {"  "}chainId: <span className="text-amber-400">50312</span>,{"\n"}
                  {"  "}venueId: process.env.VITE_DREAMDEX_VENUE_ID ||{"\n"}
                  {"           "}<span className="text-emerald-400">"0x679795a0195a1b...a4f5"</span>,{"\n"}
                  {"}"});{"\n\n"}
                  <span className="text-zinc-500">// 2. Submit deterministic scenario limit order</span>{"\n"}
                  <span className="text-purple-400">const</span> order = <span className="text-purple-400">await</span> exchange.<span className="text-blue-400">createOrder</span>({"{\n"}
                  {"  "}marketId: <span className="text-emerald-400">"BTC-0-26AUG26"</span>,{"\n"}
                  {"  "}side: <span className="text-emerald-400">"BUY_YES"</span>,{"\n"}
                  {"  "}price: <span className="text-amber-400">0.62</span>,{"\n"}
                  {"  "}amount: <span className="text-amber-400">80.64</span>,{"\n"}
                  {"}"});
                </pre>

                {/* Snippet Footer (3D Elevated Layer) */}
                <div
                  style={{ transform: "translateZ(20px)" }}
                  className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-zinc-500 font-mono"
                >
                  <span>// Click 'Copy' above to grab the full production snippet</span>
                  <span className="text-violet-400">@somnia-chain/markets-sdk</span>
                </div>
              </div>
            </div>

          </div>
        </RevealOnScroll>
      </section>

      {/* ─── Institutional Footer ────────────────────────────────────── */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#07070B] px-4 sm:px-8 lg:px-12 py-8 text-xs font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <ForeSightLogo size={20} animated={false} />
          <span className="text-zinc-300 font-semibold">FORESIGHT TERMINAL</span>
          <span>•</span>
          <span>Somnia × DreamDEX Hackathon</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onLaunchTerminal}
            className="text-violet-400 hover:text-violet-300 transition"
          >
            Launch Terminal →
          </button>
          <a
            href="https://github.com/DanhCaTuanNgoc/ForeSight"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-300 transition"
          >
            GitHub
          </a>
          <a
            href="https://somnia.network"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-300 transition"
          >
            Somnia L1
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
