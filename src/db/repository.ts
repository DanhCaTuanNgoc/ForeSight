/**
 * Data-access repository — all DB read/write operations in one place.
 * Clean API surface consumed by workers, server endpoints, and agents.
 */

import { getSupabase, isSupabaseConfigured } from "./supabase.js";
import type {
  MarketSnapshotInsert,
  MarketSnapshotRow,
  SpikeInsert,
  SpikeRow,
  NewsEventInsert,
  NewsEventRow,
  UserStrategyInsert,
  UserStrategyRow,
} from "./types.js";

// ────────────────────────────────────────────────────────────
// Market Snapshots
// ────────────────────────────────────────────────────────────

/** Batch-insert market probability snapshots. */
export async function insertSnapshots(rows: MarketSnapshotInsert[]): Promise<number> {
  if (!isSupabaseConfigured() || rows.length === 0) return 0;
  const sb = getSupabase();

  const { data, error } = await sb
    .from("market_snapshots")
    .insert(rows as any)
    .select("id");

  if (error) {
    console.error("[repo] insertSnapshots error:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

/**
 * Fetch probability timeline for a symbol within a time window.
 * Returns rows ordered oldest → newest (for charting).
 */
export async function getTimeline(
  symbol: string,
  fromIso: string,
  toIso?: string,
  limit = 500,
): Promise<MarketSnapshotRow[]> {
  const sb = getSupabase();

  let query = sb
    .from("market_snapshots")
    .select("*")
    .eq("symbol", symbol)
    .gte("recorded_at", fromIso)
    .order("recorded_at", { ascending: true })
    .limit(limit);

  if (toIso) {
    query = query.lte("recorded_at", toIso);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[repo] getTimeline error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as MarketSnapshotRow[];
}

/**
 * Get the latest snapshot per symbol (for detecting spikes).
 */
export async function getLatestSnapshot(symbol: string): Promise<MarketSnapshotRow | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("market_snapshots")
    .select("*")
    .eq("symbol", symbol)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[repo] getLatestSnapshot error:", error.message);
    return null;
  }
  return (data ?? null) as unknown as MarketSnapshotRow | null;
}

// ────────────────────────────────────────────────────────────
// Spikes
// ────────────────────────────────────────────────────────────

/** Insert a newly detected spike. */
export async function insertSpike(spike: SpikeInsert): Promise<SpikeRow | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();

  const { data, error } = await sb
    .from("spikes")
    .insert(spike as any)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[repo] insertSpike error:", error.message);
    return null;
  }
  return (data ?? null) as unknown as SpikeRow | null;
}

