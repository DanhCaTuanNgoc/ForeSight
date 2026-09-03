import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header.js";
import { MarketTicker } from "./components/MarketTicker.js";
import { MarketStats } from "./components/MarketStats.js";
import { PriceChart, type CanvasVisualMode } from "./components/PriceChart.js";
import { ContextPanel } from "./components/ContextPanel.js";
import { DualDebateModal } from "./components/DualDebateModal.js";
import { ScenarioSimulator } from "./components/ScenarioSimulator.js";
import { LandingPage } from "./components/LandingPage.js";
import { WalletModal } from "./components/WalletModal.js";
import { ThesisHealthMonitor, type PositionRecord } from "./components/ThesisHealthMonitor.js";
import { AnalyticsView } from "./components/AnalyticsView.js";
import { InsightsView } from "./components/InsightsView.js";
import { ActivityView } from "./components/ActivityView.js";
import { WalletProvider, useWallet } from "./context/WalletContext.js";
import { CryptoIcon } from "./components/CryptoIcon.js";
import { sound } from "./utils/sound-fx.js";
import { apiUrl } from "./utils/api.js";
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

const FALLBACK_MARKETS: Market[] = [
  {
    id: "btc-hourly-1",
    symbol: "BTC",
    underlyingAsset: "BTC",
    question: "BTC closes at or above its opening price",
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
    question: "ETH closes at or above its opening price",
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
    question: "SOL closes at or above its opening price",
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
    question: "SOMI closes at or above its opening price",
    bestBid: 0.72,
    bestAsk: 0.75,
    probability: 73.8,
    midPrice: 0.735,
    status: "TRADING",
    volume24h: 51240,
  },
];

