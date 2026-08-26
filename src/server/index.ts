import express from "express";
import cors from "cors";
import chalk from "chalk";
import { createExchangeContext, shutdownExchange, type ExchangeContext } from "../core/exchange.js";
import { MarketWatcher } from "../core/market-watcher.js";
import { OrderEngine } from "../core/order-engine.js";
import { SettlementSweeper } from "../core/settlement-sweeper.js";
import { AICopilotStrategy } from "../agents/strategies/ai-copilot.js";
import { isSupabaseConfigured } from "../db/supabase.js";
import { MarketSnapshotWorker } from "../workers/market-snapshot-worker.js";
import { NewsIngestionWorker } from "../workers/news-ingestion-worker.js";
import {
  getTimeline,
  getRecentSpikes,
  getNewsByTimeWindow,
  getLatestNews,
  saveStrategy,
  getStrategiesByWallet,
} from "../db/repository.js";
import { generateDualDebate, calculateScenario } from "../agents/strategies/dual-debate-engine.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

let ctx: ExchangeContext;
let watcher: MarketWatcher;
let orderEngine: OrderEngine;
let sweeper: SettlementSweeper;
let snapshotWorker: MarketSnapshotWorker;
let newsWorker: NewsIngestionWorker;
const copilotStrategy = new AICopilotStrategy();

// In-memory simulated positions and recent trade logs for demo / testing
const simulatedPositions: Array<{
  id: string;
  symbol: string;
  outcome: "YES" | "NO";
  amount: number;
  entryPrice: number;
  timestamp: number;
  status: "OPEN" | "SETTLED";
}> = [];

// ═══════════════════════════════════════════════════════════════
// EXISTING ENDPOINTS (unchanged logic)
// ═══════════════════════════════════════════════════════════════

/**
 * Health & Connectivity Info
 */
