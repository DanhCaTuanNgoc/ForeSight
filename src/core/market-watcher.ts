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

      const expirationTime = rawInfo?.expiry ? Number(rawInfo.expiry) : (rawInfo?.expirationTime ? Number(rawInfo.expirationTime) : undefined);
      const timeRemainingSec = expirationTime ? Math.max(0, expirationTime - nowSec) : undefined;

      // Exclude expired markets if finished over 1 hour ago
      if (timeRemainingSec !== undefined && timeRemainingSec <= -3600) {
        continue;
      }

      const statusStr = String(rawInfo?.status || "Trading");
      const isTradingStatus = statusStr.toLowerCase() === "trading" || rawInfo?.status === 1 || rawInfo?.status === MarketStatus.Trading;
      const isTradable = isTradingStatus && (!timeRemainingSec || timeRemainingSec > 0);

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
      const dynamicQuestion = rawInfo?.question || rawInfo?.title || 
        (strikePrice && strikePrice > 0 
          ? `Will ${underlyingAsset} close at or above $${strikePrice.toLocaleString()} at expiry?`
          : `Will ${underlyingAsset} close at or above opening price at expiry?`);

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
        interval: rawInfo?.interval || (rawInfo?.intervalSec ? `${Number(rawInfo.intervalSec) / 60}m` : "5m"),
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
