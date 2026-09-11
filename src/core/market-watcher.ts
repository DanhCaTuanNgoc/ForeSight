import type { SomniaMarkets } from "@somnia-chain/markets-sdk";
import { MarketStatus, OUTCOME_NAMES } from "../config/constants.js";
import type { ExchangeContext } from "./exchange.js";

export interface EventContractMarket {
  id: string;
  symbol: string;
  baseSymbol: string;
  quoteSymbol: string;
  venueId?: string;
  status: string | number;
  isTradable: boolean;
  question?: string;
  outcomes: string[];
  expirationTime?: number;
  timeRemainingSec?: number;
  strikePrice?: number;
  underlyingAsset?: string;
  interval?: string;
  minOrderSize?: number;
  tickSize?: number;
  bestBid?: number;
  bestAsk?: number;
  midPrice?: number;
  impliedUpProbability?: number;
  impliedDownProbability?: number;
  spread?: number;
  probability?: number;
  volume24h?: number;
  marketAddress?: string;
  poolAddress?: string;
  yesTokenId?: string;
  noTokenId?: string;
}

export interface MarketAnalysis {
  market: EventContractMarket;
  orderbook: {
    bids: [number, number][];
    asks: [number, number][];
  };
  fairUpPrice: number;
  fairDownPrice: number;
  mispricing: {
    upMispricing: number;
    downMispricing: number;
  };
}

/**
 * Sanitizes and cleans raw DreamDEX question strings into trader-friendly, professional format.
 * E.g. "Pricefeed test: will ETH/USDC's price be at or above 2505.80 at unix time 1789133520?"
 * becomes: "Will ETH/USDC settle at or above $2,505.80 at expiry?"
 */
