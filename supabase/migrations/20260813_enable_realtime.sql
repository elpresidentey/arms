-- ARMS: enable Postgres Realtime (postgres_changes) for live
-- dashboard updates without a hosted socket backend.
-- In the Supabase dashboard these tables would instead be toggled under
-- Database > Replication; this migration makes the config explicit.
-- Realtime respects RLS, so residents only receive events for rows they
-- can SELECT (their own records) and staff receive all events.

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'waste_collections',
    'recyclables',
    'wallet_transactions',
    'service_requests',
    'reports',
    'collection_routes',
    'collection_requests'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;