-- ARMS RLS fix: grant staff INSERT/UPDATE/DELETE on the operation/staff tables
-- the frontend writes to directly. Without these, RLS blocks every client write
-- (0 rows returned), which surfaces as PGRST116 "Cannot coerce the result to a
-- single JSON object" from .single() after the update/insert.

BEGIN;

-- collection_routes (SELECT: staff OR active) — staff maintain routes.
DROP POLICY IF EXISTS collection_routes_insert ON public.collection_routes;
CREATE POLICY collection_routes_insert ON public.collection_routes
  FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS collection_routes_update ON public.collection_routes;
CREATE POLICY collection_routes_update ON public.collection_routes
  FOR UPDATE USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS collection_routes_delete ON public.collection_routes;
CREATE POLICY collection_routes_delete ON public.collection_routes
  FOR DELETE USING (public.is_staff());

-- service_schedules (SELECT: staff OR published) — staff maintain schedules.
DROP POLICY IF EXISTS service_schedules_insert ON public.service_schedules;
CREATE POLICY service_schedules_insert ON public.service_schedules
  FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS service_schedules_update ON public.service_schedules;
CREATE POLICY service_schedules_update ON public.service_schedules
  FOR UPDATE USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS service_schedules_delete ON public.service_schedules;
CREATE POLICY service_schedules_delete ON public.service_schedules
  FOR DELETE USING (public.is_staff());

-- vehicles — staff only.
DROP POLICY IF EXISTS vehicles_insert ON public.vehicles;
CREATE POLICY vehicles_insert ON public.vehicles
  FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS vehicles_update ON public.vehicles;
CREATE POLICY vehicles_update ON public.vehicles
  FOR UPDATE USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS vehicles_delete ON public.vehicles;
CREATE POLICY vehicles_delete ON public.vehicles
  FOR DELETE USING (public.is_staff());

-- drivers — staff only (owner driver may read own record).
DROP POLICY IF EXISTS drivers_insert ON public.drivers;
CREATE POLICY drivers_insert ON public.drivers
  FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS drivers_update ON public.drivers;
CREATE POLICY drivers_update ON public.drivers
  FOR UPDATE USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS drivers_delete ON public.drivers;
CREATE POLICY drivers_delete ON public.drivers
  FOR DELETE USING (public.is_staff());

-- vehicle_assignments — staff only.
DROP POLICY IF EXISTS vehicle_assignments_insert ON public.vehicle_assignments;
CREATE POLICY vehicle_assignments_insert ON public.vehicle_assignments
  FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS vehicle_assignments_update ON public.vehicle_assignments;
CREATE POLICY vehicle_assignments_update ON public.vehicle_assignments
  FOR UPDATE USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS vehicle_assignments_delete ON public.vehicle_assignments;
CREATE POLICY vehicle_assignments_delete ON public.vehicle_assignments
  FOR DELETE USING (public.is_staff());

-- maintenance_records — staff only.
DROP POLICY IF EXISTS maintenance_records_insert ON public.maintenance_records;
CREATE POLICY maintenance_records_insert ON public.maintenance_records
  FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS maintenance_records_update ON public.maintenance_records;
CREATE POLICY maintenance_records_update ON public.maintenance_records
  FOR UPDATE USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS maintenance_records_delete ON public.maintenance_records;
CREATE POLICY maintenance_records_delete ON public.maintenance_records
  FOR DELETE USING (public.is_staff());

-- route_executions — staff only.
DROP POLICY IF EXISTS route_executions_insert ON public.route_executions;
CREATE POLICY route_executions_insert ON public.route_executions
  FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS route_executions_update ON public.route_executions;
CREATE POLICY route_executions_update ON public.route_executions
  FOR UPDATE USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS route_executions_delete ON public.route_executions;
CREATE POLICY route_executions_delete ON public.route_executions
  FOR DELETE USING (public.is_staff());

COMMIT;