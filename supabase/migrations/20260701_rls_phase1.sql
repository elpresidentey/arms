-- ARMS Phase 1: Supabase-native backend
-- Row Level Security + auth trigger + helpers.
-- Conventions:
--   * Employee identity vs resident is the single `public.users.role` column.
--   * Most ownership columns are LEGACY VARCHAR columns storing a uuid-as-text
--     (e.g. wallet_transactions."userId", recyclables."userId",
--     waste_collections."residentId", reports."reporterId",
--     service_requests."residentId") or uuid columns (bills."userId",
--     bill_payments."userId", payout_requests."userId").
--   * auth.uid() returns uuid; the helper public.owns(text) compares the
--     varchar column against it.

BEGIN;

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER so they can read `users` without RLS recursion)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND COALESCE(public.get_role(), '') <> 'resident';
$$;

-- Does this (possibly NULL/empty varchar uuid) column equal the current user?
CREATE OR REPLACE FUNCTION public.owns(col text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(NULLIF(trim($1), ''), '') <> ''
     AND NULLIF(trim($1), '')::uuid = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Auth trigger: auto-create a resident profile on signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, "isActive", "createdAt", "updatedAt",
    "firstName", "lastName", "phoneNumber", address, street, "houseNumber", ward, "serviceZone", "propertyType", landmark,
    "householdSize", latitude, longitude)
  VALUES (new.id, new.email, 'resident', true, now(), now(),
    COALESCE(new.raw_user_meta_data->>'firstName', ''),
    COALESCE(new.raw_user_meta_data->>'lastName', ''),
    COALESCE(new.raw_user_meta_data->>'phoneNumber', ''),
    COALESCE(new.raw_user_meta_data->>'address', ''),
    COALESCE(new.raw_user_meta_data->>'street', ''),
    COALESCE(new.raw_user_meta_data->>'houseNumber', ''),
    COALESCE(new.raw_user_meta_data->>'ward', 'Unassigned'),
    COALESCE(new.raw_user_meta_data->>'serviceZone', ''),
    COALESCE(new.raw_user_meta_data->>'propertyType', ''),
    COALESCE(new.raw_user_meta_data->>'landmark', ''),
    NULLIF(new.raw_user_meta_data->>'householdSize', '')::integer,
    NULLIF(new.raw_user_meta_data->>'latitude', '')::numeric,
    NULLIF(new.raw_user_meta_data->>'longitude', '')::numeric)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill a known auth-only user that has no profile yet.
INSERT INTO public.users (id, email, role, "isActive", "createdAt", "updatedAt",
  "firstName", "lastName", "phoneNumber", address, street)
