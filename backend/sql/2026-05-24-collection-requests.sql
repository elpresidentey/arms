-- Drop and recreate collection_requests table with correct column names
DROP TABLE IF EXISTS collection_requests CASCADE;

CREATE TABLE collection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "residentId" UUID NOT NULL,
  address VARCHAR(255) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  street VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  type VARCHAR(50) NOT NULL DEFAULT 'routine',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  "preferredDate" TIMESTAMP,
  description TEXT,
  "routeId" UUID,
  "scheduledDate" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_collection_requests_status ON collection_requests(status);
CREATE INDEX idx_collection_requests_residentId ON collection_requests("residentId");
CREATE INDEX idx_collection_requests_createdAt ON collection_requests("createdAt" DESC);
CREATE INDEX idx_collection_requests_type ON collection_requests(type);
CREATE INDEX idx_collection_requests_ward_street ON collection_requests(ward, street);
