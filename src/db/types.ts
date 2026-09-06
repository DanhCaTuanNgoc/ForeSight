/**
 * Database row types matching the Supabase/PostgreSQL schema.
 * These types are the single source of truth for all DB interactions.
 */

// ── market_snapshots ──────────────────────────────────────────
export interface MarketSnapshotRow {
  id: number;
  symbol: string;
  asset: string;
  cadence: string | null;
  best_bid: number | null;
  best_ask: number | null;
  mid_price: number | null;
  spread: number | null;
  time_remaining_sec: number | null;
  is_tradable: boolean;
  recorded_at: string; // ISO 8601
}

export type MarketSnapshotInsert = Omit<MarketSnapshotRow, "id" | "recorded_at"> & {
  recorded_at?: string;
};

// ── spikes ────────────────────────────────────────────────────
export interface SpikeRow {
  id: number;
  symbol: string;
  asset: string;
  cadence: string | null;
  spike_type: "UP_SURGE" | "DOWN_SURGE";
  probability_before: number | null;
  probability_after: number | null;
  delta: number | null;
  delta_pct: number | null;
  window_seconds: number;
  context_summary: string | null;
  bull_argument: string | null;
  bear_argument: string | null;
  sources: Array<{ title: string; url: string }>;
  detected_at: string;
}

export type SpikeInsert = Omit<SpikeRow, "id" | "detected_at"> & {
  detected_at?: string;
};

// ── news_events ───────────────────────────────────────────────
export interface NewsEventRow {
  id: number;
  title: string;
  summary: string | null;
  url: string | null;
  source: string | null;
  asset_tags: string[];
  sentiment: "bullish" | "bearish" | "neutral" | null;
  published_at: string | null;
  ingested_at: string;
}

export type NewsEventInsert = Omit<NewsEventRow, "id" | "ingested_at"> & {
  ingested_at?: string;
};

// ── user_strategies ───────────────────────────────────────────
export interface UserStrategyRow {
  id: string; // UUID
  name: string;
  wallet_address: string | null;
  strategy_type: "copilot" | "market_maker" | "oracle_follower" | "custom";
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserStrategyInsert = Omit<UserStrategyRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// ── user_positions ────────────────────────────────────────────
export interface UserPositionRow {
  id: string;
  symbol: string;
  outcome: "YES" | "NO";
  amount: number;
  entry_price: number;
  timestamp: number;
  status: "OPEN" | "SETTLED" | "RESOLVED" | "CLAIMED" | "CLOSED";
  wallet_address: string | null;
  order_id: string | null;
  tx_hash: string | null;
  is_live_on_chain: boolean;
  exit_price: number | null;
  realized_pnl: number | null;
  realized_roi_percent: number | null;
  closed_at: number | null;
  close_tx_hash: string | null;
  created_at?: string;
}

export type UserPositionInsert = Omit<UserPositionRow, "created_at"> & {
  created_at?: string;
};

// ── Supabase Database type definition (for createClient generic) ──
export interface Database {
  public: {
    Tables: {
      market_snapshots: {
        Row: MarketSnapshotRow;
        Insert: MarketSnapshotInsert;
        Update: Partial<MarketSnapshotInsert>;
      };
      spikes: {
        Row: SpikeRow;
        Insert: SpikeInsert;
        Update: Partial<SpikeInsert>;
      };
      news_events: {
        Row: NewsEventRow;
        Insert: NewsEventInsert;
        Update: Partial<NewsEventInsert>;
      };
      user_strategies: {
        Row: UserStrategyRow;
        Insert: UserStrategyInsert;
        Update: Partial<UserStrategyInsert>;
      };
      user_positions: {
        Row: UserPositionRow;
        Insert: UserPositionInsert;
        Update: Partial<UserPositionInsert>;
      };
    };
  };
}
