-- ARMS Phase 1b: auth profile healing helper
-- Lets the frontend self-heal a missing profile row after login/register
-- without exposing INSERT on public.users (which stays client-disabled).

CREATE OR REPLACE FUNCTION public.ensure_profile(meta jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, "isActive", "createdAt", "updatedAt",
    "firstName", "lastName", "phoneNumber", address, street, "houseNumber", ward, "serviceZone", "propertyType", landmark,
    "householdSize", latitude, longitude)
  SELECT auth.uid(), au.email, 'resident', true, now(), now(),
    COALESCE(meta->>'firstName', ''),
    COALESCE(meta->>'lastName', ''),
    COALESCE(meta->>'phoneNumber', ''),
    COALESCE(meta->>'address', ''),
    COALESCE(meta->>'street', ''),
    COALESCE(meta->>'houseNumber', ''),
    COALESCE(meta->>'ward', 'Unassigned'),
    COALESCE(meta->>'serviceZone', ''),
    COALESCE(meta->>'propertyType', ''),
    COALESCE(meta->>'landmark', ''),
    NULLIF(meta->>'householdSize', '')::integer,
    NULLIF(meta->>'latitude', '')::numeric,
    NULLIF(meta->>'longitude', '')::numeric
  FROM auth.users au
  WHERE au.id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid());
END;
$$;