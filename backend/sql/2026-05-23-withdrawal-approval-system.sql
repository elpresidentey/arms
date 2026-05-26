-- Add status and metadata columns to wallet_transactions table for withdrawal approval system
-- Migration: 2026-05-23-withdrawal-approval-system

-- Add status column (default 'approved' for backward compatibility)
ALTER TABLE wallet_transactions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';

-- Add metadata column for storing additional information
ALTER TABLE wallet_transactions 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status 
ON wallet_transactions(status);

-- Create index on source and status for withdrawal queries
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_source_status 
ON wallet_transactions(source, status);

-- Update existing withdrawal transactions to have 'approved' status
UPDATE wallet_transactions 
SET status = 'approved' 
WHERE source = 'withdrawal' AND status IS NULL;

-- Add comment to table
COMMENT ON COLUMN wallet_transactions.status IS 'Transaction status: pending, approved, rejected, failed';
COMMENT ON COLUMN wallet_transactions.metadata IS 'Additional transaction data including account details and approval information';