app.get("/api/health", async (req, res) => {
  try {
    const isLive = Boolean(ctx);
    res.json({
      status: "ok",
      network: ctx?.config.networkName || "Somnia Testnet",
      chainId: ctx?.config.chainId || 50312,
      rpcUrl: ctx?.config.rpcUrl,
      indexerUrl: ctx?.config.indexerUrl,
      venueId: ctx?.config.venueId,
      canTrade: ctx?.canTrade || false,
      walletAddress: ctx?.walletAddress || null,
      supabaseConnected: isSupabaseConfigured(),
      workers: {
        snapshots: snapshotWorker?.getStats() ?? null,
        news: newsWorker?.getStats() ?? null,
      },
      serverTime: Date.now(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * Get All Active & Live Event Contracts
 */
app.get("/api/markets", async (req, res) => {
  try {
    const markets = await watcher.getActiveEventContracts();
    const asset = req.query.asset as string | undefined;
    const cadence = req.query.cadence as string | undefined;

    let filtered = markets;
    if (asset && asset !== "ALL") {
      filtered = filtered.filter((m) => m.underlyingAsset?.toUpperCase() === asset.toUpperCase());
    }
    if (cadence && cadence !== "ALL") {
      filtered = filtered.filter((m) => m.interval === cadence);
    }

    res.json({
      count: filtered.length,
      totalMarkets: markets.length,
      markets: filtered,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * Get Specific Market Orderbook & Implied Probabilities
 */
app.get("/api/markets/:symbol/orderbook", async (req, res) => {
  try {
    const symbol = decodeURIComponent(req.params.symbol);
    const depth = await watcher.getOrderbookDepth(symbol, 15);
    const markets = await watcher.getActiveEventContracts();
    const market = markets.find((m) => m.symbol === symbol || m.id === symbol);

    const bestBid = depth.bids[0]?.[0] ?? 0;
    const bestAsk = depth.asks[0]?.[0] ?? 1;
    const mid = (bestBid + bestAsk) / 2;

    res.json({
      symbol,
      market,
      bids: depth.bids,
      asks: depth.asks,
      bestBid,
      bestAsk,
      midPrice: mid,
      impliedOdds: {
        yes: Number(mid.toFixed(3)),
        no: Number((1 - mid).toFixed(3)),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * Run AI Copilot Reasoning on Live Markets
 */
app.get("/api/signals", async (req, res) => {
  try {
    const markets = await watcher.getActiveEventContracts();
    const tradable = markets.filter((m) => m.isTradable).slice(0, 10);

    const signals = [];
    for (const m of tradable) {
      const analysis = await copilotStrategy.generateAIAnalysis(m);
      if (analysis) {
        signals.push({
          symbol: m.symbol,
          question: m.question,
          asset: m.underlyingAsset,
          cadence: m.interval,
          timeRemainingSec: m.timeRemainingSec,
          direction: analysis.direction,
          confidence: analysis.confidence,
          suggestedPrice: analysis.suggestedPrice,
          reasoning: analysis.reasoning,
          timestamp: Date.now(),
        });
      }
    }

    res.json({
      count: signals.length,
      signals,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * Submit Prediction Order (Live Testnet or Simulation)
 */
app.post("/api/orders", async (req, res) => {
  try {
    const { symbol, outcome, amount, price, simulate } = req.body;

    if (!symbol || !outcome || !amount) {
      return res.status(400).json({ error: "Missing required order fields: symbol, outcome, amount" });
    }

    const targetOutcomeSymbol = `${symbol}#${outcome.toUpperCase()}`;
    const orderPrice = price || (outcome === "YES" ? 0.55 : 0.45);

    if (simulate || !ctx.canTrade) {
      // Create simulated position
      const newPos = {
        id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        symbol,
        outcome: outcome.toUpperCase() as "YES" | "NO",
        amount: Number(amount),
        entryPrice: orderPrice,
        timestamp: Date.now(),
        status: "OPEN" as const,
      };
      simulatedPositions.unshift(newPos);

      return res.json({
        success: true,
        simulated: true,
        position: newPos,
        message: `Simulated ${outcome} position entered for ${amount} contracts @ ${orderPrice} USDC`,
      });
    }

    // Execute on live Somnia testnet
    const result = await orderEngine.placeLimitOrder({
      symbol: targetOutcomeSymbol,
      side: "buy",
      price: orderPrice,
      amount: Number(amount),
    });

    res.json({
      success: result.success,
      orderId: result.orderId,
      error: result.error,
      filledAmount: result.filledAmount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * Get User Positions & Balances
 */
app.get("/api/positions", async (req, res) => {
  try {
    let balances: any = {};
    if (ctx.canTrade) {
      try {
        balances = await ctx.exchange.fetchBalance();
      } catch {
        // Ignore balance read error
      }
    }

    res.json({
      walletAddress: ctx.walletAddress || null,
      balances,
      simulatedPositions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * Sweep and Claim All Settled Contracts
 */
app.post("/api/claim", async (req, res) => {
  try {
    if (!ctx.canTrade) {
      // Simulate claiming positions
      let claimedCount = 0;
      for (const pos of simulatedPositions) {
        if (pos.status === "OPEN") {
          pos.status = "SETTLED";
          claimedCount++;
        }
      }
      return res.json({
        success: true,
        simulated: true,
        message: `Simulated settlement sweep completed: redeemed ${claimedCount} positions.`,
        claimedCount,
      });
    }

    const results = await sweeper.sweepSettledMarkets();
    res.json({
      success: true,
      results,
      claimedCount: results.filter((r) => r.claimed).length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

// ═══════════════════════════════════════════════════════════════
// NEW PHASE 1 ENDPOINTS — Database-backed Intelligence Data
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/timeline/:symbol
 * Fetch probability history for a market (powers the Area Chart).
 * Query params: from (ISO), to (ISO), limit
 */
app.get("/api/timeline/:symbol", async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({ error: "Database not configured", data: [] });
    }

    const symbol = decodeURIComponent(req.params.symbol);
    const from = (req.query.from as string) || new Date(Date.now() - 3600_000).toISOString(); // default: last 1h
    const to = (req.query.to as string) || new Date().toISOString();
    const limit = Math.min(Number(req.query.limit) || 500, 1000);

    const data = await getTimeline(symbol, from, to, limit);

    res.json({
      symbol,
      from,
      to,
      count: data.length,
      data,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * GET /api/spikes
 * Fetch recent probability spikes (powers Spike Detection & AI Debate).
 * Query params: asset, symbol, limit
 */
app.get("/api/spikes", async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({ error: "Database not configured", spikes: [] });
    }

    const asset = req.query.asset as string | undefined;
    const symbol = req.query.symbol as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const spikes = await getRecentSpikes({ asset, symbol, limit });

    res.json({
      count: spikes.length,
      spikes,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * GET /api/news
 * Fetch latest crypto news stored in DB (powers RAG Evidence).
 * Query params: from, to, asset, limit
 */
app.get("/api/news", async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({ error: "Database not configured", news: [] });
    }

    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const asset = req.query.asset as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    let news;
    if (from && to) {
      news = await getNewsByTimeWindow(from, to, asset, limit);
    } else {
      news = await getLatestNews(limit);
    }

    res.json({
      count: news.length,
      news,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * POST /api/strategies
 * Save a user strategy configuration to the database.
 */
app.post("/api/strategies", async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { name, wallet_address, strategy_type, config } = req.body;

    if (!name || !strategy_type) {
      return res.status(400).json({ error: "Missing required fields: name, strategy_type" });
    }

    const saved = await saveStrategy({
      name,
      wallet_address: wallet_address?.toLowerCase() || null,
      strategy_type,
      config: config || {},
      is_active: false,
    });

    res.json({ success: true, strategy: saved });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * GET /api/strategies/:wallet
 * Get all saved strategies for a wallet address.
 */
app.get("/api/strategies/:wallet", async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({ error: "Database not configured", strategies: [] });
    }

    const wallet = req.params.wallet;
    const strategies = await getStrategiesByWallet(wallet);

    res.json({
      count: strategies.length,
      strategies,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * GET /api/debate/:symbol
 * Generate real-time Dual AI Agent debate (Bull vs Bear) for a market or spike.
 */
app.get("/api/debate/:symbol", async (req, res) => {
  try {
    const symbol = decodeURIComponent(req.params.symbol);
    const markets = await watcher.getActiveEventContracts();
    const market = markets.find((m) => m.symbol === symbol || m.id === symbol);

    if (!market) {
      return res.status(404).json({ error: `Market ${symbol} not found.` });
    }

    const spikeId = req.query.spikeId as string | undefined;
    const spikeMagnitude = req.query.magnitude ? Number(req.query.magnitude) : undefined;
    const spikeTimestamp = req.query.timestamp ? Number(req.query.timestamp) : undefined;

    const debate = await generateDualDebate({
      market,
      spikeId,
      spikeMagnitude,
      spikeTimestamp,
    });

    res.json({
      success: true,
      debate,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

/**
 * POST /api/simulate
 * Deterministic Scenario Calculation Engine.
 */
app.post("/api/simulate", async (req, res) => {
  try {
    const { symbol, outcome, investmentUsdc, entryPrice, targetExitPrice, stopLossPrice } = req.body;

    if (!symbol || !outcome || investmentUsdc === undefined || entryPrice === undefined || targetExitPrice === undefined) {
      return res.status(400).json({
        error: "Missing required simulation fields: symbol, outcome, investmentUsdc, entryPrice, targetExitPrice",
      });
    }

    const result = calculateScenario({
      symbol,
      outcome,
      investmentUsdc: Number(investmentUsdc),
      entryPrice: Number(entryPrice),
      targetExitPrice: Number(targetExitPrice),
      stopLossPrice: stopLossPrice !== undefined ? Number(stopLossPrice) : undefined,
    });

    res.json({
      success: true,
      result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

// ═══════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════

async function startServer() {
  try {
    console.log(chalk.cyan("Starting Somnia DreamDEX Copilot API Server...\n"));

    // ── 1. Core exchange context ──────────────────────────────
    ctx = await createExchangeContext();
    watcher = new MarketWatcher(ctx);
    orderEngine = new OrderEngine(ctx);
    sweeper = new SettlementSweeper(ctx);

    // ── 2. Database workers (if Supabase configured) ──────────
    if (isSupabaseConfigured()) {
      console.log(chalk.green("✔ Supabase connected — starting data workers"));

      snapshotWorker = new MarketSnapshotWorker(ctx, {
        pollIntervalSec: 10,
        spikeThreshold: 0.10,
        maxMarketsPerTick: 80,
      });
      snapshotWorker.start();

      newsWorker = new NewsIngestionWorker({
        pollIntervalSec: 120,
      });
      newsWorker.start();
    } else {
      console.log(chalk.yellow("⚠ Supabase not configured — running without database (set SUPABASE_URL + SUPABASE_ANON_KEY in .env)"));
    }

    // ── 3. Start HTTP listener ────────────────────────────────
    app.listen(PORT, () => {
      console.log(chalk.bold.green(`\n✔ Server listening on http://localhost:${PORT}`));
      console.log(chalk.white(`✔ Connected to ${ctx.config.networkName} (Chain ID: ${ctx.config.chainId})`));
      console.log(chalk.white(`✔ Indexer: ${ctx.config.indexerUrl}`));
      console.log(chalk.white(`✔ Venue: ${ctx.config.venueId}`));
      console.log(chalk.white(`✔ Trading Mode: ${ctx.canTrade ? "LIVE" : "SIMULATION / READ-ONLY"}`));
      console.log(chalk.white(`✔ Database: ${isSupabaseConfigured() ? "Supabase Cloud PostgreSQL" : "Not configured"}`));

      console.log(chalk.gray("\n── API Endpoints ──────────────────────────────────────"));
      console.log(chalk.gray("  GET  /api/health                 System health & worker stats"));
      console.log(chalk.gray("  GET  /api/markets                Live event contracts"));
      console.log(chalk.gray("  GET  /api/markets/:sym/orderbook Orderbook depth"));
      console.log(chalk.gray("  GET  /api/signals                AI copilot signals"));
      console.log(chalk.gray("  POST /api/orders                 Place order (live/sim)"));
      console.log(chalk.gray("  GET  /api/positions              User positions"));
      console.log(chalk.gray("  POST /api/claim                  Sweep settlements"));
      console.log(chalk.gray("  GET  /api/timeline/:sym          Probability timeline (DB)"));
      console.log(chalk.gray("  GET  /api/spikes                 Detected spikes (DB)"));
      console.log(chalk.gray("  GET  /api/news                   Crypto news feed (DB)"));
      console.log(chalk.gray("  POST /api/strategies             Save bot strategy (DB)"));
      console.log(chalk.gray("  GET  /api/strategies/:wallet     Get saved strategies (DB)"));
      console.log(chalk.gray("───────────────────────────────────────────────────────\n"));
    });

    // ── 4. Graceful shutdown ──────────────────────────────────
    const shutdown = async () => {
      console.log(chalk.yellow("\nShutting down..."));
      snapshotWorker?.stop();
      newsWorker?.stop();
      await shutdownExchange(ctx);
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err: any) {
    console.error(chalk.red(`Failed to start server: ${err?.message || err}`));
    process.exit(1);
  }
}

startServer();
