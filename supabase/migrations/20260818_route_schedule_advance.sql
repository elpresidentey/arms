-- ARMS: automate route schedule roll-forward via pg_cron.
--
-- Replaces reliance on the NestJS in-process scheduler (backend must be
-- online for its 5 AM cron to run). This DB-native job advances
-- nextCollectionDate for active routes so schedules stay current even when
-- no admin/staff is online and the backend is idle.
--
-- Idempotent: it only touches routes whose scheduled date is already in the
-- past, and it advances by the route frequency until the date is in the
-- future again. Running the function repeatedly is a no-op afterwards.

BEGIN;

-- ---------------------------------------------------------------------------
-- Worker function: roll forward past-due active routes
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.advance_due_route_schedules()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  advanced integer := 0;
  r record;
  next_date timestamptz;
BEGIN
  FOR r IN
    SELECT id, frequency, "nextCollectionDate"
    FROM public.collection_routes
    WHERE status = 'active'
      AND "nextCollectionDate" IS NOT NULL
      AND "nextCollectionDate" < now()
  LOOP
    next_date := r."nextCollectionDate";

    -- Roll forward in frequency-sized steps until the date is in the future.
    WHILE next_date < now() LOOP
      next_date := next_date + CASE lower(r.frequency)
        WHEN 'daily'    THEN interval '1 day'
        WHEN 'biweekly' THEN interval '14 days'
        WHEN 'monthly'  THEN interval '1 month'
        ELSE interval '7 days' -- weekly and any legacy/default value
      END;
    END LOOP;

    UPDATE public.collection_routes
    SET "nextCollectionDate" = next_date,
        "updatedAt" = now()
    WHERE id = r.id;

    advanced := advanced + 1;
  END LOOP;

  RETURN advanced;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.advance_due_route_schedules() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.advance_due_route_schedules() TO postgres;

-- ---------------------------------------------------------------------------
-- pg_cron schedule: nightly at 01:00 UTC (02:00 Africa/Lagos)
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('advance-route-schedules')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'advance-route-schedules');

SELECT cron.schedule(
  'advance-route-schedules',
  '0 1 * * *',
  $$SELECT public.advance_due_route_schedules();$$
);

COMMIT;