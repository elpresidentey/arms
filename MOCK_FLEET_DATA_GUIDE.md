# Mock Fleet Data Generation Guide

This guide explains how to populate your ARMS system with realistic mock data for testing the Fleet Management features.

## Overview

We've created two methods to generate mock fleet data:
1. **Automated Script** - Directly inserts data into the database
2. **Manual Entry** - Use the provided mock data with the UI forms

## Method 1: Automated Database Seeding (Recommended)

### Prerequisites
- PostgreSQL database running
- Backend environment variables configured
- `pg` npm package installed

### Running the Seed Script

```bash
cd backend
node scripts/seed-fleet-data.js
```

### What It Creates

#### 5 Sample Users (if needed)
- John Driver (Supervisor)
- Sarah Wheeler (Supervisor)
- Mike Collins (Dispatcher)
- Emma Rodriguez (Dispatcher)
- David Chen (Dispatcher)

#### 5 Drivers
- **DR001** - John Driver
  - License: DL-A1234567 (Class A)
  - Specializations: Compactor Trucks, Long Distance
  - Emergency Contact: Jane Driver (+2348012345678)

- **DR002** - Sarah Wheeler
  - License: DL-B2345678 (Class B)
  - Specializations: Tipper Trucks, Urban Routes
  - Emergency Contact: Robert Wheeler (+2348123456789)

- **DR003** - Mike Collins
  - License: DL-C3456789 (CDL)
  - Specializations: Recycling Trucks, Hazardous Materials
  - Emergency Contact: Lisa Collins (+2348234567890)

- **DR004** - Emma Rodriguez
  - License: DL-D4567890 (Class B)
  - Specializations: Compactor Trucks, Night Shifts
  - Emergency Contact: Carlos Rodriguez (+2348345678901)

- **DR005** - David Chen
  - License: DL-E5678901 (Class A)
  - Specializations: Roll-off Trucks, Construction Sites
  - Emergency Contact: Wei Chen (+2348456789012)

#### 8 Vehicles

| Code | Plate Number | Make | Model | Type | Capacity | Status |
|------|-------------|------|-------|------|----------|--------|
| TR001 | LAG-001-TR | Mercedes-Benz | Econic 2630 | Compactor | 12 tons | Operational |
| TR002 | LAG-002-TR | Volvo | FM 440 | Tipper | 15 tons | Operational |
| TR003 | LAG-003-TR | Isuzu | FVR 34 | Compactor | 10 tons | Operational |
| TR004 | LAG-004-TR | MAN | TGM 18.290 | Recycling | 8 tons | Operational |
| TR005 | LAG-005-TR | Scania | P 320 | Roll-off | 20 m³ | Operational |
| TR006 | LAG-006-TR | Mercedes-Benz | Atego 1218 | Compactor | 9 tons | Operational |
| TR007 | LAG-007-TR | DAF | LF 180 | Tipper | 12 tons | Operational |
| TR008 | LAG-008-TR | Iveco | Eurocargo 150E28 | Compactor | 11 tons | Maintenance |

#### Vehicle Assignments
- DR001 → TR001 (Mercedes Compactor)
- DR002 → TR002 (Volvo Tipper)
- DR003 → TR003 (Isuzu Compactor)
- DR004 → TR004 (MAN Recycling)
- DR005 → TR005 (Scania Roll-off)

### Expected Output

```
Connected to database
Found 5 users for driver creation

🚗 Creating drivers...
✅ Created driver DR001: John Driver
✅ Created driver DR002: Sarah Wheeler
✅ Created driver DR003: Mike Collins
✅ Created driver DR004: Emma Rodriguez
✅ Created driver DR005: David Chen

🚛 Creating vehicles...
✅ Created vehicle TR001: LAG-001-TR (Mercedes-Benz Econic 2630)
✅ Created vehicle TR002: LAG-002-TR (Volvo FM 440)
... (8 vehicles total)

🔗 Creating vehicle assignments...
✅ Assigned TR001 to DR001
✅ Assigned TR002 to DR002
... (5 assignments total)

✨ Fleet data seeding completed successfully!

📊 Summary:
   - Drivers created: 5
   - Vehicles created: 8
   - Assignments created: 5

🎉 You can now view the fleet in the Fleet Management page!
```

## Method 2: Manual Entry via UI

Use the provided `mock-fleet-data.json` file for reference when manually adding drivers and vehicles through the Fleet Management interface.

### Steps for Adding Drivers

1. Navigate to **Fleet Management** page
2. Click **"Add Driver"** button
3. Use the following test data:

#### Sample Driver 1
```
User: (Select any available user)
License Number: DL-A1234567
License Class: Class A
License Expiry: 2027-12-31
Hire Date: 2023-01-15
Emergency Contact: Jane Driver
Emergency Phone: +2348012345678
Notes: Experienced driver with 10+ years in waste management
```

