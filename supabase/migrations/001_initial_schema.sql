-- ============================================================
-- DreamDEX Intelligence Layer — Initial Database Schema
-- Somnia × DreamDEX Event Contracts Hackathon
-- ============================================================

-- 1. market_snapshots: Historical probability readings per market
--    Drives the Probability Timeline (Area Chart) feature.
CREATE TABLE IF NOT EXISTS market_snapshots (
  id            BIGSERIAL PRIMARY KEY,
  symbol        TEXT          NOT NULL,
  asset         TEXT          NOT NULL,       -- BTC, ETH
  cadence       TEXT,                         -- 1m, 5m, 15m, 1h, 4h, 24h
  best_bid      NUMERIC(10,6),
  best_ask      NUMERIC(10,6),
  mid_price     NUMERIC(10,6),               -- implied UP probability
  spread        NUMERIC(10,6),
  time_remaining_sec INTEGER,
  is_tradable   BOOLEAN       DEFAULT true,
  recorded_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2. spikes: Auto-detected probability surges / crashes
--    Drives the Spike Detection & Dual AI Debate feature.
CREATE TABLE IF NOT EXISTS spikes (
  id                    BIGSERIAL PRIMARY KEY,
  symbol                TEXT          NOT NULL,
  asset                 TEXT          NOT NULL,
  cadence               TEXT,
  spike_type            TEXT          NOT NULL,   -- UP_SURGE, DOWN_SURGE
  probability_before    NUMERIC(10,6),
  probability_after     NUMERIC(10,6),
  delta                 NUMERIC(10,6),            -- absolute change
  delta_pct             NUMERIC(10,4),            -- percentage change (0-100)
  window_seconds        INTEGER       DEFAULT 60,
  context_summary       TEXT,                     -- AI-generated explanation
  bull_argument         TEXT,                     -- Alpha Bull reasoning
  bear_argument         TEXT,                     -- Macro Bear reasoning
  sources               JSONB         DEFAULT '[]'::jsonb,
  detected_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 3. news_events: Scraped crypto news & market catalysts
--    Drives the RAG Retrieval & Evidence feature.
CREATE TABLE IF NOT EXISTS news_events (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT          NOT NULL,
  summary       TEXT,
  url           TEXT,
  source        TEXT,                            -- cryptopanic, rss, coingecko, etc.
  asset_tags    TEXT[]        DEFAULT '{}',       -- {BTC, ETH, CRYPTO}
  sentiment     TEXT,                            -- bullish, bearish, neutral
  published_at  TIMESTAMPTZ,
  ingested_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 4. user_strategies: Saved bot configurations (No-Code Agent)
--    Drives the "Simulate → Deploy Bot" feature.
CREATE TABLE IF NOT EXISTS user_strategies (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT          NOT NULL,
  wallet_address  TEXT,
  strategy_type   TEXT          NOT NULL,        -- copilot, market_maker, oracle_follower, custom
  config          JSONB         NOT NULL DEFAULT '{}'::jsonb,
  is_active       BOOLEAN       DEFAULT false,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for fast reads on timeline & spike queries
-- ============================================================

-- Snapshots: fast lookup by symbol + time range (for Area Chart)
CREATE INDEX IF NOT EXISTS idx_snapshots_symbol_time
  ON market_snapshots(symbol, recorded_at DESC);

-- Snapshots: fast filter by asset (BTC/ETH) + time range
CREATE INDEX IF NOT EXISTS idx_snapshots_asset_time
  ON market_snapshots(asset, recorded_at DESC);

-- Spikes: fast lookup by symbol + detection time
CREATE INDEX IF NOT EXISTS idx_spikes_symbol_time
  ON spikes(symbol, detected_at DESC);

-- Spikes: fast filter by asset + detection time
CREATE INDEX IF NOT EXISTS idx_spikes_asset_time
  ON spikes(asset, detected_at DESC);

-- News: fast sort by publish date
CREATE INDEX IF NOT EXISTS idx_news_published
  ON news_events(published_at DESC);

-- News: fast search by asset tags (GIN for array contains)
CREATE INDEX IF NOT EXISTS idx_news_asset_tags
  ON news_events USING GIN(asset_tags);

-- Strategies: lookup by wallet
CREATE INDEX IF NOT EXISTS idx_strategies_wallet
  ON user_strategies(wallet_address);

-- ============================================================
-- ROW LEVEL SECURITY (optional, enable for Supabase Auth)
-- ============================================================
-- ALTER TABLE market_snapshots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE spikes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE news_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_strategies ENABLE ROW LEVEL SECURITY;

-- Public read for market data (anyone can view)
-- CREATE POLICY "Public read snapshots" ON market_snapshots FOR SELECT USING (true);
-- CREATE POLICY "Public read spikes" ON spikes FOR SELECT USING (true);
-- CREATE POLICY "Public read news" ON news_events FOR SELECT USING (true);
