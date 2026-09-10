import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  FileText,
  Loader2,
  Zap,
  ArrowRight,
} from "lucide-react";
import { apiUrl } from "../utils/api.js";

interface DualDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  spike: any;
  symbol: string;
  onLoadScenario: (outcome: "YES" | "NO", targetExit: number) => void;
}

export const DualDebateModal: React.FC<DualDebateModalProps> = ({
  isOpen,
  onClose,
  spike,
  symbol,
  onLoadScenario,
}) => {
  const [debateData, setDebateData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !symbol) return;

    let isMounted = true;
    setIsLoading(true);

    const fetchDebate = async () => {
      try {
        const query = spike?.id ? `?spikeId=${encodeURIComponent(spike.id)}` : "";
        const res = await fetch(apiUrl(`/api/debate/${encodeURIComponent(symbol)}${query}`));
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.debate) {
            setDebateData(data.debate);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Debate fetch error:", err);
      }
      if (isMounted) setIsLoading(false);
    };

    fetchDebate();
    return () => {
      isMounted = false;
    };
  }, [isOpen, symbol, spike]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#08080E] w-full max-w-4xl max-h-[90vh] rounded-none border border-white/[0.08] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Modal Top Header */}
        <div className="p-3.5 px-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0E0E17]">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-none bg-violet-950/80 text-violet-300 border border-violet-500/40">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">MARKET CONSENSUS DEBATE</h2>
                <span className="text-[9px] px-1.5 py-0.2 rounded-none bg-violet-950/60 text-violet-300 font-mono border border-violet-500/30 font-bold">
                  DUAL THESIS
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Market: <span className="text-violet-300 font-bold">{symbol}</span> · Multi-Source Consensus Analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-none text-gray-400 hover:text-white hover:bg-[#12121C] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Scrollable */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar bg-[#07070A]">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 space-y-2 font-mono">
              <Loader2 className="w-6 h-6 mx-auto text-violet-400 animate-spin" />
              <p className="font-bold text-xs">Synthesizing institutional perspectives...</p>
            </div>
          ) : debateData ? (
            <>
              {/* Executive Summary */}
              <div className="p-3 rounded-none bg-[#0B0B14] border border-white/[0.08] flex items-start gap-2.5">
                <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-bold text-violet-300 uppercase tracking-wider font-mono">
                    EXECUTIVE SUMMARY & MARKET CONSENSUS
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{debateData.summary}</p>
                </div>
              </div>

              {/* The Arena: Bull vs Bear Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* ALPHA BULL CARD */}
                <div className="p-3.5 rounded-none border border-emerald-500/20 bg-[#08080E] flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-gray-200">BULLISH CASE · LONG THESIS</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-bold">
                        {Math.round(debateData.bullCase.confidence * 100)}% Conviction
                      </span>
                    </div>

                    <p className="p-2.5 bg-[#050508] border border-white/[0.06] text-xs text-gray-200 font-sans leading-relaxed font-medium">
                      {debateData.bullCase.headline}
                    </p>

                    {/* Quantitative & Technical Anchors Bar */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div className="p-1.5 bg-[#050508] border border-white/[0.06] rounded-none flex flex-col">
                        <span className="text-[8px] text-gray-400 font-mono uppercase font-bold">Support Level</span>
                        <span className="text-[10px] text-gray-200 font-mono font-bold truncate">
                          {debateData.bullCase.supportLevel || "Key Support ($98,250)"}
                        </span>
                      </div>
                      <div className="p-1.5 bg-[#050508] border border-white/[0.06] rounded-none flex flex-col">
                        <span className="text-[8px] text-gray-400 font-mono uppercase font-bold">Orderbook Ratio</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold truncate">
                          {debateData.bullCase.orderbookRatio || "1.85x Bid Depth"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-0.5">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                        Bull Arguments:
                      </p>
                      <ul className="space-y-1 text-xs text-gray-300 font-sans">
                        {debateData.bullCase.keyArguments.map((arg: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 bg-[#050508] p-1.5 rounded-none border border-white/[0.05]">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span className="text-[11px] leading-snug text-gray-300">{arg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {debateData.bullCase.catalysts && debateData.bullCase.catalysts.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                          Breakout Catalysts:
                        </p>
                        {debateData.bullCase.catalysts.map((cat: string, i: number) => (
                          <div
                            key={i}
                            className="text-[10px] text-gray-300 bg-[#050508] p-1.5 rounded-none border border-white/[0.05] font-mono"
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    )}

                    {debateData.bullCase.invalidationLevel && (
                      <div className="text-[9px] text-gray-400 font-mono bg-[#050508] p-1.5 rounded-none border border-white/[0.05] flex items-center justify-between">
                        <span className="text-gray-400 font-bold uppercase">Invalidation:</span>
                        <span className="text-gray-300">{debateData.bullCase.invalidationLevel}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onLoadScenario("YES", debateData.bullCase.targetProbability);
                      onClose();
                    }}
                    className="w-full py-2 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 font-mono border border-emerald-400/40 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  >
                    <span>BUY YES @ {(debateData.bullCase.targetProbability * 100).toFixed(0)}%</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* MACRO BEAR CARD */}
                <div className="p-3.5 rounded-none border border-rose-500/20 bg-[#08080E] flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span className="text-gray-200">BEARISH CASE · SHORT THESIS</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-rose-950/40 text-rose-300 border border-rose-500/30 font-bold">
                        {Math.round(debateData.bearCase.confidence * 100)}% Risk Skew
                      </span>
                    </div>

                    <p className="p-2.5 bg-[#050508] border border-white/[0.06] text-xs text-gray-200 font-sans leading-relaxed font-medium">
                      {debateData.bearCase.headline}
                    </p>

                    {/* Quantitative & Risk Anchors Bar */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div className="p-1.5 bg-[#050508] border border-white/[0.06] rounded-none flex flex-col">
                        <span className="text-[8px] text-gray-400 font-mono uppercase font-bold">Resistance Wall</span>
                        <span className="text-[10px] text-gray-200 font-mono font-bold truncate">
                          {debateData.bearCase.resistanceLevel || "Supply Wall ($98,800)"}
                        </span>
                      </div>
                      <div className="p-1.5 bg-[#050508] border border-white/[0.06] rounded-none flex flex-col">
                        <span className="text-[8px] text-gray-400 font-mono uppercase font-bold">Theta Decay Trap</span>
                        <span className="text-[10px] text-rose-400 font-mono font-bold truncate">
                          {debateData.bearCase.thetaDecayRisk || "Accelerates < 6m"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-0.5">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                        Bear Arguments:
                      </p>
                      <ul className="space-y-1 text-xs text-gray-300 font-sans">
                        {debateData.bearCase.keyArguments.map((arg: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 bg-[#050508] p-1.5 rounded-none border border-white/[0.05]">
                            <span className="text-rose-400 font-bold">•</span>
                            <span className="text-[11px] leading-snug text-gray-300">{arg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {debateData.bearCase.riskFactors && debateData.bearCase.riskFactors.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                          Execution Risk Factors:
                        </p>
                        {debateData.bearCase.riskFactors.map((risk: string, i: number) => (
                          <div
                            key={i}
                            className="text-[10px] text-gray-300 bg-[#050508] p-1.5 rounded-none border border-white/[0.05] font-mono"
                          >
                            {risk}
                          </div>
                        ))}
                      </div>
                    )}

                    {debateData.bearCase.invalidationLevel && (
                      <div className="text-[9px] text-gray-400 font-mono bg-[#050508] p-1.5 rounded-none border border-white/[0.05] flex items-center justify-between">
                        <span className="text-gray-400 font-bold uppercase">Invalidation:</span>
                        <span className="text-gray-300">{debateData.bearCase.invalidationLevel}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onLoadScenario("NO", debateData.bearCase.targetProbability);
                      onClose();
                    }}
                    className="w-full py-2 rounded-none bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 font-mono border border-rose-400/40 cursor-pointer"
                  >
                    <span>BUY NO @ {(debateData.bearCase.targetProbability * 100).toFixed(0)}%</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grounded News & Evidence Sources */}
              <div className="space-y-2 pt-1 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider">
                    <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
                    <span>GROUNDED NEWS SOURCES</span>
                  </div>
                  <span className="text-[9px] text-gray-400">
                    {debateData.sources?.length || 0} Sources
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans">
                  {debateData.sources && debateData.sources.length > 0 ? (
                    debateData.sources.map((src: any) => (
                      <a
                        key={src.id}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-none bg-[#0B0B14] hover:bg-[#0E0E17] border border-white/[0.06] hover:border-violet-500/40 transition-colors flex items-start justify-between group"
                      >
                        <div className="space-y-0.5 pr-2">
                          <p className="text-xs text-gray-200 group-hover:text-violet-300 line-clamp-2">
                            {src.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono">
                            <span className="text-violet-400 font-bold">{src.source}</span>
                            <span>·</span>
                            <span>{new Date(src.publishedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-violet-400 shrink-0 mt-0.5" />
                      </a>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-gray-500 italic">
                      No external sources indexed for this round.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400 font-mono text-xs">
              Failed to load debate reasoning.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-2.5 px-5 border-t border-white/[0.07] bg-[#0E0E17] flex items-center justify-between text-[10px] text-gray-400 font-mono">
          <span>Consensus Model · Somnia L1</span>
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-none bg-[#12121C] hover:bg-[#181826] text-gray-200 text-[10px] font-bold border border-white/[0.07] transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
export default DualDebateModal;
