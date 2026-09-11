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
import { ActivityView, parseExpiryFromSymbol, isPositionExpired } from "./components/ActivityView.js";
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
  strikePrice?: number;
  timeRemainingSec?: number;
  expirationTime?: number;
  interval?: string;
  venueId?: string;
  marketAddress?: string;
  poolAddress?: string;
  yesTokenId?: string;
  noTokenId?: string;
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
    strikePrice: 78947.56,
    interval: "5m",
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
    strikePrice: 2500.35,
    interval: "5m",
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
    strikePrice: 178.4,
    interval: "5m",
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
    strikePrice: 0.742,
    interval: "5m",
  },
];

function ForeSightTerminalApp() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [health, setHealth] = useState<any>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "TOP" | "SOMNIA" | "VOL">("ALL");
  const [marketSort, setMarketSort] = useState<"DEFAULT" | "ODDS" | "VOL">("DEFAULT");
  const [timeRange, setTimeRange] = useState<"15m" | "1H" | "4H" | "1D">("1H");
  const [visualMode, setVisualMode] = useState<CanvasVisualMode>("probability");
  const [positions, setPositions] = useState<PositionRecord[]>([]);
  const [publicPositions, setPublicPositions] = useState<PositionRecord[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [debate, setDebate] = useState<any>(null);
  const [debateLoading, setDebateLoading] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [submitStep, setSubmitStep] = useState<"idle" | "approving" | "signing">("idle");

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
          const parsed: Market[] = rawList.map((m: any) => {
            const underlyingAsset = (m.underlyingAsset || m.symbol?.split("-")[0] || "BTC").toUpperCase();
            const prob = m.probability ?? (m.bestBid ? m.bestBid * 100 : (m.midPrice ? m.midPrice * 100 : 50));
            return {
              id: m.id || m.marketId || m.symbol,
              symbol: m.symbol || `${underlyingAsset}/tUSDC`,
              underlyingAsset,
              question: m.question || `Will ${underlyingAsset} reach target?`,
              bestBid: m.bestBid ?? 0.50,
              bestAsk: m.bestAsk ?? 0.52,
              probability: prob,
              midPrice: m.midPrice ?? 0.51,
              status: m.status || "TRADING",
              volume24h: m.volume24h || 120000,
              strikePrice: m.strikePrice,
              timeRemainingSec: m.timeRemainingSec,
              expirationTime: m.expirationTime,
              interval: m.interval || "5m",
              venueId: m.venueId,
              marketAddress: m.marketAddress,
              poolAddress: m.poolAddress,
              yesTokenId: m.yesTokenId,
              noTokenId: m.noTokenId,
            };
          });

          // Ensure all 4 core assets are always represented in markets
          const mergedMarkets = [...parsed];
          for (const fb of FALLBACK_MARKETS) {
            const fbSym = (fb.underlyingAsset || fb.symbol).toUpperCase();
            const hasAsset = mergedMarkets.some(
              (m) => (m.underlyingAsset || m.symbol).toUpperCase() === fbSym
            );
            if (!hasAsset) {
              mergedMarkets.push(fb);
            }
          }

          setMarkets(mergedMarkets);
          setSelectedMarket((prev) => {
            if (!prev) return mergedMarkets[0];
            const updated = mergedMarkets.find((p) => p.id === prev.id || p.symbol === prev.symbol);
            if (updated) return updated;
            const sameAsset = mergedMarkets.find(
              (p) => (p.underlyingAsset || p.symbol).toUpperCase() === (prev.underlyingAsset || prev.symbol).toUpperCase()
            );
            // CRITICAL: Keep user-selected market; never abruptly reset to mergedMarkets[0]
            return sameAsset || prev;
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Markets API fetch fallback:", e);
    }
    setMarkets(FALLBACK_MARKETS);
    setSelectedMarket((prev) => prev || FALLBACK_MARKETS[0]);
  }, []);

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

  // 4. Fetch Authentic Candlesticks / Timeline Data from API
  const fetchTimelineData = useCallback(async (symbol: string, range: "15m" | "1H" | "4H" | "1D") => {
    if (!symbol) return;
    try {
      const cleanAsset = symbol.replace(/\/.*$/, "").replace(/-.*$/, "").toUpperCase();
      const intervalMap: Record<string, string> = {
        "15m": "15m",
        "1H": "1h",
        "4H": "4h",
        "1D": "1d",
      };
      const interval = intervalMap[range] || "15m";

      // 1. First try authentic live candlesticks
      const candleRes = await fetch(apiUrl(`/api/candles/${encodeURIComponent(cleanAsset)}?interval=${interval}&limit=50`));
      if (candleRes.ok) {
        const candleJson = await candleRes.json();
        if (candleJson.candles && candleJson.candles.length > 0) {
          setTimelineData(candleJson.candles);
          return;
        }
      }

      // 2. Fallback to timeline if candles endpoint fails
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
  // One-time auto-purge of legacy simulated test sessions
  const TEST_CLEANUP_FLAG = "foresight_clean_slate_v3";
  if (typeof window !== "undefined" && !localStorage.getItem(TEST_CLEANUP_FLAG)) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("foresight_positions_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(TEST_CLEANUP_FLAG, "true");
    } catch {}
  }

  const getLocalPositions = (addr?: string | null): PositionRecord[] => {
    if (!addr || typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`foresight_positions_${addr.toLowerCase()}`);
      if (!raw) return [];
      const parsed: PositionRecord[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const filtered = parsed.filter(
        (p) =>
          p &&
          !p.id?.startsWith("pos-demo-") &&
          p.orderId !== "ord-btc-demo-live" &&
          p.orderId !== "ord-eth-settled-1" &&
          p.orderId !== "ord-somi-settled-2" &&
          p.txHash !== "0x999f033fbddf512b93eb3b480f4b2f37521377c4eb11b77401eadafabb98e1a7" &&
          (p as any).status !== "FAILED"
      );
      if (filtered.length !== parsed.length) {
        saveLocalPositions(addr, filtered);
      }
      return filtered;
    } catch {
      return [];
    }
  };

  const saveLocalPositions = (addr: string | null | undefined, list: PositionRecord[]) => {
    if (!addr || typeof window === "undefined") return;
    try {
      localStorage.setItem(`foresight_positions_${addr.toLowerCase()}`, JSON.stringify(list));
    } catch {
      // Ignore storage errors
    }
  };

  // 5. Fetch Positions (User scoped + Public verifiable ledger)
  const fetchPositions = useCallback(async () => {
    const resolveStatus = (p: any) => {
      if (p.status === "CLAIMED") return "CLAIMED";
      if (p.status === "CLOSED") return "CLOSED";
      if (p.status === "REFUNDED" || p.isRefunded || p.txHash === "0x58f77beab8dc966f8faca8f71c2f529dee14f06e6fc3105471695598d8a48ef0") return "REFUNDED";
      if (p.status === "RESTING" || p.status === "PENDING") return "RESTING";
      if (p.status === "SETTLED_WIN" || p.status === "SETTLED_LOSS" || p.status === "RESOLVING") return p.status;
      if (isPositionExpired(p)) {
        return p.isWinner === true ? "SETTLED_WIN" : p.isWinner === false ? "SETTLED_LOSS" : "RESOLVING";
      }
      return p.status || "OPEN";
    };

    try {
      // 1. Fetch public verifiable on-chain positions from Somnia testnet
      const pubRes = await fetch(apiUrl("/api/positions"));
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        const pubList = Array.isArray(pubData) ? pubData : pubData.positions || [];
        const cleanedPub = pubList.filter(
          (p: any) => p && !p.id?.startsWith("pos-demo-") && p.status !== "FAILED"
        );
        const enrichedPub = cleanedPub.map((p: any) => ({
          ...p,
          status: resolveStatus(p),
        }));
        setPublicPositions(enrichedPub);
      }

      // 2. Fetch user scoped positions if wallet is connected
      if (!wallet.address) {
        setPositions([]);
        return;
      }
      const addr = wallet.address.toLowerCase();
      const cached = getLocalPositions(addr);
      if (cached.length > 0) {
        const enrichedCached = cached.map((p) => {
          const status = resolveStatus(p);
          return { ...p, status };
        });
        setPositions(enrichedCached);
      }

      const url = `/api/positions?wallet=${encodeURIComponent(wallet.address)}`;
      const res = await fetch(apiUrl(url));
      if (res.ok) {
        const data = await res.json();
        const serverList = Array.isArray(data) ? data : data.positions || [];
        
        // Clean phantom demo orders & test orders
        const cleaned = serverList.filter(
          (p: any) =>
            p &&
            !p.id?.startsWith("pos-demo-") &&
            p.orderId !== "ord-btc-demo-live" &&
            p.orderId !== "ord-eth-settled-1" &&
            p.orderId !== "ord-somi-settled-2" &&
            p.txHash !== "0x999f033fbddf512b93eb3b480f4b2f37521377c4eb11b77401eadafabb98e1a7" &&
            p.status !== "FAILED"
        );
        
        const enriched = cleaned.map((p: any) => {
          const status = resolveStatus(p);
          return { ...p, status };
        });

        setPositions(enriched);
        saveLocalPositions(addr, enriched);
      }
    } catch {
      if (wallet.address) {
        const cached = getLocalPositions(wallet.address);
        if (cached.length > 0) {
          const enriched = cached.map((p) => {
            const status = resolveStatus(p);
            return { ...p, status };
          });
          setPositions(enriched);
        }
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
    }, 3500);

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
    if (!wallet.address) {
      setPositions([]);
    }
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
      // 1. Gather settled winning pool addresses
      const winningPositions = positions.filter(
        (p) => (p.status === "SETTLED_WIN" || (p.status === "SETTLED" && p.isWinner === true)) && p.poolAddress
      );
      if (winningPositions.length === 0) {
        showToast("No winning claimable payouts available. Note: Losing rounds expire with $0 payout.", "info");
        setIsClaiming(false);
        return;
      }
      const settledPools = winningPositions.map((p) => p.poolAddress as string);

      // Request on-chain signing in MetaMask for ForeSightBatchSweeper contract
      const txResult = await wallet.executeOnChainClaim(settledPools);
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
          const activeAddr = wallet.address;
          setPositions((prev) => {
            const next: PositionRecord[] = prev.map((p) =>
              p.id === positionId ? { ...p, status: "CLOSED", realizedPnl: data.realizedPnl } : p
            );
            saveLocalPositions(activeAddr, next);
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

  // Clear / Reset All Test Positions
  const handleResetPositions = async () => {
    try {
      if (wallet.address) {
        localStorage.removeItem(`foresight_positions_${wallet.address.toLowerCase()}`);
      }
      setPositions([]);
      await fetch(apiUrl("/api/positions/reset"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet.address }),
      });
      showToast("Positions ledger cleared successfully", "info");
      await fetchPositions();
    } catch {
      showToast("Failed to reset positions", "error");
    }
  };

  // Trade Execution (Web3 MetaMask signing on Somnia Shannon L1)
  const handleExecuteTrade = async (
    symbol: string,
    outcome: "YES" | "NO",
    amount: number,
    price?: number,
    poolAddress?: string,
    expirationTime?: number
  ) => {
    if (!wallet.isConnected) {
      wallet.openWalletModal();
      showToast("Please connect your Web3 wallet (MetaMask) to sign and place orders.", "info");
      return;
    }

    const currentMarket = activeMarket;
    const targetPool = poolAddress || currentMarket?.poolAddress;
    const targetExpiry = expirationTime || currentMarket?.expirationTime;

    setIsSubmittingOrder(true);
    setSubmitStep("idle");
    try {
      // 1. Request on-chain signature/transaction in MetaMask directly on DreamDEX BinaryPool
      const txResult = await wallet.executeOnChainTrade({
        symbol,
        outcome,
        amount,
        price,
        poolAddress: targetPool,
        expirationTime: targetExpiry,
        onStep: (step) => setSubmitStep(step === "confirming" ? "signing" : step),
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
          poolAddress: targetPool,
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
          const activeAddr = wallet.address;
          setPositions((prev) => {
            const exists = prev.some((p) => p.id === data.position.id);
            const next: PositionRecord[] = exists
              ? prev.map((p) => (p.id === data.position.id ? data.position : p))
              : [data.position, ...prev];
            saveLocalPositions(activeAddr, next);
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
      setSubmitStep("idle");
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
    if (categoryFilter === "TOP") {
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
    const clean = sym.trim().toUpperCase();
    const list = markets.length > 0 ? markets : FALLBACK_MARKETS;
    let found = list.find(
      (m) =>
        (m.underlyingAsset || "").toUpperCase() === clean ||
        (m.symbol || "").toUpperCase() === clean ||
        (m.symbol || "").toUpperCase().startsWith(clean)
    );
    if (!found) {
      found = FALLBACK_MARKETS.find(
        (m) =>
          (m.underlyingAsset || "").toUpperCase() === clean ||
          (m.symbol || "").toUpperCase() === clean
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
          selectedMarket={selectedMarket}
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
          selectedMarket={selectedMarket}
          selectedSymbol={activeSymbol}
          positions={positions}
          publicPositions={publicPositions}
          walletAddress={wallet.address || undefined}
          onConnectWallet={() => wallet.openWalletModal()}
          showToast={showToast}
          onSelectSymbol={handleSelectSymbolGlobal}
          onTradeSignal={(sym, outcome, price, toastText) => {
            handleSelectSymbolGlobal(sym);
            setPrefillOutcome(outcome);
            if (price) setPrefillEntryPrice(price);
            setActiveTab("markets");
            showToast(toastText || `Loaded ${sym} ${outcome} signal into Terminal!`, "success");
          }}
        />
      )}

      {activeTab === "activity" && (
        <ActivityView
          positions={positions}
          publicPositions={publicPositions}
          onClaimAll={handleClaimAll}
          isClaiming={isClaiming}
          onTradeNew={() => setActiveTab("markets")}
          walletAddress={wallet.address || undefined}
          walletBalance={wallet.balance || undefined}
          onEarlyExit={handleEarlyExit}
          onResetPositions={handleResetPositions}
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
                  {(["ALL", "TOP", "SOMNIA", "VOL"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        sound.playClick();
                        setCategoryFilter(cat);
                      }}
                      className={`text-[9px] font-mono py-0.5 rounded-none font-bold uppercase transition-colors border cursor-pointer ${
                        categoryFilter === cat
                          ? "bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.15)]"
                          : "bg-[#0B0D13] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-[#11131C]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Markets Header with Count and Sort */}
              <div className="px-2.5 py-1.5 border-b border-white/[0.07] bg-[#07080C] flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                  <span className="inline-block w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                  MARKETS
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setMarketSort((s) => (s === "DEFAULT" ? "ODDS" : s === "ODDS" ? "VOL" : "DEFAULT"));
                    }}
                    className="text-[9px] font-mono text-zinc-400 hover:text-violet-300 flex items-center gap-0.5 px-1 py-0.5 border border-white/[0.06] rounded-none hover:border-violet-500/40 transition-colors cursor-pointer"
                    title="Toggle Sort: Default / Odds / Volume"
                  >
                    <ArrowUpDown className="w-2.5 h-2.5" />
                    <span>{marketSort === "DEFAULT" ? "SORT" : marketSort}</span>
                  </button>
                  <span className="text-[9px] font-mono text-violet-300 bg-violet-950/40 border border-violet-500/30 px-1.5 py-0.2 rounded-none font-bold">
                    {filteredMarkets.length} PAIRS
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
                          ? "bg-[#0F0E1A] border-violet-500 text-white"
                          : "border-transparent bg-[#08090E] hover:bg-[#0E1018] text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span
                          className={`text-xs font-bold flex items-center gap-1.5 truncate max-w-[155px] ${
                            isSelected ? "text-white" : "text-zinc-200"
                          }`}
                          title={m.symbol}
                        >
                          <CryptoIcon symbol={m.underlyingAsset || m.symbol} size={15} />
                          <span className="truncate">
                            {m.symbol.endsWith("/tUSDC") ? m.symbol : `${m.symbol}/tUSDC`}
                          </span>
                        </span>
                        <span
                          className={`text-[11px] font-bold font-mono px-1.5 py-0.2 border shrink-0 rounded-none tabular-nums ${
                            isYes
                              ? "text-emerald-400 bg-emerald-950/40 border-emerald-500/40"
                              : "text-rose-400 bg-rose-950/40 border-rose-500/40"
                          }`}
                        >
                          {prob.toFixed(1)}%
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-400 line-clamp-1 leading-tight font-sans">
                        {m.question}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono pt-0.5">
                        <span>Bid: <b className="text-zinc-300 font-normal">${m.bestBid ? m.bestBid.toFixed(2) : "0.50"}</b></span>
                        <span>Ask: <b className="text-zinc-300 font-normal">${m.bestAsk ? m.bestAsk.toFixed(2) : "0.52"}</b></span>
                        {m.timeRemainingSec ? (
                          <span className="text-zinc-300 font-bold tabular-nums flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full inline-block animate-pulse" />
                            {Math.floor(m.timeRemainingSec / 60)}:{(m.timeRemainingSec % 60).toString().padStart(2, "0")}
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-bold">Vol ${((m.volume24h || 100000) / 1000).toFixed(0)}K</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Market Navigator Footer Summary */}
              <div className="p-2 bg-[#07070C] border-t border-white/[0.07] flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <span className="flex items-center gap-1 text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  SOMNIA TESTNET
                </span>
                <span className="text-zinc-400 font-bold">24H VOL: ${(total24hVol / 1000).toFixed(0)}K</span>
              </div>
            </aside>

            {/* ── CENTER COLUMN: Price Chart & Order Placement ── */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#07070A] overflow-hidden">
              {/* Header Stats Bar */}
              <MarketStats
                market={activeMarket}
                serverMode={health?.mode}
                onOpenDebate={() => setIsDebateModalOpen(true)}
              />

              {/* Trading Workspace Board */}
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
                {/* Top Half: Multi-Mode Chart Canvas */}
                <div className="flex-shrink-0">
                  <PriceChart
                    symbol={activeSymbol}
                    data={timelineData}
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    currentPrice={activeMarket.probability}
                    strikePrice={activeMarket.strikePrice}
                    activeVisualMode={visualMode}
                    onVisualModeChange={setVisualMode}
                    entryPrice={prefillEntryPrice}
                    targetExitPrice={prefillTargetExit}
                    onSetEntryPrice={(p) => setPrefillEntryPrice(p)}
                    onSetTargetExitPrice={(p) => setPrefillTargetExit(p)}
                    showToast={showToast}
                    timeRemainingSec={activeMarket.timeRemainingSec}
                    expirationTime={activeMarket.expirationTime}
                    expiresAt={activeMarket.expiresAt}
                    marketInterval={activeMarket.interval}
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
                    submitStep={submitStep}
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

          {/* 4. Bottom Dock: Order Positions & Settlement Monitor */}
          <ThesisHealthMonitor
            positions={positions}
            onClaimAll={handleClaimAll}
            isClaiming={isClaiming}
            activeSymbol={activeSymbol}
          />
        </>
      )}

      {/* Market Consensus Debate Modal */}
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
            className={`px-4 py-2.5 rounded-none font-mono text-xs border shadow-xl backdrop-blur-md flex items-center gap-2.5 ${
              toastMessage.type === "success"
                ? "bg-[#0A1813]/95 text-emerald-300 border-emerald-500/40"
                : toastMessage.type === "error"
                ? "bg-[#1C0D11]/95 text-rose-300 border-rose-500/40"
                : "bg-[#0A141E]/95 text-cyan-300 border-cyan-500/40"
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