function ForeSightTerminalApp() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [health, setHealth] = useState<any>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeRange, setTimeRange] = useState<"15m" | "1H" | "4H" | "1D">("1H");
  const [visualMode, setVisualMode] = useState<CanvasVisualMode>("probability");
  const [positions, setPositions] = useState<PositionRecord[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [debate, setDebate] = useState<any>(null);
  const [debateLoading, setDebateLoading] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Modals & Interactive simulation state
  const [isDebateModalOpen, setIsDebateModalOpen] = useState<boolean>(false);
  const [prefillOutcome, setPrefillOutcome] = useState<"YES" | "NO">("YES");
  const [prefillEntryPrice, setPrefillEntryPrice] = useState<number>(0.55);
  const [prefillTargetExit, setPrefillTargetExit] = useState<number>(0.85);
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [tickers, setTickers] = useState<any[]>([]);

  const wallet = useWallet();

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch System Health
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/health"));
      if (res.ok) setHealth(await res.json());
    } catch {
      setHealth({ network: "Somnia Shannon", chainId: 50312, canTrade: false, mode: "simulation" });
    }
  }, []);

  // 2. Fetch Markets
  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/markets"));
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
          // Ensure core Somnia assets (SOL, SOMI) are always available in the UI
          const existingAssets = new Set(parsed.map((p: any) => (p.underlyingAsset || p.symbol).toUpperCase()));
          FALLBACK_MARKETS.forEach((fb) => {
            if (fb.underlyingAsset && !existingAssets.has(fb.underlyingAsset.toUpperCase())) {
              parsed.push(fb);
            }
          });

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

  // 3. Fetch Tickers Tape
  const fetchTickers = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/tickers"));
      if (res.ok) {
        const data = await res.json();
        if (data.tickers && data.tickers.length > 0) {
          setTickers(data.tickers);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // 4. Fetch Timeline Data from API
  const fetchTimelineData = useCallback(async (symbol: string, range: "15m" | "1H" | "4H" | "1D") => {
    if (!symbol) return;
    try {
      const msMap = { "15m": 900_000, "1H": 3600_000, "4H": 14400_000, "1D": 86400_000 };
      const from = new Date(Date.now() - msMap[range]).toISOString();
      const res = await fetch(apiUrl(`/api/timeline/${encodeURIComponent(symbol)}?from=${from}`));
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const formatted = json.data.map((d: any) => ({
            time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            price: d.mid_price,
            priceNo: Number((1 - d.mid_price).toFixed(4)),
            open: d.mid_price,
            high: d.best_ask || d.mid_price,
            low: d.best_bid || d.mid_price,
            close: d.mid_price,
            volume: d.volume_24h || 12000,
            isSpike: Boolean(d.is_spike),
          }));
          setTimelineData(formatted);
          return;
        }
      }
    } catch (e) {
      console.warn("Timeline fetch error:", e);
    }
  }, []);

  // 5. Fetch Positions (Scoped exclusively to connected Web3 wallet)
  const fetchPositions = useCallback(async () => {
    try {
      if (!wallet.address) {
        setPositions([]);
        return;
      }
      const url = `/api/positions?wallet=${encodeURIComponent(wallet.address)}`;
      const res = await fetch(apiUrl(url));
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.positions || [];
        setPositions(list);
      }
    } catch {
      setPositions([]);
    }
  }, [wallet.address]);

  // 6. Fetch News
  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/news?limit=6"));
      if (res.ok) {
        const data = await res.json();
        setNews(Array.isArray(data) ? data : data.news || []);
      }
    } catch {
      // Keep default
    }
  }, []);

  // 7. Fetch Debate Synthesis
  const fetchDebate = useCallback(async (sym: string) => {
    if (!sym) return;
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

  // Initial Load & Continuous Real-Time Polling
  useEffect(() => {
    fetchHealth();
    fetchMarkets();
    fetchTickers();
    fetchPositions();
    fetchNews();

    const pollingInterval = setInterval(() => {
      fetchMarkets();
      fetchTickers();
      fetchPositions();
    }, 6000);

    const newsPolling = setInterval(() => {
      fetchNews();
    }, 25000);

    return () => {
      clearInterval(pollingInterval);
      clearInterval(newsPolling);
    };
  }, [fetchHealth, fetchMarkets, fetchTickers, fetchPositions, fetchNews]);

  useEffect(() => {
    if (selectedMarket) {
      const sym = selectedMarket.underlyingAsset || selectedMarket.symbol;
      fetchDebate(sym);
      fetchTimelineData(sym, timeRange);
    }
  }, [selectedMarket, timeRange, fetchDebate, fetchTimelineData]);

  // Re-fetch positions when wallet changes
  useEffect(() => {
    fetchPositions();
  }, [wallet.address, fetchPositions]);

  // Sweep & Claim All Winnings
  const handleClaimAll = async () => {
    setIsClaiming(true);
    try {
      const res = await fetch(apiUrl("/api/claim"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: wallet.address,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playSuccessChime();
        showToast(`Swept and claimed ${data.claimedCount || 1} settled positions!`, "success");
        await fetchPositions();
        await wallet.refreshBalance();
      } else {
        showToast(data.error || "No claimable settled positions found.", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to sweep winnings", "error");
    } finally {
      setIsClaiming(false);
    }
  };

  // Early exit on CLOB: Sell open contracts before round expiry
  const handleEarlyExit = async (positionId: string, exitPrice?: number) => {
    try {
      const res = await fetch(apiUrl(`/api/positions/${encodeURIComponent(positionId)}/close`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exitPrice }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playSuccessChime();
        const pnlStr = data.realizedPnl >= 0 ? `+$${data.realizedPnl}` : `-$${Math.abs(data.realizedPnl)}`;
        showToast(`Early exit on CLOB! Realized PnL: ${pnlStr} (${data.realizedRoiPercent > 0 ? "+" : ""}${data.realizedRoiPercent}%)`, "success");
        await fetchPositions();
      } else {
        showToast(data.error || "Failed to exit position early", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to exit position", "error");
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
      const res = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          marketId: selectedMarket?.id,
          outcome,
          amount,
          price,
          walletAddress: wallet.address,
          signerType: wallet.isConnected ? wallet.walletName : "SIMULATION",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const signerLabel = wallet.isConnected ? `[${wallet.shortAddress}]` : "[Simulated]";
        showToast(
          `Order executed ${signerLabel}: ${amount.toFixed(1)} ${outcome} contracts on ${symbol}`,
          "success"
        );
        await fetchPositions();
        await wallet.refreshBalance();
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
  const activeSymbol = activeMarket.underlyingAsset || activeMarket.symbol;

  const handleSelectSymbolGlobal = (sym: string) => {
    const list = markets.length > 0 ? markets : FALLBACK_MARKETS;
    let found = list.find(
      (m) => (m.underlyingAsset || m.symbol).toLowerCase() === sym.toLowerCase()
    );
    if (!found) {
      found = FALLBACK_MARKETS.find(
        (m) => (m.underlyingAsset || m.symbol).toLowerCase() === sym.toLowerCase()
      );
    }
    if (found) {
      setSelectedMarket(found);
    }
  };

  // ─── If Landing Page is Active ───────────────────────────────────────────────
  if (activeTab === "landing") {
    return (
      <>
        <LandingPage onLaunchTerminal={() => setActiveTab("markets")} />
        <WalletModal />
      </>
    );
  }

  // ─── Else Render All-in-One Zero-Scroll Single-Screen Cockpit ───────────────
  return (
    <div className="h-screen w-screen bg-[#07070B] text-[#E2E8F0] flex flex-col font-sans selection:bg-violet-600 selection:text-white overflow-hidden">
      {/* Toast Notification (Sharp Precision Box with Signal LED) */}
      {toastMessage && (
        <div
          className={`fixed top-14 right-5 z-50 px-4 py-2.5 rounded-none shadow-2xl border font-mono text-xs fade-in flex items-center gap-2.5 backdrop-blur-md ${
            toastMessage.type === "success"
              ? "bg-[#0E0E17]/95 text-emerald-300 border-emerald-500/50 shadow-emerald-950/40"
              : "bg-[#0E0E17]/95 text-rose-300 border-rose-500/50 shadow-rose-950/40"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              toastMessage.type === "success" ? "bg-emerald-400" : "bg-rose-400"
            }`}
          />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* 1. Global Header */}
      <Header
        health={health}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClaimAll={handleClaimAll}
        isClaiming={isClaiming}
        onConnectWallet={() => wallet.openWalletModal()}
      />

      {/* 2. Scrolling Market Ticker (Sub-Second Somnia L1 Tape) */}
      <MarketTicker markets={tickers} />

      {/* 3. Dedicated Views or Main Bento Box Cockpit */}
      {activeTab === "analytics" && (
        <AnalyticsView
          markets={markets.length > 0 ? markets : FALLBACK_MARKETS}
          selectedSymbol={activeSymbol}
          onSelectSymbol={handleSelectSymbolGlobal}
          onSelectMarket={(sym) => {
            handleSelectSymbolGlobal(sym);
            setActiveTab("markets");
          }}
        />
      )}

      {activeTab === "insights" && (
        <InsightsView
          markets={markets.length > 0 ? markets : FALLBACK_MARKETS}
          selectedSymbol={activeSymbol}
          onSelectSymbol={handleSelectSymbolGlobal}
          onTradeSignal={(sym, outcome, price) => {
            handleSelectSymbolGlobal(sym);
            setPrefillOutcome(outcome);
            if (price) setPrefillEntryPrice(price);
            setActiveTab("markets");
            showToast(`Loaded ${sym} ${outcome} signal into Terminal!`, "success");
          }}
        />
      )}

      {activeTab === "activity" && (
        <ActivityView
          positions={positions}
          onClaimAll={handleClaimAll}
          isClaiming={isClaiming}
          onTradeNew={() => setActiveTab("markets")}
          walletAddress={wallet.address || undefined}
          walletBalance={wallet.balance || undefined}
          onEarlyExit={handleEarlyExit}
        />
      )}

      {activeTab === "markets" && (
        <>
          <div className="flex-1 flex min-h-0 overflow-hidden bg-[#07070B]">
            {/* ── LEFT COLUMN: Market Navigator & Live Radar (Section 10 Spec) ── */}
            <aside className="w-60 xl:w-64 border-r border-white/[0.08] bg-[#0E0E17] flex flex-col flex-shrink-0 min-h-0 overflow-hidden">
              {/* Search Bar */}
              <div className="p-2.5 border-b border-white/[0.08] bg-[#0A0A12]">
                <div className="flex items-center bg-[#0E0E17] border border-white/[0.08] focus-within:border-violet-500/60 rounded-none px-2.5 py-1.5 gap-2 transition-colors">
                  <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="SEARCH EVENT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-gray-200 placeholder-gray-600 outline-none w-full font-mono uppercase tracking-wider"
                  />
                </div>
              </div>

              {/* Radar Header */}
              <div className="px-3 py-2 border-b border-white/[0.08] bg-[#0B0B12] flex items-center justify-between">
                <span className="stat-label text-[10px] flex items-center gap-1.5 font-mono">
                  <span className="inline-block w-1.5 h-1.5 bg-violet-400 rounded-full" />
                  MARKET RADAR
                </span>
                <span className="text-[10px] font-mono text-violet-300 bg-violet-950/60 border border-violet-500/30 px-1.5 py-0.5 rounded-none font-bold">
                  {filteredMarkets.length} LIVE
                </span>
              </div>

              {/* Market List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] custom-scrollbar">
                {filteredMarkets.map((m) => {
                  const isSelected = activeMarket.id === m.id;
                  const prob = m.probability ?? 50;
                  const isYes = prob >= 50;

                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedMarket(m);
                      }}
                      className={`w-full text-left p-2.5 transition-colors flex flex-col gap-1 rounded-none border-l-2 ${
                        isSelected
                          ? "bg-violet-950/30 border-violet-500 text-violet-300"
                          : "border-transparent hover:bg-[#12121C] text-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span
                          className={`text-xs font-bold flex items-center gap-1.5 ${
                            isSelected ? "text-violet-200" : "text-gray-200"
                          }`}
                        >
                          <CryptoIcon symbol={m.underlyingAsset || m.symbol} size={15} />
                          <span>{m.symbol}/tUSDC</span>
                        </span>
                        <span
                          className={`text-xs font-bold font-mono ${
                            isYes ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {prob.toFixed(1)}%
                        </span>
                      </div>

                      <p className="text-[10px] text-gray-400 line-clamp-1 leading-tight font-sans">
                        {m.question}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono pt-0.5">
                        <span>Bid: ${m.bestBid ? m.bestBid.toFixed(2) : "0.50"}</span>
                        <span className="text-gray-500">Vol ${((m.volume24h || 100000) / 1000).toFixed(0)}K</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* ── CENTER COLUMN: Visual Intelligence Canvas + Decision Stress Test ── */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#07070B] overflow-hidden">
              {/* Header Stats Bar */}
              <MarketStats market={activeMarket} serverMode={health?.mode} />

              {/* Unified Visual Board (Zero-Scroll Bento Split) */}
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
                {/* Top Half: Multi-Mode Visual Intelligence Canvas */}
                <div className="flex-shrink-0">
                  <PriceChart
                    symbol={activeSymbol}
                    data={timelineData}
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    currentPrice={activeMarket.probability}
                    activeVisualMode={visualMode}
                    onVisualModeChange={setVisualMode}
                    entryPrice={prefillEntryPrice}
                    targetExitPrice={prefillTargetExit}
                    onSetEntryPrice={(p) => setPrefillEntryPrice(p)}
                    onSetTargetExitPrice={(p) => setPrefillTargetExit(p)}
                    showToast={showToast}
                  />
                </div>

                {/* Bottom Half: Deterministic Decision Stress Test & 1-Click CLOB */}
                <div className="flex-shrink-0">
                  <ScenarioSimulator
                    market={activeMarket}
                    prefillOutcome={prefillOutcome}
                    prefillEntryPrice={prefillEntryPrice}
                    prefillTargetExit={prefillTargetExit}
                    onEntryPriceChange={(p) => setPrefillEntryPrice(p)}
                    onTargetExitPriceChange={(p) => setPrefillTargetExit(p)}
                    onTrade={handleExecuteTrade}
                    isSubmitting={isSubmittingOrder}
                    showToast={showToast}
                  />
                </div>
              </div>
            </main>

            {/* ── RIGHT COLUMN: Somnia CLOB Orderbook & Liquidity Depth ────── */}
            <aside className="w-72 xl:w-80 border-l border-[#222234] bg-[#0E0E16] flex flex-col flex-shrink-0 min-h-0 overflow-hidden">
              <ContextPanel
                symbol={activeSymbol}
                midPrice={activeMarket?.midPrice || 0.50}
                onSetEntryPrice={(price) => {
                  setPrefillEntryPrice(price);
                  showToast(`Selected $${price.toFixed(3)} from Orderbook as Entry Odds!`, "success");
                }}
                onViewInsights={() => setActiveTab("insights")}
              />
            </aside>
          </div>

          {/* 4. Bottom Dock: Live Thesis Health Monitor & 1-Click Auto Claim Sweeper */}
          <ThesisHealthMonitor
            positions={positions}
            onClaimAll={handleClaimAll}
            isClaiming={isClaiming}
            activeSymbol={activeSymbol}
          />
        </>
      )}

      {/* Dual AI Agent Arena Full Modal */}
      <DualDebateModal
        isOpen={isDebateModalOpen}
        onClose={() => setIsDebateModalOpen(false)}
        spike={null}
        symbol={activeSymbol}
        onLoadScenario={(outcome, targetExit) => {
          setPrefillOutcome(outcome);
          setPrefillTargetExit(targetExit);
          showToast(`Applied ${outcome} strategy with target ${Math.round(targetExit * 100)}% to simulator!`);
        }}
      />

      {/* Web3 Wallet Connection Modal */}
      <WalletModal />
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <ForeSightTerminalApp />
    </WalletProvider>
  );
}
