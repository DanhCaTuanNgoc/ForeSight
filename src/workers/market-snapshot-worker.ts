/**
 * Market Snapshot Worker
 *
 * Polls DreamDEX Event Contracts every N seconds, stores probability
 * snapshots into Supabase, and auto-detects Spikes (probability surges).
 *
 * This drives the Probability Timeline and Spike Detection features.
 */

import chalk from "chalk";
import { MarketWatcher, type EventContractMarket } from "../core/market-watcher.js";
import { isSupabaseConfigured } from "../db/supabase.js";
import { insertSnapshots, getLatestSnapshot, insertSpike } from "../db/repository.js";
import type { MarketSnapshotInsert, SpikeInsert } from "../db/types.js";
import type { ExchangeContext } from "../core/exchange.js";

/** Minimum absolute probability change to flag as a spike. */
const SPIKE_THRESHOLD = 0.10; // 10 percentage points

/** How many seconds between each snapshot poll. */
const DEFAULT_POLL_INTERVAL_SEC = 10;

/**
 * In-memory ring buffer of recent mid-prices per symbol.
 * Used for fast spike detection without extra DB reads on every tick.
 */
const recentPrices = new Map<string, { price: number; time: number }[]>();
const RING_BUFFER_SIZE = 60; // keep last 60 readings (~10 minutes at 10s interval)

export interface SnapshotWorkerOptions {
  pollIntervalSec?: number;
  spikeThreshold?: number;
  maxMarketsPerTick?: number;
}

export class MarketSnapshotWorker {
  private watcher: MarketWatcher;
  private interval: ReturnType<typeof setInterval> | null = null;
  private pollSec: number;
  private threshold: number;
  private maxPerTick: number;
  private isRunning = false;
  private tickCount = 0;
  private snapshotsWritten = 0;
  private spikesDetected = 0;

  constructor(ctx: ExchangeContext, opts: SnapshotWorkerOptions = {}) {
    this.watcher = new MarketWatcher(ctx);
    this.pollSec = opts.pollIntervalSec ?? DEFAULT_POLL_INTERVAL_SEC;
    this.threshold = opts.spikeThreshold ?? SPIKE_THRESHOLD;
    this.maxPerTick = opts.maxMarketsPerTick ?? 100;
  }

  /** Start the polling loop. */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log(
      chalk.cyan(`[SnapshotWorker] Started — polling every ${this.pollSec}s, spike threshold ${(this.threshold * 100).toFixed(0)}%`),
    );

    // Run first tick immediately
    this.tick().catch((err) => console.error(chalk.red("[SnapshotWorker] tick error:"), err));

