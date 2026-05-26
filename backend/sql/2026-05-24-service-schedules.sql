-- Create service_schedules table for publishing service timetables
DROP TABLE IF EXISTS service_schedules CASCADE;

CREATE TABLE service_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "scheduleCode" VARCHAR(50) NOT NULL UNIQUE,
  "serviceType" VARCHAR(100) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  street VARCHAR(255),
  zone VARCHAR(100) NOT NULL,
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed')),
  "serviceDays" TEXT[] NOT NULL,
  "startTimeWindow" VARCHAR(10) NOT NULL,
  "endTimeWindow" VARCHAR(10) NOT NULL,
  description TEXT,
  "operatorName" VARCHAR(255),
  "operatorPhoneNumber" VARCHAR(20),
  "operatorEmail" VARCHAR(255),
  "serviceProviders" TEXT[],
  "publishedDate" TIMESTAMP,
  "effectiveFromDate" TIMESTAMP,
  "effectiveToDate" TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'suspended')),
  notes TEXT,
  "publishedById" UUID,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_service_schedules_ward_street ON service_schedules(ward, street);
CREATE INDEX idx_service_schedules_status_published ON service_schedules(status, "publishedDate");
CREATE INDEX idx_service_schedules_service_type_status ON service_schedules("serviceType", status);
CREATE INDEX idx_service_schedules_published_date ON service_schedules("publishedDate" DESC);
CREATE INDEX idx_service_schedules_ward ON service_schedules(ward);
CREATE INDEX idx_service_schedules_service_type ON service_schedules("serviceType");

-- Add comment to table
COMMENT ON TABLE service_schedules IS 'Stores published service timetables for waste collection, bulky pickups, and other services by ward/zone';
COMMENT ON COLUMN service_schedules."scheduleCode" IS 'Unique code for the schedule (auto-generated)';
COMMENT ON COLUMN service_schedules."serviceType" IS 'Type of service (e.g., waste_collection, bulky_pickup, bin_replacement)';
COMMENT ON COLUMN service_schedules.frequency IS 'How often the service occurs';
COMMENT ON COLUMN service_schedules."serviceDays" IS 'Days of week when service is provided (e.g., [Monday, Wednesday, Friday])';
COMMENT ON COLUMN service_schedules.status IS 'Publication status: draft (not visible), published (visible to residents), archived (old), suspended (temporarily unavailable)';
COMMENT ON COLUMN service_schedules."publishedDate" IS 'When the schedule was published';
COMMENT ON COLUMN service_schedules."effectiveFromDate" IS 'When the schedule becomes effective';
COMMENT ON COLUMN service_schedules."effectiveToDate" IS 'When the schedule expires';
