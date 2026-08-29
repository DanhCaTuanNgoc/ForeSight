import React, { useState, useCallback, useEffect } from 'react';
import { apiUrl } from '../utils/api.js';

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

// ─── Category styles ──────────────────────────────────────────────────────────
const CATEGORY_COLOR: Record<string, string> = {
  spike:  'border-violet-500 bg-violet-500',
  news:   'border-blue-500 bg-blue-500',
  volume: 'border-yellow-500 bg-yellow-500',
  settle: 'border-gray-500 bg-gray-500',
};

const CATEGORY_LABEL: Record<string, string> = {
  spike:  'PRICE SPIKE',
  news:   'NEWS',
  volume: 'VOLUME',
  settle: 'SETTLEMENT',
};

// ─── Component ────────────────────────────────────────────────────────────────
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
      description: 'Dual AI Debate consensus synthesized: Alpha Bull 68% vs Macro Bear 32%.',
      priceBefore: 0.48,
      priceAfter: 0.60,
      category: 'spike' as const,
    },
    {
      id: 'e3',
      time: formatHhMm(now - 15 * 60_000),
      timestamp: now - 15 * 60_000,
      title: 'Grounded Macro Ingestion Sync',
      description: 'Live news RSS stream synced to Somnia indexer with verified citations.',
      category: 'news' as const,
    },
  ]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeEvent = events.find(e => e.id === activeId) ?? null;

  const handleDotClick = useCallback((id: string) => {
    setActiveId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div className="panel rounded-[4px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2A2A3D]">
        <span className="stat-label">EVENT TIMELINE</span>
        <span className="text-[10px] text-gray-600 mono">{symbol}</span>
      </div>

      {/* Timeline track */}
      <div className="px-4 pt-5 pb-3">
        <div className="relative">
          {/* Horizontal line */}
          <div className="absolute top-[5px] left-0 right-0 h-px bg-[#2A2A3D]" />

          {/* Dots */}
          <div className="relative flex justify-between">
            {events.map((event) => {
              const isActive = activeId === event.id;
              const dotColor = CATEGORY_COLOR[event.category] ?? 'border-gray-500 bg-gray-500';
              return (
                <div key={event.id} className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={() => handleDotClick(event.id)}
                  title={event.title}
                >
                  {/* Dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-150 ${
                      isActive
                        ? `${dotColor} scale-[1.4] shadow-[0_0_8px_rgba(124,58,237,0.6)]`
                        : 'border-[#3A3A52] bg-[#0A0A0F] group-hover:border-violet-400 group-hover:scale-110'
                    }`}
                  />
                  {/* Time label */}
                  <span className={`mono text-[9px] whitespace-nowrap ${isActive ? 'text-violet-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {event.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event detail panel (opens on click) */}
      {activeEvent && (
        <div className="mx-4 mb-4 border border-violet-600/30 rounded-[3px] bg-violet-600/5 px-4 py-3 fade-in">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className={`tag text-[9px] px-1.5 py-0.5 rounded-sm border ${
                activeEvent.category === 'spike'  ? 'border-violet-500/40 text-violet-400 bg-violet-500/10' :
                activeEvent.category === 'news'   ? 'border-blue-500/40 text-blue-400 bg-blue-500/10' :
                activeEvent.category === 'volume' ? 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10' :
                'border-gray-500/40 text-gray-400 bg-gray-500/10'
              }`}>
                {CATEGORY_LABEL[activeEvent.category]}
              </span>
              <span className="mono text-[10px] text-gray-500 ml-2">{activeEvent.time} UTC</span>
            </div>
            <button
              onClick={() => setActiveId(null)}
              className="text-gray-600 hover:text-gray-400 text-[14px] leading-none"
            >×</button>
          </div>

          <p className="text-[12px] text-white font-medium mb-1">{activeEvent.title}</p>
          <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{activeEvent.description}</p>

          {activeEvent.priceBefore !== undefined && activeEvent.priceAfter !== undefined && (
            <div className="flex items-center gap-2 mb-2">
              <span className="stat-label">MARKET MOVEMENT</span>
              <span className="mono text-[11px] text-gray-400">
                ${activeEvent.priceBefore.toFixed(4)}
                <span className="text-gray-600 mx-1">→</span>
                <span className="text-green-400">${activeEvent.priceAfter.toFixed(4)}</span>
              </span>
            </div>
          )}

          <button className="text-[10px] text-violet-400 hover:text-violet-300 border border-violet-600/30 hover:border-violet-500/50 px-2.5 py-1 rounded-[3px] transition-colors mono font-medium">
            View Evidence →
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 pb-3">
        {Object.entries(CATEGORY_LABEL).map(([cat, label]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLOR[cat].split(' ')[1]}`} />
            <span className="text-[9px] text-gray-600 uppercase font-medium tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventTimeline;