    this.interval = setInterval(() => {
      this.tick().catch((err) => console.error(chalk.red("[SnapshotWorker] tick error:"), err));
    }, this.pollSec * 1000);
  }

  /** Stop the polling loop. */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log(
      chalk.yellow(
        `[SnapshotWorker] Stopped after ${this.tickCount} ticks — ${this.snapshotsWritten} snapshots, ${this.spikesDetected} spikes`,
      ),
    );
  }

  /** Return current worker stats. */
  getStats() {
    return {
      isRunning: this.isRunning,
      tickCount: this.tickCount,
      snapshotsWritten: this.snapshotsWritten,
      spikesDetected: this.spikesDetected,
      trackedSymbols: recentPrices.size,
    };
  }

  /** Single poll iteration: fetch markets → store snapshots → detect spikes. */
  private async tick(): Promise<void> {
    this.tickCount++;

    try {
      const markets = await this.watcher.getActiveEventContracts();
      const tradable = markets.filter((m) => m.isTradable).slice(0, this.maxPerTick);

      if (tradable.length === 0) return;

      // ── 1. Build snapshot rows ──────────────────────────────
      const now = new Date().toISOString();
      const snapshots: MarketSnapshotInsert[] = [];

      for (const m of tradable) {
        // Try to get orderbook depth for accurate mid-price
        let bestBid = m.bestBid ?? null;
        let bestAsk = m.bestAsk ?? null;
        let midPrice = m.midPrice ?? null;

        try {
          const ob = await this.watcher.getOrderbookDepth(m.symbol, 5);
          if (ob.bids.length > 0) bestBid = ob.bids[0][0];
          if (ob.asks.length > 0) bestAsk = ob.asks[0][0];
          if (bestBid !== null && bestAsk !== null) {
            midPrice = (bestBid + bestAsk) / 2;
          }
        } catch {
          // Fall back to market-level data
        }

        snapshots.push({
          symbol: m.symbol,
          asset: m.underlyingAsset || m.baseSymbol.split("-")[0] || "UNKNOWN",
          cadence: m.interval || null,
          best_bid: bestBid,
          best_ask: bestAsk,
          mid_price: midPrice,
          spread: bestBid !== null && bestAsk !== null ? bestAsk - bestBid : null,
          time_remaining_sec: m.timeRemainingSec ?? null,
          is_tradable: m.isTradable,
          recorded_at: now,
        });

        // ── 2. Update ring buffer & detect spikes ──────────────
        if (midPrice !== null) {
          this.updateRingBuffer(m.symbol, midPrice, Date.now());
          await this.detectSpike(m, midPrice);
        }
      }

      // ── 3. Persist to Supabase ──────────────────────────────
      if (isSupabaseConfigured()) {
        const written = await insertSnapshots(snapshots);
        this.snapshotsWritten += written;

        // Log progress every 30 ticks (~5 minutes)
        if (this.tickCount % 30 === 0) {
          console.log(
            chalk.gray(
              `[SnapshotWorker] tick #${this.tickCount} — ${written} snapshots written, ${tradable.length} markets, ${this.spikesDetected} total spikes`,
            ),
          );
        }
      }
    } catch (err: any) {
      console.error(chalk.red(`[SnapshotWorker] tick #${this.tickCount} error:`), err?.message || err);
    }
  }

  /** Push price into per-symbol ring buffer. */
  private updateRingBuffer(symbol: string, price: number, timeMs: number): void {
    let buf = recentPrices.get(symbol);
    if (!buf) {
      buf = [];
      recentPrices.set(symbol, buf);
    }
    buf.push({ price, time: timeMs });
    if (buf.length > RING_BUFFER_SIZE) {
      buf.shift();
    }
  }

  /** Compare current mid-price against recent history to detect spikes. */
  private async detectSpike(market: EventContractMarket, currentPrice: number): Promise<void> {
    const buf = recentPrices.get(market.symbol);
    if (!buf || buf.length < 3) return; // Need at least 3 readings

    // Look back ~60 seconds in the ring buffer
    const now = Date.now();
    const lookbackMs = 60_000;
    const oldEntries = buf.filter((e) => now - e.time >= lookbackMs * 0.8 && now - e.time <= lookbackMs * 1.5);

    if (oldEntries.length === 0) return;

    const oldPrice = oldEntries[0].price;
    const delta = currentPrice - oldPrice;
    const absDelta = Math.abs(delta);

    if (absDelta < this.threshold) return;

    // Spike detected!
    const spikeType = delta > 0 ? "UP_SURGE" : "DOWN_SURGE";
    const deltaPct = oldPrice > 0 ? (absDelta / oldPrice) * 100 : 0;
    const asset = market.underlyingAsset || market.baseSymbol.split("-")[0] || "UNKNOWN";

    console.log(
      chalk.bold.magenta(
        `🔥 [SPIKE] ${spikeType} on ${market.symbol}: ${(oldPrice * 100).toFixed(1)}% → ${(currentPrice * 100).toFixed(1)}% (Δ${(delta * 100).toFixed(1)}pp)`,
      ),
    );

    this.spikesDetected++;

    if (isSupabaseConfigured()) {
      const spike: SpikeInsert = {
        symbol: market.symbol,
        asset,
        cadence: market.interval || null,
        spike_type: spikeType,
        probability_before: oldPrice,
        probability_after: currentPrice,
        delta: absDelta,
        delta_pct: deltaPct,
        window_seconds: 60,
        context_summary: null,   // To be filled by Phase 2 AI engine
        bull_argument: null,
        bear_argument: null,
        sources: [],
      };
      await insertSpike(spike);
    }
  }
}
