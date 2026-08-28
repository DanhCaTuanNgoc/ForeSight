import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Sparkles,
  Bot,
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
      <div className="bg-[#13131D] w-full max-w-4xl max-h-[90vh] rounded-xl border border-[#2A2A3D] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 px-6 border-b border-[#2A2A3D] flex items-center justify-between bg-[#0E0E17]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Dual AI Agent Arena</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 font-mono border border-violet-700/40 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> What Changed?
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Market: <span className="text-violet-400 font-semibold">{symbol}</span> | RAG Evidence Synthesis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1A1A26] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 space-y-3">
              <Bot className="w-8 h-8 mx-auto text-violet-400 animate-spin" />
              <p className="font-semibold text-xs font-mono">Synthesizing Alpha Bull & Macro Bear arguments via RAG...</p>
            </div>
          ) : debateData ? (
            <>
              {/* Executive Summary */}
              <div className="p-4 rounded-lg bg-[#161624] border border-violet-600/30 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider font-mono">
                    AI Consensus & Context
                  </h4>
                  <p className="text-xs text-gray-200 leading-relaxed">{debateData.summary}</p>
                </div>
              </div>

              {/* The Arena: Bull vs Bear Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 🐂 ALPHA BULL CARD */}
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>Alpha Bull AI</span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                        {Math.round(debateData.bullCase.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-200 italic">
                      "{debateData.bullCase.headline}"
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                        Key Theses:
                      </p>
                      <ul className="space-y-1 text-xs text-gray-300">
                        {debateData.bullCase.keyArguments.map((arg: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{arg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                        Catalysts:
                      </p>
                      {debateData.bullCase.catalysts.map((cat: string, i: number) => (
                        <div
                          key={i}
                          className="text-[11px] text-emerald-200/90 bg-emerald-900/20 p-1.5 rounded border border-emerald-800/40 font-mono"
                        >
                          ⚡ {cat}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onLoadScenario("YES", debateData.bullCase.targetProbability);
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 font-mono"
                  >
                    <span>Simulate Bull (YES @ {(debateData.bullCase.targetProbability * 100).toFixed(0)}%)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 🐻 MACRO BEAR CARD */}
                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                        <TrendingDown className="w-4 h-4" />
                        <span>Macro Bear AI</span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                        {Math.round(debateData.bearCase.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-200 italic">
                      "{debateData.bearCase.headline}"
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono">
                        Counter Arguments:
                      </p>
                      <ul className="space-y-1 text-xs text-gray-300">
                        {debateData.bearCase.keyArguments.map((arg: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{arg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono">
                        Risk Warnings:
                      </p>
                      {debateData.bearCase.riskFactors.map((risk: string, i: number) => (
                        <div
                          key={i}
                          className="text-[11px] text-rose-200/90 bg-rose-900/20 p-1.5 rounded border border-rose-800/40 font-mono"
                        >
                          ⚠ {risk}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onLoadScenario("NO", debateData.bearCase.targetProbability);
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 font-mono"
                  >
                    <span>Simulate Bear (NO @ {(debateData.bearCase.targetProbability * 100).toFixed(0)}%)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* RAG News & Evidence Sources */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                    <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
                    <span>Evidence & News Sources (RAG Citations)</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {debateData.sources?.length || 0} Sources Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {debateData.sources && debateData.sources.length > 0 ? (
                    debateData.sources.map((src: any) => (
                      <a
                        key={src.id}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg bg-[#0E0E17] hover:bg-[#181826] border border-[#2A2A3D] transition-all flex items-start justify-between group"
                      >
                        <div className="space-y-0.5 pr-2">
                          <p className="text-xs text-gray-200 group-hover:text-violet-300 line-clamp-2">
                            {src.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono">
                            <span className="text-violet-400">{src.source}</span>
                            <span>•</span>
                            <span>{new Date(src.publishedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-violet-400 shrink-0 mt-0.5" />
                      </a>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-gray-500 italic">
                      No direct external sources indexed for this round.
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
        <div className="p-3 px-6 border-t border-[#2A2A3D] bg-[#0E0E17] flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>Deterministic AI Multi-Agent Engine • Somnia L1</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#1C1C28] hover:bg-[#2A2A3D] text-gray-200 text-xs transition-all font-mono"
          >
            Close Arena
          </button>
        </div>
      </div>
    </div>
  );
};
export default DualDebateModal;
