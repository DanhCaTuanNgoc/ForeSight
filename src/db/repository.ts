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
export async function getLatestNews(limit = 20): Promise<NewsEventRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("news_events")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[repo] getLatestNews error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as NewsEventRow[];
}

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
