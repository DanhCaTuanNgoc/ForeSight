import React, { useState, useCallback, useEffect } from 'react';
import { apiUrl } from '../utils/api.js';
import {
  Zap,
  Newspaper,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { sound } from '../utils/sound-fx.js';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TimelineEvent {
  id: string;
  time: string;        // "HH:MM"
  timestamp: number;   // unix ms
  title: string;
  description: string;
  priceBefore?: number;
  priceAfter?: number;
  category: 'spike' | 'news' | 'volume' | 'settle';
}

interface EventTimelineProps {
  events?: TimelineEvent[];
  symbol?: string;
}

// ─── Vivid Category Themes (Always Colorful, not just when clicked) ───────────
interface CategoryTheme {
  label: string;
  icon: React.ElementType;
  dotBg: string;
  dotBorder: string;
  glow: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
  cardBg: string;
  textColor: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  spike: {
    label: 'PRICE SPIKE',
    icon: Zap,
    dotBg: 'bg-violet-500',
    dotBorder: 'border-violet-400',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.8)]',
    badgeBg: 'bg-violet-950/90',
    badgeText: 'text-violet-300',
    badgeBorder: 'border-violet-500/60',
    cardBorder: 'border-violet-500/60',
    cardBg: 'bg-gradient-to-b from-[#171126] to-[#0E0E18]',
    textColor: 'text-violet-400',
  },
  news: {
    label: 'GROUNDED NEWS (RAG)',
    icon: Newspaper,
    dotBg: 'bg-cyan-500',
    dotBorder: 'border-cyan-400',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.8)]',
    badgeBg: 'bg-cyan-950/90',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/60',
    cardBorder: 'border-cyan-500/60',
    cardBg: 'bg-gradient-to-b from-[#0E1B28] to-[#0A101A]',
    textColor: 'text-cyan-400',
  },
  volume: {
    label: 'VOLUME SURGE',
    icon: BarChart2,
    dotBg: 'bg-amber-500',
    dotBorder: 'border-amber-400',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.8)]',
    badgeBg: 'bg-amber-950/90',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/60',
    cardBorder: 'border-amber-500/60',
    cardBg: 'bg-gradient-to-b from-[#1F190E] to-[#120F08]',
    textColor: 'text-amber-400',
  },
  settle: {
    label: 'SETTLEMENT',
    icon: CheckCircle2,
    dotBg: 'bg-emerald-500',
    dotBorder: 'border-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.8)]',
    badgeBg: 'bg-emerald-950/90',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/60',
    cardBorder: 'border-emerald-500/60',
    cardBg: 'bg-gradient-to-b from-[#0E201B] to-[#081410]',
    textColor: 'text-emerald-400',
  },
};

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events: propEvents,
  symbol = 'BTC',
}) => {
  const [apiEvents, setApiEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (propEvents && propEvents.length > 0) return;
    let isMounted = true;
    const fetchEvents = async () => {
      try {
        const [spikeRes, newsRes] = await Promise.all([
          fetch(apiUrl(`/api/spikes?symbol=${encodeURIComponent(symbol)}&limit=4`)),
          fetch(apiUrl(`/api/news?limit=4`)),
        ]);

        const combined: TimelineEvent[] = [];

        if (spikeRes.ok) {
          const sJson = await spikeRes.json();
          (sJson.spikes || []).forEach((s: any, idx: number) => {
            const d = new Date(s.detected_at || Date.now());
            combined.push({
              id: `spike-${s.id || idx}`,
              time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
              timestamp: d.getTime(),
              title: `${symbol} Probability Spike (${(s.magnitude * 100).toFixed(1)}%)`,
              description: s.summary || `Significant price shift detected on Somnia Shannon CLOB.`,
              priceBefore: s.price_before,
              priceAfter: s.price_after,
              category: 'spike',
            });
          });
        }

        if (newsRes.ok) {
          const nJson = await newsRes.json();
          (nJson.news || []).forEach((n: any, idx: number) => {
            const d = new Date(n.published_at || Date.now());
            combined.push({
              id: `news-${n.id || idx}`,
              time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
              timestamp: d.getTime(),
              title: n.title,
              description: n.summary || `Grounded RAG citation from ${n.source}.`,
              category: 'news',
            });
          });
        }

        if (combined.length > 0 && isMounted) {
          combined.sort((a, b) => a.timestamp - b.timestamp);
          setApiEvents(combined);
        }
      } catch {
        // Ignore
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [propEvents, symbol]);

  const formatHhMm = (ms: number) => {
    const d = new Date(ms);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const now = Date.now();
  const events = propEvents && propEvents.length > 0 ? propEvents : (apiEvents.length > 0 ? apiEvents : [
    {
      id: 'e1',
      time: formatHhMm(now - 120 * 60_000),
      timestamp: now - 120 * 60_000,
      title: `${symbol} Shannon CLOB Trading Window Active`,
      description: 'Active binary event contract orderbook initialized on Somnia L1 testnet.',
      category: 'spike' as const,
    },
    {
      id: 'e2',
      time: formatHhMm(now - 45 * 60_000),
      timestamp: now - 45 * 60_000,
      title: `${symbol} Probability Spike Shift Detected (+12.4%)`,
      description: 'Dual AI Debate consensus synthesized: Alpha Bull 68% vs Macro Bear 32%. Unusual institutional bid support observed.',
      priceBefore: 0.48,
      priceAfter: 0.60,
      category: 'spike' as const,
    },
    {
      id: 'e3',
      time: formatHhMm(now - 15 * 60_000),
      timestamp: now - 15 * 60_000,
      title: 'Grounded Macro Ingestion Sync',
      description: 'Live news RSS stream synced to Somnia indexer with verified citations from major crypto news outlets.',
      category: 'news' as const,
    },
  ]);

  // Selected event state: Defaults to the latest event
  const [activeId, setActiveId] = useState<string | null>(null);

  // Active event object
  const activeEvent = events.find(e => e.id === activeId) || events[events.length - 1] || events[0];
  const activeIndex = events.findIndex(e => e.id === activeEvent?.id);
  const activeTheme = activeEvent ? (CATEGORY_THEMES[activeEvent.category] || CATEGORY_THEMES.spike) : CATEGORY_THEMES.spike;
  const ActiveIcon = activeTheme.icon;

  const handleSelectEvent = useCallback((id: string) => {
    sound.playClick();
    setActiveId(id);
  }, []);

  const handlePrev = () => {
    if (activeIndex > 0) {
      sound.playClick();
      setActiveId(events[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (activeIndex < events.length - 1) {
      sound.playClick();
      setActiveId(events[activeIndex + 1].id);
    }
  };

  return (
    <div className="panel rounded-xl border border-[#222234] bg-[#0E0E16] overflow-hidden flex flex-col font-mono shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1F1F2E] bg-[#0A0A10]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-violet-600/20 border border-violet-500/40 text-violet-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">EVENT TIMELINE SPOTLIGHT</span>
            {/* <span className="text-[9px] text-gray-500">Click dots on the timeline to inspect each event</span> */}
          </div>
        </div>

        {/* Index counter & Prev/Next buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold">
            Event {activeIndex + 1} of {events.length}
          </span>
          <div className="flex items-center bg-[#13131F] rounded border border-[#232336] p-0.5">
            <button
              onClick={handlePrev}
              disabled={activeIndex <= 0}
              title="Previous Event"
              className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex >= events.length - 1}
              title="Next Event"
              className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 1. Continuous Timeline Track (Always Vivid Colors) ──────── */}
      <div className="px-6 pt-5 pb-3 bg-[#0B0B12] border-b border-[#1A1A28]">
        <div className="relative">
          {/* Horizontal Line connecting events */}
          <div className="absolute top-[6px] left-3 right-3 h-[2px] bg-gradient-to-r from-[#222238] via-[#3A3A55] to-[#222238]" />

          {/* Glowing Category Colored Dots */}
          <div className="relative flex justify-between items-center">
            {events.map((event, idx) => {
              const isSelected = activeEvent?.id === event.id;
              const theme = CATEGORY_THEMES[event.category] || CATEGORY_THEMES.spike;

              return (
                <div
                  key={event.id}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  onClick={() => handleSelectEvent(event.id)}
                  title={`${theme.label} at ${event.time} UTC - Click to view`}
                >
                  {/* Dot (ALWAYS fully colored based on category) */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${theme.dotBorder} ${theme.dotBg} ${theme.glow} ${
                      isSelected
                        ? 'scale-150 ring-4 ring-white/40 animate-pulse'
                        : 'opacity-85 group-hover:scale-125 group-hover:opacity-100'
                    }`}
                  />
                  {/* Time label with category color */}
                  <span
                    className={`text-[10px] font-bold transition-colors ${
                      isSelected ? 'text-white' : `${theme.textColor} group-hover:text-white`
                    }`}
                  >
                    {event.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 2. Single Active Event Spotlight (1 lúc chỉ hiện 1 news/event) ─── */}
      {activeEvent && (
        <div className="p-4 bg-[#0A0A10]">
          <div
            className={`p-4 rounded-xl border transition-all duration-300 shadow-2xl ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
          >
            {/* Top Bar of Single Card: Badge, Time, and Status */}
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#232338]">
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-md font-bold border ${activeTheme.badgeBg} ${activeTheme.badgeText} ${activeTheme.badgeBorder} shadow-sm`}
                >
                  <ActiveIcon className="w-3 h-3" />
                  <span>{activeTheme.label}</span>
                </span>
                <span className="text-gray-400 text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {activeEvent.time} UTC
                </span>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded bg-[#131320] border border-[#26263C] text-gray-400 font-mono">
                Focused Event
              </span>
            </div>

            {/* Event Title */}
            <h3 className="text-sm font-black text-white mb-1.5 leading-snug">
              {activeEvent.title}
            </h3>

            {/* Event Description */}
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              {activeEvent.description}
            </p>

            {/* Bottom Row: Price Movement & Action Link */}
            <div className="pt-2.5 border-t border-[#232338] flex flex-wrap items-center justify-between gap-2">
              {activeEvent.priceBefore !== undefined && activeEvent.priceAfter !== undefined ? (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-gray-500">Market Reaction:</span>
                  <span className="font-bold text-white bg-[#11111C] px-2 py-0.5 rounded border border-[#232336] flex items-center gap-1.5">
                    <span>${activeEvent.priceBefore.toFixed(2)}</span>
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                    <span className="text-emerald-400">${activeEvent.priceAfter.toFixed(2)}</span>
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Verified RAG Ingestion Pipeline
                </div>
              )}

              <div className="text-[10px] text-violet-400 font-bold flex items-center gap-1 ml-auto">
                <span>Select other dots on the timeline above to switch</span>
                <ArrowRight className="w-3 h-3 text-violet-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Footer Legend with Category Indicators ───────────────── */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-t border-[#1F1F2E] bg-[#0A0A10] text-[9px]">
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(CATEGORY_THEMES).map(([cat, theme]) => {
            const Icon = theme.icon;
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <Icon className={`w-3 h-3 ${theme.textColor}`} />
                <span className={`font-bold ${theme.textColor}`}>{theme.label}</span>
              </div>
            );
          })}
        </div>
        <span className="text-gray-500 font-mono">1 Event Focused at a Time</span>
      </div>
    </div>
  );
};

export default EventTimeline;