#### Sample Driver 2
```
User: (Select any available user)
License Number: DL-B2345678
License Class: Class B
License Expiry: 2028-06-30
Hire Date: 2023-03-20
Emergency Contact: Robert Wheeler
Emergency Phone: +2348123456789
Notes: Excellent safety record, knows all city routes
```

### Steps for Adding Vehicles

1. Navigate to **Fleet Management** page
2. Click **"Add Vehicle"** button
3. Use the following test data:

#### Sample Vehicle 1
```
Plate Number: LAG-001-TR
Vehicle Type: Compactor Truck
Make: Mercedes-Benz
Model: Econic 2630
Year: 2022
Fuel Type: Diesel
Capacity: 12 tons
Purchase Date: 2022-01-15
Purchase Price: 85000
Insurance Expiry: 2027-01-15
Registration Expiry: 2027-01-15
Current Mileage: 45000
Current Location: Main Depot - Bay A
Notes: Primary collection vehicle for Ward 1-5
```

#### Sample Vehicle 2
```
Plate Number: LAG-002-TR
Vehicle Type: Tipper Truck
Make: Volvo
Model: FM 440
Year: 2021
Fuel Type: Diesel
Capacity: 15 tons
Purchase Date: 2021-06-20
Purchase Price: 78000
Insurance Expiry: 2026-06-20
Registration Expiry: 2026-06-20
Current Mileage: 62000
Current Location: Main Depot - Bay B
Notes: Heavy-duty tipper for landfill transport
```

## Reference Data

### License Classes
- **CLASS_A**: Heavy vehicles with GVWR of 26,001+ lbs
- **CLASS_B**: Single vehicles with GVWR of 26,001+ lbs
- **CLASS_C**: Passenger vehicles (16+ passengers)
- **CDL**: Commercial Driver's License

### Vehicle Types
- **compactor_truck**: Waste compactor for residential collection
- **tipper_truck**: Dump truck for bulk waste
- **roll_off**: Large container transport
- **recycling_truck**: Recyclable materials
- **flatbed**: Equipment and special items

### Fuel Types
- **diesel**: Most common for heavy trucks
- **gasoline**: Light vehicles
- **electric**: Battery-powered (eco-friendly)
- **hybrid**: Diesel-electric combination
- **cng**: Compressed Natural Gas

## Testing Scenarios

After populating the mock data, you can test:

### Driver Management
- ✅ View all drivers in the drivers table
- ✅ Check driver details (license, status, performance)
- ✅ Filter drivers by status
- ✅ Search drivers by name or code
- ✅ View current vehicle assignments

### Vehicle Management
- ✅ View all vehicles in the vehicles table
- ✅ Check vehicle details (make, model, status)
- ✅ Filter vehicles by status
- ✅ Search vehicles by plate or code
- ✅ View maintenance alerts for LAG-008-TR
- ✅ Check vehicle locations

### Fleet Overview
- ✅ View fleet statistics (total vehicles, active drivers)
- ✅ Check fleet utilization percentage
- ✅ View today's deployments
- ✅ Monitor maintenance alerts
- ✅ Track vehicle assignments

### Assignment Management
- ✅ View current vehicle-driver assignments
- ✅ Check assignment dates and status
- ✅ Filter by assigned/unassigned

## Cleanup

To remove all mock fleet data:

```sql
-- Delete in order due to foreign key constraints
DELETE FROM vehicle_assignments WHERE driver_id IN (SELECT id FROM drivers WHERE driver_code LIKE 'DR%');
DELETE FROM vehicles WHERE vehicle_code LIKE 'TR%';
DELETE FROM drivers WHERE driver_code LIKE 'DR%';
-- Optionally delete the test users
DELETE FROM users WHERE email LIKE '%@arms.com' AND email != 'admin@arms.com';
```

## Troubleshooting

### Script fails with "No eligible users found"
- The script will automatically create sample users
- Or manually create users with roles: admin, supervisor, or dispatcher

### Database connection error
- Check your `.env` file has correct `DATABASE_URL`
- Ensure PostgreSQL is running
- Verify database exists and is accessible

### Duplicate key errors
- The script uses auto-incrementing codes (DR001, TR001, etc.)
- If you have existing data, codes will continue from the highest existing number
- Use the cleanup SQL above if you want to start fresh

## Production Considerations

⚠️ **Warning**: This is mock data for testing only!

Before deploying to production:
- Remove all test/mock data
- Use real driver information and documents
- Verify all license numbers and expiry dates
- Confirm vehicle registration and insurance details
- Implement proper document management system
- Add vehicle inspection records
- Set up maintenance schedules

## Next Steps

After loading mock data:
1. Test the Fleet Management UI
2. Verify all CRUD operations work
3. Test vehicle-driver assignment flow
4. Check performance stats calculations
5. Test filtering and search functionality
6. Review maintenance alert system
7. Validate role-based access controls

## Support

If you encounter issues:
- Check backend logs for SQL errors
- Verify database schema matches entity definitions
- Ensure all foreign key relationships exist
- Check that enum values match between frontend and backend
