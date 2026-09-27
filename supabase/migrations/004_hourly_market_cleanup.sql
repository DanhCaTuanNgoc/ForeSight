-- ============================================================
-- 004_hourly_market_cleanup.sql
-- Configure hourly data cleanup job for market_snapshots and spikes.
-- Retains 1 hour of history and triggers every hour at minute 0.
-- ============================================================

-- 1. Update cleanup function defaults to 1 hour
CREATE OR REPLACE FUNCTION cleanup_old_market_data(
  snapshot_retention_hours INT DEFAULT 1,
  spike_retention_hours INT DEFAULT 1
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

-- 2. Configure pg_cron scheduler for hourly execution
DO $$
BEGIN
  -- Attempt to enable pg_cron if allowed
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Remove existing daily or hourly jobs if already registered
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname IN ('daily-market-data-cleanup', 'hourly-market-data-cleanup');

  -- Schedule hourly cleanup at minute 0 of every hour
  PERFORM cron.schedule(
    'hourly-market-data-cleanup',
    '0 * * * *',
    'SELECT cleanup_old_market_data(1, 1);'
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not available or insufficient permissions. Backend Node.js worker cleanup will handle pruning.';
END;
$$;
