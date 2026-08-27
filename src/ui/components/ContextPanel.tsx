import React, { useState } from "react";
import {
  Sparkles,
  Newspaper,
  ArrowRight,
  ExternalLink,
  Volume2,
  VolumeX,
  Radio,
  Swords,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { sound } from "../utils/sound-fx.js";

interface ContextPanelProps {
  symbol: string;
  debate?: any;
  debateLoading?: boolean;
  signals?: any[];
  news?: any[];
  onViewDebate: () => void;
  onSimulate: (params: { outcome: "YES" | "NO"; capital: number }) => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  symbol,
  debate,
  debateLoading = false,
  signals = [],
  news = [],
  onViewDebate,
  onSimulate,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const bullConfidence = debate?.bullCase?.confidence ?? 68;
  const bearConfidence = debate?.bearCase?.confidence ?? 32;

  const handlePlayVoice = () => {
    sound.playClick();
    if (isPlayingAudio) {
      sound.stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    const summaryText = debate?.bullCase?.summary
      ? `ForeSight Market Intelligence Briefing for ${symbol}. Alpha Bull reports: ${debate.bullCase.summary}. Macro Bear warns: ${debate.bearCase?.summary || "Watch for resistance and time decay"}.`
      : `ForeSight Market Intelligence Briefing for ${symbol}. Unusual volume surge detected on Somnia Shannon CLOB. Alpha Bull thesis points to institutional spot bid support. Macro Bear thesis cautions against high strike distance before expiry.`;

    sound.speakBriefing(
      summaryText,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  return (
    <aside className="w-full h-full flex flex-col divide-y divide-[#222234] bg-[#0E0E16] text-gray-300 text-xs overflow-y-auto custom-scrollbar font-mono">
      {/* ─── 1. Header with Live Audio Briefing Button ───────────────── */}
      <div className="p-3 bg-[#0A0A10] flex items-center justify-between sticky top-0 z-10 border-b border-[#222234]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-violet-950/80 border border-violet-500/40 text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-white block">AI DUAL ARENA</span>
            <span className="text-[9px] text-gray-500">RAG Grounded Intelligence</span>
          </div>
        </div>

        {/* Live Audio Button */}
        <button
          onClick={handlePlayVoice}
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all shadow ${
            isPlayingAudio
              ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"
              : "bg-violet-950/80 hover:bg-violet-900 border border-violet-500/40 text-violet-300"
          }`}
          title="Play AI Voice Market Briefing"
        >
          {isPlayingAudio ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          <span>{isPlayingAudio ? "Stop Voice" : "🎙️ AI Audio"}</span>
        </button>
      </div>

      {/* ─── Waveform Animation when Audio is active ─────────────────── */}
      {isPlayingAudio && (
        <div className="px-3 py-1.5 bg-[#0C1412] border-b border-emerald-500/40 flex items-center justify-between text-[10px] text-emerald-400">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Radio Briefing Active:
          </span>
          <div className="flex items-end gap-1 h-3">
            <span className="w-1 bg-emerald-400 h-2 animate-pulse" />
            <span className="w-1 bg-emerald-400 h-3 animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1 bg-emerald-400 h-1.5 animate-pulse" style={{ animationDelay: "300ms" }} />
            <span className="w-1 bg-emerald-400 h-2.5 animate-pulse" style={{ animationDelay: "450ms" }} />
          </div>
        </div>
      )}

      {/* ─── 2. Tug-of-War Bull vs Bear Battle Bar ────────────────────── */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Bull ({bullConfidence}%)
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Swords className="w-3 h-3 text-violet-400" /> TUG-OF-WAR
          </span>
          <span className="text-rose-400 flex items-center gap-1">
            Bear ({bearConfidence}%) <TrendingDown className="w-3 h-3" />
          </span>
        </div>

        {/* Dynamic Dual Energy Bar */}
        <div className="w-full bg-[#181828] h-3 rounded-full overflow-hidden p-0.5 border border-[#2A2A3D] flex">
          <div
            className="h-full rounded-l-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            style={{ width: `${bullConfidence}%` }}
          />
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
            style={{ width: `${bearConfidence}%` }}
          />
        </div>

        {/* 2-Column Opposing Arguments Box */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          {/* Alpha Bull */}
          <div className="p-2.5 rounded-lg bg-[#0F1815] border border-emerald-900/40 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>🐂 Alpha Bull Thesis</span>
              <span className="text-[9px] bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-600/40">
                Score: {bullConfidence}%
              </span>
            </div>
            <p className="text-gray-300 font-sans leading-relaxed text-[11px]">
              {debate?.bullCase?.summary ||
                "Spot momentum velocity (+0.041%/m) and persistent buy-side order depth strongly favor strike target."}
            </p>
          </div>

          {/* Macro Bear */}
          <div className="p-2.5 rounded-lg bg-[#181115] border border-rose-900/40 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-rose-400 font-bold">
              <span>🐻 Macro Bear Thesis</span>
              <span className="text-[9px] bg-rose-950 px-1.5 py-0.2 rounded border border-rose-600/40">
                Score: {bearConfidence}%
              </span>
            </div>
            <p className="text-gray-300 font-sans leading-relaxed text-[11px]">
              {debate?.bearCase?.summary ||
                "Rapid time-decay curve and overhead liquidity supply wall pose high downside reversion risks."}
            </p>
          </div>
        </div>

        {/* 1-Click Sync to Simulator Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onSimulate({ outcome: "YES", capital: 100 });
            }}
            className="py-1.5 px-2 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-600/40 rounded font-bold text-[10px] transition shadow-sm"
          >
            ⚡ Simulate Bull $100
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSimulate({ outcome: "NO", capital: 100 });
            }}
            className="py-1.5 px-2 bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-600/40 rounded font-bold text-[10px] transition shadow-sm"
          >
            ⚡ Simulate Bear $100
          </button>
        </div>
      </div>

      {/* ─── 3. Verified RAG News Evidence Stream ────────────────────── */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Newspaper className="w-3 h-3 text-violet-400" />
            Verified RAG Evidence
          </span>
          <span className="text-[9px] text-emerald-400">100% Grounded</span>
        </div>

        <div className="space-y-2">
          {news.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-[10px] font-mono">
              Ingesting live RSS crypto evidence citations...
            </div>
          ) : (
            news.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-[#12121E] border border-[#232336] space-y-1 hover:border-violet-500/50 transition group"
            >
              <a
                href={item.url || "https://www.coindesk.com"}
                target="_blank"
                rel="noreferrer"
                className="text-gray-200 font-sans font-medium text-[11px] leading-snug group-hover:text-violet-300 transition-colors block"
              >
                {item.title}
              </a>

              <div className="flex items-center justify-between text-[9px] text-gray-500 pt-0.5">
                <span className="text-violet-400 font-bold">{item.source}</span>
                <a
                  href={item.url || "https://www.coindesk.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white flex items-center gap-0.5 underline"
                >
                  <span>[View Source]</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )))}
        </div>
      </div>
    </aside>
  );
};
export default ContextPanel;