/** Fetch recent spikes, optionally filtered by asset. */
export async function getRecentSpikes(
  opts: { asset?: string; symbol?: string; limit?: number } = {},
): Promise<SpikeRow[]> {
  const sb = getSupabase();

  let query = sb
    .from("spikes")
    .select("*")
    .order("detected_at", { ascending: false })
    .limit(opts.limit ?? 50);

  if (opts.asset) query = query.eq("asset", opts.asset);
  if (opts.symbol) query = query.eq("symbol", opts.symbol);

  const { data, error } = await query;
  if (error) {
    console.error("[repo] getRecentSpikes error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as SpikeRow[];
}

/**
 * Prune stale market snapshots and spikes older than the retention threshold.
 * Prevents database storage overflow.
 */
export async function cleanupOldMarketData(
  snapshotRetentionHours = 24,
  spikeRetentionHours = 48,
): Promise<{ deletedSnapshots: number; deletedSpikes: number; success: boolean }> {
  if (!isSupabaseConfigured()) {
    return { deletedSnapshots: 0, deletedSpikes: 0, success: false };
  }

  const sb = getSupabase();
  const snapshotCutoff = new Date(Date.now() - snapshotRetentionHours * 3600_000).toISOString();
  const spikeCutoff = new Date(Date.now() - spikeRetentionHours * 3600_000).toISOString();

  let deletedSnapshots = 0;
  let deletedSpikes = 0;

  // 1. Try calling the PostgreSQL stored procedure if migration was executed
  try {
    const { data: rpcData, error: rpcError } = await (sb as any).rpc("cleanup_old_market_data", {
      snapshot_retention_hours: snapshotRetentionHours,
      spike_retention_hours: spikeRetentionHours,
    });

    if (!rpcError && rpcData && rpcData.success !== false) {
      return {
        deletedSnapshots: rpcData.deleted_snapshots ?? 0,
        deletedSpikes: rpcData.deleted_spikes ?? 0,
        success: true,
      };
    }
  } catch {
    // Stored procedure not installed yet, proceed to direct queries
  }

  // 2. Direct delete fallback via Supabase client
  try {
    const { count: sCount, error: sErr } = await (sb as any)
      .from("market_snapshots")
      .delete({ count: "exact" })
      .lt("recorded_at", snapshotCutoff);

    if (!sErr && typeof sCount === "number") {
      deletedSnapshots = sCount;
    }
  } catch (err: any) {
    console.error("[repo] cleanup market_snapshots error:", err?.message || err);
  }

  try {
    const { count: spCount, error: spErr } = await (sb as any)
      .from("spikes")
      .delete({ count: "exact" })
      .lt("detected_at", spikeCutoff);

    if (!spErr && typeof spCount === "number") {
      deletedSpikes = spCount;
    }
  } catch (err: any) {
    console.error("[repo] cleanup spikes error:", err?.message || err);
  }

  return {
    deletedSnapshots,
    deletedSpikes,
    success: true,
  };
}

// ────────────────────────────────────────────────────────────
// News Events
// ────────────────────────────────────────────────────────────

/** Batch-insert news articles. */
export async function insertNewsEvents(rows: NewsEventInsert[]): Promise<number> {
  if (!isSupabaseConfigured() || rows.length === 0) return 0;
  const sb = getSupabase();

  const { data, error } = await sb
    .from("news_events")
    .insert(rows as any)
    .select("id");

  if (error) {
    console.error("[repo] insertNewsEvents error:", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

/**
 * Get news events within a time window, optionally filtered by asset tag.
 * Used by RAG retrieval to explain spikes.
 */
export async function getNewsByTimeWindow(
  fromIso: string,
  toIso: string,
  assetTag?: string,
  limit = 20,
): Promise<NewsEventRow[]> {
  const sb = getSupabase();

  let query = sb
    .from("news_events")
    .select("*")
    .gte("published_at", fromIso)
    .lte("published_at", toIso)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (assetTag) {
    query = query.contains("asset_tags", [assetTag]);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[repo] getNewsByTimeWindow error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as NewsEventRow[];
}

/** Get latest N news events (for dashboard feed). */
export async function getLatestNews(limit = 20, asset?: string): Promise<NewsEventRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("news_events")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit * 5);

  if (error) {
    console.error("[repo] getLatestNews error:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as NewsEventRow[];
  
  // Deduplicate recurring titles
  const seen = new Set<string>();
  const uniqueRows: NewsEventRow[] = [];
  for (const r of rows) {
    if (!r.title) continue;
    const norm = r.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 28);
    if (seen.has(norm)) continue;
    seen.add(norm);
    uniqueRows.push(r);
  }

  if (!asset || asset === "ALL") {
    return uniqueRows.slice(0, limit);
  }

  const target = asset.toUpperCase();
  // Filter & prioritize articles directly mentioning the asset in tags or title
  const assetMatched = uniqueRows.filter((r) =>
    (r.asset_tags || []).some((t: string) => t.toUpperCase() === target) ||
    r.title.toUpperCase().includes(target)
  );
  const others = uniqueRows.filter((r) => !assetMatched.includes(r));

  return [...assetMatched, ...others].slice(0, limit);
}

// ────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────
// User Strategies
// ────────────────────────────────────────────────────────────

/** Save a new strategy config. */
export async function saveStrategy(strategy: UserStrategyInsert): Promise<UserStrategyRow | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();

  const { data, error } = await sb
    .from("user_strategies")
    .insert(strategy as any)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[repo] saveStrategy error:", error.message);
    return null;
  }
  return (data ?? null) as unknown as UserStrategyRow | null;
}

/** Get all strategies for a wallet. */
export async function getStrategiesByWallet(walletAddress: string): Promise<UserStrategyRow[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("user_strategies")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[repo] getStrategiesByWallet error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as UserStrategyRow[];
}

// ────────────────────────────────────────────────────────────
// User Positions & Trade Orders
// ────────────────────────────────────────────────────────────

/** Save a new position in Supabase */
export async function insertPosition(pos: any): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const sb = getSupabase();
    const baseRow: Record<string, any> = {
      id: pos.id,
      symbol: pos.symbol,
      outcome: pos.outcome,
      amount: pos.amount,
      entry_price: pos.entryPrice,
      timestamp: pos.timestamp,
      status: pos.status,
      wallet_address: pos.walletAddress ? pos.walletAddress.toLowerCase() : null,
      order_id: pos.orderId || null,
      tx_hash: pos.txHash || null,
      is_live_on_chain: Boolean(pos.isLiveOnChain),
      exit_price: pos.exitPrice || null,
      realized_pnl: pos.realizedPnl || null,
      realized_roi_percent: pos.realizedRoiPercent || null,
      closed_at: pos.closedAt || null,
      close_tx_hash: pos.claimTxHash || pos.closeTxHash || null,
    };

    // Try inserting with optional enhanced metadata columns first
    const fullRow = {
      ...baseRow,
      ...(pos.poolAddress ? { pool_address: pos.poolAddress } : {}),
      ...(pos.nonce !== undefined && pos.nonce !== null ? { nonce: Number(pos.nonce) } : {}),
      ...(pos.expirationTime ? { expiration_time: Number(pos.expirationTime) } : {}),
      ...(pos.isWinner !== undefined ? { is_winner: Boolean(pos.isWinner) } : {}),
      ...(pos.winningOutcome ? { winning_outcome: pos.winningOutcome } : {}),
      ...(pos.claimTxHash ? { claim_tx_hash: pos.claimTxHash } : {}),
    };

    let { error } = await (sb as any).from("user_positions").upsert(fullRow);
    if (error) {
      // If error was due to columns not existing in DB, fallback to baseRow
      const fallback = await (sb as any).from("user_positions").upsert(baseRow);
      if (fallback.error) {
        console.warn("[repo] insertPosition Supabase warn:", fallback.error.message);
        return false;
      }
    }
    return true;
  } catch (err: any) {
    console.warn("[repo] insertPosition exception:", err?.message || err);
    return false;
  }
}

/** Update position status / exit in Supabase */
export async function updatePositionInDb(id: string, updates: any): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const sb = getSupabase();
    const mapped: Record<string, any> = {};
    if (updates.status !== undefined) mapped.status = updates.status;
    if (updates.realizedPnl !== undefined || updates.realized_pnl !== undefined) {
      mapped.realized_pnl = updates.realizedPnl ?? updates.realized_pnl;
    }
    if (updates.realizedRoiPercent !== undefined || updates.realized_roi_percent !== undefined) {
      mapped.realized_roi_percent = updates.realizedRoiPercent ?? updates.realized_roi_percent;
    }
    if (updates.exitPrice !== undefined || updates.exit_price !== undefined) {
      mapped.exit_price = updates.exitPrice ?? updates.exit_price;
    }
    if (updates.closedAt !== undefined || updates.closed_at !== undefined) {
      mapped.closed_at = updates.closedAt ?? updates.closed_at;
    }
    if (updates.closeTxHash !== undefined || updates.close_tx_hash !== undefined || updates.claimTxHash !== undefined) {
      mapped.close_tx_hash = updates.closeTxHash ?? updates.close_tx_hash ?? updates.claimTxHash;
    }
    if (updates.isWinner !== undefined || updates.is_winner !== undefined) {
      mapped.is_winner = updates.isWinner ?? updates.is_winner;
    }
    if (updates.winningOutcome !== undefined || updates.winning_outcome !== undefined) {
      mapped.winning_outcome = updates.winningOutcome ?? updates.winning_outcome;
    }

    let { error } = await (sb as any).from("user_positions").update(mapped).eq("id", id);
    if (error) {
      // If column mismatch error, retry with core fields only
      const coreMapped: Record<string, any> = {};
      if (mapped.status !== undefined) coreMapped.status = mapped.status;
      if (mapped.realized_pnl !== undefined) coreMapped.realized_pnl = mapped.realized_pnl;
      if (mapped.realized_roi_percent !== undefined) coreMapped.realized_roi_percent = mapped.realized_roi_percent;
      if (mapped.close_tx_hash !== undefined) coreMapped.close_tx_hash = mapped.close_tx_hash;
      const retry = await (sb as any).from("user_positions").update(coreMapped).eq("id", id);
      if (retry.error) {
        console.warn("[repo] updatePositionInDb Supabase warn:", retry.error.message);
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** Helper to map raw Supabase row to standardized position object */
function mapPositionRow(r: any): any {
  const isRefunded = r.status === "REFUNDED" || r.is_refunded === true;
  const isWin = isRefunded
    ? false
    : r.is_winner !== null && r.is_winner !== undefined
    ? Boolean(r.is_winner)
    : r.status === "SETTLED_WIN" || (r.realized_pnl && Number(r.realized_pnl) > 0)
    ? true
    : r.status === "SETTLED_LOSS"
    ? false
    : undefined;

  return {
    id: r.id,
    symbol: r.symbol,
    outcome: r.outcome,
    amount: Number(r.amount),
    entryPrice: Number(r.entry_price),
    timestamp: Number(r.timestamp),
    status: r.status,
    walletAddress: r.wallet_address || undefined,
    orderId: r.order_id || undefined,
    txHash: r.tx_hash || undefined,
    isLiveOnChain: Boolean(r.is_live_on_chain),
    poolAddress: r.pool_address || undefined,
    nonce: r.nonce !== null && r.nonce !== undefined ? Number(r.nonce) : undefined,
    expirationTime: r.expiration_time !== null && r.expiration_time !== undefined ? Number(r.expiration_time) : undefined,
    isWinner: isWin,
    isRefunded: isRefunded || undefined,
    winningOutcome: isRefunded ? "REFUNDED" : (r.winning_outcome || undefined),
    exitPrice: r.exit_price !== null && r.exit_price !== undefined ? Number(r.exit_price) : undefined,
    realizedPnl: isRefunded ? 0 : (r.realized_pnl !== null && r.realized_pnl !== undefined ? Number(r.realized_pnl) : undefined),
    realizedRoiPercent: isRefunded ? 0 : (r.realized_roi_percent !== null && r.realized_roi_percent !== undefined ? Number(r.realized_roi_percent) : undefined),
    closedAt: r.closed_at !== null && r.closed_at !== undefined ? Number(r.closed_at) : undefined,
    closeTxHash: r.close_tx_hash || undefined,
    claimTxHash: isRefunded ? undefined : (r.claim_tx_hash || r.close_tx_hash || undefined),
    refundTxHash: isRefunded ? (r.close_tx_hash || undefined) : undefined,
  };
}

/** Fetch positions for a specific wallet from Supabase */
export async function getPositionsByWalletFromDb(walletAddress: string): Promise<any[]> {
  if (!isSupabaseConfigured() || !walletAddress) return [];
  try {
    const sb = getSupabase();
    const { data, error } = await (sb as any)
      .from("user_positions")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .order("timestamp", { ascending: false });

    if (error || !data) return [];
    return data.map(mapPositionRow);
  } catch {
    return [];
  }
}

/** Fetch latest public positions across all users from Supabase */
export async function getAllPositionsFromDb(limit = 100): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = getSupabase();
    const { data, error } = await (sb as any)
      .from("user_positions")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapPositionRow);
  } catch {
    return [];
  }
}

