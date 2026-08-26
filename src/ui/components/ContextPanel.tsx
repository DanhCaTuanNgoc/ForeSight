import React from "react";
import { Sparkles, Newspaper, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";

interface ContextPanelProps {
  symbol: string;
  debate?: any;
  debateLoading?: boolean;
  signals?: any[];
  news?: any[];
  onViewDebate: () => void;
  onSimulate: (params: { outcome: "YES" | "NO"; capital: number }) => void;
}

const DEFAULT_NEWS = [
  {
    title: "Bitcoin breaks consolidation band as volume spikes across top venues",
    source: "CoinDesk",
    time: "18m ago",
  },
  {
    title: "Somnia Shannon testnet records high TPS during high-frequency volatility test",
    source: "Somnia Blog",
    time: "42m ago",
  },
  {
    title: "Macro interest rate expectations adjust ahead of upcoming central bank decisions",
    source: "Bloomberg",
    time: "1h ago",
  },
];

export const ContextPanel: React.FC<ContextPanelProps> = ({
  symbol,
  debate,
  debateLoading = false,
  signals = [],
  news = DEFAULT_NEWS,
  onViewDebate,
  onSimulate,
}) => {
  return (
    <aside className="w-full flex flex-col divide-y divide-[#2A2A3D] bg-[#111118] text-gray-300 text-xs">
      {/* 1. Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-[#13131D]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="stat-label text-violet-300">MARKET CONTEXT</span>
        </div>
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
          RAG Intel Engine
        </span>
      </div>

      {/* 2. Dual AI Debate Summary & Confidence */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold tracking-wide">
            Dual AI Outlook
          </span>
          <span className="text-[10px] font-mono text-violet-400">{symbol}</span>
        </div>

        {debateLoading ? (
          <div className="flex flex-col gap-2 py-2">
            <div className="skeleton h-3.5 w-full rounded" />
            <div className="skeleton h-3.5 w-4/5 rounded" />
            <div className="skeleton h-3.5 w-3/5 rounded" />
          </div>
        ) : debate ? (
          <div className="flex flex-col gap-3 fade-in">
            <p className="text-gray-300 text-[11px] leading-relaxed bg-[#161622] p-2.5 rounded border border-[#2A2A3D]/70">
              {debate.bullCase?.summary?.slice(0, 140) ||
                "Evidence synthesis indicates moderate upward momentum backed by orderflow."}
              ...
            </p>

            {/* Confidence Gauges */}
            <div className="flex flex-col gap-1.5 font-mono text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-semibold">Alpha Bull</span>
                <span className="text-gray-300 font-medium">
                  {debate.bullCase?.confidence ?? 62}%
                </span>
              </div>
              <div className="w-full bg-[#1F1F2E] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${debate.bullCase?.confidence ?? 62}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-rose-400 font-semibold">Macro Bear</span>
                <span className="text-gray-300 font-medium">
                  {debate.bearCase?.confidence ?? 38}%
                </span>
              </div>
              <div className="w-full bg-[#1F1F2E] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${debate.bearCase?.confidence ?? 38}%` }}
                />
              </div>
            </div>

            <button
              onClick={onViewDebate}
              className="w-full mt-1 py-1.5 px-3 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-700/50 text-violet-300 rounded font-mono text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
            >
              <span>View Full AI Debate & Evidence</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-[11px]">Select a market to generate live debate synthesis.</p>
        )}
      </div>

      {/* 3. Key Contextual Events */}
      <div className="p-4 flex flex-col gap-3">
        <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold tracking-wide">
          Key Correlated Events
        </span>

        <div className="flex flex-col gap-3">
          <div className="border-l-2 border-violet-500 pl-2.5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>14:32 UTC</span>
              <span className="text-violet-400 font-medium">Spike Detected</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-snug">
              Significant market movement coincided with elevated DEX volume.
            </p>
            <button
              onClick={onViewDebate}
              className="text-[10px] font-mono text-violet-400 hover:text-violet-300 w-fit mt-0.5"
            >
              [View Evidence]
            </button>
          </div>

          <div className="border-l-2 border-emerald-500/60 pl-2.5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>13:47 UTC</span>
              <span className="text-emerald-400 font-medium">Volume Surge</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-snug">
              Trading volume increased 42% around this time across correlated pairs.
            </p>
            <button
              onClick={onViewDebate}
              className="text-[10px] font-mono text-violet-400 hover:text-violet-300 w-fit mt-0.5"
            >
              [View Evidence]
            </button>
          </div>

          <div className="border-l-2 border-gray-600 pl-2.5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>12:20 UTC</span>
              <span className="text-gray-400 font-medium">Macro Catalyst</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-snug">
              Market movement followed related asset volatility of +3.1%.
            </p>
            <button
              onClick={onViewDebate}
              className="text-[10px] font-mono text-violet-400 hover:text-violet-300 w-fit mt-0.5"
            >
              [View Evidence]
            </button>
          </div>
        </div>
      </div>

      {/* 4. Quick Scenario Simulation */}
      <div className="p-4 flex flex-col gap-2.5 bg-[#13131D]">
        <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold tracking-wide">
          Quick Scenario PnL
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSimulate({ outcome: "YES", capital: 100 })}
            className="py-2 px-3 bg-emerald-950/40 border border-emerald-600/40 hover:bg-emerald-900/50 text-emerald-300 rounded font-mono text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            Simulate YES $100
          </button>
          <button
            onClick={() => onSimulate({ outcome: "NO", capital: 100 })}
            className="py-2 px-3 bg-rose-950/40 border border-rose-600/40 hover:bg-rose-900/50 text-rose-300 rounded font-mono text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            Simulate NO $100
          </button>
        </div>
      </div>

      {/* 5. News Feed */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold tracking-wide">
              Market Ingestion Feed
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {news.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-0.5 group">
              <span className="text-gray-200 text-[11px] leading-snug group-hover:text-violet-300 transition-colors">
                {item.title}
              </span>
              <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500">
                <span className="text-violet-400">{item.source}</span>
                <span>•</span>
                <span>{item.published_at ? new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.time || "Recent"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
export default ContextPanel;
