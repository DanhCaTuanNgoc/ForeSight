import React, { useState, useRef, useCallback } from "react";
import { CyberBackground } from "./CyberBackground.js";
import { ForeSightLogo } from "./ForeSightLogo.js";
import { CryptoIcon } from "./CryptoIcon.js";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Sparkles,
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
  DollarSign,
  Radio,
  BookOpen,
  Boxes,
  Copy,
  Check,
} from "lucide-react";

interface LandingPageProps {
  onLaunchTerminal: () => void;
}

const TICKER_ITEMS = [
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
    badge: "100K+ TPS",
    desc: "Shannon Testnet (50312) with sub-second finality & reactive EVM",
    icon: Zap,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-950/80 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.35)]",
    badgeBg: "bg-purple-950/90 text-purple-300 border-purple-500/50",
    hoverBorder: "hover:border-purple-500/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]",
  },
  {
    name: "DreamDEX Event Contracts",
    badge: "500+ Markets",
    desc: "High-frequency on-chain binary prediction orderbook & liquidity pools",
    icon: Layers,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-950/80 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.35)]",
    badgeBg: "bg-cyan-950/90 text-cyan-300 border-cyan-500/50",
    hoverBorder: "hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]",
  },
  {
    name: "@somnia-chain/markets-sdk",
    badge: "v0.28.1",
    desc: "Direct TypeScript integration for market hydration & order placement",
    icon: Code2,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-950/80 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.35)]",
    badgeBg: "bg-blue-950/90 text-blue-300 border-blue-500/50",
    hoverBorder: "hover:border-blue-500/60 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]",
  },
  {
    name: "Viem Web3 Engine",
    badge: "Type-Safe",
    desc: "Lightweight, blazing-fast client for Somnia RPC & wallet signatures",
    icon: Terminal,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-950/80 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.35)]",
    badgeBg: "bg-indigo-950/90 text-indigo-300 border-indigo-500/50",
    hoverBorder: "hover:border-indigo-500/60 hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]",
  },
  {
    name: "Prophecy Spot Oracles",
    badge: "Real-Time",
    desc: "Decentralized high-precision spot price feeds for binary settlements",
    icon: Activity,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-950/80 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.35)]",
    badgeBg: "bg-orange-950/90 text-orange-300 border-orange-500/50",
    hoverBorder: "hover:border-orange-500/60 hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]",
  },
  {
    name: "Settlement Sweeper",
    badge: "Auto-Claim",
    desc: "Batch redemption engine claiming stranded collateral in 1 click",
    icon: ShieldCheck,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-950/80 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
    badgeBg: "bg-emerald-950/90 text-emerald-300 border-emerald-500/50",
    hoverBorder: "hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
  },
];

const TECH_STACK_ROW_2 = [
  {
    name: "Dual AI Debate Arena",
    badge: "Bull vs Bear",
    desc: "Alpha Bull vs Macro Bear consensus eliminating single-model hallucinations",
    icon: Bot,
    iconColor: "text-fuchsia-400",
    iconBg: "bg-fuchsia-950/80 border-fuchsia-500/50 shadow-[0_0_12px_rgba(217,70,239,0.35)]",
    badgeBg: "bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-500/50",
    hoverBorder: "hover:border-fuchsia-500/60 hover:shadow-[0_0_25px_rgba(217,70,239,0.25)]",
  },
  {
    name: "RAG News Evidence Pipeline",
    badge: "100% Grounded",
    desc: "Live Crypto & Macro RSS ingestion with transparent [View Sources] links",
    icon: Sparkles,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-950/80 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]",
    badgeBg: "bg-amber-950/90 text-amber-300 border-amber-500/50",
    hoverBorder: "hover:border-amber-500/60 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]",
  },
  {
    name: "Deterministic Scenario Engine",
    badge: "0ms Latency",
    desc: "Zero-latency mathematical modeling for PnL, ROI %, and Breakeven curves",
    icon: Sliders,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-950/80 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]",
    badgeBg: "bg-rose-950/90 text-rose-300 border-rose-500/50",
    hoverBorder: "hover:border-rose-500/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]",
  },
  {
    name: "Supabase Cloud Database",
    badge: "Postgres",
    desc: "Time-series probability snapshots, spike indexing & strategy persistence",
    icon: Database,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-950/80 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
    badgeBg: "bg-emerald-950/90 text-emerald-300 border-emerald-500/50",
    hoverBorder: "hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
  },
  {
    name: "React 19 & Vite 6",
    badge: "Concurrent",
    desc: "Sub-millisecond interactive UI rendering with TypeScript & Tailwind CSS",
    icon: Boxes,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-950/80 border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.35)]",
    badgeBg: "bg-sky-950/90 text-sky-300 border-sky-500/50",
    hoverBorder: "hover:border-sky-500/60 hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]",
  },
  {
    name: "Autonomous Bot Loops",
    badge: "4 Strategies",
    desc: "Market Maker, Oracle Follower, Starter Bot & Take-Profit Auto Execution",
    icon: Cpu,
    iconColor: "text-teal-400",
    iconBg: "bg-teal-950/80 border-teal-500/50 shadow-[0_0_12px_rgba(20,184,166,0.35)]",
    badgeBg: "bg-teal-950/90 text-teal-300 border-teal-500/50",
    hoverBorder: "hover:border-teal-500/60 hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]",
  },
];

