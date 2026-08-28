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
 * MarketWatcher inspects, scans, and monitors Event Contracts on DreamDEX
 */
export class MarketWatcher {
  private exchange: SomniaMarkets;
  private venueId?: string;

  constructor(context: ExchangeContext) {
    this.exchange = context.exchange;
    this.venueId = context.config.venueId;
  }

  /**
   * Hydrates/loads markets from DreamDEX indexer
   */
  async loadMarkets(): Promise<void> {
    try {
      await this.exchange.fetchMarkets();
    } catch {
      // Ignore if already loaded
    }
  }

  /**
   * Retrieves all binary event contract markets filtered by venue
   */
  async getActiveEventContracts(): Promise<EventContractMarket[]> {
    const rawMarkets = await this.exchange.fetchMarkets();
    const nowSec = Math.floor(Date.now() / 1000);

    const eventContracts: EventContractMarket[] = [];

    for (const m of rawMarkets) {
      const rawInfo = m.info as any;
      const isBinary = m.type === "binary" || rawInfo?.marketType === "BINARY" || rawInfo?.isBinary;
      if (!isBinary) continue;

      // Filter by venue if specified
      if (this.venueId && rawInfo?.venueId && rawInfo.venueId.toLowerCase() !== this.venueId.toLowerCase()) {
        continue;
      }

      const expirationTime = rawInfo?.expiry ? Number(rawInfo.expiry) : (rawInfo?.expirationTime ? Number(rawInfo.expirationTime) : undefined);
      const timeRemainingSec = expirationTime ? Math.max(0, expirationTime - nowSec) : undefined;
      
      const statusStr = String(rawInfo?.status || "Trading");
      const isTradingStatus = statusStr.toLowerCase() === "trading" || rawInfo?.status === 1 || rawInfo?.status === MarketStatus.Trading;
      const isTradable = isTradingStatus && (!timeRemainingSec || timeRemainingSec > 0);

      const contract: EventContractMarket = {
        id: m.id,
        symbol: m.symbol,
        baseSymbol: m.base,
        quoteSymbol: m.quote,
        venueId: rawInfo?.venueId,
        status: statusStr,
        isTradable,
        question: rawInfo?.question || rawInfo?.title || `${m.base} UP/DOWN`,
        outcomes: (m as any).outcomes?.map((o: any) => o.label || o.symbol) || [OUTCOME_NAMES.UP, OUTCOME_NAMES.DOWN],
        expirationTime,
        timeRemainingSec,
        strikePrice: rawInfo?.strike ? Number(rawInfo.strike) : (rawInfo?.strikePrice ? Number(rawInfo.strikePrice) : undefined),
        underlyingAsset: rawInfo?.asset || m.base.split("-")[0] || m.base,
        interval: rawInfo?.interval || (rawInfo?.intervalSec ? `${Number(rawInfo.intervalSec) / 60}m` : undefined),
        minOrderSize: m.limits?.amount?.min,
        tickSize: m.precision?.price,
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
