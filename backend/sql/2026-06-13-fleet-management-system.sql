-- Fleet Management System Migration
-- Created: 2026-06-13
-- Purpose: Add comprehensive fleet management tables for drivers, vehicles, assignments, and route executions

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_code VARCHAR(10) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) NOT NULL,
    license_class VARCHAR(20) DEFAULT 'class_c' CHECK (license_class IN ('class_a', 'class_b', 'class_c')),
    license_expiry_date TIMESTAMP NOT NULL,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    hire_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'suspended')),
    specializations TEXT, -- JSON array of specializations
    performance_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (performance_rating >= 0 AND performance_rating <= 5),
    total_routes INTEGER DEFAULT 0,
    completed_routes INTEGER DEFAULT 0,
    average_completion_time DECIMAL(5,2) DEFAULT 0, -- Average hours per route
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_code VARCHAR(10) UNIQUE NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900),
    vehicle_type VARCHAR(20) DEFAULT 'open_truck' CHECK (vehicle_type IN ('compactor_truck', 'open_truck', 'tipper_truck', 'mini_truck', 'tricycle')),
    fuel_type VARCHAR(20) DEFAULT 'diesel' CHECK (fuel_type IN ('diesel', 'petrol', 'electric', 'hybrid')),
    capacity DECIMAL(8,2) NOT NULL,
    capacity_unit VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'out_of_service', 'retired')),
    purchase_date TIMESTAMP NOT NULL,
    purchase_price DECIMAL(12,2),
    insurance_expiry TIMESTAMP,
    registration_expiry TIMESTAMP,
    last_service_date TIMESTAMP,
    next_service_due TIMESTAMP,
    current_mileage INTEGER DEFAULT 0,
    fuel_efficiency DECIMAL(5,2) DEFAULT 0, -- km per liter
    total_routes INTEGER DEFAULT 0,
    average_downtime DECIMAL(5,2) DEFAULT 0, -- Average days in maintenance
    current_location VARCHAR(255),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vehicle assignments table
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP NOT NULL DEFAULT NOW(),
    unassigned_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'temporary')),
    reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(20) DEFAULT 'preventive' CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency', 'inspection')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    started_date TIMESTAMP,
    completed_date TIMESTAMP,
    mileage_at_maintenance INTEGER,
    service_provider VARCHAR(255),
    technician VARCHAR(255),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    parts_used TEXT, -- JSON array of parts
    work_performed TEXT,
    next_service_due TIMESTAMP,
    next_service_mileage INTEGER,
    created_by_id UUID REFERENCES users(id),
    attachments TEXT, -- JSON array of file URLs
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create route executions table
CREATE TABLE IF NOT EXISTS route_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES collection_routes(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'disrupted', 'cancelled')),
    planned_stops INTEGER DEFAULT 0,
    completed_stops INTEGER DEFAULT 0,
    total_distance DECIMAL(8,2), -- In kilometers
    fuel_used DECIMAL(5,2), -- In liters
    waste_collected DECIMAL(8,2), -- In tons or cubic meters
    waste_unit VARCHAR(10),
    start_mileage INTEGER,
    end_mileage INTEGER,
    start_location VARCHAR(255),
    end_location VARCHAR(255),
    start_latitude DECIMAL(10,6),
    start_longitude DECIMAL(10,6),
    end_latitude DECIMAL(10,6),
    end_longitude DECIMAL(10,6),
    route_gps_trace TEXT, -- JSON array of GPS coordinates
    delay_reason VARCHAR(255),
    delay_minutes INTEGER DEFAULT 0,
    issues TEXT, -- JSON array of issues encountered
    notes TEXT,
    driver_rating DECIMAL(3,2) CHECK (driver_rating >= 0 AND driver_rating <= 5),
    resident_satisfaction DECIMAL(3,2) CHECK (resident_satisfaction >= 0 AND resident_satisfaction <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_license_expiry ON drivers(license_expiry_date);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_service ON vehicles(next_service_due);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration_expiry ON vehicles(registration_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance_expiry ON vehicles(insurance_expiry);

CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_driver ON vehicle_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_vehicle ON vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_status ON vehicle_assignments(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_active ON vehicle_assignments(status) WHERE status = 'active' AND unassigned_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_scheduled_date ON maintenance_records(scheduled_date);
-- Removed problematic index with NOW() function - can be added with IMMUTABLE function wrapper if needed
-- CREATE INDEX IF NOT EXISTS idx_maintenance_records_overdue ON maintenance_records(scheduled_date) WHERE status = 'scheduled' AND scheduled_date < NOW();

CREATE INDEX IF NOT EXISTS idx_route_executions_route ON route_executions(route_id);
CREATE INDEX IF NOT EXISTS idx_route_executions_driver ON route_executions(driver_id);
CREATE INDEX IF NOT EXISTS idx_route_executions_vehicle ON route_executions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_route_executions_status ON route_executions(status);
CREATE INDEX IF NOT EXISTS idx_route_executions_scheduled_date ON route_executions(scheduled_date);
-- Removed problematic index with CURRENT_DATE function - can query by date range instead
-- CREATE INDEX IF NOT EXISTS idx_route_executions_today ON route_executions(scheduled_date) WHERE DATE(scheduled_date) = CURRENT_DATE;

-- Create triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_assignments_updated_at BEFORE UPDATE ON vehicle_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_executions_updated_at BEFORE UPDATE ON route_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add sample data for testing (optional - can be run separately)

-- Sample drivers
INSERT INTO drivers (driver_code, user_id, license_number, license_class, license_expiry_date, hire_date, notes)
SELECT 
    'DR001',
    u.id,
    'NG-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
    'class_b',
    NOW() + INTERVAL '2 years',
    NOW() - INTERVAL '6 months',
    'Experienced compactor truck operator'
FROM users u 
WHERE u.role = 'psp_operator' 
LIMIT 1
ON CONFLICT (driver_code) DO NOTHING;

-- Sample vehicles
INSERT INTO vehicles (vehicle_code, plate_number, make, model, year, vehicle_type, fuel_type, capacity, capacity_unit, purchase_date, current_location, notes)
VALUES 
    ('TR001', 'LAG-123-AB', 'Isuzu', 'NPR', 2022, 'compactor_truck', 'diesel', 15.5, 'm3', '2022-01-15', 'Main Depot', 'Primary collection vehicle for residential routes'),
    ('TR002', 'LAG-456-CD', 'Hino', '300 Series', 2021, 'open_truck', 'diesel', 8.0, 'm3', '2021-06-20', 'Main Depot', 'Backup vehicle for overflow collection'),
    ('TR003', 'LAG-789-EF', 'Mercedes', 'Atego', 2023, 'compactor_truck', 'diesel', 18.0, 'm3', '2023-03-10', 'Service Bay', 'New high-capacity vehicle for commercial areas')
ON CONFLICT (vehicle_code) DO NOTHING;

-- Legacy truck_code updates removed - collection_routes table structure changed
-- These updates are no longer needed as the new system uses vehicle assignments

-- Create sample route executions for today
INSERT INTO route_executions (route_id, scheduled_date, planned_stops, status)
SELECT 
    cr.id,
    CURRENT_DATE + TIME '08:00:00',
    10,
    'scheduled'
FROM collection_routes cr
WHERE cr.status = 'active'
LIMIT 5
ON CONFLICT DO NOTHING;

COMMENT ON TABLE drivers IS 'Store driver profiles, licenses, and performance data';
COMMENT ON TABLE vehicles IS 'Store vehicle information, maintenance schedules, and operational data';
COMMENT ON TABLE vehicle_assignments IS 'Track driver-vehicle assignments over time';
COMMENT ON TABLE maintenance_records IS 'Store vehicle maintenance history and schedules';
COMMENT ON TABLE route_executions IS 'Track actual route execution with performance metrics';

-- Grant statements removed - using Supabase default roles instead
-- GRANT SELECT, INSERT, UPDATE ON drivers TO arms_app;
-- GRANT SELECT, INSERT, UPDATE ON vehicles TO arms_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_assignments TO arms_app;
-- GRANT SELECT, INSERT, UPDATE ON maintenance_records TO arms_app;
-- GRANT SELECT, INSERT, UPDATE ON route_executions TO arms_app;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO arms_app;