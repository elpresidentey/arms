-- Create billing system tables for waste collection service fees

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "billNumber" VARCHAR(50) NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "billingPeriod" VARCHAR(20) NOT NULL, -- e.g., '2026-05' for May 2026
  "propertyType" VARCHAR(50) NOT NULL CHECK ("propertyType" IN ('residential', 'commercial')),
  amount DECIMAL(10, 2) NOT NULL,
  "lateFee" DECIMAL(10, 2) DEFAULT 0,
  "totalAmount" DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  "dueDate" TIMESTAMP NOT NULL,
  "paidAt" TIMESTAMP,
  "paymentReference" VARCHAR(255),
  "paymentMethod" VARCHAR(50), -- 'paystack', 'bank_transfer', 'cash'
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "billId" UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  "paymentReference" VARCHAR(255) NOT NULL UNIQUE,
  "paymentMethod" VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  "paystackReference" VARCHAR(255),
  "paystackAccessCode" VARCHAR(255),
  metadata JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Billing configuration table
CREATE TABLE IF NOT EXISTS billing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "propertyType" VARCHAR(50) NOT NULL UNIQUE CHECK ("propertyType" IN ('residential', 'commercial')),
  "monthlyFee" DECIMAL(10, 2) NOT NULL,
  "lateFeePercentage" DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  "gracePeriodDays" INTEGER NOT NULL DEFAULT 7,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default billing rates
INSERT INTO billing_config ("propertyType", "monthlyFee", "lateFeePercentage", "gracePeriodDays")
VALUES 
  ('residential', 2000.00, 10.00, 7),
  ('commercial', 3500.00, 10.00, 7)
ON CONFLICT ("propertyType") DO UPDATE SET
  "monthlyFee" = EXCLUDED."monthlyFee",
  "lateFeePercentage" = EXCLUDED."lateFeePercentage",
  "gracePeriodDays" = EXCLUDED."gracePeriodDays";

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bills_user ON bills("userId");
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills("dueDate");
CREATE INDEX IF NOT EXISTS idx_bills_billing_period ON bills("billingPeriod");
CREATE INDEX IF NOT EXISTS idx_bills_user_period ON bills("userId", "billingPeriod");
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill ON bill_payments("billId");
CREATE INDEX IF NOT EXISTS idx_bill_payments_user ON bill_payments("userId");
CREATE INDEX IF NOT EXISTS idx_bill_payments_reference ON bill_payments("paymentReference");

-- Add comments
COMMENT ON TABLE bills IS 'Monthly waste collection service bills for residents and commercial properties';
COMMENT ON TABLE bill_payments IS 'Payment transactions for bills';
COMMENT ON TABLE billing_config IS 'Billing configuration for different property types';
COMMENT ON COLUMN bills."billNumber" IS 'Unique bill identifier (e.g., BILL-2026-05-001)';
COMMENT ON COLUMN bills."billingPeriod" IS 'Billing period in YYYY-MM format';
COMMENT ON COLUMN bills."lateFee" IS 'Late payment penalty amount';
COMMENT ON COLUMN bills."totalAmount" IS 'Total amount including late fees';