export function sanitizeMarketQuestion(
  rawQuestion?: string,
  underlyingAsset?: string,
  strikePrice?: number
): string {
  const asset = underlyingAsset || "Asset";

  if (!rawQuestion || typeof rawQuestion !== "string") {
    return strikePrice && strikePrice > 0
      ? `Will ${asset} settle at or above $${strikePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} at expiry?`
      : `Will ${asset} settle at or above opening price at expiry?`;
  }

  let clean = rawQuestion.trim();

  // 1. Remove testnet / pricefeed prefix noise
  clean = clean.replace(/^(pricefeed\s*test|pricefeed|testnet|test|mock)\s*:\s*/i, "");

  // 2. Remove "at unix time <timestamp>" or replace with "at expiry"
  clean = clean.replace(/at\s+unix\s+time\s+\d+\??/i, "at expiry?");
  clean = clean.replace(/at\s+unix\s+time\b/i, "at expiry");

  // 3. Format raw numbers into currency if missing $
  // e.g. "at or above 2505.80" -> "at or above $2,505.80"
  clean = clean.replace(/(at or above|above|below|reach)\s+(\d+(?:\.\d+)?)/i, (match, prefix, numStr) => {
    const val = Number(numStr);
    if (!isNaN(val) && val > 0) {
      const formatted = val >= 1000
        ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$${val}`;
      return `${prefix} ${formatted}`;
    }
    return match;
  });

  // 4. Polish grammar and phrasing
  clean = clean.replace(/^will\s+([A-Z0-9\/-]+)'s\s+price\s+be\s+/i, "Will $1 settle ");
  clean = clean.replace(/^will\s+([A-Z0-9\/-]+)\s+be\s+at\s+or\s+above/i, "Will $1 settle at or above");

  // 5. Clean whitespace & ensure proper capitalization and question mark
  clean = clean.replace(/\s+/g, " ").trim();
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  if (!clean.endsWith("?")) {
    clean += "?";
  }

  return clean;
}

/**
 * MarketWatcher inspects, scans, and monitors Event Contracts on DreamDEX
 */
export class MarketWatcher {
  private exchange: SomniaMarkets;
  private venueId?: string;
  private lastReloadTime: number = 0;
  private reloadPromise: Promise<void> | null = null;
  private autoPollTimer: NodeJS.Timeout | null = null;
  private readonly reloadIntervalMs: number = 8_000; // 8-second cache TTL for high-frequency pool discovery

  constructor(context: ExchangeContext) {
    this.exchange = context.exchange;
    this.venueId = context.config.venueId;
  }

  /**
   * Hydrates/reloads markets from DreamDEX indexer with request deduplication
   */
  async loadMarkets(force = false): Promise<void> {
    const now = Date.now();
    if (!force && this.lastReloadTime > 0 && now - this.lastReloadTime < this.reloadIntervalMs) {
      return;
    }

    if (this.reloadPromise) {
      return this.reloadPromise;
    }

    this.reloadPromise = (async () => {
      try {
        await (this.exchange as any).loadMarkets(true);
        this.lastReloadTime = Date.now();
      } catch (err) {
        console.warn("[MarketWatcher] Error reloading markets from DreamDEX indexer:", err);
      } finally {
        this.reloadPromise = null;
      }
    })();

    return this.reloadPromise;
  }

  /**
   * Starts high-frequency background polling to discover newly created DreamDEX rounds immediately
   */
  startAutoPolling(intervalMs = 8000): void {
    if (this.autoPollTimer) return;
    // Immediate initial sync
    this.loadMarkets(true).catch(() => {});
    this.autoPollTimer = setInterval(async () => {
      try {
        await this.loadMarkets(true);
      } catch (err) {
        console.warn("[MarketWatcher] Auto-poll sync error:", err);
      }
    }, intervalMs);
    if (this.autoPollTimer.unref) {
      this.autoPollTimer.unref();
    }
  }

  /**
   * Stops high-frequency background polling
   */
  stopAutoPolling(): void {
    if (this.autoPollTimer) {
      clearInterval(this.autoPollTimer);
      this.autoPollTimer = null;
    }
  }

  /**
   * Retrieves all binary event contract markets filtered by venue
   */
  async getActiveEventContracts(): Promise<EventContractMarket[]> {
    // If never loaded or cache is stale, reload markets from indexer
    if (this.lastReloadTime === 0 || Date.now() - this.lastReloadTime >= this.reloadIntervalMs) {
      await this.loadMarkets(false);
    }

    const rawMarkets = await this.exchange.fetchMarkets();
    const nowSec = Math.floor(Date.now() / 1000);

    const eventContracts: EventContractMarket[] = [];

    for (const m of rawMarkets) {
      const rawInfo = m.info as any;
      const isBinary = m.type === "binary" || rawInfo?.marketType === "BINARY" || rawInfo?.isBinary;
      if (!isBinary) continue;

      const expirationTime = rawInfo?.expiry ? Number(rawInfo.expiry) : (rawInfo?.expirationTime ? Number(rawInfo.expirationTime) : undefined);
      
      // Exclude expired markets where trading is no longer active
      if (expirationTime !== undefined && expirationTime <= nowSec) {
        continue;
      }

      const timeRemainingSec = expirationTime ? Math.max(1, expirationTime - nowSec) : undefined;
      const statusStr = String(rawInfo?.status || "Trading");
      const isTradingStatus = statusStr.toLowerCase() === "trading" || rawInfo?.status === 1 || rawInfo?.status === MarketStatus.Trading;
      const isTradable = isTradingStatus && Boolean(timeRemainingSec && timeRemainingSec > 0);

      // Parse strike price from DreamDEX raw integer representation
      let strikePrice: number | undefined;
      const rawStrike = rawInfo?.strike ?? rawInfo?.strikePrice;
      if (rawStrike !== undefined && rawStrike !== null) {
        const num = Number(rawStrike);
        if (num > 10000) {
          // 2 decimals on DreamDEX (e.g. 250035 => $2500.35, 7894756 => $78947.56)
          strikePrice = Number((num / 100).toFixed(2));
        } else if (num > 0) {
          strikePrice = num;
        } else {
          strikePrice = 0;
        }
      }

      const underlyingAsset = rawInfo?.asset || m.base.split("-")[0] || m.base;
      const dynamicQuestion = sanitizeMarketQuestion(
        rawInfo?.question || rawInfo?.title,
        underlyingAsset,
        strikePrice
      );

      // Determine human-readable cadence interval
      let interval = "5m";
      if (rawInfo?.interval) {
        interval = rawInfo.interval;
      } else if (rawInfo?.intervalSec) {
        const sec = Number(rawInfo.intervalSec);
        if (sec === 60) interval = "1m";
        else if (sec === 300) interval = "5m";
        else if (sec === 900) interval = "15m";
        else if (sec === 3600) interval = "1h";
        else if (sec === 14400) interval = "4h";
        else if (sec === 86400) interval = "24h";
        else if (sec >= 86400) interval = `${Math.round(sec / 86400)}d`;
        else interval = `${Math.round(sec / 60)}m`;
      }

      const contract: EventContractMarket = {
        id: m.id,
        symbol: m.symbol,
        baseSymbol: m.base,
        quoteSymbol: m.quote,
        venueId: rawInfo?.venueId,
        status: statusStr,
        isTradable,
        question: dynamicQuestion,
        outcomes: (m as any).outcomes?.map((o: any) => o.label || o.symbol) || [OUTCOME_NAMES.UP, OUTCOME_NAMES.DOWN],
        expirationTime,
        timeRemainingSec,
        strikePrice,
        underlyingAsset,
        interval,
        minOrderSize: m.limits?.amount?.min,
        tickSize: m.precision?.price,
        marketAddress: rawInfo?.marketAddress,
        poolAddress: rawInfo?.poolAddress,
        yesTokenId: rawInfo?.yesTokenId,
        noTokenId: rawInfo?.noTokenId,
      };

      // Best bid / ask if present
      if (m.info?.lastPrice !== undefined && m.info?.lastPrice !== null) {
        let p = Number(m.info.lastPrice);
        if (p > 1000) {
          p = p / 1_000_000;
        } else if (p > 1) {
          p = p / 100;
        }
        p = Math.max(0.01, Math.min(0.99, p));
        contract.midPrice = Number(p.toFixed(4));
        contract.impliedUpProbability = contract.midPrice;
        contract.impliedDownProbability = Number((1 - contract.midPrice).toFixed(4));
      }

      eventContracts.push(contract);
    }

    // Trigger immediate force reload if zero active contracts remain
    if (eventContracts.length === 0) {
      this.loadMarkets(true).catch(() => {});
    }

    eventContracts.sort((a, b) => (a.timeRemainingSec || 999999) - (b.timeRemainingSec || 999999));
    return eventContracts;
  }

  /**
   * Fetches detailed depth for a single symbol
   */
  async getOrderbookDepth(symbol: string, limit = 20) {
    return await this.exchange.fetchOrderBook(symbol, limit);
  }

  /**
   * Analyzes mispricing between estimated fair odds and orderbook quotes
   */
  async analyzeMarket(symbol: string, estimatedFairUpProbability: number): Promise<MarketAnalysis | null> {
    const markets = await this.getActiveEventContracts();
    const market = markets.find((m) => m.symbol === symbol || m.id === symbol);
    if (!market) return null;

    const orderbook = await this.getOrderbookDepth(market.symbol);
    const fairUpPrice = Math.min(Math.max(estimatedFairUpProbability, 0.01), 0.99);
    const fairDownPrice = 1 - fairUpPrice;

    const bestAsk = market.bestAsk ?? 1;
    const bestBid = market.bestBid ?? 0;

    return {
      market,
      orderbook: {
        bids: orderbook.bids,
        asks: orderbook.asks,
      },
      fairUpPrice,
      fairDownPrice,
      mispricing: {
        upMispricing: fairUpPrice - bestAsk,
        downMispricing: (1 - fairUpPrice) - (1 - bestBid),
      },
    };
  }
}