const CODE_SNIPPET_TEXT = `import { SomniaMarkets } from "@somnia-chain/markets-sdk";

// 1. Hydrate ForeSight with Somnia Shannon CLOB
const exchange = new SomniaMarkets({
  chainId: 50312,
  venueId: "0x679795a0195a1b76cdebb7c51d74e0...",
});

// 2. Execute 1-Click Deterministic Scenario Order
const order = await exchange.createOrder({
  marketId: "BTC-0-26AUG26",
  side: "BUY_YES",
  price: 0.62,
  amount: 80.64,
});`;

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchTerminal }) => {
  // ─── 3D Mouse Parallax State ───────────────────────────────────────
  const heroRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Max tilt: 10 degrees on Y, -8 degrees on X
    setRotate({
      x: -y * 10,
      y: x * 12,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 });
  }, []);

  // ─── Code Snippet 3D Parallax State ────────────────────────────────
  const codeSnippetRef = useRef<HTMLDivElement>(null);
  const [codeRotate, setCodeRotate] = useState({ x: 0, y: 0 });
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleCodeMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!codeSnippetRef.current) return;
    const rect = codeSnippetRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Max tilt: 10 degrees on Y, -8 degrees on X
    setCodeRotate({
      x: -y * 10,
      y: x * 12,
    });
  }, []);

  const handleCodeMouseLeave = useCallback(() => {
    setCodeRotate({ x: 0, y: 0 });
  }, []);

  const handleCopySnippet = useCallback(() => {
    navigator.clipboard.writeText(CODE_SNIPPET_TEXT);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  }, []);

  // ─── Interactive Hero Sandbox State ────────────────────────────────
  const [simCapital, setSimCapital] = useState<number>(100);
  const [simEntryPrice, setSimEntryPrice] = useState<number>(0.62);
  const [simExitPrice, setSimExitPrice] = useState<number>(0.88);
  const [activeDebateTab, setActiveDebateTab] = useState<"bull" | "bear">("bull");

  // Deterministic math
  const shares = simCapital / simEntryPrice;
  const exitValue = shares * simExitPrice;
  const pnl = exitValue - simCapital;
  const roiNum = (pnl / simCapital) * 100;
  const roi = roiNum.toFixed(1);

  return (
    <div className="min-h-screen bg-[#07070A] text-[#E2E8F0] font-sans selection:bg-violet-600 selection:text-white relative overflow-hidden flex flex-col">
      {/* ─── Dynamic 3D Cyber Background Canvas & Atmosphere ─────────── */}
      <CyberBackground />

      {/* ─── Fixed Navigation Header ───────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#07070A]/90 backdrop-blur-xl border-b border-[#1F1F2E] px-6 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <ForeSightLogo size={46} animated={true} />
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-xl text-white tracking-widest neon-glow-violet">
              FORESIGHT
            </span>
            <span className="text-[10px] font-mono text-violet-300 bg-violet-950/90 border border-violet-500/50 px-2 py-0.5 rounded font-bold shadow-[0_0_10px_rgba(124,58,237,0.4)]">
              TERMINAL
            </span>
          </div>
        </div>

        {/* Links */}
        {/* <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-400">
          <a href="#hero-sandbox" className="hover:text-violet-300 transition-colors">
            Live Sandbox
          </a>
          <a href="#loop" className="hover:text-violet-300 transition-colors">
            4-Step Workflow
          </a>
          <a href="#tech-stack" className="hover:text-violet-300 transition-colors">
            Tech Stack
          </a>
          <a href="#stats" className="hover:text-violet-300 transition-colors">
            Proof Metrics
          </a>
          <a href="#benchmarks" className="hover:text-violet-300 transition-colors">
            Comparison
          </a>
          <a href="#sdk" className="hover:text-violet-300 transition-colors">
            Developers
          </a>
        </nav> */}

        {/* Actions */}
        <div className="flex items-center gap-3 font-mono">
          <div className="hidden sm:flex items-center gap-2 bg-[#12121B] border border-[#232336] px-3 py-1 rounded text-[11px] text-gray-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Somnia Shannon (50312)</span>
          </div>

          <button
            onClick={onLaunchTerminal}
            className="border-beam-container bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-2"
          >
            <span>Launch Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ─── Top Marquee Ticker Tape (Positioned Below Fixed Header) ────── */}
      <div className="w-full bg-[#0D0D14]/90 backdrop-blur-md border-b border-[#1F1F2E] overflow-hidden py-1.5 z-40 text-[11px] font-mono select-none mt-16">
        <div className="relative flex items-center">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md bg-[#13131D]/90 border border-[#232336] hover:border-violet-400 cursor-pointer transition-all hover:shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                onClick={onLaunchTerminal}
              >
                <span className="text-gray-400 font-medium">{item.pair}</span>
                <span className="text-white font-bold">{item.prob}</span>
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                    item.isUp ? "text-emerald-400 neon-glow-emerald" : "text-rose-400"
                  }`}
                >
                  {item.isUp ? "▲" : "▼"} {item.change}
                </span>
                {item.spike && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded bg-violet-950/80 text-violet-300 border border-violet-500 animate-pulse shadow-[0_0_8px_rgba(167,139,250,0.6)]">
                    ⚡ SPIKE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 3D Interactive Hero Section ──────────────────────────────── */}
      <section
        id="hero-sandbox"
        className="relative pt-12 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center"
      >
        {/* Floating Holographic Telemetry Badges */}
        <div className="hidden xl:block absolute top-16 left-4 animate-float-slow z-20 pointer-events-none">
          <div className="p-2.5 rounded-xl bg-[#12121D]/80 backdrop-blur-md border border-emerald-500/30 text-left font-mono text-[10px] shadow-[0_0_18px_rgba(16,185,129,0.2)]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Somnia Shannon #1,492,020</span>
            </div>
            <div className="text-gray-400 mt-0.5">Throughput: 100K+ TPS Finality</div>
          </div>
        </div>

        <div className="hidden xl:block absolute top-20 right-4 animate-float-reverse z-20 pointer-events-none">
          <div className="p-2.5 rounded-xl bg-[#12121D]/80 backdrop-blur-md border border-violet-500/30 text-left font-mono text-[10px] shadow-[0_0_18px_rgba(167,139,250,0.2)]">
            <div className="flex items-center gap-2 text-violet-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Dual RAG Consensus: 88%</span>
            </div>
            <div className="text-gray-400 mt-0.5">Bull/Bear verified citations</div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12121C]/90 backdrop-blur-md border border-violet-500/50 text-violet-300 text-xs font-mono mb-6 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" style={{ animationDuration: "6s" }} />
          <span>Institutional Intelligence Layer for DreamDEX & Somnia</span>
          <span className="text-gray-600">•</span>
          <span className="text-emerald-400 font-bold">100K TPS Ready</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.12]">
          Understand the market <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent neon-glow-violet">
            before you trade it.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-gray-300 max-w-2xl font-light leading-relaxed">
          ForeSight transforms opaque prediction-market orderbooks into an interactive 30-second loop:
          detect probability spikes, synthesize verified dual AI debates, and simulate deterministic PnL.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-mono text-xs z-10">
          <button
            onClick={onLaunchTerminal}
            className="border-beam-container px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition-all shadow-[0_0_30px_rgba(124,58,237,0.5)] flex items-center gap-2 group"
          >
            <span>ENTER FORESIGHT TERMINAL</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="https://github.com/DanhCaTuanNgoc/ForeSight"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3.5 rounded-xl bg-[#12121C]/80 hover:bg-[#1A1A28] text-gray-300 border border-[#232336] transition-colors flex items-center gap-2 backdrop-blur-md hover:border-violet-500/50"
          >
            <Code2 className="w-4 h-4 text-violet-400" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
          </a>
        </div>

        {/* ─── 3D TILT INTERACTIVE HERO SANDBOX MOCKUP ─────────────────── */}
        <div
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="mt-12 w-full max-w-5xl perspective-1000 select-none relative z-10"
        >
          <div
            style={{
              transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transition: "transform 0.15s ease-out",
            }}
            className="border-beam-container cyber-card rounded-2xl border border-[#2A2A3D] bg-[#0E0E16]/95 p-1.5 shadow-[0_0_50px_rgba(124,58,237,0.25)] backdrop-blur-2xl transform-3d text-left"
          >
            {/* Top Terminal Bar */}
            <div className="h-9 bg-[#09090F] rounded-t-xl border-b border-[#232336] px-4 flex items-center justify-between text-xs font-mono text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span className="ml-2 text-gray-200 font-semibold text-[11px]">
                  foresight-terminal :: somnia-shannon-clob (Chain 50312)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE SANDBOX FEED
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-violet-300 font-bold">0ms DETERMINISTIC MATH</span>
              </div>
            </div>

            {/* Terminal Main Grid */}
            <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 7 Cols: Probability Chart + Spike Marker */}
              <div className="lg:col-span-7 bg-[#07070B]/90 rounded-xl border border-[#1F1F2E] p-4 flex flex-col justify-between space-y-4 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <CryptoIcon symbol="BTC" size={18} />
                      <span className="text-sm font-bold text-white">BTC-0-26AUG26 / tUSDC</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                        ACTIVE CLOB
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Will BTC close above $78,500 at 16:00 UTC?
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-2xl font-black text-emerald-400 neon-glow-emerald">62.4%</div>
                    <div className="text-[10px] text-emerald-400 font-bold">▲ +14.2% Spike Detected</div>
                  </div>
                </div>

                {/* SVG Curve Representation */}
                <div className="h-32 w-full relative flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                    <defs>
                      <linearGradient id="cyberHeroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 85 Q 80 80 160 65 T 280 75 T 390 28 L 500 22 L 500 120 L 0 120 Z"
                      fill="url(#cyberHeroGrad)"
                    />
                    <path
                      d="M 0 85 Q 80 80 160 65 T 280 75 T 390 28 L 500 22"
                      fill="none"
                      stroke="#A78BFA"
                      strokeWidth="3"
                    />
                    {/* Static Spike Point Marker */}
                    <circle cx="390" cy="28" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  </svg>

                  {/* Spike Tooltip Badge */}
                  <div className="absolute top-2 right-12 bg-violet-950/95 border border-violet-400 rounded-md px-2.5 py-1 text-[10px] font-mono text-violet-200 shadow-[0_0_16px_rgba(124,58,237,0.6)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold">⚡ 14:32 UTC SPIKE (+14.2%)</span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-[#1F1F2E] pt-2">
                  <span>12:00 UTC</span>
                  <span>13:00 UTC</span>
                  <span>14:00 UTC</span>
                  <span>15:00 UTC</span>
                  <span className="text-violet-400 font-bold">16:00 (EXPIRY)</span>
                </div>
              </div>

              {/* Right 5 Cols: Live Interactive Mini-Simulator & RAG Debate */}
              <div className="lg:col-span-5 bg-[#07070B]/90 rounded-xl border border-[#1F1F2E] p-4 flex flex-col justify-between space-y-3 font-mono text-xs">
                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-[#1F1F2E] pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDebateTab("bull")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        activeDebateTab === "bull"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      🐂 Alpha Bull (68%)
                    </button>
                    <button
                      onClick={() => setActiveDebateTab("bear")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        activeDebateTab === "bear"
                          ? "bg-rose-950 text-rose-400 border border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      🐻 Macro Bear (32%)
                    </button>
                  </div>
                  <span className="text-[9px] text-violet-400 uppercase font-bold">RAG Grounded</span>
                </div>

                {/* RAG Context Output */}
                <div className="p-2.5 rounded-lg bg-[#101018] border border-[#232336] text-[11px]">
                  {activeDebateTab === "bull" ? (
                    <p className="text-gray-200 font-sans leading-snug">
                      <b className="text-emerald-400 font-mono font-bold">Bull Thesis:</b> Heavy institutional bid walls on Somnia CLOB after ETF inflow data release.
                    </p>
                  ) : (
                    <p className="text-gray-200 font-sans leading-snug">
                      <b className="text-rose-400 font-mono font-bold">Bear Thesis:</b> Macro uncertainty remains high ahead of option expiry time window.
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-[#1F1F2E] pt-1">
                    <span>Source: CoinDesk / Somnia Indexer</span>
                    <span className="text-violet-400 underline cursor-pointer hover:text-violet-300">
                      [View 3 Citations]
                    </span>
                  </div>
                </div>

                {/* Decision Stress Test & Interactive Slider */}
                <div className="space-y-2 pt-1 border-t border-[#1F1F2E]">
                  {/* Trajectory Velocity Coverage & Break Hint */}
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                    <div className="bg-[#12121E] px-2 py-1 rounded border border-[#232336] flex items-center justify-between">
                      <span className="text-gray-400">Velocity Coverage:</span>
                      <span className="font-bold text-emerald-400">1.28× Req ✓</span>
                    </div>
                    <div className="bg-[#181115] px-2 py-1 rounded border border-rose-900/40 flex items-center justify-between">
                      <span className="text-gray-400">Break Level:</span>
                      <span className="font-bold text-rose-300">&lt; $108.8K</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Simulate Capital: <b className="text-white">${simCapital}</b></span>
                    <span>Target Exit: <b className="text-white">${simExitPrice.toFixed(2)}</b></span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={simCapital}
                    onChange={(e) => setSimCapital(Number(e.target.value))}
                    className="w-full accent-violet-500 h-1.5 bg-[#1F1F2E] rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between bg-[#12121C] p-2 rounded-lg border border-[#232336] shadow-sm">
                    <span className="text-gray-400 text-[10px]">Scenario PnL:</span>
                    <span className="font-bold text-emerald-400 text-xs neon-glow-emerald">
                      +${pnl.toFixed(2)} ({roiNum > 0 ? `+${roi}%` : `${roi}%`} ROI)
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={onLaunchTerminal}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-[0_0_16px_rgba(124,58,237,0.4)] flex items-center justify-center gap-1.5"
                >
                  <span>Launch Decision Stress Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Proof Metrics Bar (DreamDEX Style) ───────────────────────── */}
      <section id="stats" className="py-12 px-6 lg:px-12 max-w-6xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="cyber-card p-5 rounded-2xl bg-[#0E0E16]/90 backdrop-blur-md border border-[#1F1F2E] flex flex-col justify-between hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Event Volume
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-white">$45.2M+</div>
            <p className="mt-1 text-[11px] text-gray-400 font-light">Trailing 30D tracked onchain</p>
          </div>

          <div className="cyber-card p-5 rounded-2xl bg-[#0E0E16]/90 backdrop-blur-md border border-[#1F1F2E] flex flex-col justify-between hover:shadow-[0_0_24px_rgba(6,182,212,0.2)]">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              Somnia Throughput
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-cyan-400 neon-glow-cyan">100K+ TPS</div>
            <p className="mt-1 text-[11px] text-gray-400 font-light">Sub-second CLOB execution</p>
          </div>

          <div className="cyber-card p-5 rounded-2xl bg-[#0E0E16]/90 backdrop-blur-md border border-[#1F1F2E] flex flex-col justify-between hover:shadow-[0_0_24px_rgba(167,139,250,0.2)]">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
              Math Latency
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-violet-300 neon-glow-violet">0 ms</div>
            <p className="mt-1 text-[11px] text-gray-400 font-light">Deterministic scenario calculations</p>
          </div>

          <div className="cyber-card p-5 rounded-2xl bg-[#0E0E16]/90 backdrop-blur-md border border-[#1F1F2E] flex flex-col justify-between hover:shadow-[0_0_24px_rgba(245,158,11,0.2)]">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              RAG Evidence
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-amber-300">100%</div>
            <p className="mt-1 text-[11px] text-gray-400 font-light">Verified citations & no black-boxes</p>
          </div>
        </div>
      </section>

      {/* ─── The 4-Step ForeSight Experience ───────────────────────────── */}
      <section id="loop" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#1F1F2E] w-full relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
            THE 30-SECOND WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            The 4-Step ForeSight Decision Loop
          </h2>
          <p className="text-sm text-gray-400 mt-3 font-light">
            Designed to bridge the gap between complex blockchain prediction markets and instant, confident trading decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="cyber-card p-6 rounded-2xl border border-[#1F1F2E] bg-[#0E0E16]/90 backdrop-blur-md hover:border-violet-500/60 transition-all flex flex-col justify-between space-y-4 group hover:shadow-[0_0_25px_rgba(124,58,237,0.25)]">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/50 flex items-center justify-center text-violet-300 font-mono font-bold text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                01
              </div>
              <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider block">
                What Happened?
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                Probability Timeline & Spike Radar
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Continuous scanning for probability spikes $\ge 10\%$ across Somnia event contracts with glowing visual markers.
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#1F1F2E]">
              Module 1 • Real-Time Indexing
            </div>
          </div>

          {/* Step 2 */}
          <div className="cyber-card p-6 rounded-2xl border border-[#1F1F2E] bg-[#0E0E16]/90 backdrop-blur-md hover:border-violet-500/60 transition-all flex flex-col justify-between space-y-4 group hover:shadow-[0_0_25px_rgba(124,58,237,0.25)]">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/50 flex items-center justify-center text-violet-300 font-mono font-bold text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                02
              </div>
              <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider block">
                What Changed?
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                Dual AI Arena + RAG Verification
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Alpha Bull vs Macro Bear synthesize live crypto news and macro events. No black boxes — every thesis links to verified sources.
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#1F1F2E]">
              Module 2 • RAG Intelligence
            </div>
          </div>

          {/* Step 3 */}
          <div className="cyber-card p-6 rounded-2xl border border-[#1F1F2E] bg-[#0E0E16]/90 backdrop-blur-md hover:border-violet-500/60 transition-all flex flex-col justify-between space-y-4 group hover:shadow-[0_0_25px_rgba(124,58,237,0.25)]">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/50 flex items-center justify-center text-violet-300 font-mono font-bold text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                03
              </div>
              <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider block">
                What If?
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                Decision Stress Test & Trajectory
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Stress-test event trajectory feasibility (1.28× velocity coverage), pre-trade Thesis Break conditions, and 0ms deterministic PnL money math.
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#1F1F2E]">
              Module 3 • Event Contract Reasoning
            </div>
          </div>

          {/* Step 4 */}
          <div className="cyber-card p-6 rounded-2xl border border-[#1F1F2E] bg-[#0E0E16]/90 backdrop-blur-md hover:border-violet-500/60 transition-all flex flex-col justify-between space-y-4 group hover:shadow-[0_0_25px_rgba(124,58,237,0.25)]">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/50 flex items-center justify-center text-violet-300 font-mono font-bold text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                04
              </div>
              <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider block">
                What Do I Do?
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                1-Click Execution & Auto Sweeper
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Execute directly to Somnia CLOB, deploy strategies as automated background bots, and auto-sweep all settled winnings.
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#1F1F2E]">
              Module 4 • On-Chain Execution
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tech Stack Infinite Running Carousel ─────────────────────── */}
      <section
        id="tech-stack"
        className="py-16 border-t border-[#1F1F2E] w-full relative z-10 overflow-hidden"
      >
        <div className="text-center max-w-3xl mx-auto mb-12 px-6">
          <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
            POWERED BY HYBRID INFRASTRUCTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            The ForeSight Technology Stack
          </h2>
          <p className="text-sm text-gray-400 mt-3 font-light max-w-2xl mx-auto">
            Combining Somnia L1 sub-second finality, DreamDEX decentralized CLOB, and multi-agent RAG intelligence into a unified cognitive terminal.
          </p>
        </div>

        {/* Marquee Row 1 (Left Scrolling) */}
        <div className="w-full overflow-hidden marquee-mask py-1.5">
          <div className="animate-marquee flex items-center gap-4 whitespace-nowrap">
            {[...TECH_STACK_ROW_1, ...TECH_STACK_ROW_1].map((tech, idx) => {
              const IconComp = tech.icon;
              return (
                <div
                  key={idx}
                  className={`cyber-card inline-flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#0E0E16]/90 border border-[#1F1F2E] backdrop-blur-md ${tech.hoverBorder} transition-all duration-200 group cursor-pointer select-none`}
                  onClick={onLaunchTerminal}
                >
                  <div className={`w-8 h-8 rounded-lg ${tech.iconBg} border flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <IconComp className={`w-4 h-4 ${tech.iconColor} group-hover:brightness-125`} />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white font-mono group-hover:text-white transition-colors">
                        {tech.name}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${tech.badgeBg}`}>
                        {tech.badge}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-light mt-0.5 max-w-[280px] truncate leading-tight">
                      {tech.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Marquee Row 2 (Right / Reverse Scrolling) */}
        <div className="w-full overflow-hidden marquee-mask py-1.5 mt-3">
          <div className="animate-marquee-reverse flex items-center gap-4 whitespace-nowrap">
            {[...TECH_STACK_ROW_2, ...TECH_STACK_ROW_2].map((tech, idx) => {
              const IconComp = tech.icon;
              return (
                <div
                  key={idx}
                  className={`cyber-card inline-flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#0E0E16]/90 border border-[#1F1F2E] backdrop-blur-md ${tech.hoverBorder} transition-all duration-200 group cursor-pointer select-none`}
                  onClick={onLaunchTerminal}
                >
                  <div className={`w-8 h-8 rounded-lg ${tech.iconBg} border flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <IconComp className={`w-4 h-4 ${tech.iconColor} group-hover:brightness-125`} />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white font-mono group-hover:text-white transition-colors">
                        {tech.name}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${tech.badgeBg}`}>
                        {tech.badge}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-light mt-0.5 max-w-[280px] truncate leading-tight">
                      {tech.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Benchmarks & Architecture Comparison ──────────────────────── */}
      <section id="benchmarks" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#1F1F2E] w-full relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
            WHY FORESIGHT
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">
            ForeSight vs Traditional Trading Bots
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#1F1F2E] bg-[#0E0E16]/90 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <table className="w-full text-left text-xs font-mono divide-y divide-[#1F1F2E]">
            <thead className="bg-[#0A0A0F]/90 text-gray-400 uppercase">
              <tr>
                <th className="p-4">Feature</th>
                <th className="p-4 text-violet-400 font-bold">ForeSight Terminal</th>
                <th className="p-4 text-gray-500">Generic Black-Box Bots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F2E]/60">
              <tr className="hover:bg-[#13131D] transition">
                <td className="p-4 font-semibold text-gray-200">AI Decision Transparency</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold neon-glow-emerald">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Dual Bull/Bear Debates + Direct RAG Citations
                </td>
                <td className="p-4 text-gray-500">Opaque single-number signals</td>
              </tr>
              <tr className="hover:bg-[#13131D] transition">
                <td className="p-4 font-semibold text-gray-200">Risk & Scenario Modeling</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold neon-glow-emerald">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Deterministic Math Sliders (0ms Latency)
                </td>
                <td className="p-4 text-gray-500">Manual calculation spreadsheets</td>
              </tr>
              <tr className="hover:bg-[#13131D] transition">
                <td className="p-4 font-semibold text-gray-200">Execution Speed</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold neon-glow-emerald">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sub-second finality on Somnia Shannon CLOB
                </td>
                <td className="p-4 text-gray-500">Slow gas-constrained EVM blocks</td>
              </tr>
              <tr className="hover:bg-[#13131D] transition">
                <td className="p-4 font-semibold text-gray-200">Settlement Workflow</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold neon-glow-emerald">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  1-Click Auto Sweeper & Bot Deployment
                </td>
                <td className="p-4 text-gray-500">Manual per-contract claiming</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── SDK / Developer Snippet Section ───────────────────────────── */}
      <section id="sdk" className="py-16 px-6 lg:px-12 max-w-5xl mx-auto border-t border-[#1F1F2E] w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
              DEVELOPER NATIVE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Built on Somnia & DreamDEX SDK
            </h2>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              ForeSight natively integrates with <code className="text-violet-300 font-mono">@somnia-chain/markets-sdk</code>,
              supporting indexer hydration, CLOB limit orders, and automated multi-agent bot loops.
            </p>
            <div className="flex items-center gap-3 pt-2 font-mono text-xs">
              <button
                onClick={onLaunchTerminal}
                className="px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition flex items-center gap-1.5 shadow-[0_0_16px_rgba(124,58,237,0.4)]"
              >
                <span>Test on Shannon</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={codeSnippetRef}
            onMouseMove={handleCodeMouseMove}
            onMouseLeave={handleCodeMouseLeave}
            className="lg:col-span-7 perspective-1000 select-none relative z-10"
          >
            <div
              style={{
                transform: `rotateX(${codeRotate.x}deg) rotateY(${codeRotate.y}deg)`,
                transition: "transform 0.15s ease-out",
              }}
              className="border-beam-container cyber-card rounded-2xl border border-[#2A2A3D] bg-[#0E0E16]/95 p-5 font-mono text-[11px] text-gray-300 overflow-x-auto shadow-[0_0_40px_rgba(124,58,237,0.25)] backdrop-blur-2xl transform-3d text-left"
            >
              <div className="flex items-center justify-between text-gray-400 border-b border-[#232336] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  <span className="ml-2 text-gray-200 font-semibold text-[11px]">
                    somnia-execution-snippet.ts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/50 font-bold shadow-[0_0_8px_rgba(124,58,237,0.3)]">
                    TypeScript
                  </span>
                  <button
                    onClick={handleCopySnippet}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161622] hover:bg-[#1F1F2F] text-gray-300 hover:text-white border border-[#2A2A3D] hover:border-violet-500/50 text-[10px] font-mono transition-all active:scale-95 cursor-pointer shadow-sm"
                    title="Copy code"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-gray-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="leading-relaxed">
                <span className="text-purple-400">import</span> {"{ SomniaMarkets }"} <span className="text-purple-400">from</span> <span className="text-emerald-400">"@somnia-chain/markets-sdk"</span>;{"\n\n"}
                <span className="text-gray-500">// 1. Hydrate ForeSight with Somnia Shannon CLOB</span>{"\n"}
                <span className="text-purple-400">const</span> exchange = <span className="text-purple-400">new</span> <span className="text-yellow-300">SomniaMarkets</span>({"{\n"}
                {"  "}chainId: <span className="text-amber-400">50312</span>,{"\n"}
                {"  "}venueId: <span className="text-emerald-400">"0x679795a0195a1b76cdebb7c51d74e0..."</span>,{"\n"}
                {"}"});{"\n\n"}
                <span className="text-gray-500">// 2. Execute 1-Click Deterministic Scenario Order</span>{"\n"}
                <span className="text-purple-400">const</span> order = <span className="text-purple-400">await</span> exchange.<span className="text-blue-400">createOrder</span>({"{\n"}
                {"  "}marketId: <span className="text-emerald-400">"BTC-0-26AUG26"</span>,{"\n"}
                {"  "}side: <span className="text-emerald-400">"BUY_YES"</span>,{"\n"}
                {"  "}price: <span className="text-amber-400">0.62</span>,{"\n"}
                {"  "}amount: <span className="text-amber-400">80.64</span>,{"\n"}
                {"}"});
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-[#1F1F2E] bg-[#07070A]/90 backdrop-blur-md px-6 lg:px-12 py-8 text-xs font-mono text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <ForeSightLogo size={22} animated={false} />
          <span className="text-gray-300 font-bold">FORESIGHT TERMINAL</span>
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
            className="hover:text-gray-300 transition"
          >
            GitHub
          </a>
          <a
            href="https://somnia.network"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-300 transition"
          >
            Somnia L1
          </a>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
