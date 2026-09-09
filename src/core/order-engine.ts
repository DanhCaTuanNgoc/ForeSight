import type { SomniaMarkets } from "@somnia-chain/markets-sdk";
import type { ExchangeContext } from "./exchange.js";
import type { AppConfig } from "../config/env.js";

export interface PlaceOrderParams {
  symbol: string;
  side: "buy" | "sell";
  price: number; // 0.01 to 0.99 USDC for binary prediction tokens
  amount: number; // Quantity of outcome tokens
  outcome?: "YES" | "NO" | "UP" | "DOWN";
  postOnly?: boolean;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  txHash?: string;
  filledAmount?: number;
  error?: string;
}

/**
 * OrderEngine manages safe, gated execution on DreamDEX CLOB
 */
export class OrderEngine {
  private exchange: SomniaMarkets;
  private config: AppConfig;
  private canTrade: boolean;

  constructor(context: ExchangeContext) {
    this.exchange = context.exchange;
    this.config = context.config;
    this.canTrade = context.canTrade;
  }

  /**
   * Places a limit order with risk controls and pre-execution validation
   */
  async placeLimitOrder(params: PlaceOrderParams): Promise<OrderResult> {
    if (!this.canTrade) {
      return {
        success: false,
        error: "Trading disabled: No PRIVATE_KEY configured in environment.",
      };
    }

    const orderValueUsdc = params.price * params.amount;
    if (orderValueUsdc > this.config.maxOrderSizeUsdc) {
      return {
        success: false,
        error: `Order size ${orderValueUsdc.toFixed(2)} USDC exceeds MAX_ORDER_SIZE_USDC limit of ${this.config.maxOrderSizeUsdc} USDC`,
      };
    }

    try {
      // Resolve proper tradable symbol with #YES or #NO suffix for DreamDEX Binary markets
      const normalizedOutcome = params.outcome
        ? (params.outcome.toUpperCase() === "NO" || params.outcome.toUpperCase() === "DOWN" ? "NO" : "YES")
        : undefined;

      let tradableRef = params.symbol;
      if (normalizedOutcome && !tradableRef.includes("#")) {
        tradableRef = `${params.symbol}#${normalizedOutcome}`;
      }

      // Validate market state
      const market = this.exchange.market(tradableRef);
      if (!market) {
        return {
          success: false,
          error: `Market not found for symbol: ${tradableRef}`,
        };
      }

      // In binary prediction markets, entering an outcome position (YES or NO) is a "buy" on that outcome tradable
      const orderSide = normalizedOutcome ? "buy" : params.side;

      // Execute order via SomniaMarkets unified API
      const result = await this.exchange.createOrder(
        tradableRef,
        "limit",
        orderSide,
        params.amount,
        params.price,
        { postOnly: params.postOnly }
      );

      return {
        success: true,
        orderId: result.id,
        txHash: (result as any).hash || (result as any).txHash,
        filledAmount: result.filled,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || String(err),
      };
    }
  }

  /**
   * Takes liquidity by crossing the resting quote
   */
  async placeMarketOrder(symbol: string, side: "buy" | "sell", amount: number): Promise<OrderResult> {
    if (!this.canTrade) {
      return {
        success: false,
        error: "Trading disabled: No PRIVATE_KEY configured in environment.",
      };
    }

    try {
      const result = await this.exchange.createOrder(
        symbol,
        "market",
        side,
        amount
      );

      return {
        success: true,
        orderId: result.id,
        filledAmount: result.filled,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || String(err),
      };
    }
  }

  /**
   * Cancels a resting limit order
   */
  async cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    if (!this.canTrade) return false;
    try {
      await this.exchange.cancelOrder(orderId, symbol);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cancels all open orders for a specific symbol or all markets
   */
  async cancelAllOrders(symbol?: string): Promise<number> {
    if (!this.canTrade) return 0;
    try {
      const openOrders = await this.exchange.fetchOpenOrders(symbol);
      let count = 0;
      for (const order of openOrders) {
        try {
          await this.exchange.cancelOrder(order.id, order.symbol);
          count++;
        } catch {
          // Continue canceling remaining
        }
      }
      return count;
    } catch {
      return 0;
    }
  }
}
