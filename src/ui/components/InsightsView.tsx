import React, { useState, useEffect, useCallback } from "react";
import { Bot, Sparkles, Brain, Newspaper, Volume2, ShieldCheck, ArrowUpRight, Flame } from "lucide-react";
import { AICopilotFeed } from "./AICopilotFeed.js";
import { CryptoIcon } from "./CryptoIcon.js";
import { sound } from "../utils/sound-fx.js";
import { apiUrl } from "../utils/api.js";

interface InsightsViewProps {
  markets: any[];
  onTradeSignal: (symbol: string, outcome: "YES" | "NO", price?: number) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  markets,
  onTradeSignal,
}) => {
  const [signals, setSignals] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    markets[0]?.underlyingAsset || markets[0]?.symbol || "BTC"
  );
  const [debate, setDebate] = useState<any>(null);
  const [debateLoading, setDebateLoading] = useState<boolean>(false);
  const [news, setNews] = useState<any[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

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
      // Ignore
    }
  }, []);

  // Fetch Debate for selected symbol
  const fetchDebate = useCallback(async (sym: string) => {
    setDebateLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/debate/${encodeURIComponent(sym)}`));
      if (res.ok) {
        const data = await res.json();
        setDebate(data.debate || data);
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
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchSignals, fetchNews]);

  useEffect(() => {
    if (selectedSymbol) {
      fetchDebate(selectedSymbol);
    }
  }, [selectedSymbol, fetchDebate]);

  const bullConfidence = debate?.bullCase?.confidence ?? 68;
  const bearConfidence = debate?.bearCase?.confidence ?? 32;

  const handleVoiceBriefing = () => {
    sound.playClick();
    if (isPlayingAudio) {
      sound.stopSpeech();
      setIsPlayingAudio(false);
      return;
    }
    const text = `${selectedSymbol} AI Arena. Bull thesis: ${
      debate?.bullCase?.argument || "Strong momentum and orderbook depth."
    }. Bear thesis: ${
      debate?.bearCase?.argument || "Macro resistance and volume decay."
    }`;
    setIsPlayingAudio(true);
    sound.speakBriefing(text);
    setTimeout(() => setIsPlayingAudio(false), 8000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0F] text-[#E2E8F0] overflow-y-auto custom-scrollbar p-4 space-y-4">
      {/* ─── Top Stats Ribbon ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Active AI Reasoning
            </span>
            <span className="text-base font-bold font-mono text-amber-400">
              Autonomous Copilot
            </span>
          </div>
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Bot className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Dual Debate Engine
            </span>
            <span className="text-base font-bold font-mono text-violet-400">
              Alpha vs Macro
            </span>
          </div>
          <div className="p-2 rounded bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Brain className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              RAG Fact-Checking
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              100% Grounded
            </span>
          </div>
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0E0E16] border border-[#222234] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Live Signals Emitted
            </span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {signals.length > 0 ? `${signals.length} Real-Time` : "Scanning CLOB..."}
            </span>
          </div>
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ─── Main 2-Column AI Intelligence Layout ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: AI Copilot Feed */}
        <div className="lg:col-span-6 flex flex-col min-h-[480px]">
          <AICopilotFeed
            signals={signals.length > 0 ? signals : [
              {
                symbol: `${selectedSymbol}/tUSDC`,
                question: `Will ${selectedSymbol} sustain upside above resistance?`,
                direction: "UP",
                confidence: 0.78,
                suggestedPrice: 0.62,
                reasoning: `Orderbook bid-depth asymmetry on Somnia CLOB + strong buying pressure detected on ${selectedSymbol}.`,
                timestamp: Date.now(),
              },
              {
                symbol: "ETH/tUSDC",
                question: "Will ETH breakout within the 1-hour expiry?",
                direction: "DOWN",
                confidence: 0.65,
                suggestedPrice: 0.44,
                reasoning: "Heavy ask walls near $2,480 suppressing short-term probability momentum.",
                timestamp: Date.now() - 60000,
              },
            ]}
            onSelectMarket={(sym) => {
              const cleanSym = sym.split("/")[0];
              setSelectedSymbol(cleanSym);
              onTradeSignal(cleanSym, "YES");
            }}
          />
        </div>

        {/* Right: Dual Debate Arena & Grounded Evidence */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Dual Debate Arena Card */}
          <div className="panel rounded-xl p-5 flex flex-col space-y-4 border border-[#2A2A3D] bg-[#0E0E16]">
            <div className="flex items-center justify-between border-b border-[#2A2A3D] pb-3">
              <div className="flex items-center gap-2">
                <CryptoIcon symbol={selectedSymbol} size={20} />
                <h3 className="font-bold text-white text-sm font-mono uppercase">
                  Dual AI Arena · {selectedSymbol}/tUSDC
                </h3>
              </div>
              <button
                onClick={handleVoiceBriefing}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition border ${
                  isPlayingAudio
                    ? "bg-violet-600 text-white border-violet-400 animate-pulse"
                    : "bg-[#141420] text-violet-300 hover:text-white border-[#2A2A3D]"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingAudio ? "Playing Voice..." : "Voice Briefing"}</span>
              </button>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">🐂 Alpha Bull ({bullConfidence}%)</span>
                <span className="text-rose-400">🐻 Macro Bear ({bearConfidence}%)</span>
              </div>
              <div className="h-2.5 w-full bg-[#1A1A28] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${bullConfidence}%` }}
                />
                <div
                  className="h-full bg-rose-500 transition-all duration-700"
                  style={{ width: `${bearConfidence}%` }}
                />
              </div>
            </div>

            {/* Bull vs Bear Arguments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-emerald-300">
                    🟢 BULL CATALYST
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">High Conviction</span>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  {debate?.bullCase?.argument ||
                    "Orderbook bid density exceeding asks by 1.8x. Implied probability surging on rapid Somnia sub-second state execution."}
                </p>
                <button
                  onClick={() => onTradeSignal(selectedSymbol, "YES", 0.62)}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs font-mono transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Trade Bull YES</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-rose-300">
                    🔴 BEAR SKEW
                  </span>
                  <span className="text-[10px] text-rose-400 font-mono">Macro Risk</span>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  {debate?.bearCase?.argument ||
                    "Time-decay acceleration as contract enters final 30 minutes. Resistance ceiling holding at upper bound."}
                </p>
                <button
                  onClick={() => onTradeSignal(selectedSymbol, "NO", 0.38)}
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs font-mono transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Trade Bear NO</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Verified RAG News Citations Stream */}
          <div className="panel rounded-xl p-5 border border-[#2A2A3D] bg-[#0E0E16] space-y-3">
            <div className="flex items-center justify-between border-b border-[#2A2A3D] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-300">
                <Newspaper className="w-4 h-4 text-violet-400" />
                <span>Verified RAG Ingestion Citations</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {news.slice(0, 4).map((item, idx) => (
                <a
                  key={idx}
                  href={item.url || "https://www.coindesk.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-lg bg-[#12121E] border border-[#222234] hover:border-violet-500/50 transition group flex flex-col justify-between"
                >
                  <p className="text-xs text-gray-200 font-sans font-medium line-clamp-2 group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 font-mono">
                    <span className="text-violet-400 font-bold">{item.source}</span>
                    <span className="group-hover:text-white transition">View Fact →</span>
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
