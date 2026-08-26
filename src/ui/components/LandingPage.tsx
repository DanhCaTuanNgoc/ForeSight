import React from "react";
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
} from "lucide-react";

interface LandingPageProps {
  onLaunchTerminal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchTerminal }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#E2E8F0] font-sans selection:bg-violet-600 selection:text-white relative overflow-hidden flex flex-col">
      {/* Background Cyber Grid & Violet Glow Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F1F2E0F_1px,transparent_1px),linear-gradient(to_bottom,#1F1F2E0F_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-violet-600/15 via-purple-900/5 to-transparent blur-3xl pointer-events-none" />

      {/* ─── Navigation Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-14 bg-[#111118]/90 backdrop-blur-md border-b border-[#2A2A3D] px-6 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-violet-600 to-purple-400 flex items-center justify-center shadow-md shadow-violet-600/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-white tracking-wider">
              FORESIGHT
            </span>
            <span className="text-[10px] font-mono text-violet-400 bg-violet-950/60 border border-violet-700/40 px-1.5 py-0.2 rounded font-semibold">
              v1.0
            </span>
          </div>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-400">
          <a href="#features" className="hover:text-violet-300 transition-colors">
            Architecture
          </a>
          <a href="#loop" className="hover:text-violet-300 transition-colors">
            The 4-Step Loop
          </a>
          <a href="#benchmarks" className="hover:text-violet-300 transition-colors">
            Comparison
          </a>
          <a href="#sdk" className="hover:text-violet-300 transition-colors">
            Developers
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#161622] border border-[#2A2A3D] px-2.5 py-1 rounded text-[11px] font-mono text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Somnia Shannon (50312)</span>
          </div>

          <button
            onClick={onLaunchTerminal}
            className="bg-violet-600 hover:bg-violet-500 text-white font-mono font-semibold text-xs px-4 py-1.5 rounded transition-all shadow-md shadow-violet-600/30 flex items-center gap-1.5"
          >
            <span>Launch Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161624] border border-violet-600/40 text-violet-300 text-xs font-mono mb-8 fade-in shadow-sm shadow-violet-900/20">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Autonomous AI Intelligence & Prediction Market Terminal</span>
          <span className="text-gray-500">•</span>
          <span className="text-emerald-400">Somnia L1 native</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.15]">
          Understand the market <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            before you trade it.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl font-light leading-relaxed">
          ForeSight transforms opaque prediction markets into an intuitive 30-second decision loop:
          detect price spikes, synthesize dual AI debates with verified RAG citations, and model deterministic PnL.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 font-mono text-xs">
          <button
            onClick={onLaunchTerminal}
            className="px-6 py-3 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg shadow-violet-600/30 flex items-center gap-2 group"
          >
            <span>ENTER FORESIGHT TERMINAL</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <a
            href="https://github.com/somnia-chain"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded bg-[#161622] hover:bg-[#1C1C2C] text-gray-300 border border-[#2A2A3D] transition-colors flex items-center gap-2"
          >
            <Code2 className="w-4 h-4 text-violet-400" />
            <span>View Architecture Spec</span>
          </a>
        </div>

        {/* ─── Hero Terminal Interactive Mockup ────────────────────────── */}
        <div className="mt-14 w-full max-w-5xl rounded-xl border border-[#2A2A3D] bg-[#111118] p-1.5 shadow-2xl shadow-violet-950/40 relative">
          {/* Top Terminal Bar */}
          <div className="h-8 bg-[#0D0D14] rounded-t-lg border-b border-[#2A2A3D] px-4 flex items-center justify-between text-xs font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-gray-400 text-[11px]">foresight-terminal --somnia-shannon</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-emerald-400 font-semibold">● 532 MARKETS ACTIVE</span>
              <span className="text-gray-600">|</span>
              <span>100K TPS ENGINE</span>
            </div>
          </div>

          {/* Terminal Content Mock */}
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 text-left">
            {/* Left: Prob Chart Mock */}
            <div className="lg:col-span-8 bg-[#0A0A0F] rounded-lg border border-[#2A2A3D] p-4 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-sm font-bold text-white">BTC-0-26AUG26 / tUSDC</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-700/40 font-semibold">
                      TRADING
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Will BTC close above $78,500 at 16:00 UTC?
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-bold text-emerald-400">62.4%</div>
                  <div className="text-[10px] text-emerald-500">▲ +14.2% Spike</div>
                </div>
              </div>

              {/* Graphic visual line representation */}
              <div className="h-28 w-full relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100">
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 70 Q 100 65 180 50 T 320 60 T 420 20 L 500 15 L 500 100 L 0 100 Z"
                    fill="url(#heroGrad)"
                  />
                  <path
                    d="M 0 70 Q 100 65 180 50 T 320 60 T 420 20 L 500 15"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="2.5"
                  />
                  <circle cx="420" cy="20" r="4" fill="#A78BFA" />
                </svg>
                <div className="absolute top-2 right-16 bg-violet-950/80 border border-violet-600/50 rounded px-2 py-0.5 text-[9px] font-mono text-violet-300">
                  ⚡ 14:32 SPIKE (+14.2%)
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-[#2A2A3D]/40 pt-2">
                <span>12:00 UTC</span>
                <span>13:00 UTC</span>
                <span>14:00 UTC</span>
                <span>15:00 UTC</span>
                <span className="text-violet-400 font-semibold">16:00 (EXPIRY)</span>
              </div>
            </div>

            {/* Right: Dual Debate Intelligence Mock */}
            <div className="lg:col-span-4 bg-[#0A0A0F] rounded-lg border border-[#2A2A3D] p-4 flex flex-col justify-between space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#2A2A3D]/60 pb-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  Dual AI Outlook
                </span>
                <span className="text-[10px] text-violet-400">RAG SYNTHESIS</span>
              </div>

              <div className="space-y-2">
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-emerald-400 mb-0.5">
                    <span>🐂 Alpha Bull</span>
                    <span>68% Confidence</span>
                  </div>
                  <p className="text-gray-300 font-sans text-[10px] leading-tight">
                    Orderbook liquidity surging on Somnia CLOB with massive bid wall.
                  </p>
                </div>

                <div className="p-2 rounded bg-rose-950/20 border border-rose-500/30 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-rose-400 mb-0.5">
                    <span>🐻 Macro Bear</span>
                    <span>32% Confidence</span>
                  </div>
                  <p className="text-gray-300 font-sans text-[10px] leading-tight">
                    Macro rate uncertainty remains elevated ahead of round close.
                  </p>
                </div>
              </div>

              <button
                onClick={onLaunchTerminal}
                className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Launch Interactive Sim</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The 4-Step Loop Matrix ────────────────────────────────────── */}
      <section id="loop" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#2A2A3D]/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
            THE 30-SECOND WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            The 4-Step ForeSight Experience
          </h2>
          <p className="text-sm text-gray-400 mt-3 font-light">
            Designed to bridge the gap between complex blockchain event contracts and instant, confident trading decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="p-5 rounded-xl border border-[#2A2A3D] bg-[#111118] hover:border-violet-600/50 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-700/40 flex items-center justify-center text-violet-400 font-mono font-bold text-xs">
                01
              </div>
              <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
                What Happened?
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                Probability Timeline & Spike Detection
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Continuous scanning for probability spikes $\ge 10\%$ across Somnia event contracts with glowing visual markers.
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#2A2A3D]/40">
              Module 1 • Real-Time Indexing
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl border border-[#2A2A3D] bg-[#111118] hover:border-violet-600/50 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-700/40 flex items-center justify-center text-violet-400 font-mono font-bold text-xs">
                02
              </div>
              <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
                What Changed?
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                Dual AI Arena + RAG Verification
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Alpha Bull vs Macro Bear synthesize live crypto news and macro events. No black boxes — every thesis links to verified sources.
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#2A2A3D]/40">
              Module 2 • RAG Intelligence
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl border border-[#2A2A3D] bg-[#111118] hover:border-violet-600/50 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-700/40 flex items-center justify-center text-violet-400 font-mono font-bold text-xs">
                03
              </div>
              <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
                What If?
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                Deterministic Scenario Simulator
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                0ms zero-latency sliders for Capital, Entry Odds, and Target Take-Profit. Mathematical PnL calculations with zero guesswork.
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#2A2A3D]/40">
              Module 3 • Financial Modeling
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-xl border border-[#2A2A3D] bg-[#111118] hover:border-violet-600/50 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-700/40 flex items-center justify-center text-violet-400 font-mono font-bold text-xs">
                04
              </div>
              <span className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
                What Do I Do?
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                1-Click Execution & Auto Sweeper
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Execute directly to Somnia CLOB, deploy strategies as automated background bots, and auto-sweep all settled winnings.
              </p>
            </div>
            <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#2A2A3D]/40">
              Module 4 • On-Chain Execution
            </div>
          </div>
        </div>
      </section>

      {/* ─── Benchmarks & Architecture Comparison ──────────────────────── */}
      <section id="benchmarks" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-[#2A2A3D]/60 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono text-violet-400 uppercase tracking-widest font-semibold">
            WHY FORESIGHT
          </span>
          <h2 className="text-3xl font-bold text-white mt-2">
            ForeSight vs Traditional Trading Bots
          </h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#2A2A3D] bg-[#111118]">
          <table className="w-full text-left text-xs font-mono divide-y divide-[#2A2A3D]">
            <thead className="bg-[#0E0E16] text-gray-400 uppercase">
              <tr>
                <th className="p-4">Feature</th>
                <th className="p-4 text-violet-400 font-bold">ForeSight Terminal</th>
                <th className="p-4 text-gray-500">Generic Black-Box Bots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A3D]/40">
              <tr className="hover:bg-[#161624]/40 transition">
                <td className="p-4 font-semibold text-gray-200">AI Decision Transparency</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Dual Bull/Bear Debates + Direct RAG Citations
                </td>
                <td className="p-4 text-gray-500">Opaque single-number signals</td>
              </tr>
              <tr className="hover:bg-[#161624]/40 transition">
                <td className="p-4 font-semibold text-gray-200">Risk & Scenario Modeling</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Deterministic Math Sliders (0ms Latency)
                </td>
                <td className="p-4 text-gray-500">Manual calculation spreadsheets</td>
              </tr>
              <tr className="hover:bg-[#161624]/40 transition">
                <td className="p-4 font-semibold text-gray-200">Execution Speed</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sub-second finality on Somnia Shannon CLOB
                </td>
                <td className="p-4 text-gray-500">Slow gas-constrained EVM blocks</td>
              </tr>
              <tr className="hover:bg-[#161624]/40 transition">
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
      <section id="sdk" className="py-16 px-6 lg:px-12 max-w-5xl mx-auto border-t border-[#2A2A3D]/60 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
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

          <div className="lg:col-span-7 bg-[#0D0D14] border border-[#2A2A3D] rounded-xl p-4 font-mono text-[11px] text-gray-300 overflow-x-auto shadow-xl">
            <div className="flex items-center justify-between text-gray-500 border-b border-[#2A2A3D]/60 pb-2 mb-3">
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
      <footer className="mt-auto border-t border-[#2A2A3D] bg-[#0E0E16] px-6 lg:px-12 py-8 text-xs font-mono text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            href="https://dorahacks.io"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-300 transition"
          >
            DoraHacks
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
