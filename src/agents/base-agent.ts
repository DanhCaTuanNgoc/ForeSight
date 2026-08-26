import chalk from "chalk";
import type { ExchangeContext } from "../core/exchange.js";
import { MarketWatcher, type EventContractMarket } from "../core/market-watcher.js";
import { OrderEngine } from "../core/order-engine.js";
import { SettlementSweeper } from "../core/settlement-sweeper.js";
import type { AgentMetrics, AgentStrategy, TradingSignal } from "./types.js";

export abstract class BaseAgent {
  protected context: ExchangeContext;
  protected watcher: MarketWatcher;
  protected orderEngine: OrderEngine;
  protected sweeper: SettlementSweeper;
  protected isRunning = false;
  protected pollIntervalMs: number;

  public metrics: AgentMetrics = {
    totalTrades: 0,
    successfulTrades: 0,
    totalVolumeUsdc: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    lastTickTime: 0,
    status: "idle",
  };

  constructor(context: ExchangeContext, pollIntervalMs = 3000) {
    this.context = context;
    this.watcher = new MarketWatcher(context);
    this.orderEngine = new OrderEngine(context);
    this.sweeper = new SettlementSweeper(context);
    this.pollIntervalMs = pollIntervalMs;
  }

  abstract get strategy(): AgentStrategy;

  /**
   * Initializes market data and connection
   */
  async init(): Promise<void> {
    console.log(chalk.cyan(`[${this.strategy.name}] Initializing on ${this.context.config.networkName}...`));
    await this.watcher.loadMarkets();
    console.log(chalk.green(`[${this.strategy.name}] Loaded markets successfully.`));
  }

  /**
   * Starts the agent execution loop
   */
  async start(): Promise<void> {
    await this.init();
    this.isRunning = true;
    this.metrics.status = "running";
    console.log(chalk.bold.green(`[${this.strategy.name}] Agent started. Running ticks every ${this.pollIntervalMs}ms...`));

    while (this.isRunning) {
      try {
        await this.tick();
      } catch (err: any) {
        console.error(chalk.red(`[${this.strategy.name}] Error during tick: ${err?.message || err}`));
      }

      // Check auto-claim if enabled
      if (this.context.config.autoClaim) {
        await this.sweeper.maybeClaim();
      }

      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }
  }

  /**
   * Stops the agent gracefully
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    this.metrics.status = "stopped";
    console.log(chalk.yellow(`[${this.strategy.name}] Agent stopped.`));
  }

  /**
   * Single execution cycle over tradable markets
   */
  protected async tick(): Promise<void> {
    this.metrics.lastTickTime = Date.now();
    const markets = await this.watcher.getActiveEventContracts();
    const tradableMarkets = markets.filter((m) => m.isTradable);

    for (const market of tradableMarkets) {
      const signal = await this.strategy.evaluate(market);
      if (signal) {
        await this.executeSignal(signal, market);
      }
    }
  }

  /**
   * Executes a generated signal with order safety
   */
  protected async executeSignal(signal: TradingSignal, market: EventContractMarket): Promise<void> {
    if (signal.direction === "NEUTRAL") return;

    console.log(
      chalk.magenta(
        `[SIGNAL] ${market.symbol} -> ${signal.direction} @ ${signal.targetPrice.toFixed(2)} (Conf: ${(signal.confidence * 100).toFixed(0)}%) | ${signal.rationale}`
      )
    );

    if (!this.context.canTrade) {
      console.log(chalk.dim(`[DRY-RUN] Would buy ${signal.recommendedSize} ${signal.direction} contracts.`));
      return;
    }

    const res = await this.orderEngine.placeLimitOrder({
      symbol: market.symbol,
      side: "buy",
      price: signal.targetPrice,
      amount: signal.recommendedSize,
    });

    this.metrics.totalTrades++;
    if (res.success) {
      this.metrics.successfulTrades++;
      this.metrics.totalVolumeUsdc += signal.targetPrice * signal.recommendedSize;
      console.log(chalk.green(`[ORDER SUCCESS] Placed order ID: ${res.orderId}`));
    } else {
      console.log(chalk.red(`[ORDER FAILED] ${res.error}`));
    }
  }
}
