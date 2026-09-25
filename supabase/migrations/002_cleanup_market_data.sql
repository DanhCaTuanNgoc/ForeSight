-- ============================================================
-- DreamDEX Intelligence Layer — Data Retention & Cleanup Job
-- Automatically prunes stale market_snapshots and spikes
-- to prevent database storage overflow.
-- ============================================================

-- 1. Create cleanup function (Safe to run directly or via pg_cron)
CREATE OR REPLACE FUNCTION cleanup_old_market_data(
  snapshot_retention_hours INT DEFAULT 24,
  spike_retention_hours INT DEFAULT 48
)
RETURNS JSONB AS $$
DECLARE
  deleted_snapshots INT := 0;
  deleted_spikes INT := 0;
BEGIN
  -- 1. Prune market snapshots older than retention threshold
  DELETE FROM market_snapshots
  WHERE recorded_at < NOW() - (snapshot_retention_hours || ' hours')::interval;
  GET DIAGNOSTICS deleted_snapshots = ROW_COUNT;

  -- 2. Prune spikes older than retention threshold
  DELETE FROM spikes
  WHERE detected_at < NOW() - (spike_retention_hours || ' hours')::interval;
  GET DIAGNOSTICS deleted_spikes = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'deleted_snapshots', deleted_snapshots,
    'deleted_spikes', deleted_spikes,
    'snapshot_retention_hours', snapshot_retention_hours,
    'spike_retention_hours', spike_retention_hours,
    'executed_at', NOW()
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'executed_at', NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Configure pg_cron scheduler (if pg_cron extension is available on Supabase)
DO $$
BEGIN
  -- Attempt to enable pg_cron if allowed
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Remove existing job if already registered to avoid duplication
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'daily-market-data-cleanup';

  -- Schedule daily cleanup at 00:00 UTC (prune snapshots > 24h, spikes > 48h)
  PERFORM cron.schedule(
    'daily-market-data-cleanup',
    '0 0 * * *',
    'SELECT cleanup_old_market_data(24, 48);'
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not available or insufficient permissions. Fallback backend worker cleanup will handle pruning.';
END;
$$;
