import React, { useState, useRef, useCallback, useEffect } from "react";
import { CyberBackground } from "./CyberBackground.js";
import { ForeSightLogo } from "./ForeSightLogo.js";
import { CryptoIcon } from "./CryptoIcon.js";
import { TechIcon } from "./TechIcon.js";
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

interface TickerItem {
  pair: string;
  prob: string;
  change: string;
  isUp: boolean;
  spike: boolean;
}

interface MarketItem {
  symbol: string;
  question?: string;
  underlyingAsset?: string;
  midPrice?: number;
  priceChange?: number;
  strikePrice?: number;
}

const DEFAULT_TICKERS: TickerItem[] = [
  { pair: "BTC > $78.5K (16:00 UTC)", prob: "62.4%", change: "+14.2%", isUp: true, spike: true },
  { pair: "ETH > $2,480 Strike", prob: "48.0%", change: "-3.5%", isUp: false, spike: false },
  { pair: "SOMI / USDso", prob: "$0.1090", change: "+4.1%", isUp: true, spike: false },
  { pair: "FED Rate Cut Nov", prob: "78.5%", change: "+19.0%", isUp: true, spike: true },
  { pair: "SOL > $185 Strike", prob: "54.2%", change: "+6.8%", isUp: true, spike: false },
  { pair: "TRUMP Polymarket Arb", prob: "51.8%", change: "-1.2%", isUp: false, spike: false },
];

const TECH_STACK_ROW_1 = [
  {
    name: "Somnia L1 Blockchain",
    techKey: "somnia",
    badge: "100K+ TPS",
    desc: "Shannon Testnet (50312) with sub-second finality & reactive EVM execution",
    badgeBg: "bg-violet-950/80 text-violet-300 border-violet-500/30",
  },
  {
    name: "DreamDEX Event Contracts",
    techKey: "dreamdex",
    badge: "CLOB Orderbook",
    desc: "Decentralized on-chain binary prediction limit orders and liquidity pools",
    badgeBg: "bg-cyan-950/80 text-cyan-300 border-cyan-500/30",
  },
  {
    name: "@somnia-chain/markets-sdk",
    techKey: "typescript",
    badge: "TypeScript",
    desc: "Type-safe native client for indexer hydration and order placement",
    badgeBg: "bg-blue-950/80 text-blue-300 border-blue-500/30",
  },
  {
    name: "Viem Web3 Engine",
    techKey: "viem",
    badge: "EIP-1193",
    desc: "High-performance client for Somnia RPC and fast signature verification",
    badgeBg: "bg-indigo-950/80 text-indigo-300 border-indigo-500/30",
  },
  {
    name: "Prophecy Spot Oracles",
    techKey: "oracle",
    badge: "Real-Time",
    desc: "High-precision spot price feeds for transparent binary settlements",
    badgeBg: "bg-orange-950/80 text-orange-300 border-orange-500/30",
  },
  {
    name: "Settlement Sweeper",
    techKey: "sweeper",
    badge: "Batch Claim",
    desc: "MultiCall redemption engine claiming stranded winnings in a single batch",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/30",
  },
];

