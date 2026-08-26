import type { EventContractMarket, MarketAnalysis } from "../core/market-watcher.js";

export type SignalDirection = "UP" | "DOWN" | "NEUTRAL";

export interface TradingSignal {
  symbol: string;
  direction: SignalDirection;
  confidence: number; // 0.0 to 1.0
  targetPrice: number; // Desired entry price (0.01 to 0.99)
  recommendedSize: number; // Token quantity
  rationale: string;
  timestamp: number;
}

export interface AgentMetrics {
  totalTrades: number;
  successfulTrades: number;
  totalVolumeUsdc: number;
  unrealizedPnL: number;
  realizedPnL: number;
  lastTickTime: number;
  status: "idle" | "running" | "stopped" | "error";
}

export interface AgentStrategy {
  name: string;
  description: string;
  evaluate(market: EventContractMarket, analysis?: MarketAnalysis): Promise<TradingSignal | null>;
}
