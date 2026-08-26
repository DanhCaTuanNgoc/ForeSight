import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header.js";
import { MarketTicker } from "./components/MarketTicker.js";
import { MarketStats } from "./components/MarketStats.js";
import { PriceChart } from "./components/PriceChart.js";
import { DepthChart } from "./components/DepthChart.js";
import { EventTimeline } from "./components/EventTimeline.js";
import { Heatmap } from "./components/Heatmap.js";
import { ActivityTable } from "./components/ActivityTable.js";
import { ContextPanel } from "./components/ContextPanel.js";
import { DualDebateModal } from "./components/DualDebateModal.js";
import { ScenarioSimulator } from "./components/ScenarioSimulator.js";
import { LandingPage } from "./components/LandingPage.js";
import { Search } from "lucide-react";

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface Market {
  id: string;
  symbol: string;
  question: string;
  bestBid?: number;
  bestAsk?: number;
  probability?: number;
  expiresAt?: string;
  status?: string;
  volume24h?: number;
  midPrice?: number;
  underlyingAsset?: string;
}

export interface Position {
  id: string;
  symbol: string;
  outcome: string;
  amount: number;
  entryPrice: number;
  timestamp: number;
  status: "OPEN" | "SETTLED";
}

const FALLBACK_MARKETS: Market[] = [
  {
    id: "btc-hourly-1",
    symbol: "BTC",
    underlyingAsset: "BTC",
    question: "Will BTC close above $78,500 at 16:00 UTC?",
    bestBid: 0.61,
    bestAsk: 0.63,
    probability: 62.4,
    midPrice: 0.62,
    status: "TRADING",
    volume24h: 342900,
  },
  {
    id: "eth-hourly-1",
    symbol: "ETH",
    underlyingAsset: "ETH",
    question: "Will ETH close above $2,480 at 16:00 UTC?",
    bestBid: 0.44,
    bestAsk: 0.46,
    probability: 45.1,
    midPrice: 0.45,
    status: "TRADING",
    volume24h: 189400,
  },
  {
    id: "sol-hourly-1",
    symbol: "SOL",
    underlyingAsset: "SOL",
    question: "Will SOL trade above $185 within the next 4 hours?",
    bestBid: 0.53,
    bestAsk: 0.55,
    probability: 54.0,
    midPrice: 0.54,
    status: "TRADING",
    volume24h: 98150,
  },
  {
    id: "somi-hourly-1",
    symbol: "SOMI",
    underlyingAsset: "SOMI",
    question: "Will Somnia Shannon Testnet TPS exceed 10,000 today?",
    bestBid: 0.72,
    bestAsk: 0.75,
    probability: 73.8,
    midPrice: 0.735,
    status: "TRADING",
    volume24h: 51240,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [health, setHealth] = useState<any>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeRange, setTimeRange] = useState<"15m" | "1H" | "4H" | "1D">("1H");
  const [positions, setPositions] = useState<Position[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [debate, setDebate] = useState<any>(null);
  const [debateLoading, setDebateLoading] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Modals & Interactive simulation state
  const [isDebateModalOpen, setIsDebateModalOpen] = useState<boolean>(false);
  const [prefillOutcome, setPrefillOutcome] = useState<"YES" | "NO">("YES");
  const [prefillTargetExit, setPrefillTargetExit] = useState<number | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch System Health
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) setHealth(await res.json());
    } catch {
      setHealth({ network: "Somnia Shannon", chainId: 50312, canTrade: false, mode: "simulation" });
    }
  }, []);

  // 2. Fetch Markets
  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch("/api/markets");
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.markets || [];
        if (rawList.length > 0) {
          const parsed = rawList.map((m: any) => ({
            id: m.id || m.marketId || m.symbol,
            symbol: m.underlyingAsset || m.symbol?.split("-")[0] || "BTC",
            underlyingAsset: m.underlyingAsset || "BTC",
            question: m.question || `Will ${m.symbol || "Asset"} reach target?`,
            bestBid: m.bestBid ?? 0.50,
            bestAsk: m.bestAsk ?? 0.52,
            probability: m.probability ?? (m.bestBid ? m.bestBid * 100 : 50),
            midPrice: m.midPrice ?? 0.51,
            status: m.status || "TRADING",
            volume24h: m.volume24h || 120000,
          }));
          setMarkets(parsed);
          if (!selectedMarket) setSelectedMarket(parsed[0]);
          return;
        }
      }
    } catch (e) {
      console.warn("Markets API fetch fallback:", e);
    }
    setMarkets(FALLBACK_MARKETS);
    if (!selectedMarket) setSelectedMarket(FALLBACK_MARKETS[0]);
  }, [selectedMarket]);

  // 3. Fetch Positions
  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch("/api/positions");
      if (res.ok) {
        const data = await res.json();
        setPositions(Array.isArray(data) ? data : data.positions || []);
      }
    } catch {
      // Keep default
    }
  }, []);

  // 4. Fetch News
  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch("/api/news?limit=4");
      if (res.ok) {
        const data = await res.json();
        setNews(Array.isArray(data) ? data : data.news || []);
      }
    } catch {
      // Keep default
    }
  }, []);

  // 5. Fetch Debate Synthesis
  const fetchDebate = useCallback(async (sym: string) => {
    if (!sym) return;
    setDebateLoading(true);
    try {
      const res = await fetch(`/api/debate/${encodeURIComponent(sym)}`);
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

  // Initial Load & Interval Poll
  useEffect(() => {
    fetchHealth();
    fetchMarkets();
    fetchPositions();
    fetchNews();
  }, [fetchHealth, fetchMarkets, fetchPositions, fetchNews]);

  useEffect(() => {
    if (selectedMarket) {
      fetchDebate(selectedMarket.underlyingAsset || selectedMarket.symbol);
    }
  }, [selectedMarket, fetchDebate]);

  // Sweep & Claim All Winnings
  const handleClaimAll = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch("/api/claim", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(`Swept and claimed ${data.claimedCount || 1} settled positions!`, "success");
        await fetchPositions();
      } else {
        showToast(data.error || "No claimable settled positions found.", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to sweep winnings", "error");
    } finally {
      setIsClaiming(false);
    }
  };

  // Trade Execution
  const handleExecuteTrade = async (
    symbol: string,
    outcome: "YES" | "NO",
    amount: number,
    price?: number
  ) => {
    setIsSubmittingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          marketId: selectedMarket?.id,
          outcome,
          amount,
          price,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Order executed: ${amount.toFixed(1)} ${outcome} contracts on ${symbol}`,
          "success"
        );
        await fetchPositions();
      } else {
        showToast(data.error || "Order execution failed", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Order network error", "error");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Filtered Markets for Sidebar
  const filteredMarkets = markets.filter(
    (m) =>
      m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMarket = selectedMarket || markets[0] || FALLBACK_MARKETS[0];

  // ─── If Landing Page is Active ───────────────────────────────────────────────
  if (activeTab === "landing") {
    return <LandingPage onLaunchTerminal={() => setActiveTab("markets")} />;
  }

  // ─── Else Render Full Trading Terminal ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#E2E8F0] flex flex-col font-sans selection:bg-violet-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-14 right-5 z-50 px-4 py-2.5 rounded shadow-xl border font-mono text-xs fade-in ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
              : "bg-rose-950/90 text-rose-300 border-rose-500/50"
          }`}
        >
          {toastMessage.msg}
        </div>
      )}

      {/* 1. Global Header */}
      <Header
        health={health}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClaimAll={handleClaimAll}
        isClaiming={isClaiming}
        onConnectWallet={() =>
          showToast("MetaMask / Viem integration active in next step!", "success")
        }
      />

      {/* 2. Scrolling Market Ticker */}
      <MarketTicker />

      {/* 3. Main Dashboard Layout (3-Column Dense Exchange Layout) */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT COLUMN: Market Navigator ───────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 border-r border-[#2A2A3D] bg-[#0E0E16] flex-shrink-0">
          {/* Search Bar */}
          <div className="p-3 border-b border-[#2A2A3D]">
            <div className="flex items-center bg-[#141420] border border-[#2A2A3D] rounded px-2.5 py-1.5 gap-2">
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-gray-200 placeholder-gray-600 outline-none w-full font-mono"
              />
            </div>
          </div>

          <div className="px-3 py-2 border-b border-[#2A2A3D]/60 flex items-center justify-between">
            <span className="stat-label">PREDICTION MARKETS</span>
            <span className="text-[10px] font-mono text-violet-400">
              {filteredMarkets.length} LIVE
            </span>
          </div>

          {/* Market List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2A2A3D]/30 custom-scrollbar">
            {filteredMarkets.map((m) => {
              const isSelected = activeMarket.id === m.id;
              const prob = m.probability ?? 50;
              const isYes = prob >= 50;

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMarket(m)}
                  className={`w-full text-left p-3 transition-colors duration-150 flex flex-col gap-1 ${
                    isSelected
                      ? "bg-violet-950/25 border-l-2 border-violet-500"
                      : "hover:bg-[#151522]"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-violet-300" : "text-gray-200"
                      }`}
                    >
                      {m.symbol}/tUSDC
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isYes ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {prob.toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-tight">
                    {m.question}
                  </p>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span>Bid: ${m.bestBid ? m.bestBid.toFixed(2) : "—"}</span>
                    <span>Ask: ${m.bestAsk ? m.bestAsk.toFixed(2) : "—"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── CENTER COLUMN: Primary Chart & Technical Analytics ──────── */}
        <main className="flex-1 overflow-y-auto flex flex-col min-w-0 bg-[#0A0A0F]">
          {/* Market Header Stats */}
          <MarketStats market={activeMarket} serverMode={health?.mode} />

          {/* Chart + Simulator + Secondary Panels */}
          <div className="p-4 space-y-4 max-w-7xl">
            {/* Primary Interactive Chart */}
            <PriceChart
              symbol={activeMarket.underlyingAsset || activeMarket.symbol}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              currentPrice={activeMarket.probability}
            />

            {/* Deterministic Scenario Simulator */}
            <ScenarioSimulator
              market={activeMarket}
              prefillOutcome={prefillOutcome}
              prefillTargetExit={prefillTargetExit}
              onTrade={handleExecuteTrade}
              isSubmitting={isSubmittingOrder}
              showToast={showToast}
            />

            {/* Event Timeline (What Happened?) */}
            <EventTimeline symbol={activeMarket.underlyingAsset || activeMarket.symbol} />

            {/* Bottom Row: Depth Chart + Recent Activity + Heatmap */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <DepthChart
                symbol={activeMarket.underlyingAsset || activeMarket.symbol}
                midPrice={activeMarket.midPrice || 0.50}
              />
              <ActivityTable
                positions={positions}
                onClaim={handleClaimAll}
                isClaiming={isClaiming}
              />
              <div className="md:col-span-2 xl:col-span-1">
                <Heatmap />
              </div>
            </div>
          </div>
        </main>

        {/* ── RIGHT COLUMN: RAG Intelligence & Market Context ─────────── */}
        <aside className="hidden 2xl:flex flex-col w-80 border-l border-[#2A2A3D] bg-[#0E0E16] flex-shrink-0 overflow-y-auto custom-scrollbar">
          <ContextPanel
            symbol={activeMarket.underlyingAsset || activeMarket.symbol}
            debate={debate}
            debateLoading={debateLoading}
            news={news}
            onViewDebate={() => setIsDebateModalOpen(true)}
            onSimulate={({ outcome, capital }) => {
              setPrefillOutcome(outcome);
              showToast(`Loaded ${outcome} scenario into simulator!`, "success");
            }}
          />
        </aside>
      </div>

      {/* Dual AI Agent Arena Modal */}
      <DualDebateModal
        isOpen={isDebateModalOpen}
        onClose={() => setIsDebateModalOpen(false)}
        spike={null}
        symbol={activeMarket.underlyingAsset || activeMarket.symbol}
        onLoadScenario={(outcome, targetExit) => {
          setPrefillOutcome(outcome);
          setPrefillTargetExit(targetExit);
          showToast(`Applied ${outcome} strategy with target ${Math.round(targetExit * 100)}% to simulator!`);
        }}
      />
    </div>
  );
}
