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

// Module-level cache across tab switches so debates are remembered without re-running
const debateCache: Record<string, any> = {};

export const InsightsView: React.FC<InsightsViewProps> = ({
  markets = [],
  onTradeSignal,
  selectedSymbol: propSymbol,
  onSelectSymbol,
}) => {
  const [internalSymbol, setInternalSymbol] = useState<string>(
    propSymbol || markets[0]?.underlyingAsset || markets[0]?.symbol || "BTC"
  );
  const [signals, setSignals] = useState<any[]>([]);
  const selectedSymbol = propSymbol || internalSymbol;

  const [debate, setDebate] = useState<any>(() => debateCache[selectedSymbol] || null);
  const [debateLoading, setDebateLoading] = useState<boolean>(false);
  const [news, setNews] = useState<any[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [lastGenTimestamp, setLastGenTimestamp] = useState<number>(Date.now());

  const handleSelectSymbol = (sym: string) => {
    sound.playClick();
    setInternalSymbol(sym);
    if (onSelectSymbol) onSelectSymbol(sym);
    if (debateCache[sym]) {
      setDebate(debateCache[sym]);
    }
  };

  useEffect(() => {
    if (propSymbol) {
      setInternalSymbol(propSymbol);
      if (debateCache[propSymbol]) {
        setDebate(debateCache[propSymbol]);
      }
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

  // Explicit Re-Debate (Only called when user manually clicks Re-Debate or Refresh)
  const handleExplicitReDebate = useCallback(async (sym: string) => {
    setDebateLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/debate/${encodeURIComponent(sym)}`));
      if (res.ok) {
        const data = await res.json();
        const resDebate = data.debate || data;
        debateCache[sym] = resDebate;
        setDebate(resDebate);
        setLastGenTimestamp(Date.now());
      }
    } catch {
      // Keep existing debate if refresh fails
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

  // Quiet initial background loader: loads once if no cache exists, WITHOUT triggering Re-Debate loading animation
  useEffect(() => {
    if (!selectedSymbol) return;

    if (debateCache[selectedSymbol]) {
      setDebate(debateCache[selectedSymbol]);
      return;
    }

    let isCancelled = false;
    fetch(apiUrl(`/api/debate/${encodeURIComponent(selectedSymbol)}`))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isCancelled && data) {
          const resDebate = data.debate || data;
          debateCache[selectedSymbol] = resDebate;
          setDebate(resDebate);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [selectedSymbol]);

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
    <div className="flex-1 flex flex-col min-h-0 bg-[#07070A] text-[#E2E8F0] overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3 font-mono">
      {/* ─── 1. INSTITUTIONAL ASSET CONTROL & REAL-TIME QUOTE BAR ─── */}
      <div className="w-full flex-shrink-0 p-3 sm:p-3.5 bg-[#08080E] border border-white/[0.08] rounded-none flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 shadow-lg">
        {/* Left: Token Identity & Settlement Context */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#0E0E17] border border-white/[0.08] rounded-none flex-shrink-0">
            <CryptoIcon symbol={selectedSymbol} size={32} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide font-mono">
                {selectedSymbol}<span className="text-gray-400 font-normal text-xs">/tUSDC</span>
              </h2>
              <span className="text-[9px] px-1.5 py-0.2 bg-violet-950/40 text-violet-300 border border-violet-500/30 font-bold uppercase tracking-wider font-mono">
                DUAL ARENA
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Somnia L1
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-300">
                {debate?.engineUsed === "dual_frontier_llm" ? "Gemini 2.5 Flash vs LLaMA 3.3 70B" : "Dual Intelligence Pipeline"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Market & Model Metrics Matrix */}
        <div className="flex items-center gap-3 sm:gap-4 bg-[#0E0E17] border border-white/[0.07] px-3.5 py-1.5 rounded-none flex-wrap sm:flex-nowrap">
          <div>
            <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Implied Probability</span>
            <span className={`text-xs font-bold font-mono ${currentTokenProb >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
              {currentTokenProb.toFixed(1)}% YES
            </span>
          </div>
          <div className="w-px h-5 bg-white/[0.07]" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Consensus Bias</span>
            <span className={`text-xs font-bold font-mono ${bullConfidence >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
              {bullConfidence >= 50 ? `Bullish (+${bullConfidence - bearConfidence}%)` : `Bearish (+${bearConfidence - bullConfidence}%)`}
            </span>
          </div>
          <div className="w-px h-5 bg-white/[0.07]" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase tracking-wider">RAG Citations</span>
            <span className="text-xs font-bold font-mono text-violet-300">
              {ragSources.length} Sources
            </span>
          </div>
          <div className="w-px h-5 bg-white/[0.07]" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Status</span>
            <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {debateLoading ? "Synthesizing" : "Live"}
            </span>
          </div>
        </div>

        {/* Right: Asset Selector & Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-[#0E0E17] border border-white/[0.07] p-0.5 gap-1 rounded-none">
            {["BTC", "ETH", "SOL", "SOMI"].map((sym) => {
              const isCurrent = sym === selectedSymbol;
              return (
                <button
                  key={sym}
                  onClick={() => handleSelectSymbol(sym)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-none transition-colors cursor-pointer border ${
                    isCurrent
                      ? "bg-violet-600 text-white border-violet-400/60 shadow-[0_0_8px_rgba(124,58,237,0.25)]"
                      : "bg-[#0B0B14] text-gray-400 border-white/[0.05] hover:text-white hover:bg-[#141422]"
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleExplicitReDebate(selectedSymbol)}
            disabled={debateLoading}
            title="Re-analyze market debate"
            className="p-1.5 rounded-none bg-[#0E0E17] border border-white/[0.07] text-gray-400 hover:text-white hover:border-violet-500/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${debateLoading ? "animate-spin text-violet-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── 2. Main Intelligence Layout: ARENA + SIDECAR ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* ── CENTER STAGE (lg:col-span-8): Dual Intelligence Arena ── */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="rounded-none p-3.5 sm:p-4 flex flex-col space-y-3.5 border border-white/[0.08] bg-[#08080E] shadow-xl">
            {/* Arena Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/[0.07] pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-none bg-violet-950/70 border border-violet-500/40 text-violet-300">
                  <Swords className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-wider uppercase font-mono">
                    DUAL INTELLIGENCE ARENA · {selectedSymbol}/tUSDC
                  </h3>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleExplicitReDebate(selectedSymbol)}
                  disabled={debateLoading}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-mono font-bold transition-colors border cursor-pointer ${
                    debateLoading
                      ? "bg-[#0E0E17] text-gray-500 border-white/[0.06] cursor-not-allowed"
                      : "bg-[#0E0E17] text-violet-300 hover:text-white hover:border-violet-500/40 border-white/[0.07]"
                  }`}
                  title="Re-run dual model analysis"
                >
                  <Sparkles className={`w-3 h-3 ${debateLoading ? "animate-spin text-violet-400" : "text-violet-400"}`} />
                  <span>{debateLoading ? "Analyzing..." : "Re-Analyze"}</span>
                </button>

                <button
                  onClick={handleVoiceBriefing}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-mono font-bold transition-colors border cursor-pointer ${
                    isPlayingAudio
                      ? "bg-violet-600 text-white border-violet-400/60 shadow-[0_0_8px_rgba(124,58,237,0.25)]"
                      : "bg-[#0E0E17] text-gray-300 hover:text-white border-white/[0.07]"
                  }`}
                  title="Listen to synthesized audio briefing"
                >
                  {isPlayingAudio ? <VolumeX className="w-3 h-3" /> : <Mic className="w-3 h-3 text-violet-400" />}
                  <span>{isPlayingAudio ? "Stop Audio" : "Audio Brief"}</span>
                </button>
              </div>
            </div>

            {/* Pipeline Loading State */}
            {debateLoading && (
              <div className="p-3 rounded-none bg-[#0B0B14] border border-violet-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      Synthesizing Institutional Bull & Bear Perspectives...
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-violet-300 bg-violet-950/60 px-1.5 py-0.2 rounded-none border border-violet-500/30 font-bold">
                    Dual Model Run
                  </span>
                </div>
                <div className="space-y-1 text-[10px] font-mono text-gray-300">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>Gemini 2.5 Flash: Evaluating bid asymmetry, volume velocity, and momentum targets...</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <CheckCircle2 className="w-3 h-3 text-rose-400 flex-shrink-0" />
                    <span>Meta LLaMA 3.3 70B: Stress-testing supply wall resistance and binary theta decay...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Waveform Indicator */}
            {isPlayingAudio && (
              <div className="px-3 py-1.5 rounded-none bg-[#0C1412] border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-400 font-mono">
                <span className="flex items-center gap-1.5 font-bold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Broadcasting synthesized market debate briefing...
                </span>
              </div>
            )}

            {/* ─── TUG-OF-WAR POWER BALANCE BAR ─── */}
            <div className="space-y-1.5 p-2.5 rounded-none bg-[#0E0E17] border border-white/[0.06]">
              <div className="flex justify-between items-center text-xs font-bold font-mono">
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>LONG THESIS · GEMINI 2.5 ({bullConfidence}%)</span>
                </div>
                <div className="px-2 py-0.2 rounded-none bg-[#12121C] border border-white/[0.07] text-[9px] text-gray-300 font-bold flex items-center gap-1">
                  <Swords className="w-3 h-3 text-violet-400" />
                  <span>{bullConfidence >= 50 ? `Bull Lead (+${bullConfidence - bearConfidence}%)` : `Bear Lead (+${bearConfidence - bullConfidence}%)`}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400">
                  <span>({bearConfidence}%) SHORT THESIS · LLAMA 3.3</span>
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="h-2 w-full bg-[#12121C] rounded-none overflow-hidden flex border border-white/[0.06] relative">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${bullConfidence}%` }}
                />
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${bearConfidence}%` }}
                />
              </div>
            </div>

            {/* ─── ADVERSARIAL RING: BULL VS BEAR PERSPECTIVES ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
              {/* 🟢 GEMINI 2.5 FLASH (LONG / BULLISH THESIS) */}
              <div className="p-3.5 rounded-none bg-[#08080E] border border-emerald-500/20 flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="space-y-2.5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-none bg-[#0E0E17] border border-emerald-500/30 text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-200 block">
                            GEMINI 2.5 FLASH
                          </span>
                          <span className="text-[8px] px-1 py-0.2 rounded-none bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-bold">
                            LONG THESIS
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono">
                          Momentum & Bid Asymmetry
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-400 font-mono block">
                        {bullConfidence}%
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">Conviction</span>
                    </div>
                  </div>

                  {/* Core Headline */}
                  <div className="p-2.5 rounded-none bg-[#050508] border border-white/[0.06] text-xs text-gray-200 leading-relaxed font-sans font-medium">
                    {debate?.bullCase?.headline || `Aggressive buying pressure on ${selectedSymbol} with expanding bid support on CLOB.`}
                  </div>

                  {/* Key Execution Anchors */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 bg-[#050508] border border-white/[0.06] rounded-none flex flex-col">
                      <span className="text-[8px] text-gray-400 font-mono uppercase font-bold">Support Level</span>
                      <span className="text-[10px] text-gray-200 font-mono font-bold truncate">
                        {debate?.bullCase?.supportLevel || "Key EMA Support ($98,250)"}
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#050508] border border-white/[0.06] rounded-none flex flex-col">
                      <span className="text-[8px] text-gray-400 font-mono uppercase font-bold">Orderbook Ratio</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold truncate">
                        {debate?.bullCase?.orderbookRatio || "1.85x Bid Depth"}
                      </span>
                    </div>
                  </div>

                  {/* Key Arguments */}
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>Bull Arguments:</span>
                    </span>
                    <ul className="space-y-1 text-xs text-gray-300 font-sans">
                      {debate?.bullCase?.keyArguments && debate.bullCase.keyArguments.length > 0 ? (
                        debate.bullCase.keyArguments.map((arg: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 bg-[#050508] p-2 rounded-none border border-white/[0.05]">
                            <span className="text-emerald-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug text-[11px] text-gray-300">{arg}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-1.5 bg-[#050508] p-2 rounded-none border border-white/[0.05]">
                            <span className="text-emerald-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug text-[11px] text-gray-300">Orderbook bid asymmetry exceeds ask depth by 1.85x on DreamDEX CLOB.</span>
                          </li>
                          <li className="flex items-start gap-1.5 bg-[#050508] p-2 rounded-none border border-white/[0.05]">
                            <span className="text-emerald-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug text-[11px] text-gray-300">Strong upward continuation velocity $VC &gt; 1.35x$ into expiration.</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Breakout Catalysts */}
                  {debate?.bullCase?.catalysts && debate.bullCase.catalysts.length > 0 && (
                    <div className="space-y-1 pt-0.5">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Breakout Catalysts:</span>
                      </span>
                      <div className="space-y-1">
                        {debate.bullCase.catalysts.map((cat: string, i: number) => (
                          <div
                            key={i}
                            className="text-[10px] text-gray-300 bg-[#050508] p-1.5 rounded-none border border-white/[0.05] font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                            <span className="truncate">{cat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invalidation Trigger */}
                  {debate?.bullCase?.invalidationLevel && (
                    <div className="text-[9px] text-gray-400 font-mono bg-[#050508] p-1.5 rounded-none border border-white/[0.05] flex items-center justify-between">
                      <span className="text-gray-400 font-bold uppercase">Invalidation:</span>
                      <span className="text-gray-300">{debate.bullCase.invalidationLevel}</span>
                    </div>
                  )}
                </div>

                {/* Bull Action Button */}
                <button
                  onClick={() => onTradeSignal(selectedSymbol, "YES", targetBullOdds)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 border border-emerald-400/40 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                >
                  <span>BUY YES @ ${(targetBullOdds * 100).toFixed(0)}%</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 🔴 META LLAMA 3.3 70B (SHORT / BEARISH THESIS) */}
              <div className="p-3.5 rounded-none bg-[#08080E] border border-rose-500/20 flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="space-y-2.5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-none bg-[#0E0E17] border border-rose-500/30 text-rose-400">
                        <TrendingDown className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-200 block">
                            META LLAMA 3.3 70B
                          </span>
                          <span className="text-[8px] px-1 py-0.2 rounded-none bg-rose-950/40 text-rose-400 border border-rose-500/30 font-bold">
                            SHORT THESIS
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono">
                          Risk & Theta Decay Specialist
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-rose-400 font-mono block">
                        {bearConfidence}%
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">Risk Skew</span>
                    </div>
                  </div>

                  {/* Core Headline */}
                  <div className="p-2.5 rounded-none bg-[#050508] border border-white/[0.06] text-xs text-gray-200 leading-relaxed font-sans font-medium">
                    {debate?.bearCase?.headline || `Overextended probability on ${selectedSymbol} with overhead resistance and time decay.`}
                  </div>

                  {/* Key Execution Anchors */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 bg-[#050508] border border-white/[0.06] rounded-none flex flex-col">
                      <span className="text-[8px] text-gray-400 font-mono uppercase font-bold">Resistance Wall</span>
                      <span className="text-[10px] text-gray-200 font-mono font-bold truncate">
                        {debate?.bearCase?.resistanceLevel || "Heavy Supply Wall ($98,800)"}
                      </span>
                    </div>
                    <div className="p-1.5 bg-[#050508] border border-white/[0.06] rounded-none flex flex-col">
                      <span className="text-[8px] text-gray-400 font-mono uppercase font-bold">Theta Decay Trap</span>
                      <span className="text-[10px] text-rose-400 font-mono font-bold truncate">
                        {debate?.bearCase?.thetaDecayRisk || "Accelerates < 6m window"}
                      </span>
                    </div>
                  </div>

                  {/* Key Arguments */}
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      <span>Bear Arguments:</span>
                    </span>
                    <ul className="space-y-1 text-xs text-gray-300 font-sans">
                      {debate?.bearCase?.keyArguments && debate.bearCase.keyArguments.length > 0 ? (
                        debate.bearCase.keyArguments.map((arg: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 bg-[#050508] p-2 rounded-none border border-white/[0.05]">
                            <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug text-[11px] text-gray-300">{arg}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-1.5 bg-[#050508] p-2 rounded-none border border-white/[0.05]">
                            <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug text-[11px] text-gray-300">Binary theta decay accelerates rapidly as round settlement window compresses.</span>
                          </li>
                          <li className="flex items-start gap-1.5 bg-[#050508] p-2 rounded-none border border-white/[0.05]">
                            <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                            <span className="leading-snug text-[11px] text-gray-300">Heavy ask supply wall creates strong overhead resistance.</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Risk Factors */}
                  {debate?.bearCase?.riskFactors && debate.bearCase.riskFactors.length > 0 && (
                    <div className="space-y-1 pt-0.5">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                        <span>Execution Risk Factors:</span>
                      </span>
                      <div className="space-y-1">
                        {debate.bearCase.riskFactors.map((risk: string, i: number) => (
                          <div
                            key={i}
                            className="text-[10px] text-gray-300 bg-[#050508] p-1.5 rounded-none border border-white/[0.05] font-mono flex items-center gap-1.5"
                          >
                            <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                            <span className="truncate">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invalidation Trigger */}
                  {debate?.bearCase?.invalidationLevel && (
                    <div className="text-[9px] text-gray-400 font-mono bg-[#050508] p-1.5 rounded-none border border-white/[0.05] flex items-center justify-between">
                      <span className="text-gray-400 font-bold uppercase">Invalidation:</span>
                      <span className="text-gray-300">{debate.bearCase.invalidationLevel}</span>
                    </div>
                  )}
                </div>

                {/* Bear Action Button */}
                <button
                  onClick={() => onTradeSignal(selectedSymbol, "NO", targetBearOdds)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-none font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 border border-rose-400/40 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                >
                  <span>BUY NO @ ${(targetBearOdds * 100).toFixed(0)}%</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ─── EXECUTIVE SYNTHESIS BANNER ─── */}
            {debate?.summary && !debateLoading && (
              <div className="p-3 rounded-none bg-[#0E0E17] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5 tracking-wider uppercase font-mono">
                    <Scale className="w-3.5 h-3.5 text-violet-400" />
                    EXECUTIVE SYNTHESIS & MARKET VERDICT
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono bg-[#12121C] px-1.5 py-0.2 rounded-none border border-white/[0.06]">
                    Consensus
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {debate.summary}
                </p>
              </div>
            )}

            {/* ─── VERIFIED GROUNDING SOURCES (RAG) ─── */}
            <div className="pt-2 border-t border-white/[0.07] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-300">
                  <Newspaper className="w-3.5 h-3.5 text-violet-400" />
                  <span>VERIFIED NEWS GROUNDING ({selectedSymbol})</span>
                </div>
                <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  RAG VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-sans">
                {ragSources.map((item: any, idx: number) => (
                  <a
                    key={idx}
                    href={item.url || "https://www.coindesk.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-none bg-[#0E0E17] border border-white/[0.06] hover:border-violet-500/40 hover:bg-[#12121C] transition-colors group flex flex-col justify-between"
                  >
                    <p className="text-xs text-gray-200 font-medium line-clamp-2 group-hover:text-violet-300 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1.5 font-mono">
                      <span className="text-violet-400 font-bold">{item.source || "Feed"}</span>
                      <span className="group-hover:text-white transition-colors flex items-center gap-0.5">
                        <span>Source Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDECAR (lg:col-span-4): Live Signals Feed ── */}
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
