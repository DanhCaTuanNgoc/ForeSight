import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Search, ArrowUpDown, CheckCircle2, AlertTriangle, Info } from "lucide-react";

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
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "HOT" | "SOMNIA" | "VOL">("ALL");
  const [marketSort, setMarketSort] = useState<"DEFAULT" | "ODDS" | "VOL">("DEFAULT");
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
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [tickers, setTickers] = useState<any[]>([]);

  const wallet = useWallet();

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
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
          let prevClose = json.data[0].mid_price || 0.5;
          const formatted = json.data.map((d: any, idx: number) => {
            const mid = d.mid_price ?? 0.5;
            const open = d.open ?? (idx === 0 ? mid : prevClose);
            const close = d.close ?? mid;
            prevClose = close;
            const high = d.high ?? Math.min(0.99, Math.max(open, close) + 0.006);
            const low = d.low ?? Math.max(0.01, Math.min(open, close) - 0.006);
            return {
              time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              price: Number(close.toFixed(4)),
              priceNo: Number((1 - close).toFixed(4)),
              open: Number(open.toFixed(4)),
              high: Number(high.toFixed(4)),
              low: Number(low.toFixed(4)),
              close: Number(close.toFixed(4)),
              volume: d.volume_24h || 12000,
              isSpike: Boolean(d.is_spike),
            };
          });
          setTimelineData(formatted);
          return;
        }
      }
    } catch (e) {
      console.warn("Timeline fetch error:", e);
    }
  }, []);

  // Client-side localStorage persistence helpers for positions
  const getLocalPositions = (addr: string): any[] => {
    if (!addr || typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`foresight_positions_${addr.toLowerCase()}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalPositions = (addr: string, list: any[]) => {
    if (!addr || typeof window === "undefined") return;
    try {
      localStorage.setItem(`foresight_positions_${addr.toLowerCase()}`, JSON.stringify(list));
    } catch {
      // Ignore storage errors
    }
  };

  // 5. Fetch Positions (Scoped exclusively to connected Web3 wallet + local backup merge)
  const fetchPositions = useCallback(async () => {
    try {
      if (!wallet.address) {
        setPositions([]);
        return;
      }
      const addr = wallet.address.toLowerCase();
      const cached = getLocalPositions(addr);
      if (cached.length > 0) {
        setPositions(cached);
      }

      const url = `/api/positions?wallet=${encodeURIComponent(wallet.address)}`;
      const res = await fetch(apiUrl(url));
      if (res.ok) {
        const data = await res.json();
        const serverList = Array.isArray(data) ? data : data.positions || [];
        
        // Merge cached and server records (favoring server state for settlement status updates)
        const map = new Map<string, any>();
        for (const item of cached) {
          if (item && item.id) map.set(item.id, item);
        }
        for (const item of serverList) {
          if (item && item.id) map.set(item.id, item);
        }
        const merged = Array.from(map.values()).sort(
          (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
        );
        setPositions(merged);
        saveLocalPositions(addr, merged);
      }
    } catch {
      if (wallet.address) {
        const cached = getLocalPositions(wallet.address);
        if (cached.length > 0) setPositions(cached);
      }
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

  // Sweep & Claim All Winnings (1-Click MultiCall via ForeSightBatchSweeper)
  const handleClaimAll = async () => {
    if (!wallet.isConnected) {
      wallet.openWalletModal();
      showToast("Please connect your Web3 wallet (MetaMask) to claim payouts on Somnia.", "info");
      return;
    }

    setIsClaiming(true);
    try {
      // 1. Request on-chain signing in MetaMask for ForeSightBatchSweeper contract
      const txResult = await wallet.executeOnChainClaim();
      if (!txResult.success) {
        showToast(txResult.error || "Claim transaction signing cancelled", "error");
        return;
      }

      // 2. Dispatch claimed status to backend with verified TxHash
      const res = await fetch(apiUrl("/api/claim"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: wallet.address,
          txHash: txResult.txHash,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playSuccessChime();
        const shortHash = txResult.txHash ? `${txResult.txHash.slice(0, 6)}...${txResult.txHash.slice(-4)}` : "";
        showToast(`Batch Sweeper Claimed on Somnia L1 [${shortHash}]`, "success");
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
        if (wallet.address) {
          setPositions((prev) => {
            const next = prev.map((p) =>
              p.id === positionId ? { ...p, status: "CLOSED", realizedPnl: data.realizedPnl } : p
            );
            saveLocalPositions(wallet.address, next);
            return next;
          });
        }
        await fetchPositions();
      } else {
        showToast(data.error || "Failed to exit position early", "error");
      }
    } catch (e: any) {
      showToast(e.message || "Failed to exit position", "error");
    }
  };

  // Trade Execution (Web3 MetaMask signing on Somnia Shannon L1)
  const handleExecuteTrade = async (
    symbol: string,
    outcome: "YES" | "NO",
    amount: number,
    price?: number
  ) => {
    if (!wallet.isConnected) {
      wallet.openWalletModal();
      showToast("Please connect your Web3 wallet (MetaMask) to sign and place orders.", "info");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      // 1. Request on-chain signature/transaction in MetaMask
      const txResult = await wallet.executeOnChainTrade({
        symbol,
        outcome,
        amount,
        price,
      });

      if (!txResult.success) {
        showToast(txResult.error || "Order signature cancelled", "error");
        return;
      }

      // 2. Broadcast order to backend with verified on-chain TxHash
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
          signerType: wallet.walletName || "MetaMask",
          txHash: txResult.txHash,
        }),
      });
      const data = await res.json();
      if (data.success) {
        sound.playSuccessChime();
        const shortHash = txResult.txHash ? `${txResult.txHash.slice(0, 6)}...${txResult.txHash.slice(-4)}` : "";
        showToast(
          `Order Confirmed on Somnia L1 [${shortHash}]: ${amount.toFixed(1)} ${outcome} contracts on ${symbol}`,
          "success"
        );
        if (data.position && wallet.address) {
          setPositions((prev) => {
            const exists = prev.some((p) => p.id === data.position.id);
            const next = exists
              ? prev.map((p) => (p.id === data.position.id ? data.position : p))
              : [data.position, ...prev];
            saveLocalPositions(wallet.address, next);
            return next;
          });
        }
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

  // Filtered & Sorted Markets for Sidebar
  const filteredMarkets = useMemo(() => {
    let list = markets.length > 0 ? markets : FALLBACK_MARKETS;

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.symbol.toLowerCase().includes(q) ||
          (m.underlyingAsset && m.underlyingAsset.toLowerCase().includes(q)) ||
          m.question.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (categoryFilter === "HOT") {
      list = list.filter((m) => (m.probability ?? 50) >= 60 || (m.probability ?? 50) <= 40);
    } else if (categoryFilter === "SOMNIA") {
      list = list.filter((m) => (m.underlyingAsset || m.symbol).toUpperCase() === "SOMI");
    } else if (categoryFilter === "VOL") {
      list = [...list].sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
    }

    // Sort
    if (marketSort === "ODDS") {
      list = [...list].sort((a, b) => (b.probability || 0) - (a.probability || 0));
    } else if (marketSort === "VOL") {
      list = [...list].sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
    }

    return list;
  }, [markets, searchQuery, categoryFilter, marketSort]);

  const total24hVol = useMemo(() => {
    const list = markets.length > 0 ? markets : FALLBACK_MARKETS;
    return list.reduce((acc, m) => acc + (m.volume24h || 0), 0);
  }, [markets]);

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
    <div className="h-screen w-screen bg-[#07070A] text-[#F1F5F9] flex flex-col font-sans selection:bg-violet-600 selection:text-white overflow-hidden">

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
          <div className="flex-1 flex min-h-0 overflow-hidden bg-[#07070A]">
            {/* ── LEFT COLUMN: Markets Navigator ── */}
            <aside className="w-60 xl:w-64 border-r border-white/[0.07] bg-[#0A0A10] flex flex-col flex-shrink-0 min-h-0 overflow-hidden">
              {/* Search Bar & Categories */}
              <div className="p-2 border-b border-white/[0.07] bg-[#07070C] space-y-1.5">
                <div className="flex items-center bg-[#0E0E17] border border-white/[0.08] focus-within:border-violet-500/60 rounded-none px-2 py-1 gap-2 transition-colors">
                  <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="SEARCH MARKETS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-[11px] text-gray-200 placeholder-gray-600 outline-none w-full font-mono uppercase tracking-wider"
                  />
                </div>

                {/* Filter Presets */}
                <div className="grid grid-cols-4 gap-1">
                  {(["ALL", "HOT", "SOMNIA", "VOL"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        sound.playClick();
                        setCategoryFilter(cat);
                      }}
                      className={`text-[9px] font-mono py-0.5 rounded-none font-bold uppercase transition-colors border cursor-pointer ${
                        categoryFilter === cat
                          ? "bg-violet-600/25 text-violet-300 border-violet-500/50"
                          : "bg-[#0E0E17] text-gray-400 border-white/[0.05] hover:text-gray-200 hover:bg-[#13131F]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radar Header with Count and Sort */}
              <div className="px-2.5 py-1.5 border-b border-white/[0.07] bg-[#08080E] flex items-center justify-between">
                <span className="stat-label text-[10px] flex items-center gap-1.5 font-mono">
                  <span className="inline-block w-1.5 h-1.5 bg-violet-400 rounded-full" />
                  MARKETS
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setMarketSort((s) => (s === "DEFAULT" ? "ODDS" : s === "ODDS" ? "VOL" : "DEFAULT"));
                    }}
                    className="text-[9px] font-mono text-gray-400 hover:text-violet-300 flex items-center gap-0.5 px-1 py-0.5 border border-white/[0.06] rounded-none hover:border-violet-500/30 transition-colors cursor-pointer"
                    title="Toggle Sort: Default / Odds / Volume"
                  >
                    <ArrowUpDown className="w-2.5 h-2.5" />
                    <span>{marketSort === "DEFAULT" ? "SORT" : marketSort}</span>
                  </button>
                  <span className="text-[10px] font-mono text-violet-300 bg-violet-950/50 border border-violet-500/30 px-1 py-0.2 rounded-none font-bold">
                    {filteredMarkets.length} ACTIVE
                  </span>
                </div>
              </div>

              {/* Market List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03] custom-scrollbar">
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
                      className={`w-full text-left p-2.5 transition-colors flex flex-col gap-1 rounded-none border-l-2 cursor-pointer ${
                        isSelected
                          ? "bg-violet-950/25 border-violet-500 text-violet-200"
                          : "border-transparent hover:bg-[#0F0F1A] text-gray-300"
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
                          className={`text-[11px] font-bold font-mono px-1.5 py-0.2 border rounded-none ${
                            isYes
                              ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/30"
                              : "text-rose-400 bg-rose-950/30 border-rose-500/30"
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
                        <span>Ask: ${m.bestAsk ? m.bestAsk.toFixed(2) : "0.52"}</span>
                        <span className="text-gray-400 font-bold">Vol ${((m.volume24h || 100000) / 1000).toFixed(0)}K</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Market Navigator Footer Summary */}
              <div className="p-2 bg-[#07070C] border-t border-white/[0.07] flex items-center justify-between text-[9px] font-mono text-gray-500">
                <span className="flex items-center gap-1 text-violet-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  SOMNIA L1
                </span>
                <span className="text-gray-400 font-bold">24H VOL: ${(total24hVol / 1000).toFixed(0)}K</span>
              </div>
            </aside>

            {/* ── CENTER COLUMN: Visual Intelligence Canvas & Order Simulator ── */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#07070A] overflow-hidden">
              {/* Header Stats Bar */}
              <MarketStats
                market={activeMarket}
                serverMode={health?.mode}
                onOpenDebate={() => setIsDebateModalOpen(true)}
              />

              {/* Unified Visual Board (Zero-Scroll Bento Split) */}
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
                {/* Top Half: Multi-Mode Chart Canvas */}
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

                {/* Bottom Half: Order Simulator & 1-Click CLOB Execution */}
                <div className="flex-shrink-0">
                  <ScenarioSimulator
                    market={activeMarket}
                    prefillOutcome={prefillOutcome}
                    prefillEntryPrice={prefillEntryPrice}
                    prefillTargetExit={prefillTargetExit}
                    onOutcomeChange={(o) => setPrefillOutcome(o)}
                    onEntryPriceChange={(p) => setPrefillEntryPrice(p)}
                    onTargetExitPriceChange={(p) => setPrefillTargetExit(p)}
                    onTrade={handleExecuteTrade}
                    isSubmitting={isSubmittingOrder}
                    showToast={showToast}
                  />
                </div>
              </div>
            </main>

            {/* ── RIGHT COLUMN: Somnia CLOB Orderbook ────── */}
            <aside className="w-72 xl:w-80 border-l border-white/[0.07] bg-[#0A0A10] flex flex-col flex-shrink-0 min-h-0 overflow-hidden">
              <ContextPanel
                symbol={activeSymbol}
                midPrice={activeMarket?.midPrice || 0.50}
                onSetEntryPrice={(price) => {
                  setPrefillEntryPrice(price);
                  showToast(`Selected $${price.toFixed(3)} from Orderbook as Entry Odds!`, "success");
                }}
                onViewInsights={() => setActiveTab("insights")}
                onViewDebate={() => setIsDebateModalOpen(true)}
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

      {/* Floating System Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <div
            className={`px-4 py-2.5 rounded-none font-mono text-xs border shadow-2xl backdrop-blur-md flex items-center gap-2.5 ${
              toastMessage.type === "success"
                ? "bg-[#07130F]/95 text-emerald-300 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                : toastMessage.type === "error"
                ? "bg-[#16080B]/95 text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                : "bg-[#07111A]/95 text-cyan-300 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            }`}
          >
            {toastMessage.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            {toastMessage.type === "error" && (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            {toastMessage.type === "info" && (
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            )}
            <span className="font-semibold tracking-wide">{toastMessage.msg}</span>
          </div>
        </div>
      )}
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
