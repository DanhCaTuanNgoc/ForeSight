import React, { useState, useRef, useCallback } from "react";
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
      {/* Background Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F1F2E14_1px,transparent_1px),linear-gradient(to_bottom,#1F1F2E14_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-violet-600/20 via-purple-900/10 to-transparent blur-[120px] pointer-events-none" />

      {/* ─── Top Marquee Ticker Tape (DreamDEX Inspired) ──────────────── */}
      <div className="w-full bg-[#0D0D14] border-b border-[#1F1F2E] overflow-hidden py-1.5 z-50 text-[11px] font-mono select-none">
        <div className="relative flex items-center">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-0.5 rounded bg-[#13131D]/80 border border-[#232336] hover:border-violet-500/50 cursor-pointer transition-colors"
                onClick={onLaunchTerminal}
              >
                <span className="text-gray-400 font-medium">{item.pair}</span>
                <span className="text-white font-bold">{item.prob}</span>
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                    item.isUp ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {item.isUp ? "▲" : "▼"} {item.change}
                </span>
                {item.spike && (
                  <span className="ml-1 text-[9px] px-1 rounded bg-violet-950 text-violet-300 border border-violet-700/50 animate-pulse">
                    SPIKE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Navigation Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-14 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-[#1F1F2E] px-6 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-base text-white tracking-widest">
              FORESIGHT
            </span>
            <span className="text-[10px] font-mono text-violet-300 bg-violet-950/80 border border-violet-600/40 px-1.5 py-0.5 rounded font-semibold">
              TERMINAL
            </span>
          </div>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-400">
          <a href="#hero-sandbox" className="hover:text-violet-300 transition-colors">
            Live Sandbox
          </a>
          <a href="#loop" className="hover:text-violet-300 transition-colors">
            4-Step Workflow
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
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 font-mono">
          <div className="hidden sm:flex items-center gap-2 bg-[#12121B] border border-[#232336] px-3 py-1 rounded text-[11px] text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Somnia Shannon (50312)</span>
          </div>

          <button
            onClick={onLaunchTerminal}
            className="relative group bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 rounded transition-all shadow-md shadow-violet-600/30 flex items-center gap-2 overflow-hidden"
          >
            <span>Launch Terminal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            <div className="scanner-line" />
          </button>
        </div>
      </header>

      {/* ─── 3D Interactive Hero Section ──────────────────────────────── */}
      <section
        id="hero-sandbox"
        className="relative pt-12 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center"
      >
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12121C] border border-violet-500/40 text-violet-300 text-xs font-mono mb-6 shadow-sm shadow-violet-900/30">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Institutional Intelligence Layer for DreamDEX & Somnia</span>
          <span className="text-gray-600">•</span>
          <span className="text-emerald-400 font-semibold">100K TPS Ready</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.12]">
          Understand the market <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
            before you trade it.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl font-light leading-relaxed">
          ForeSight transforms opaque prediction-market orderbooks into an interactive 30-second loop:
          detect probability spikes, synthesize verified dual AI debates, and simulate deterministic PnL.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
          <button
            onClick={onLaunchTerminal}
            className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-xl shadow-violet-600/40 flex items-center gap-2 group relative overflow-hidden"
          >
            <span>ENTER FORESIGHT TERMINAL</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <div className="scanner-line" />
          </button>

          <a
            href="https://github.com/DanhCaTuanNgoc/ForeSight"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-lg bg-[#12121C] hover:bg-[#1A1A28] text-gray-300 border border-[#232336] transition-colors flex items-center gap-2"
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
          className="mt-12 w-full max-w-5xl perspective-1000 select-none"
        >
          <div
            style={{
              transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transition: "transform 0.15s ease-out",
            }}
            className="cyber-card rounded-xl border border-[#2A2A3D] bg-[#0E0E16]/95 p-1.5 shadow-2xl shadow-violet-950/50 backdrop-blur-xl transform-3d text-left"
          >
            {/* Top Terminal Bar */}
            <div className="h-9 bg-[#09090F] rounded-t-lg border-b border-[#232336] px-4 flex items-center justify-between text-xs font-mono text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/90" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/90" />
                <span className="ml-2 text-gray-300 font-semibold text-[11px]">
                  foresight-terminal :: somnia-shannon-clob (Chain 50312)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE SANDBOX FEED
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-violet-400">0ms DETERMINISTIC MATH</span>
              </div>
            </div>

            {/* Terminal Main Grid */}
            <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 7 Cols: Probability Chart + Spike Marker */}
              <div className="lg:col-span-7 bg-[#07070B] rounded-lg border border-[#1F1F2E] p-4 flex flex-col justify-between space-y-4 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-sm font-bold text-white">BTC-0-26AUG26 / tUSDC</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-700/50 font-bold">
                        ACTIVE CLOB
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Will BTC close above $78,500 at 16:00 UTC?
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-2xl font-black text-emerald-400">62.4%</div>
                    <div className="text-[10px] text-emerald-400 font-bold">▲ +14.2% Spike Detected</div>
                  </div>
                </div>

                {/* SVG Curve Representation */}
                <div className="h-32 w-full relative flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                    <defs>
                      <linearGradient id="cyberHeroGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.45" />
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
                    {/* Spike Point Marker */}
                    <circle cx="390" cy="28" r="5" fill="#10B981" className="animate-ping" />
                    <circle cx="390" cy="28" r="4" fill="#10B981" />
                  </svg>

                  {/* Spike Tooltip Badge */}
                  <div className="absolute top-2 right-12 bg-violet-950/90 border border-violet-500/70 rounded-md px-2.5 py-1 text-[10px] font-mono text-violet-200 shadow-lg shadow-violet-900/40 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>14:32 UTC SPIKE (+14.2%)</span>
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
              <div className="lg:col-span-5 bg-[#07070B] rounded-lg border border-[#1F1F2E] p-4 flex flex-col justify-between space-y-3 font-mono text-xs">
                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-[#1F1F2E] pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDebateTab("bull")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        activeDebateTab === "bull"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-600/50"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      🐂 Alpha Bull (68%)
                    </button>
                    <button
                      onClick={() => setActiveDebateTab("bear")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        activeDebateTab === "bear"
                          ? "bg-rose-950 text-rose-400 border border-rose-600/50"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      🐻 Macro Bear (32%)
                    </button>
                  </div>
                  <span className="text-[9px] text-violet-400 uppercase font-bold">RAG Grounded</span>
                </div>

                {/* RAG Context Output */}
                <div className="p-2.5 rounded bg-[#101018] border border-[#232336] text-[11px]">
                  {activeDebateTab === "bull" ? (
                    <p className="text-gray-300 font-sans leading-snug">
                      <b className="text-emerald-400 font-mono font-bold">Bull Thesis:</b> Heavy institutional bid walls on Somnia CLOB after ETF inflow data release.
                    </p>
                  ) : (
                    <p className="text-gray-300 font-sans leading-snug">
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

                {/* Interactive Slider */}
                <div className="space-y-2 pt-1 border-t border-[#1F1F2E]">
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
                  <div className="flex items-center justify-between bg-[#12121C] p-2 rounded border border-[#232336]">
                    <span className="text-gray-400 text-[10px]">Scenario PnL:</span>
                    <span className="font-bold text-emerald-400 text-xs">
                      +${pnl.toFixed(2)} ({roiNum > 0 ? `+${roi}%` : `${roi}%`} ROI)
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={onLaunchTerminal}
                  className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded text-[11px] font-bold transition-all shadow-md shadow-violet-600/30 flex items-center justify-center gap-1.5"
                >
                  <span>Execute Scenario on Somnia</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Proof Metrics Bar (DreamDEX Style) ───────────────────────── */}
      <section id="stats" className="py-12 px-6 lg:px-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="cyber-card p-5 rounded-xl bg-[#0E0E16] border border-[#1F1F2E] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Event Volume
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-white">$45.2M+</div>
            <p className="mt-1 text-[11px] text-gray-400 font-light">Trailing 30D tracked onchain</p>
          </div>

          <div className="cyber-card p-5 rounded-xl bg-[#0E0E16] border border-[#1F1F2E] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Somnia Throughput
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-cyan-400">100K+ TPS</div>
            <p className="mt-1 text-[11px] text-gray-400 font-light">Sub-second CLOB execution</p>
          </div>

          <div className="cyber-card p-5 rounded-xl bg-[#0E0E16] border border-[#1F1F2E] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
              Math Latency
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-violet-300">0 ms</div>
            <p className="mt-1 text-[11px] text-gray-400 font-light">Deterministic scenario calculations</p>
          </div>

          <div className="cyber-card p-5 rounded-xl bg-[#0E0E16] border border-[#1F1F2E] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              RAG Evidence
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-amber-300">100%</div>
            <p className="mt-1 text-[11px] text-gray-400 font-light">Verified citations & no black-boxes</p>
          </div>
        </div>
      </section>

      {/* ─── The 4-Step ForeSight Experience ───────────────────────────── */}
      <section id="loop" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#1F1F2E] w-full">
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
          <div className="cyber-card p-6 rounded-xl border border-[#1F1F2E] bg-[#0E0E16] hover:border-violet-600/50 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/70 border border-violet-600/40 flex items-center justify-center text-violet-300 font-mono font-bold text-xs">
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
          <div className="cyber-card p-6 rounded-xl border border-[#1F1F2E] bg-[#0E0E16] hover:border-violet-600/50 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/70 border border-violet-600/40 flex items-center justify-center text-violet-300 font-mono font-bold text-xs">
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
          <div className="cyber-card p-6 rounded-xl border border-[#1F1F2E] bg-[#0E0E16] hover:border-violet-600/50 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/70 border border-violet-600/40 flex items-center justify-center text-violet-300 font-mono font-bold text-xs">
                03
              </div>
              <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider block">
                What If?
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                Deterministic Scenario Simulator
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                0ms zero-latency sliders for Capital, Entry Odds, and Target Take-Profit. Mathematical PnL calculations with zero guesswork.
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#1F1F2E]">
              Module 3 • Financial Modeling
            </div>
          </div>

          {/* Step 4 */}
          <div className="cyber-card p-6 rounded-xl border border-[#1F1F2E] bg-[#0E0E16] hover:border-violet-600/50 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/70 border border-violet-600/40 flex items-center justify-center text-violet-300 font-mono font-bold text-xs">
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

      {/* ─── Benchmarks & Architecture Comparison ──────────────────────── */}
      <section id="benchmarks" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#1F1F2E] w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
            WHY FORESIGHT
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">
            ForeSight vs Traditional Trading Bots
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1F1F2E] bg-[#0E0E16]">
          <table className="w-full text-left text-xs font-mono divide-y divide-[#1F1F2E]">
            <thead className="bg-[#0A0A0F] text-gray-400 uppercase">
              <tr>
                <th className="p-4">Feature</th>
                <th className="p-4 text-violet-400 font-bold">ForeSight Terminal</th>
                <th className="p-4 text-gray-500">Generic Black-Box Bots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F2E]/60">
              <tr className="hover:bg-[#13131D] transition">
                <td className="p-4 font-semibold text-gray-200">AI Decision Transparency</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Dual Bull/Bear Debates + Direct RAG Citations
                </td>
                <td className="p-4 text-gray-500">Opaque single-number signals</td>
              </tr>
              <tr className="hover:bg-[#13131D] transition">
                <td className="p-4 font-semibold text-gray-200">Risk & Scenario Modeling</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Deterministic Math Sliders (0ms Latency)
                </td>
                <td className="p-4 text-gray-500">Manual calculation spreadsheets</td>
              </tr>
              <tr className="hover:bg-[#13131D] transition">
                <td className="p-4 font-semibold text-gray-200">Execution Speed</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sub-second finality on Somnia Shannon CLOB
                </td>
                <td className="p-4 text-gray-500">Slow gas-constrained EVM blocks</td>
              </tr>
              <tr className="hover:bg-[#13131D] transition">
                <td className="p-4 font-semibold text-gray-200">Settlement Workflow</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold">
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
      <section id="sdk" className="py-16 px-6 lg:px-12 max-w-5xl mx-auto border-t border-[#1F1F2E] w-full">
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
                className="px-4 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold transition flex items-center gap-1.5"
              >
                <span>Test on Shannon</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#09090F] border border-[#1F1F2E] rounded-xl p-4 font-mono text-[11px] text-gray-300 overflow-x-auto shadow-xl">
            <div className="flex items-center justify-between text-gray-500 border-b border-[#1F1F2E] pb-2 mb-3">
              <span>somnia-execution-snippet.ts</span>
              <span className="text-violet-400">TypeScript</span>
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
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-[#1F1F2E] bg-[#07070A] px-6 lg:px-12 py-8 text-xs font-mono text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center text-white font-bold text-[10px]">
            F
          </div>
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
