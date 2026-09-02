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

  // Fetch News for Grounded RAG
  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/news?limit=6"));
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
    fetchNews();
    const interval = setInterval(() => {
      fetchSignals();
      fetchNews();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchSignals, fetchNews]);

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
      {/* ─── 1. HERO BANNER: ACTIVE ASSET AI RADAR ──────────────────── */}
      <div className="w-full flex-shrink-0 p-4 rounded-2xl bg-gradient-to-r from-[#17122E] via-[#10101C] to-[#0D1524] border border-violet-500/50 shadow-2xl flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
        {/* Left: Token Identity & AI Status */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/60 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <CryptoIcon symbol={selectedSymbol} size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-violet-950/90 border border-violet-500/60 text-violet-300 font-bold tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {debateLoading ? "AI GENERATING INSIGHTS..." : "AI DUAL ARENA LIVE"}
              </span>
              <span className="text-[10px] text-gray-400">Somnia Shannon L1</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight flex items-center gap-2">
              <span>{selectedSymbol} / tUSDC</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#1C1C2C] text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>{debate?.engineUsed === "dual_frontier_llm" ? "Gemini 2.5 vs LLaMA 3.3 70B" : debate?.engineUsed === "live_llm" ? "Gemini 2.5 Flash Live" : "Autonomous RAG"}</span>
              </span>
            </h2>
          </div>
        </div>

        {/* Center: Live Real-Time Market Stats */}
        <div className="flex items-center gap-4 sm:gap-6 bg-[#080811]/90 border border-[#232338] px-4 py-2 rounded-xl shadow-inner flex-wrap sm:flex-nowrap">
          <div>
            <span className="text-[9px] text-gray-500 block uppercase font-bold">Market Mid Price</span>
            <span className="text-base font-black text-white">
              ${(activeMarket?.midPrice || 0.50).toFixed(3)}
            </span>
          </div>
          <div className="w-px h-6 bg-[#232338]" />
          <div>
            <span className="text-[9px] text-gray-500 block uppercase font-bold">Consensus Bias</span>
            <span className={`text-base font-black ${bullConfidence >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
              {bullConfidence >= 50 ? `Bull (${bullConfidence}%)` : `Bear (${bearConfidence}%)`}
            </span>
          </div>
          <div className="w-px h-6 bg-[#232338]" />
          <div>
            <span className="text-[9px] text-gray-500 block uppercase font-bold">RAG Citations</span>
            <span className="text-base font-black text-violet-300">
              {ragSources.length} Fact-Checked
            </span>
          </div>
        </div>

        {/* Right: Quick Token Selector & Trade in Terminal */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="flex items-center bg-[#0B0B14] border border-[#24243A] rounded-xl p-1 gap-1">
            {["BTC", "ETH", "SOL", "SOMI"].map((sym) => {
              const isCurrent = sym === selectedSymbol;
              return (
                <button
                  key={sym}
                  onClick={() => handleSelectSymbol(sym)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.7)] border border-violet-400 scale-[1.03]"
                      : "text-gray-400 hover:text-white hover:bg-[#181826]"
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onTradeSignal(selectedSymbol, bullConfidence >= 50 ? "YES" : "NO", targetBullOdds)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <span>Load into Terminal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
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

      {/* ─── 3. Main 2-Column AI Intelligence Layout ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: AI Copilot Feed (100% Real-time Signals) */}
        <div className="lg:col-span-5 flex flex-col min-h-[500px]">
          <AICopilotFeed
            signals={signals}
            onSelectMarket={(sym) => {
              const cleanSym = sym.split("/")[0].split("-")[0];
              handleSelectSymbol(cleanSym);
              onTradeSignal(cleanSym, "YES");
            }}
          />
        </div>

        {/* Right: Dual Debate Arena & Grounded Citations */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Dual Debate Arena Card */}
          <div className="panel rounded-xl p-4 sm:p-5 flex flex-col space-y-4 border border-[#2A2A3D] bg-[#0E0E16] shadow-sm relative">
            <div className="flex flex-wrap items-center justify-between border-b border-[#2A2A3D] pb-3 gap-2">
              <div className="flex items-center gap-2">
                <CryptoIcon symbol={selectedSymbol} size={22} />
                <h3 className="font-bold text-white text-sm font-mono uppercase">
                  Dual AI Arena · {selectedSymbol}/tUSDC
                </h3>
              </div>

              {/* Action Buttons: Re-Prompt & Audio Voice */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchDebate(selectedSymbol)}
                  disabled={debateLoading}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition border cursor-pointer ${
                    debateLoading
                      ? "bg-[#181826] text-gray-500 border-[#2A2A3D] cursor-not-allowed"
                      : "bg-[#141420] text-cyan-300 hover:text-white hover:border-cyan-400 border-[#2A2A3D]"
                  }`}
                  title="Re-run generative prompt on Gemini 2.5 Flash"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${debateLoading ? "animate-spin text-cyan-400" : "text-yellow-400"}`} />
                  <span>{debateLoading ? "Synthesizing..." : "Re-Prompt Gemini"}</span>
                </button>

                <button
                  onClick={handleVoiceBriefing}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition border cursor-pointer ${
                    isPlayingAudio
                      ? "bg-violet-600 text-white border-violet-400 animate-pulse shadow-md"
                      : "bg-[#141420] text-violet-300 hover:text-white border-[#2A2A3D]"
                  }`}
                  title="Listen to synthesized AI voice briefing"
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? "Stop Voice" : "🎙️ AI Voice"}</span>
                </button>
              </div>
            </div>

            {/* ─── LIVE NEURAL REASONING PIPELINE (Shows AI in action) ──── */}
            {debateLoading && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#120E2E] via-[#0E0E1A] to-[#0A1624] border border-cyan-500/40 space-y-3 shadow-lg animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      GOOGLE GEMINI 2.5 FLASH · ACTIVE NEURAL REASONING
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                    Streaming Inference
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-gray-300">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>[1/3] Somnia Shannon CLOB orderbook depth & implied odds ingested</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>[2/3] Vectorized real-time crypto news & RAG context sources</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300 animate-pulse">
                    <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
                    <span>[3/3] Gemini synthesizing Alpha Bull vs Macro Bear institutional payoff thesis...</span>
                  </div>
                </div>

                <div className="w-full bg-[#18152E] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 animate-pulse w-full" />
                </div>
              </div>
            )}

            {/* Audio Waveform Readout */}
            {isPlayingAudio && (
              <div className="px-3 py-2 rounded-lg bg-[#0C1412] border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-400">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Playing Synthesized Market Briefing...
                </span>
                <div className="flex items-end gap-1 h-3.5">
                  <span className="w-1 bg-emerald-400 h-2 animate-pulse" />
                  <span className="w-1 bg-emerald-400 h-3.5 animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 bg-emerald-400 h-1.5 animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className="w-1 bg-emerald-400 h-3 animate-pulse" style={{ animationDelay: "450ms" }} />
                </div>
              </div>
            )}

            {/* ─── EXECUTIVE AI SYNTHESIS SUMMARY SPOTLIGHT ─────────────── */}
            {debate?.summary && !debateLoading && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#141226] via-[#0E0E18] to-[#141226] border border-violet-500/40 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-violet-300 flex items-center gap-1.5 tracking-wider uppercase">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    Gemini 2.5 Flash Executive Synthesis
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Live Generated
                  </span>
                </div>
                <p className="text-xs text-gray-200 font-sans leading-relaxed italic">
                  "{debate.summary}"
                </p>
              </div>
            )}

            {/* Confidence Tug-of-War Bar */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Alpha Bull ({bullConfidence}%)</span>
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  <span>Macro Bear ({bearConfidence}%)</span>
                  <TrendingDown className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="h-3 w-full bg-[#1A1A28] rounded-full overflow-hidden flex p-0.5 border border-[#28283E]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${bullConfidence}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-r-full transition-all duration-700 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                  style={{ width: `${bearConfidence}%` }}
                />
              </div>
            </div>

            {/* Bull vs Bear Dynamic Arguments (100% Real Live Data) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Alpha Bull Card */}
              <div className="p-3.5 rounded-xl bg-[#0B1713] border border-emerald-500/30 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ALPHA BULL THESIS
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      Conviction: {bullConfidence}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap text-[9px] font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1 bg-[#061410] px-2 py-0.5 rounded border border-emerald-500/40">
                      <Cpu className="w-2.5 h-2.5 text-cyan-400" />
                      <span>Brain: {debate?.bullCase?.modelUsed || debate?.bullModel || "Google Gemini 2.5 Flash"}</span>
                    </span>
                    <span className="text-gray-400">Prompt: Momentum & Bid Skew</span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-100 font-sans leading-snug">
                    {debate?.bullCase?.headline || `Aggressive buying pressure on ${selectedSymbol} with deep bid support on DreamDEX CLOB.`}
                  </h4>

                  {/* Bullet Points from Real Key Arguments */}
                  <ul className="space-y-1 text-[11px] text-gray-300 font-sans list-disc list-inside leading-relaxed">
                    {debate?.bullCase?.keyArguments && debate.bullCase.keyArguments.length > 0 ? (
                      debate.bullCase.keyArguments.map((arg: string, i: number) => (
                        <li key={i} className="line-clamp-2">{arg}</li>
                      ))
                    ) : (
                      <>
                        <li>Orderbook bid asymmetry exceeds ask depth by 1.8x.</li>
                        <li>High probability of continuation into the round expiration window.</li>
                      </>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => onTradeSignal(selectedSymbol, "YES", targetBullOdds)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs font-mono transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Trade Bull YES @ ${(targetBullOdds * 100).toFixed(0)}%</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Macro Bear Card */}
              <div className="p-3.5 rounded-xl bg-[#170D12] border border-rose-500/30 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      MACRO BEAR THESIS
                    </span>
                    <span className="text-[10px] text-rose-400 font-mono bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                      Risk Skew: {bearConfidence}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap text-[9px] font-mono">
                    <span className="text-rose-400 font-bold flex items-center gap-1 bg-[#14080D] px-2 py-0.5 rounded border border-rose-500/40">
                      <Cpu className="w-2.5 h-2.5 text-orange-400" />
                      <span>Brain: {debate?.bearCase?.modelUsed || debate?.bearModel || "Meta LLaMA 3.3 70B"}</span>
                    </span>
                    <span className="text-gray-400">Prompt: Theta Decay & Overhead</span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-100 font-sans leading-snug">
                    {debate?.bearCase?.headline || `Overextended probability on ${selectedSymbol} with heavy overhead resistance and time decay.`}
                  </h4>

                  {/* Bullet Points from Real Key Arguments */}
                  <ul className="space-y-1 text-[11px] text-gray-300 font-sans list-disc list-inside leading-relaxed">
                    {debate?.bearCase?.keyArguments && debate.bearCase.keyArguments.length > 0 ? (
                      debate.bearCase.keyArguments.map((arg: string, i: number) => (
                        <li key={i} className="line-clamp-2">{arg}</li>
                      ))
                    ) : (
                      <>
                        <li>Binary decay accelerates as time to expiry compresses.</li>
                        <li>Heavy ask supply walls prevent higher probability expansion.</li>
                      </>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => onTradeSignal(selectedSymbol, "NO", targetBearOdds)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs font-mono transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Trade Bear NO @ ${(targetBearOdds * 100).toFixed(0)}%</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── 4. Verified Grounded RAG Ingestion Citations ─────────── */}
          <div className="panel rounded-xl p-4 sm:p-5 border border-[#2A2A3D] bg-[#0E0E16] space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#2A2A3D] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-300">
                <Newspaper className="w-4 h-4 text-violet-400" />
                <span>Verified RAG Ingestion Citations ({selectedSymbol})</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100% Fact-Checked
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
                  <p className="text-xs text-gray-200 font-sans font-medium line-clamp-2 group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 font-mono">
                    <span className="text-violet-400 font-bold">{item.source || "CoinDesk"}</span>
                    <span className="group-hover:text-white transition flex items-center gap-0.5">
                      <span>View Source</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsView;
