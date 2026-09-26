-- ============================================================
-- 003_enhance_positions_schema.sql
-- Add essential metadata columns to user_positions for reliable
-- on-chain settlement, round nonce matching, and claim tracking.
-- ============================================================

ALTER TABLE user_positions 
  ADD COLUMN IF NOT EXISTS pool_address TEXT,
  ADD COLUMN IF NOT EXISTS nonce BIGINT,
  ADD COLUMN IF NOT EXISTS expiration_time BIGINT,
  ADD COLUMN IF NOT EXISTS is_winner BOOLEAN,
  ADD COLUMN IF NOT EXISTS winning_outcome TEXT,
  ADD COLUMN IF NOT EXISTS claim_tx_hash TEXT;

-- Index for fast pool + nonce resolution lookup
CREATE INDEX IF NOT EXISTS idx_positions_pool_nonce
  ON user_positions(pool_address, nonce);

CREATE INDEX IF NOT EXISTS idx_positions_wallet_status
  ON user_positions(wallet_address, status);
