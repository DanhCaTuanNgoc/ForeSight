import React, { useState, useCallback } from 'react';

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

// ─── Mock events ──────────────────────────────────────────────────────────────
const MOCK_EVENTS: TimelineEvent[] = [
  {
    id: 'e1',
    time: '10:00',
    timestamp: Date.now() - 6 * 3600_000,
    title: 'Market Opened',
    description: 'Market opened for trading at the start of the 24h window.',
    category: 'spike',
  },
  {
    id: 'e2',
    time: '11:47',
    timestamp: Date.now() - 5 * 3600_000,
    title: 'Volume Surge Detected',
    description: 'Trading volume increased 42% coincided with broader market activity.',
    category: 'volume',
  },
  {
    id: 'e3',
    time: '13:12',
    timestamp: Date.now() - 3.5 * 3600_000,
    title: 'Significant Price Movement',
    description: 'Market movement followed relevant information detected around this time.',
    priceBefore: 0.54,
    priceAfter: 0.67,
    category: 'spike',
  },
  {
    id: 'e4',
    time: '14:32',
    timestamp: Date.now() - 2 * 3600_000,
    title: 'News Signal Captured',
    description: 'Related macro event coincided with a 3.1% move in correlated assets.',
    category: 'news',
  },
  {
    id: 'e5',
    time: '15:58',
    timestamp: Date.now() - 0.5 * 3600_000,
    title: 'Settlement Approaching',
    description: 'Contract expires in under 2 hours. Market pricing reflects elevated uncertainty.',
    category: 'settle',
  },
];

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
  const events = propEvents && propEvents.length > 0 ? propEvents : MOCK_EVENTS;
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
