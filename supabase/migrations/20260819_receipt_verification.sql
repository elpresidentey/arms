-- ARMS: tamper-proof payment receipts.
--
-- Receipt authenticity is anchored server-side. A signing secret lives only in
-- the private schema (not exposed to clients). Two SECURITY DEFINER functions
-- expose just the necessary surface over RPC:
--
--   * public.get_receipt_code(bill_id) -> text
--       Returns the HMAC-SHA256 code for a paid bill. Only the bill owner (or
--       staff) can retrieve it, and only after the bill is paid.
--
--   * public.verify_receipt(bill_number, code) -> jsonb
--       Publicly recomputes the code over the authoritative bill row and
--       returns whether it matches, plus the official payment facts. A forged
--       receipt cannot reproduce a valid code because the HMAC key is never
--       exposed, and any change to the stored record invalidates old codes.
--
-- Idempotent: safe to re-run.

BEGIN;

-- ---------------------------------------------------------------------------
-- Signing secret (private schema: hidden from PostgREST/clients)
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.receipt_config (
  id              int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  signing_secret  text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

INSERT INTO private.receipt_config (signing_secret)
SELECT encode(gen_random_bytes(48), 'hex')
WHERE NOT EXISTS (SELECT 1 FROM private.receipt_config WHERE id = 1);

REVOKE ALL ON ALL TABLES IN SCHEMA private FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- Canonical payload shared by both functions
-- ---------------------------------------------------------------------------

-- The payload covers every fact printed on a receipt. Both functions run the
-- same SQL, so the code a resident sees is exactly the code the verifier
-- recomputes from the authoritative row.
CREATE OR REPLACE FUNCTION public.receipt_payload(bill_id uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT concat_ws(
    '|',
    b."billNumber",
    b."billingPeriod",
    round((b."totalAmount")::numeric, 2)::text,
    b."paidAt"::text,
    b."paymentReference",
    b.status
  )
  FROM public.bills b
  WHERE b.id = bill_id
$$;

-- ---------------------------------------------------------------------------
-- Resident-side: fetch the code for a paid bill (owner or staff only)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_receipt_code(bill_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private, extensions
AS $$
DECLARE
  v_secret  text;
  v_owner   boolean;
  v_paid    boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT b."userId" = auth.uid() OR public.is_staff(),
         b.status = 'paid'
  INTO v_owner, v_paid
  FROM public.bills b
  WHERE b.id = bill_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Receipt code unavailable for this bill' USING ERRCODE = '42501';
  END IF;

  IF NOT (v_owner AND v_paid) THEN
    RAISE EXCEPTION 'Receipt code unavailable for this bill' USING ERRCODE = '42501';
  END IF;

  SELECT signing_secret INTO v_secret FROM private.receipt_config WHERE id = 1;
  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'Receipt signing is not configured' USING ERRCODE = 'XX000';
  END IF;

  RETURN encode(
    hmac(
      convert_to(public.receipt_payload(bill_id), 'UTF8'),
      convert_to(v_secret, 'UTF8'),
      'sha256'::text
    ),
    'hex'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_receipt_code(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_receipt_code(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Public verification: recompute over authoritative data, constant-time compare
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.verify_receipt(bill_number text, code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private, extensions
AS $$
DECLARE
  v_row      public.bills%ROWTYPE;
  v_secret   text;
  v_expected text;
  v_provided text;
BEGIN
  SELECT * INTO v_row
  FROM public.bills
  WHERE "billNumber" = trim(bill_number);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  SELECT signing_secret INTO v_secret FROM private.receipt_config WHERE id = 1;
  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'Receipt signing is not configured' USING ERRCODE = 'XX000';
  END IF;

  v_expected := encode(
    hmac(
      convert_to(public.receipt_payload(v_row.id), 'UTF8'),
      convert_to(v_secret, 'UTF8'),
      'sha256'::text
    ),
    'hex'
  );
  v_provided := lower(regexp_replace(code, '[^0-9a-fA-F]', '', 'g'));

  RETURN jsonb_build_object(
    'valid', encode(hmac(convert_to(v_expected, 'UTF8'), convert_to(v_secret, 'UTF8'), 'sha256'::text), 'hex') =
             encode(hmac(convert_to(v_provided, 'UTF8'), convert_to(v_secret, 'UTF8'), 'sha256'::text), 'hex'),
    'bill', jsonb_build_object(
      'billNumber',    v_row."billNumber",
      'billingPeriod', v_row."billingPeriod",
      'totalAmount',   round((v_row."totalAmount")::numeric, 2),
      'paidAt',        v_row."paidAt",
      'paymentMethod', v_row."paymentMethod",
      'status',        v_row.status
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.verify_receipt(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_receipt(text, text) TO anon, authenticated;

COMMIT;