const TECH_STACK_ROW_2 = [
  {
    name: "Dual AI Debate Arena",
    techKey: "dual ai",
    badge: "Bull vs Bear",
    desc: "Adversarial multi-agent consensus challenging single-model bias",
    badgeBg: "bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/30",
  },
  {
    name: "RAG Evidence Pipeline",
    techKey: "rag",
    badge: "Source-Cited",
    desc: "Real-time Crypto RSS ingestion with transparent, verifiable source citations",
    badgeBg: "bg-amber-950/80 text-amber-300 border-amber-500/30",
  },
  {
    name: "Deterministic Scenario Engine",
    techKey: "scenario",
    badge: "Client-Side",
    desc: "Zero-latency mathematical modeling for PnL, breakeven, and velocity coverage",
    badgeBg: "bg-rose-950/80 text-rose-300 border-rose-500/30",
  },
  {
    name: "Supabase Cloud Database",
    techKey: "supabase",
    badge: "Postgres",
    desc: "Time-series probability snapshots, anomaly indexing, and user persistence",
    badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/30",
  },
  {
    name: "React 19 & Vite 6",
    techKey: "react",
    badge: "Concurrent",
    desc: "Sub-millisecond interactive UI rendering with TypeScript & Tailwind CSS",
    badgeBg: "bg-sky-950/80 text-sky-300 border-sky-500/30",
  },
  {
    name: "Autonomous Bot Loops",
    techKey: "bot",
    badge: "4 Strategies",
    desc: "Market Maker, Oracle Follower, Starter Bot, and Take-Profit Auto Execution",
    badgeBg: "bg-teal-950/80 text-teal-300 border-teal-500/30",
  },
];

