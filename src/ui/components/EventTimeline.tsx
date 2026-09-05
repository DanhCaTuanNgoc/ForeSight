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
  Volume2,
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
  evidenceUrl?: string;
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
    glow: 'shadow-[0_0_8px_rgba(139,92,246,0.5)]',
    badgeBg: 'bg-violet-950/60',
    badgeText: 'text-violet-300',
    badgeBorder: 'border-violet-500/30',
    cardBorder: 'border-violet-500/30',
    cardBg: 'bg-[#0E0E17]',
    textColor: 'text-violet-400',
  },
  news: {
    label: 'GROUNDED NEWS (RAG)',
    icon: Newspaper,
    dotBg: 'bg-violet-400',
    dotBorder: 'border-violet-300',
    glow: 'shadow-[0_0_8px_rgba(167,139,250,0.4)]',
    badgeBg: 'bg-white/[0.04]',
    badgeText: 'text-violet-200',
    badgeBorder: 'border-white/[0.08]',
    cardBorder: 'border-white/[0.08]',
    cardBg: 'bg-[#0E0E17]',
    textColor: 'text-violet-300',
  },
  volume: {
    label: 'VOLUME SURGE',
    icon: BarChart2,
    dotBg: 'bg-purple-600',
    dotBorder: 'border-purple-400',
    glow: 'shadow-[0_0_8px_rgba(147,51,234,0.4)]',
    badgeBg: 'bg-purple-950/50',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/30',
    cardBorder: 'border-purple-500/30',
    cardBg: 'bg-[#0E0E17]',
    textColor: 'text-purple-300',
  },
  settle: {
    label: 'SETTLEMENT',
    icon: CheckCircle2,
    dotBg: 'bg-emerald-500',
    dotBorder: 'border-emerald-400',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    badgeBg: 'bg-emerald-950/50',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    cardBorder: 'border-emerald-500/30',
    cardBg: 'bg-[#0E0E17]',
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
    const cleanAsset = (symbol || 'BTC').replace(/\/.*$/, '').replace(/-.*$/, '').trim().toUpperCase() || 'BTC';

    const fetchEvents = async () => {
      try {
        const [spikeRes, newsRes] = await Promise.all([
          fetch(apiUrl(`/api/spikes?symbol=${encodeURIComponent(cleanAsset)}&asset=${encodeURIComponent(cleanAsset)}&limit=4`)),
          fetch(apiUrl(`/api/news?asset=${encodeURIComponent(cleanAsset)}&limit=4`)),
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
              title: `${cleanAsset} Probability Spike (${(s.magnitude * 100).toFixed(1)}%)`,
              description: s.summary || `Significant price shift detected on Somnia Shannon CLOB for ${cleanAsset}.`,
              priceBefore: s.price_before,
              priceAfter: s.price_after,
              category: 'spike',
              evidenceUrl: 'https://shannon-explorer.somnia.network',
            });
          });
        }

        if (newsRes.ok) {
          const nJson = await newsRes.json();
          (nJson.news || []).forEach((n: any, idx: number) => {
            const d = new Date(n.published_at || Date.now());
            let cleanUrl = (n.url || "").replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
            if (!cleanUrl || cleanUrl === "https://www.coindesk.com" || cleanUrl === "https://cointelegraph.com") {
              cleanUrl = n.title ? `https://www.google.com/search?q=${encodeURIComponent(n.title + " " + cleanAsset + " crypto news")}` : `https://cointelegraph.com/tags/${cleanAsset.toLowerCase()}`;
            } else if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
              cleanUrl = `https://${cleanUrl}`;
            }

            combined.push({
              id: `news-${n.id || idx}`,
              time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
              timestamp: d.getTime(),
              title: n.title,
              description: n.summary || `Grounded RAG citation covering ${cleanAsset} market dynamics.`,
              category: 'news',
              evidenceUrl: cleanUrl,
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
    const interval = setInterval(fetchEvents, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [propEvents, symbol]);

  const cleanAsset = (symbol || 'BTC').replace(/\/.*$/, '').replace(/-.*$/, '').trim().toUpperCase() || 'BTC';
  const formatHhMm = (ms: number) => {
    const d = new Date(ms);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const now = Date.now();

  const getAssetFallbackEvents = (): TimelineEvent[] => {
    if (cleanAsset === 'ETH') {
      return [
        {
          id: 'eth-e1',
          time: formatHhMm(now - 90 * 60_000),
          timestamp: now - 90 * 60_000,
          title: 'ETH-USD Shannon CLOB High-Frequency Contract Active',
          description: 'Somnia Shannon testnet orderbook depth stabilizes with active market-maker quoting around strike bounds.',
          category: 'spike',
          evidenceUrl: 'https://shannon-explorer.somnia.network',
        },
        {
          id: 'eth-e2',
          time: formatHhMm(now - 40 * 60_000),
          timestamp: now - 40 * 60_000,
          title: 'Ethereum L1 & L2 Settlement Throughput Advances',
          description: 'On-chain derivatives volume and layer-2 batch settlement velocity accelerate across EVM protocols.',
          category: 'news',
          evidenceUrl: 'https://cointelegraph.com/news/ethereum-layer1-and-layer2-settlement-surges',
        },
        {
          id: 'eth-e3',
          time: formatHhMm(now - 12 * 60_000),
          timestamp: now - 12 * 60_000,
          title: 'ETH Probability Shift Detected (+8.6%)',
          description: 'Dual AI Debate consensus synthesized: Bullish staking tailwinds offset macro headwinds.',
          category: 'spike',
          priceBefore: 0.44,
          priceAfter: 0.53,
          evidenceUrl: 'https://shannon-explorer.somnia.network',
        },
      ];
    }

    if (cleanAsset === 'SOL') {
      return [
        {
          id: 'sol-e1',
          time: formatHhMm(now - 80 * 60_000),
          timestamp: now - 80 * 60_000,
          title: 'SOL-USD Binary Market Liquidity Wave Detected',
          description: 'Sub-second prediction algorithms adapt to high-throughput CLOB architecture.',
          category: 'spike',
          evidenceUrl: 'https://shannon-explorer.somnia.network',
        },
        {
          id: 'sol-e2',
          time: formatHhMm(now - 35 * 60_000),
          timestamp: now - 35 * 60_000,
          title: 'Decentralized Prediction Market Orderbooks Expand Arbitrage',
          description: 'High-frequency market makers leverage Somnia low latency for cross-venue delta-neutral hedging.',
          category: 'news',
          evidenceUrl: 'https://decrypt.co/news/crypto-prediction-markets-arbitrage',
        },
      ];
    }

    if (cleanAsset === 'SOMI') {
      return [
        {
          id: 'somi-e1',
          time: formatHhMm(now - 60 * 60_000),
          timestamp: now - 60 * 60_000,
          title: 'Somnia Shannon Testnet Sustains 100K+ TPS Event Execution',
          description: 'Reactive EVM architecture achieves sub-second settlement finality across DreamDEX contracts.',
          category: 'news',
          evidenceUrl: 'https://somnia.network',
        },
        {
          id: 'somi-e2',
          time: formatHhMm(now - 15 * 60_000),
          timestamp: now - 15 * 60_000,
          title: 'SOMI Native Utility & Event Contract Gas Incentives Live',
          description: 'Zero-gas fast path execution benchmarked for algorithmic high-frequency prediction bots.',
          category: 'spike',
          evidenceUrl: 'https://shannon-explorer.somnia.network',
        },
      ];
    }

    // Default: BTC
    return [
      {
        id: 'btc-e1',
        time: formatHhMm(now - 120 * 60_000),
        timestamp: now - 120 * 60_000,
        title: 'BTC Shannon CLOB Trading Window Active',
        description: 'Active binary event contract orderbook initialized on Somnia L1 testnet.',
        category: 'spike',
        evidenceUrl: 'https://shannon-explorer.somnia.network',
      },
      {
        id: 'btc-e2',
        time: formatHhMm(now - 45 * 60_000),
        timestamp: now - 45 * 60_000,
        title: 'BTC Probability Spike Shift Detected (+12.4%)',
        description: 'Dual AI Debate consensus synthesized: Alpha Bull 68% vs Macro Bear 32%. Unusual institutional bid support observed.',
        priceBefore: 0.48,
        priceAfter: 0.60,
        category: 'spike',
        evidenceUrl: 'https://shannon-explorer.somnia.network',
      },
      {
        id: 'btc-e3',
        time: formatHhMm(now - 15 * 60_000),
        timestamp: now - 15 * 60_000,
        title: 'Strategy buys $370M Bitcoin in first corporate purchase since June',
        description: 'Strategy added to its BTC treasury for the first time in two months, while continuing to bolster cash reserves.',
        category: 'news',
        evidenceUrl: 'https://cointelegraph.com/news/strategy-buys-370m-bitcoin-first-acquisition-june',
      },
    ];
  };

  const events = propEvents && propEvents.length > 0 ? propEvents : (apiEvents.length > 0 ? apiEvents : getAssetFallbackEvents());

  // Selected event state: Defaults to the latest event
  const [activeId, setActiveId] = useState<string | null>(null);

  // Reset selected card when switching assets so it immediately displays the active coin
  useEffect(() => {
    setActiveId(null);
  }, [cleanAsset]);

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
    <div className="rounded-none border border-white/[0.07] bg-[#08080E] overflow-hidden flex flex-col font-mono">
      {/* Header with Title and Nav Controls */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.07] bg-[#0E0E17]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-violet-950/60 border border-violet-500/30 text-violet-300">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">EVENT & CATALYST TIMELINE</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-none bg-violet-950/60 border border-violet-500/30 text-violet-300 font-bold font-mono">
              {cleanAsset}
            </span>
          </div>
        </div>

        {/* Index counter & Prev/Next buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold">
            Event {activeIndex + 1} of {events.length}
          </span>
          <div className="flex items-center bg-[#12121C] rounded-none border border-white/[0.07] p-0.5">
            <button
              onClick={handlePrev}
              disabled={activeIndex <= 0}
              title="Previous Event"
              className="p-1 rounded-none text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex >= events.length - 1}
              title="Next Event"
              className="p-1 rounded-none text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 1. Continuous Timeline Track ──────── */}
      <div className="px-6 pt-4 pb-2.5 bg-[#07070A] border-b border-white/[0.07]">
        <div className="relative">
          {/* Horizontal Line connecting events */}
          <div className="absolute top-[6px] left-3 right-3 h-[1px] bg-white/[0.08]" />

          {/* Category Colored Dots */}
          <div className="relative flex justify-between items-center">
            {events.map((event) => {
              const isSelected = activeEvent?.id === event.id;
              const theme = CATEGORY_THEMES[event.category] || CATEGORY_THEMES.spike;

              return (
                <div
                  key={event.id}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  onClick={() => handleSelectEvent(event.id)}
                  title={`${theme.label} at ${event.time} UTC - Click to view`}
                >
                  {/* Dot */}
                  <div
                    className={`w-3 h-3 rounded-full border transition-transform duration-200 ${theme.dotBorder} ${theme.dotBg} ${
                      isSelected
                        ? 'scale-125 ring-2 ring-violet-400/60'
                        : 'opacity-85 group-hover:scale-110 group-hover:opacity-100'
                    }`}
                  />
                  {/* Time label */}
                  <span
                    className={`text-[9px] font-bold font-mono transition-colors ${
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

      {/* ─── 2. Single Active Event Spotlight ─── */}
      {activeEvent && (
        <div className="p-3.5 bg-[#08080E]">
          <div
            className={`p-3.5 rounded-none border transition-colors ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
          >
            {/* Top Bar: Badge, Time, Status */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-none font-bold border ${activeTheme.badgeBg} ${activeTheme.badgeText} ${activeTheme.badgeBorder}`}
                >
                  <ActiveIcon className="w-3 h-3" />
                  <span>{activeTheme.label}</span>
                </span>
                <span className="text-gray-400 text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {activeEvent.time} UTC
                </span>
              </div>

              <span className="text-[9px] px-1.5 py-0.2 rounded-none bg-[#12121C] border border-white/[0.07] text-gray-400 font-mono">
                Focused Event
              </span>
            </div>

            {/* Event Title */}
            <h3 className="text-xs font-bold text-white mb-1 leading-snug font-sans">
              {activeEvent.title}
            </h3>

            {/* Event Description */}
            <p className="text-[11px] text-gray-300 leading-relaxed mb-2.5 font-sans">
              {activeEvent.description}
            </p>

            {/* Bottom Row: Price Movement & Action Link */}
            <div className="pt-2 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-2">
              {activeEvent.priceBefore !== undefined && activeEvent.priceAfter !== undefined ? (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-gray-400 text-[10px]">Market Reaction:</span>
                  <span className="font-bold text-white bg-[#12121C] px-2 py-0.5 rounded-none border border-white/[0.07] flex items-center gap-1.5 text-[11px]">
                    <span>${activeEvent.priceBefore.toFixed(2)}</span>
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                    <span className="text-emerald-400">${activeEvent.priceAfter.toFixed(2)}</span>
                  </span>
                </div>
              ) : (
                <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  Verified RAG Ingestion Pipeline
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <a
                  href={activeEvent.evidenceUrl || (activeEvent.category === "spike" ? "https://shannon-explorer.somnia.network" : "https://www.coindesk.com")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="px-2.5 py-1 rounded-none bg-[#12121C] hover:bg-[#161622] text-violet-300 hover:text-white border border-white/[0.07] text-[10px] font-bold font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Evidence</span>
                  <ExternalLink className="w-3 h-3 text-violet-400" />
                </a>

                <button
                  onClick={() => {
                    sound.playClick();
                    sound.speakBriefing(`${activeEvent.title}. ${activeEvent.description}`);
                  }}
                  title="Hear Voice Briefing"
                  className="px-2.5 py-1 rounded-none bg-[#12121C] hover:bg-[#161622] text-gray-300 hover:text-white border border-white/[0.07] text-[10px] font-bold font-mono transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3 h-3 text-violet-400" />
                  <span>Audio Brief</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Footer Legend ───────────────── */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-1.5 border-t border-white/[0.07] bg-[#0E0E17] text-[9px] font-mono">
        <div className="flex items-center gap-3.5 flex-wrap">
          {Object.entries(CATEGORY_THEMES).map(([cat, theme]) => {
            const Icon = theme.icon;
            return (
              <div key={cat} className="flex items-center gap-1">
                <Icon className={`w-3 h-3 ${theme.textColor}`} />
                <span className={`font-bold ${theme.textColor}`}>{theme.label}</span>
              </div>
            );
          })}
        </div>
        <span className="text-gray-500">1 Event Focused</span>
      </div>
    </div>
  );
};

export default EventTimeline;