VALUES ('dd68de10-a571-4e6e-abf2-e91f61a33ec0', 'iduwe4vibecoding@gmail.com', 'resident', true, now(), now(),
  'IDUWE', 'AARON', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_own_or_staff ON public.users;
CREATE POLICY users_select_own_or_staff ON public.users
  FOR SELECT USING (id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (id = auth.uid());

-- No client INSERT/DELETE; profiles come from the auth trigger / edge functions.

-- ---------------------------------------------------------------------------
-- Resident-owned tables (legacy varchar owner columns)
-- ---------------------------------------------------------------------------

-- wallet_transactions: read-only (created by business logic)
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wallet_tx_select ON public.wallet_transactions;
CREATE POLICY wallet_tx_select ON public.wallet_transactions
  FOR SELECT USING (public.owns("userId") OR public.is_staff());

-- recyclables
ALTER TABLE public.recyclables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recyclables_select ON public.recyclables;
CREATE POLICY recyclables_select ON public.recyclables
  FOR SELECT USING (public.owns("userId") OR public.owns("recyclerId") OR public.is_staff());
DROP POLICY IF EXISTS recyclables_insert ON public.recyclables;
CREATE POLICY recyclables_insert ON public.recyclables
  FOR INSERT WITH CHECK (public.owns("userId"));
DROP POLICY IF EXISTS recyclables_update ON public.recyclables;
CREATE POLICY recyclables_update ON public.recyclables
  FOR UPDATE USING (public.owns("userId") OR public.is_staff())
  WITH CHECK (public.owns("userId") OR public.is_staff());

-- waste_collections
ALTER TABLE public.waste_collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS waste_collections_select ON public.waste_collections;
CREATE POLICY waste_collections_select ON public.waste_collections
  FOR SELECT USING (public.owns("residentId") OR public.is_staff());
DROP POLICY IF EXISTS waste_collections_insert ON public.waste_collections;
CREATE POLICY waste_collections_insert ON public.waste_collections
  FOR INSERT WITH CHECK (public.owns("residentId"));
DROP POLICY IF EXISTS waste_collections_update ON public.waste_collections;
CREATE POLICY waste_collections_update ON public.waste_collections
  FOR UPDATE USING (public.owns("residentId") OR public.is_staff())
  WITH CHECK (public.owns("residentId") OR public.is_staff());

-- reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reports_select ON public.reports;
CREATE POLICY reports_select ON public.reports
  FOR SELECT USING (public.owns("reporterId") OR public.is_staff());
DROP POLICY IF EXISTS reports_insert ON public.reports;
CREATE POLICY reports_insert ON public.reports
  FOR INSERT WITH CHECK (public.owns("reporterId"));
DROP POLICY IF EXISTS reports_update ON public.reports;
CREATE POLICY reports_update ON public.reports
  FOR UPDATE USING (public.owns("reporterId") OR public.is_staff())
  WITH CHECK (public.owns("reporterId") OR public.is_staff());

-- service_requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_requests_select ON public.service_requests;
CREATE POLICY service_requests_select ON public.service_requests
  FOR SELECT USING (public.owns("residentId") OR public.is_staff());
DROP POLICY IF EXISTS service_requests_insert ON public.service_requests;
CREATE POLICY service_requests_insert ON public.service_requests
  FOR INSERT WITH CHECK (public.owns("residentId"));
DROP POLICY IF EXISTS service_requests_update ON public.service_requests;
CREATE POLICY service_requests_update ON public.service_requests
  FOR UPDATE USING (public.owns("residentId") OR public.is_staff())
  WITH CHECK (public.owns("residentId") OR public.is_staff());

-- collection_requests (uuid owner column)
ALTER TABLE public.collection_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS collection_requests_select ON public.collection_requests;
CREATE POLICY collection_requests_select ON public.collection_requests
  FOR SELECT USING ("residentId" = auth.uid() OR public.is_staff());
DROP POLICY IF EXISTS collection_requests_insert ON public.collection_requests;
CREATE POLICY collection_requests_insert ON public.collection_requests
  FOR INSERT WITH CHECK ("residentId" = auth.uid());
DROP POLICY IF EXISTS collection_requests_update ON public.collection_requests;
CREATE POLICY collection_requests_update ON public.collection_requests
  FOR UPDATE USING ("residentId" = auth.uid() OR public.is_staff())
  WITH CHECK ("residentId" = auth.uid() OR public.is_staff());

-- bills (uuid owner column) - read only from client
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bills_select ON public.bills;
CREATE POLICY bills_select ON public.bills
  FOR SELECT USING ("userId" = auth.uid() OR public.is_staff());

-- bill_payments (uuid owner column) - read only
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bill_payments_select ON public.bill_payments;
CREATE POLICY bill_payments_select ON public.bill_payments
  FOR SELECT USING ("userId" = auth.uid() OR public.is_staff());

-- payout_requests (uuid owner column)
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payout_requests_select ON public.payout_requests;
CREATE POLICY payout_requests_select ON public.payout_requests
  FOR SELECT USING ("userId" = auth.uid() OR public.is_staff());

-- ---------------------------------------------------------------------------
-- Public / published data
-- ---------------------------------------------------------------------------

-- service_schedules: published schedules are public; everything is staff-only.
ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_schedules_select ON public.service_schedules;
CREATE POLICY service_schedules_select ON public.service_schedules
  FOR SELECT USING (public.is_staff() OR status = 'published');

-- collection_routes: active routes are public; everything is staff-only.
ALTER TABLE public.collection_routes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS collection_routes_select ON public.collection_routes;
CREATE POLICY collection_routes_select ON public.collection_routes
  FOR SELECT USING (public.is_staff() OR status = 'active');

-- ---------------------------------------------------------------------------
-- Staff-only tables (fleet + operations)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enforce_staff()
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$ SELECT public.is_staff() $$;

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vehicles_select_staff ON public.vehicles;
CREATE POLICY vehicles_select_staff ON public.vehicles
  FOR SELECT USING (public.is_staff());

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS drivers_select ON public.drivers;
CREATE POLICY drivers_select ON public.drivers
  FOR SELECT USING (public.is_staff() OR user_id = auth.uid());

ALTER TABLE public.route_executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS route_executions_select_staff ON public.route_executions;
CREATE POLICY route_executions_select_staff ON public.route_executions
  FOR SELECT USING (public.is_staff());

ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS maintenance_select_staff ON public.maintenance_records;
CREATE POLICY maintenance_select_staff ON public.maintenance_records
  FOR SELECT USING (public.is_staff());

ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vehicle_assignments_select_staff ON public.vehicle_assignments;
CREATE POLICY vehicle_assignments_select_staff ON public.vehicle_assignments
  FOR SELECT USING (public.is_staff());

ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_invites_select_staff ON public.admin_invites;
CREATE POLICY admin_invites_select_staff ON public.admin_invites
  FOR SELECT USING (public.is_staff());

ALTER TABLE public.billing_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS billing_config_select_staff ON public.billing_config;
CREATE POLICY billing_config_select_staff ON public.billing_config
  FOR SELECT USING (public.is_staff());

COMMIT;