const DECISION_WORKFLOW = [
  {
    step: "01",
    phase: "DETECT",
    subtitle: "Real-Time Volatility Scanner",
    title: "Orderbook Anomaly Detection",
    desc: "Monitors DreamDEX event contracts. Surfaces real-time implied probability shifts exceeding ≥10% on the probability timeline.",
    highlights: ["10-Second Indexing", "≥10% Shift Detection", "Interactive Timeline Markers"],
    accentColor: "text-cyan-400",
    badgeBg: "bg-cyan-950/60 border-cyan-500/30 text-cyan-300",
  },
  {
    step: "02",
    phase: "CHALLENGE",
    subtitle: "Adversarial Consensus",
    title: "Dual-Agent Thesis Debate",
    desc: "Alpha Bull and Macro Bear agents analyze drivers behind order flow moves with verified news citations to eliminate single-model bias.",
    highlights: ["Adversarial Multi-Agent Debate", "Verified RAG Citations", "Consensus Divergence Metric"],
    accentColor: "text-fuchsia-400",
    badgeBg: "bg-fuchsia-950/60 border-fuchsia-500/30 text-fuchsia-300",
  },
  {
    step: "03",
    phase: "SIMULATE",
    subtitle: "Deterministic Trajectory",
    title: "Trajectory & Feasibility Modeling",
    desc: "Simulates capital allocation, breakeven curves, and Velocity Coverage (VC) under Black-Scholes implied odds with zero client latency.",
    highlights: ["Velocity Coverage (VC) Math", "Client-Side Greeks Modeling", "Instant PnL & Breakeven Curves"],
    accentColor: "text-rose-400",
    badgeBg: "bg-rose-950/60 border-rose-500/30 text-rose-300",
  },
  {
    step: "04",
    phase: "EXECUTE",
    subtitle: "Precision Settlement",
    title: "Order Dispatch & Settlement Claim",
    desc: "Dispatches limit orders directly to DreamDEX CLOB on Somnia L1. Settlement Sweeper claims winning contract payouts in a single batch.",
    highlights: ["DreamDEX CLOB Execution", "Simulation Sandbox", "Batch MultiCall Settlement"],
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

  const handleCockpitMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cockpitRef.current) return;
    const rect = cockpitRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCockpitRotate({
      x: -y * 8, // 8 deg max tilt on X
      y: x * 10, // 10 deg max tilt on Y
    });
    setCockpitGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.18,
    });
  }, []);

  const handleCockpitMouseLeave = useCallback(() => {
    setCockpitRotate({ x: 0, y: 0 });
    setCockpitGlare((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  // ─── 3D Mouse Parallax State for SDK Code Snippet ───────────────────
  const snippetRef = useRef<HTMLDivElement>(null);
  const [snippetRotate, setSnippetRotate] = useState({ x: 0, y: 0 });
  const [snippetGlare, setSnippetGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleSnippetMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!snippetRef.current) return;
    const rect = snippetRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setSnippetRotate({
      x: -y * 8,
      y: x * 10,
    });
    setSnippetGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.18,
    });
  }, []);

  const handleSnippetMouseLeave = useCallback(() => {
    setSnippetRotate({ x: 0, y: 0 });
    setSnippetGlare((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  // ─── State Management ──────────────────────────────────────────────
  const [liveTickers, setLiveTickers] = useState<TickerItem[]>(DEFAULT_TICKERS);
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
        const [tickerRes, marketRes] = await Promise.all([
          fetch(apiUrl("/api/tickers")),
          fetch(apiUrl("/api/markets?limit=10")),
        ]);

        if (tickerRes.ok) {
          const tData = await tickerRes.json();
          if (tData.tickers && tData.tickers.length > 0 && isMounted) {
            setLiveTickers(
              tData.tickers.map((t: any) => ({
                pair: t.symbol,
                prob: `${(t.probability ?? 50).toFixed(1)}%`,
                change: `${t.change >= 0 ? "+" : ""}${(t.change ?? 0).toFixed(1)}%`,
                isUp: (t.change ?? 0) >= 0,
                spike: Math.abs(t.change ?? 0) >= 8,
              }))
            );
          }
        }

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

  // ─── Ticker Tape Continuous Loop Timing ─────────────────────────────
  const repeatedTickers = Array(3).fill(liveTickers).flat();
  const tickerDurationSec = Math.max(50, Math.round((repeatedTickers.length * 200) / 25));

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

      {/* ─── Live Market Tape ────────────────────────────────────────── */}
      <div className="w-full bg-[#09090F]/95 backdrop-blur-md border-b border-white/[0.08] overflow-hidden py-1.5 z-40 text-[11px] font-mono select-none mt-14 relative">
        <div className="relative flex items-center">
          <div
            className="ticker-track flex items-center gap-0"
            style={{
              animation: `ticker ${tickerDurationSec}s linear infinite`,
              willChange: "transform",
            }}
          >
            {[0, 1].map((stripIdx) => (
              <div key={stripIdx} className="flex items-center gap-3 pr-3 whitespace-nowrap flex-shrink-0">
                {repeatedTickers.map((item, idx) => (
                  <div
                    key={`${stripIdx}-${idx}`}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#0D0D15] border border-white/[0.08] hover:border-violet-500/50 cursor-pointer transition-all text-xs rounded-none"
                    onClick={onLaunchTerminal}
                  >
                    <span className="text-zinc-400 font-normal">{item.pair}</span>
                    <span className="text-white font-medium tabular-nums">{item.prob}</span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums ${
                        item.isUp ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {item.isUp ? "▲" : "▼"} {item.change}
                    </span>
                    {item.spike && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-violet-950/80 text-violet-300 border border-violet-500/50 font-medium rounded-none">
                        SPIKE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
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
              <span className="text-violet-300">Somnia L1</span>
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
              Detect anomaly spikes on DreamDEX orderbooks. Challenge market theses with multi-agent RAG evidence. Model trajectory feasibility with zero client latency.
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
                <div className="text-white font-semibold tabular-nums">100K+ TPS</div>
                <div className="text-zinc-500 text-[10px]">Sub-second finality</div>
              </div>
              <div className="bg-[#0B0B14] p-2.5 border border-white/[0.06] rounded-none">
                <div className="text-white font-semibold">Decentralized CLOB</div>
                <div className="text-zinc-500 text-[10px]">Limit orderbook</div>
              </div>
              <div className="bg-[#0B0B14] p-2.5 border border-white/[0.06] rounded-none">
                <div className="text-white font-semibold">&lt;1ms Math</div>
                <div className="text-zinc-500 text-[10px]">Deterministic physics</div>
              </div>
            </div>
          </div>

          {/* Right 6 Cols: Live Interactive Market Stage with 3D Tilt & Fixed Height */}
          <div
            ref={cockpitRef}
            onMouseMove={handleCockpitMouseMove}
            onMouseLeave={handleCockpitMouseLeave}
            className="lg:col-span-6 w-full perspective-1000 select-none relative z-10"
          >
            <div
              style={{
                transform: `perspective(1000px) rotateX(${cockpitRotate.x}deg) rotateY(${cockpitRotate.y}deg)`,
                transition: "transform 0.15s ease-out",
              }}
              className="terminal-panel rounded-none overflow-hidden border border-white/[0.12] bg-[#0A0A12]/95 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] transform-3d relative"
            >
              {/* Dynamic Specular Glare Reflection */}
              <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-none"
                style={{
                  background: `radial-gradient(circle 400px at ${cockpitGlare.x}% ${cockpitGlare.y}%, rgba(255,255,255,${cockpitGlare.opacity}), transparent 80%)`,
                }}
              />
              
              {/* Terminal Window Header */}
              <div className="h-10 bg-[#07070C] border-b border-white/[0.08] px-4 flex items-center justify-between text-xs font-mono text-zinc-400">
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

              {/* Sub-Header & Navigation Tabs */}
              <div className="p-3.5 border-b border-white/[0.08] bg-[#0C0C14] flex flex-wrap items-center justify-between gap-3">
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
                <div className="flex items-center bg-[#07070B] p-0.5 border border-white/[0.08] text-[11px] font-mono rounded-none">
                  <button
                    onClick={() => setActiveCockpitTab("curve")}
                    className={`px-3 py-1 rounded-none transition-all ${
                      activeCockpitTab === "curve"
                        ? "bg-violet-600/30 text-violet-200 border border-violet-500/50 font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Probability
                  </button>
                  <button
                    onClick={() => setActiveCockpitTab("debate")}
                    className={`px-3 py-1 rounded-none transition-all ${
                      activeCockpitTab === "debate"
                        ? "bg-violet-600/30 text-violet-200 border border-violet-500/50 font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Thesis
                  </button>
                  <button
                    onClick={() => setActiveCockpitTab("scenario")}
                    className={`px-3 py-1 rounded-none transition-all ${
                      activeCockpitTab === "scenario"
                        ? "bg-violet-600/30 text-violet-200 border border-violet-500/50 font-semibold"
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
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[11px] font-mono text-zinc-400">Current Implied Odds</div>
                        <div className="text-3xl font-bold font-mono text-white tabular-nums">
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
                    <div className="h-32 w-full relative flex items-end">
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

                      <div className="absolute top-2 right-12 bg-[#141420] border border-violet-500/50 px-2 py-0.5 text-[10px] font-mono text-violet-200 flex items-center gap-1.5 shadow-sm rounded-none">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="font-medium">SPIKE POINT (+12.8%)</span>
                      </div>
                    </div>

                    {/* Timeline labels */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/[0.06] pt-2">
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
                  <div className="flex flex-col justify-between h-full space-y-3">
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

                    <div className="p-3 bg-[#0E0E17] border border-white/[0.08] text-xs leading-relaxed flex-1 flex flex-col justify-between rounded-none">
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
                  <div className="flex flex-col justify-between h-full space-y-3 font-mono text-xs">
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

                    <div className="flex items-center justify-between bg-[#0E0E17] p-2.5 border border-white/[0.08] rounded-none">
                      <span className="text-zinc-400 text-xs">Scenario PnL:</span>
                      <span className="font-bold text-emerald-400 text-sm tabular-nums">
                        +${pnl.toFixed(2)} ({roiNum > 0 ? `+${roi}%` : `${roi}%`} ROI)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Widget Footer CTA */}
              <div className="p-3 bg-[#07070C] border-t border-white/[0.08]">
                <button
                  onClick={onLaunchTerminal}
                  className="rounded-none w-full py-2.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-200 border border-violet-500/40 text-xs font-mono font-medium transition-all flex items-center justify-center gap-2"
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
                100K+ TPS
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 font-normal">Sub-second reactive EVM execution</p>
            </div>

            <div className="terminal-panel-subtle p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between rounded-none">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                DreamDEX CLOB
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                500+ Markets
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 font-normal">On-chain limit order liquidity</p>
            </div>

            <div className="terminal-panel-subtle p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between rounded-none">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Deterministic Math
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-violet-300 tabular-nums">
                &lt;1 ms
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 font-normal">Zero-latency client Greeks engine</p>
            </div>

            <div className="terminal-panel-subtle p-4 sm:p-5 border border-white/[0.08] flex flex-col justify-between rounded-none">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                RAG Evidence
              </span>
              <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                100% Cited
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 font-normal">Verifiable news RSS citations</p>
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

      {/* ─── Benchmarks: ForeSight vs Black-Box Bots ──────────────────── */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto border-t border-white/[0.08] w-full relative z-10">
        <RevealOnScroll direction="up" delayMs={60}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
              TRANSPARENCY BENCHMARK
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              ForeSight vs Traditional Black-Box Bots
            </h2>
          </div>

          <div className="overflow-x-auto border border-white/[0.08] bg-[#0A0A10]/90 backdrop-blur-md rounded-none">
            <table className="w-full text-left text-xs font-mono divide-y divide-white/[0.06]">
              <thead className="bg-[#07070C] text-zinc-400 uppercase text-[11px]">
                <tr>
                  <th className="p-3.5 sm:p-4">Feature</th>
                  <th className="p-3.5 sm:p-4 text-violet-400 font-bold">ForeSight Terminal</th>
                  <th className="p-3.5 sm:p-4 text-zinc-500">Generic Black-Box Bots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-200">Decision Transparency</td>
                  <td className="p-3.5 sm:p-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Dual Bull/Bear debate + Grounded RAG citations
                  </td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">Opaque single-number signals</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-200">Risk & Scenario Modeling</td>
                  <td className="p-3.5 sm:p-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Client-side Greeks & Velocity Coverage (&lt;1ms)
                  </td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">Manual spreadsheets or none</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-200">Execution Speed</td>
                  <td className="p-3.5 sm:p-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Sub-second CLOB limit orders on Somnia Shannon L1
                  </td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">Slow gas-constrained EVM blocks</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-200">Payout Recovery</td>
                  <td className="p-3.5 sm:p-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    1-Click Auto Sweeper recovering stranded collateral
                  </td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">Manual round-by-round claiming</td>
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
              onMouseLeave={handleSnippetMouseLeave}
              className="lg:col-span-7 w-full perspective-1000 select-none relative z-10"
            >
              <div
                style={{
                  transform: `perspective(1000px) rotateX(${snippetRotate.x}deg) rotateY(${snippetRotate.y}deg)`,
                  transition: "transform 0.15s ease-out",
                }}
                className="terminal-panel rounded-none border border-white/[0.12] bg-[#07070F]/95 p-4 sm:p-5 font-mono text-[11px] text-zinc-300 overflow-hidden text-left shadow-[0_15px_50px_rgba(0,0,0,0.6)] transform-3d relative"
              >
                {/* Dynamic Specular Glare Reflection */}
                <div
                  className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-none"
                  style={{
                    background: `radial-gradient(circle 350px at ${snippetGlare.x}% ${snippetGlare.y}%, rgba(255,255,255,${snippetGlare.opacity}), transparent 80%)`,
                  }}
                />

                <div className="flex items-center justify-between text-zinc-400 border-b border-white/[0.08] pb-3 mb-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/90 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    <span className="ml-2 text-zinc-300 font-medium text-[11px]">
                      somnia-execution-snippet.ts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-950/80 text-violet-300 border border-violet-500/40 font-medium rounded-none">
                      TypeScript
                    </span>
                    <button
                      onClick={handleCopySnippet}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-[10px] transition-all cursor-pointer rounded-none"
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

                <pre className="leading-relaxed text-zinc-300 font-mono text-[11px] overflow-hidden">
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

                <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
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
