-- Credit resident wallets when a recyclable is marked paid.
-- Mirrors the retired NestJS RecyclablesService.creditRecyclableEarnings():
--   * one credit per recyclable (guarded by referenceId + source + type)
--   * amount = actualValue || estimatedValue (skipped when <= 0)
--   * balanceAfter = previous balance + amount
-- wallet_transactions is read-only from the client (RLS), so this must run
-- server-side. Run this in the Supabase Dashboard > SQL Editor.

CREATE OR REPLACE FUNCTION public.credit_recyclable_earnings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  amount numeric;
  previous_balance numeric;
BEGIN
  IF NEW.status <> 'paid' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.wallet_transactions
    WHERE source = 'recyclables'
      AND type = 'credit'
      AND "referenceId" = NEW.id::text
  ) THEN
    RETURN NEW;
  END IF;

  amount := COALESCE(NEW."actualValue", NEW."estimatedValue", 0);
  IF amount <= 0 THEN
    RETURN NEW;
  END IF;

  SELECT "balanceAfter" INTO previous_balance
  FROM public.wallet_transactions
  WHERE "userId" = NEW."userId"
  ORDER BY "createdAt" DESC, id DESC
  LIMIT 1;
  previous_balance := COALESCE(previous_balance, 0);

  INSERT INTO public.wallet_transactions (
    "userId", type, amount, "balanceAfter", source, description, "referenceId", status
  ) VALUES (
    NEW."userId", 'credit', amount, previous_balance + amount, 'recyclables',
    'Recyclables valuation payout', NEW.id::text, 'approved'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_credit_recyclable_earnings ON public.recyclables;
CREATE TRIGGER trg_credit_recyclable_earnings
  BEFORE UPDATE OF status ON public.recyclables
  FOR EACH ROW
  WHEN (NEW.status = 'paid')
  EXECUTE FUNCTION public.credit_recyclable_earnings();
