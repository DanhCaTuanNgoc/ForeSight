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
    const row = {
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
      close_tx_hash: pos.closeTxHash || null,
    };
    const { error } = await (sb as any).from("user_positions").upsert(row);
    if (error) {
      console.warn("[repo] insertPosition Supabase warn:", error.message);
      return false;
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
    const { error } = await (sb as any).from("user_positions").update(updates).eq("id", id);
    if (error) {
      console.warn("[repo] updatePositionInDb Supabase warn:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
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
    return data.map((r: any) => ({
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
      exitPrice: r.exit_price !== null && r.exit_price !== undefined ? Number(r.exit_price) : undefined,
      realizedPnl: r.realized_pnl !== null && r.realized_pnl !== undefined ? Number(r.realized_pnl) : undefined,
      realizedRoiPercent: r.realized_roi_percent !== null && r.realized_roi_percent !== undefined ? Number(r.realized_roi_percent) : undefined,
      closedAt: r.closed_at !== null && r.closed_at !== undefined ? Number(r.closed_at) : undefined,
      closeTxHash: r.close_tx_hash || undefined,
    }));
  } catch {
    return [];
  }
}
