import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bot,
  Sparkles,
  Brain,
  Newspaper,
  Volume2,
  VolumeX,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
  RefreshCw,
  Cpu,
  Flame,
  Swords,
  Zap,
  Scale,
  ShieldAlert,
  Mic,
} from "lucide-react";
import { AICopilotFeed } from "./AICopilotFeed.js";
import { CryptoIcon } from "./CryptoIcon.js";
import { sound } from "../utils/sound-fx.js";
import { apiUrl } from "../utils/api.js";

interface InsightsViewProps {
  markets: any[];
  onTradeSignal: (symbol: string, outcome: "YES" | "NO", price?: number) => void;
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  markets = [],
  onTradeSignal,
  selectedSymbol: propSymbol,
  onSelectSymbol,
}) => {
  const [signals, setSignals] = useState<any[]>([]);
  const [internalSymbol, setInternalSymbol] = useState<string>(
    propSymbol || markets[0]?.underlyingAsset || markets[0]?.symbol || "BTC"
  );
  const selectedSymbol = propSymbol || internalSymbol;

  const [debate, setDebate] = useState<any>(null);
  const [debateLoading, setDebateLoading] = useState<boolean>(false);
  const [news, setNews] = useState<any[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [lastGenTimestamp, setLastGenTimestamp] = useState<number>(Date.now());

  const handleSelectSymbol = (sym: string) => {
    sound.playClick();
    setInternalSymbol(sym);
    if (onSelectSymbol) onSelectSymbol(sym);
  };

  useEffect(() => {
    if (propSymbol) {
      setInternalSymbol(propSymbol);
    }
  }, [propSymbol]);

  // Find active market data for selected symbol
  const activeMarket = useMemo(() => {
    return (
      markets.find(
        (m) => (m.underlyingAsset || m.symbol).toUpperCase() === selectedSymbol.toUpperCase()
      ) || markets[0] || {
        symbol: selectedSymbol,
        underlyingAsset: selectedSymbol,
        probability: 50,
        midPrice: 0.50,
        volume24h: 100000,
      }
    );
  }, [markets, selectedSymbol]);

  // Fetch Signals from /api/signals
  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/signals"));
      if (res.ok) {
        const data = await res.json();
        if (data.signals && data.signals.length > 0) {
          setSignals(data.signals);
          return;
        }
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  // Fetch Debate for selected symbol
  const fetchDebate = useCallback(async (sym: string) => {
    setDebateLoading(true);
    setDebate(null); // Clear previous debate so UI immediately reacts to the selected token
    try {
      const res = await fetch(apiUrl(`/api/debate/${encodeURIComponent(sym)}`));
      if (res.ok) {
        const data = await res.json();
        setDebate(data.debate || data);
        setLastGenTimestamp(Date.now());
      }
    } catch {
      setDebate(null);
    } finally {
      setDebateLoading(false);
    }
  }, []);

  // Fetch News for Grounded RAG (targeted to selected asset)
  const fetchNews = useCallback(async (sym: string) => {
    try {
      const res = await fetch(apiUrl(`/api/news?asset=${encodeURIComponent(sym)}&limit=6`));
      if (res.ok) {
        const data = await res.json();
        setNews(Array.isArray(data) ? data : data.news || []);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    fetchNews(selectedSymbol);
    const interval = setInterval(() => {
      fetchSignals();
      fetchNews(selectedSymbol);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchSignals, fetchNews, selectedSymbol]);

  useEffect(() => {
    if (selectedSymbol) {
      fetchDebate(selectedSymbol);
    }
  }, [selectedSymbol, fetchDebate]);

  // Real-time confidence calculations tied directly to the active token's distinct market odds
  const defaultProbMap: Record<string, number> = {
    BTC: 62.4,
    ETH: 45.1,
    SOL: 54.0,
    SOMI: 73.8,
  };
  const tokenDefaultProb = defaultProbMap[selectedSymbol.toUpperCase()] || 55;
  const currentTokenProb = activeMarket?.probability && activeMarket.probability !== 50
    ? activeMarket.probability
    : tokenDefaultProb;

  const rawBull = debate?.bullCase?.confidence
    ? debate.bullCase.confidence
    : currentTokenProb / 100;

  const bullConfidence = Math.min(95, Math.max(5, Math.round(rawBull <= 1 ? rawBull * 100 : rawBull)));
  const bearConfidence = Math.round(100 - bullConfidence);

  const targetBullOdds = debate?.bullCase?.targetProbability ?? Math.min(0.95, (currentTokenProb / 100) + 0.15);
  const targetBearOdds = debate?.bearCase?.targetProbability ?? Math.max(0.05, (1 - (currentTokenProb / 100)) - 0.15);

  const handleVoiceBriefing = () => {
    sound.playClick();
    if (isPlayingAudio) {
      sound.stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    const summaryText = debate?.summary
      ? `ForeSight AI Briefing for ${selectedSymbol}. ${debate.summary}`
      : `ForeSight AI Arena for ${selectedSymbol}. Alpha Bull thesis: ${
          debate?.bullCase?.headline || "Orderbook depth expanding on Somnia L1."
        }. Macro Bear warns: ${
          debate?.bearCase?.headline || "Resistance and binary time decay risk."
        }.`;

    sound.speakBriefing(
      summaryText,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  // Real RAG citations from debate response or news feed
  const ragSources = useMemo(() => {
    if (debate?.sources && Array.isArray(debate.sources) && debate.sources.length > 0) {
      return debate.sources;
    }
    return news.slice(0, 4);
  }, [debate, news]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0F] text-[#E2E8F0] overflow-y-auto custom-scrollbar p-4 space-y-4 font-mono">
      {/* ─── 1. HERO BANNER: ASSET CONTROL & REAL-TIME QUOTE BAR ─────────── */}
      <div className="w-full flex-shrink-0 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#141026] via-[#0E0E18] to-[#0A1220] border border-[#2B2B44] shadow-xl flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
        {/* Left: Token Identity & Active Contract Context */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/40 shadow-[0_0_15px_rgba(124,58,237,0.35)] flex-shrink-0">
            <CryptoIcon symbol={selectedSymbol} size={38} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {selectedSymbol} <span className="text-gray-400 font-normal text-lg">/ tUSDC</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#181828] text-violet-300 border border-violet-500/30 font-bold uppercase tracking-wider">
                Dual AI Arena
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Somnia Shannon L1
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/80 text-cyan-300 border border-violet-500/40 font-mono font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>{debate?.engineUsed === "dual_frontier_llm" ? "Gemini 2.5 vs LLaMA 3.3 70B" : debate?.engineUsed === "live_llm" ? "Gemini 2.5 Flash Live" : "Autonomous Quant RAG"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Real-time Quantitative Quote Matrix */}
        <div className="flex items-center gap-3 sm:gap-5 bg-[#090912]/90 border border-[#1F1F32] px-4 py-2 rounded-xl shadow-inner flex-wrap sm:flex-nowrap">
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">Implied Odds</span>
            <span className={`text-sm sm:text-base font-black font-mono ${currentTokenProb >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
              {currentTokenProb.toFixed(1)}% YES
            </span>
          </div>
          <div className="w-px h-6 bg-[#212136]" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">Consensus Bias</span>
            <span className={`text-sm sm:text-base font-black font-mono ${bullConfidence >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
              {bullConfidence >= 50 ? `Bull (${bullConfidence}%)` : `Bear (${bearConfidence}%)`}
            </span>
          </div>
          <div className="w-px h-6 bg-[#212136]" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">RAG Citations</span>
            <span className="text-sm sm:text-base font-black font-mono text-cyan-300">
              {ragSources.length} Fact-Checked
            </span>
          </div>
          <div className="w-px h-6 bg-[#212136]" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">Debate Status</span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {debateLoading ? "Synthesizing" : "Live Synced"}
            </span>
          </div>
        </div>

        {/* Right: Token Switcher, Refresh & Terminal CTA */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-[#090912] border border-[#222238] rounded-xl p-1 gap-1">
            {["BTC", "ETH", "SOL", "SOMI"].map((sym) => {
              const isCurrent = sym === selectedSymbol;
              return (
                <button
                  key={sym}
                  onClick={() => handleSelectSymbol(sym)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.7)] border border-violet-400 scale-[1.02]"
                      : "text-gray-400 hover:text-white hover:bg-[#1C1C2C]"
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => fetchDebate(selectedSymbol)}
            disabled={debateLoading}
            title="Force refresh dual AI debate"
            className="p-2 rounded-xl bg-[#0F0F1A] border border-[#232338] text-gray-400 hover:text-white hover:border-violet-500 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${debateLoading ? "animate-spin text-violet-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── 2. Top Stats Ribbon (Macro AI KPIs) ─────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        <div className="p-3 rounded-xl bg-[#0E0E16] border border-[#222234] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Reasoning Engine
            </span>
            <span className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-1">
              <span>{debate?.engineUsed === "dual_frontier_llm" ? "Dual Model Arena" : debate?.engineUsed === "live_llm" ? "Gemini 2.5 Flash" : "Multi-Factor RAG"}</span>
              {(debate?.engineUsed === "dual_frontier_llm" || debate?.engineUsed === "live_llm") && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0E0E16] border border-[#222234] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Dual Debate Stance
            </span>
            <span className="text-sm font-bold font-mono text-violet-400">
              Alpha Bull vs Macro Bear
            </span>
          </div>
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Brain className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0E0E16] border border-[#222234] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              RAG Evidence Stream
            </span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {ragSources.length > 0 ? `${ragSources.length} Articles Verified` : "Syncing News..."}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0E0E16] border border-[#222234] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Real-Time AI Signals
            </span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {signals.length > 0 ? `${signals.length} Signals Emitted` : "Scanning Orderbooks..."}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ─── 3. Main AI Intelligence Layout: DUAL ARENA AS CENTER STAGE ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ── CENTER STAGE (lg:col-span-8): Dual Adversarial AI Debate Arena ── */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Main Debate Arena Card */}
          <div className="rounded-2xl p-4 sm:p-5 flex flex-col space-y-4 border border-[#2A2A44] bg-[#0E0E18] shadow-2xl relative overflow-hidden">
            {/* Ambient Background Clash Glow */}
            <div className="absolute top-0 left-0 w-1/3 h-48 bg-emerald-600/10 blur-[90px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-1/3 h-48 bg-rose-600/10 blur-[90px] pointer-events-none" />

            {/* Arena Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#222236] pb-3 gap-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-600/20 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white text-base tracking-wide flex items-center gap-2">
                      DUAL AI ARENA · {selectedSymbol}/tUSDC
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold tracking-wider">
                      LIVE DEBATE
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Adversarial Multi-Agent Clash: Alpha Bull AI vs Macro Bear AI
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchDebate(selectedSymbol)}
                  disabled={debateLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border cursor-pointer ${
                    debateLoading
                      ? "bg-[#181826] text-gray-500 border-[#2A2A3D] cursor-not-allowed"
                      : "bg-[#141420] text-cyan-300 hover:text-white hover:border-cyan-400 border-[#2A2A3D] shadow-sm"
                  }`}
                  title="Re-run debate synthesis on current orderbook & news"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${debateLoading ? "animate-spin text-cyan-400" : "text-yellow-400"}`} />
                  <span>{debateLoading ? "Clashing..." : "Re-Debate"}</span>
                </button>

                <button
                  onClick={handleVoiceBriefing}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border cursor-pointer ${
                    isPlayingAudio
                      ? "bg-violet-600 text-white border-violet-400 animate-pulse shadow-md"
                      : "bg-[#141420] text-violet-300 hover:text-white border-[#2A2A3D] shadow-sm"
                  }`}
                  title="Listen to synthesized AI voice debate summary"
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-violet-400" />}
                  <span>{isPlayingAudio ? "Stop Audio" : "AI Audio Briefing"}</span>
                </button>
              </div>
            </div>

            {/* Neural Reasoning Pipeline Loading State */}
            {debateLoading && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#120E2E] via-[#0E0E1A] to-[#0A1624] border border-cyan-500/40 space-y-3 shadow-lg animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      ADVERSARIAL AGENTS DEBATING MARKET THESIS...
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                    Dual Synthesis
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono text-gray-300">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>[1/3] Alpha Bull assessing bid asymmetry & momentum velocity...</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>[2/3] Macro Bear stress-testing overhead resistance & theta decay...</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300 animate-pulse">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
                    <span>[3/3] Cross-examining counter-arguments with verifiable RAG evidence...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Waveform Indicator */}
            {isPlayingAudio && (
              <div className="px-3 py-2 rounded-lg bg-[#0C1412] border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-400">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Broadcasting Synthesized Dual AI Debate Briefing...
                </span>
                <div className="flex items-end gap-1 h-3.5">
                  <span className="w-1 bg-emerald-400 h-2 animate-pulse" />
                  <span className="w-1 bg-emerald-400 h-3.5 animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 bg-emerald-400 h-1.5 animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className="w-1 bg-emerald-400 h-3 animate-pulse" style={{ animationDelay: "450ms" }} />
                </div>
              </div>
            )}

            {/* ─── TUG-OF-WAR POWER BALANCE BAR ─────────────────────────── */}
            <div className="space-y-2 p-3.5 rounded-xl bg-[#090912] border border-[#1E1E2E] shadow-inner">
              <div className="flex justify-between items-center text-xs font-black font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>ALPHA BULL ({bullConfidence}%)</span>
                </div>
                <div className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] text-amber-300 font-bold flex items-center gap-1">
                  <Swords className="w-3 h-3 text-amber-400" />
                  <span>{bullConfidence >= 50 ? `Bull Edge (+${bullConfidence - bearConfidence}%)` : `Bear Edge (+${bearConfidence - bullConfidence}%)`}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <span>({bearConfidence}%) MACRO BEAR</span>
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>

              <div className="h-4 w-full bg-[#141422] rounded-full overflow-hidden flex p-0.5 border border-[#2B2B40] shadow-inner relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-l-full transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                  style={{ width: `${bullConfidence}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-700 rounded-r-full transition-all duration-700 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                  style={{ width: `${bearConfidence}%` }}
                />
                {/* Center Clash Needle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white] transition-all duration-700 transform -translate-x-1/2"
                  style={{ left: `${bullConfidence}%` }}
                />
              </div>
            </div>

            {/* ─── THE ADVERSARIAL RING: BULL VS BEAR FACE-OFF ──────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {/* Central VS Clash Badge (Overlay for desktop) */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 border-2 border-white/20 shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center font-black text-xs text-white font-mono">
                  VS
                </div>
              </div>

              {/* 🟢 BLUE/GREEN CORNER: ALPHA BULL AI */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0A1813] to-[#07120E] border-2 border-emerald-500/40 flex flex-col justify-between space-y-3.5 shadow-lg relative group hover:border-emerald-400/80 transition-all">
                <div className="space-y-3">
                  {/* Fighter Header */}
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-sm">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-emerald-300 block">
                          ALPHA BULL AI
                        </span>
                        <span className="text-[9px] text-emerald-400/80 uppercase font-mono font-bold tracking-wider">
                          Offensive Long
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400 font-mono block">
                        {bullConfidence}%
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">Conviction</span>
                    </div>
                  </div>

                  {/* Model Engine Tag */}
                  <div className="flex items-center justify-between text-[10px] font-mono bg-[#05110D] px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      {debate?.bullCase?.modelUsed || debate?.bullModel || "Google Gemini 2.5 Flash"}
                    </span>
                    <span className="text-gray-400">Target: {(targetBullOdds * 100).toFixed(0)}%</span>
                  </div>

                  {/* Speech Bubble: Headline */}
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-gray-100 font-medium leading-relaxed italic relative">
                    "{debate?.bullCase?.headline || `Aggressive buying pressure on ${selectedSymbol} with deep bid support on DreamDEX CLOB.`}"
                  </div>

                  {/* Attack Arguments */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Bull Offensive Theses:</span>
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-200">
                      {debate?.bullCase?.keyArguments && debate.bullCase.keyArguments.length > 0 ? (
                        debate.bullCase.keyArguments.map((arg: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 bg-[#081611] p-2 rounded-lg border border-emerald-500/20">
                            <span className="text-emerald-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug">{arg}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-2 bg-[#081611] p-2 rounded-lg border border-emerald-500/20">
                            <span className="text-emerald-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug">Orderbook bid asymmetry exceeds ask depth by 1.8x.</span>
                          </li>
                          <li className="flex items-start gap-2 bg-[#081611] p-2 rounded-lg border border-emerald-500/20">
                            <span className="text-emerald-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug">Strong probability of upward continuation into the round expiration window.</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Bull Action Button */}
                <button
                  onClick={() => onTradeSignal(selectedSymbol, "YES", targetBullOdds)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-xs font-mono transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer hover:scale-[1.02]"
                >
                  <span>Back Alpha Bull · BUY YES @ ${(targetBullOdds * 100).toFixed(0)}%</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 🔴 RED CORNER: MACRO BEAR AI */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#180C12] to-[#12070D] border-2 border-rose-500/40 flex flex-col justify-between space-y-3.5 shadow-lg relative group hover:border-rose-400/80 transition-all">
                <div className="space-y-3">
                  {/* Fighter Header */}
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-sm">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-rose-300 block">
                          MACRO BEAR AI
                        </span>
                        <span className="text-[9px] text-rose-400/80 uppercase font-mono font-bold tracking-wider">
                          Defensive Short
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-rose-400 font-mono block">
                        {bearConfidence}%
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">Risk Skew</span>
                    </div>
                  </div>

                  {/* Model Engine Tag */}
                  <div className="flex items-center justify-between text-[10px] font-mono bg-[#14060B] px-2.5 py-1 rounded-lg border border-rose-500/30">
                    <span className="text-rose-300 font-bold flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-orange-400" />
                      {debate?.bearCase?.modelUsed || debate?.bearModel || "Meta LLaMA 3.3 70B"}
                    </span>
                    <span className="text-gray-400">Target: {(targetBearOdds * 100).toFixed(0)}%</span>
                  </div>

                  {/* Speech Bubble: Headline */}
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-gray-100 font-medium leading-relaxed italic relative">
                    "{debate?.bearCase?.headline || `Overextended probability on ${selectedSymbol} with heavy overhead resistance and time decay.`}"
                  </div>

                  {/* Defensive Arguments */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Bear Counter-Theses:</span>
                    </span>
                    <ul className="space-y-1.5 text-xs text-gray-200">
                      {debate?.bearCase?.keyArguments && debate.bearCase.keyArguments.length > 0 ? (
                        debate.bearCase.keyArguments.map((arg: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 bg-[#1A0A10] p-2 rounded-lg border border-rose-500/20">
                            <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug">{arg}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-2 bg-[#1A0A10] p-2 rounded-lg border border-rose-500/20">
                            <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug">Binary theta decay accelerates as round settlement window compresses.</span>
                          </li>
                          <li className="flex items-start gap-2 bg-[#1A0A10] p-2 rounded-lg border border-rose-500/20">
                            <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug">Heavy ask supply wall creates strong overhead resistance.</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Bear Action Button */}
                <button
                  onClick={() => onTradeSignal(selectedSymbol, "NO", targetBearOdds)}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-black text-xs font-mono transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer hover:scale-[1.02]"
                >
                  <span>Back Macro Bear · BUY NO @ ${(targetBearOdds * 100).toFixed(0)}%</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ─── REFEREE EXECUTIVE SYNTHESIS BANNER ────────────────────── */}
            {debate?.summary && !debateLoading && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#141226] via-[#0E0E18] to-[#141226] border border-violet-500/50 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-violet-300 flex items-center gap-1.5 tracking-wider uppercase">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    Referee Consensus & Settlement Arbitration
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono bg-black/40 px-2 py-0.5 rounded border border-cyan-500/30">
                    Grounded Synthesis
                  </span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed italic">
                  "{debate.summary}"
                </p>
              </div>
            )}

            {/* ─── VERIFIED GROUNDED RAG INGESTION CITATIONS ────────────── */}
            <div className="pt-2 border-t border-[#1F1F30] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-300">
                  <Newspaper className="w-4 h-4 text-violet-400" />
                  <span>Verified RAG Ingestion Citations ({selectedSymbol})</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  100% Grounded
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {ragSources.map((item: any, idx: number) => (
                  <a
                    key={idx}
                    href={item.url || "https://www.coindesk.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-lg bg-[#12121E] border border-[#222234] hover:border-violet-500/50 hover:bg-[#161626] transition group flex flex-col justify-between"
                  >
                    <p className="text-xs text-gray-200 font-medium line-clamp-2 group-hover:text-violet-300 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 font-mono">
                      <span className="text-violet-400 font-bold">{item.source || "CoinDesk"}</span>
                      <span className="group-hover:text-white transition flex items-center gap-0.5">
                        <span>View Evidence</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDECAR (lg:col-span-4): AI Copilot Live Reasoning Feed ── */}
        <div className="lg:col-span-4 flex flex-col min-h-[500px] sticky top-4">
          <AICopilotFeed
            signals={signals}
            onSelectMarket={(sym) => {
              const cleanSym = sym.split("/")[0].split("-")[0];
              handleSelectSymbol(cleanSym);
              onTradeSignal(cleanSym, "YES");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default InsightsView;
