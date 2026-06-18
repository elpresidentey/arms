# Mock Fleet Data - Quick Reference Card

## 🚀 Quick Start

### Option 1: Database Script (Fastest)
```bash
cd backend
node scripts/seed-fleet-data.js
```

### Option 2: API Script (Safer)
```bash
cd backend
node scripts/seed-fleet-via-api.js
```

### Option 3: Manual UI Entry
Use the data tables below to manually add via Fleet Management UI.

---

## 👥 Sample Users

| Name | Email | Role | Password |
|------|-------|------|----------|
| John Driver | john.driver@arms.com | Supervisor | Driver@123 |
| Sarah Wheeler | sarah.wheeler@arms.com | Supervisor | Wheeler@123 |
| Mike Collins | mike.collins@arms.com | Dispatcher | Collins@123 |
| Emma Rodriguez | emma.rodriguez@arms.com | Dispatcher | Rodriguez@123 |
| David Chen | david.chen@arms.com | Dispatcher | Chen@123 |

---

## 🚗 Sample Drivers (Copy-Paste Ready)

### Driver 1 - John Driver
```
License Number: DL-A1234567
License Class: CLASS_A
License Expiry: 2027-12-31
Emergency Contact: Jane Driver
Emergency Phone: +2348012345678
Hire Date: 2023-01-15
Notes: Experienced driver with 10+ years in waste management
```

### Driver 2 - Sarah Wheeler
```
License Number: DL-B2345678
License Class: CLASS_B
License Expiry: 2028-06-30
Emergency Contact: Robert Wheeler
Emergency Phone: +2348123456789
Hire Date: 2023-03-20
Notes: Excellent safety record, knows all city routes
```

### Driver 3 - Mike Collins
```
License Number: DL-C3456789
License Class: CDL
License Expiry: 2027-09-15
Emergency Contact: Lisa Collins
Emergency Phone: +2348234567890
Hire Date: 2023-05-10
Notes: Certified for hazardous waste handling
```

### Driver 4 - Emma Rodriguez
```
License Number: DL-D4567890
License Class: CLASS_B
License Expiry: 2028-03-20
Emergency Contact: Carlos Rodriguez
Emergency Phone: +2348345678901
Hire Date: 2023-07-01
Notes: Prefers night shifts, very reliable
```

### Driver 5 - David Chen
```
License Number: DL-E5678901
License Class: CLASS_A
License Expiry: 2027-11-30
Emergency Contact: Wei Chen
Emergency Phone: +2348456789012
Hire Date: 2023-09-15
Notes: Specializes in construction waste collection
```

---

## 🚛 Sample Vehicles (Copy-Paste Ready)

### Vehicle 1 - Mercedes Compactor
```
Plate Number: LAG-001-TR
Make: Mercedes-Benz
Model: Econic 2630
Year: 2022
Vehicle Type: compactor_truck
Fuel Type: diesel
Capacity: 12
Capacity Unit: tons
Purchase Date: 2022-01-15
Purchase Price: 85000
Insurance Expiry: 2027-01-15
Registration Expiry: 2027-01-15
Current Mileage: 45000
Current Location: Main Depot - Bay A
Notes: Primary collection vehicle for Ward 1-5
```

### Vehicle 2 - Volvo Tipper
```
Plate Number: LAG-002-TR
Make: Volvo
Model: FM 440
Year: 2021
Vehicle Type: tipper_truck
Fuel Type: diesel
Capacity: 15
Capacity Unit: tons
Purchase Date: 2021-06-20
Purchase Price: 78000
Insurance Expiry: 2026-06-20
Registration Expiry: 2026-06-20
Current Mileage: 62000
Current Location: Main Depot - Bay B
Notes: Heavy-duty tipper for landfill transport
```

### Vehicle 3 - Isuzu Compactor
```
Plate Number: LAG-003-TR
Make: Isuzu
Model: FVR 34
Year: 2023
Vehicle Type: compactor_truck
Fuel Type: diesel
Capacity: 10
Capacity Unit: tons
Purchase Date: 2023-02-10
Purchase Price: 65000
Insurance Expiry: 2028-02-10
Registration Expiry: 2028-02-10
Current Mileage: 28000
Current Location: Main Depot - Bay C
Notes: Newest addition to fleet, excellent fuel efficiency
```

### Vehicle 4 - MAN Recycling
```
Plate Number: LAG-004-TR
Make: MAN
Model: TGM 18.290
Year: 2020
Vehicle Type: recycling_truck
Fuel Type: diesel
Capacity: 8
Capacity Unit: tons
Purchase Date: 2020-09-15
Purchase Price: 72000
Insurance Expiry: 2026-09-15
Registration Expiry: 2026-09-15
Current Mileage: 78000
Current Location: Recycling Center
Notes: Dedicated recycling collection vehicle
```

### Vehicle 5 - Scania Roll-off
```
Plate Number: LAG-005-TR
Make: Scania
Model: P 320
Year: 2022
Vehicle Type: roll_off
Fuel Type: diesel
Capacity: 20
Capacity Unit: cubic_meters
Purchase Date: 2022-11-05
Purchase Price: 92000
Insurance Expiry: 2027-11-05
Registration Expiry: 2027-11-05
Current Mileage: 35000
Current Location: Main Depot - Bay D
Notes: Roll-off truck for large containers and construction sites
```

### Vehicle 6 - Mercedes Backup
```
Plate Number: LAG-006-TR
Make: Mercedes-Benz
Model: Atego 1218
Year: 2021
Vehicle Type: compactor_truck
Fuel Type: diesel
Capacity: 9
Capacity Unit: tons
Purchase Date: 2021-04-12
Purchase Price: 68000
Insurance Expiry: 2026-04-12
Registration Expiry: 2026-04-12
Current Mileage: 55000
Current Location: Main Depot - Bay A
Notes: Backup vehicle for high-demand routes
```

---

## 📋 Enum Values Reference

### License Classes
- `CLASS_A` - Heavy vehicles (26,001+ lbs)
- `CLASS_B` - Single vehicles (26,001+ lbs)
- `CLASS_C` - Passenger vehicles (16+ people)
- `CDL` - Commercial Driver's License

### Vehicle Types
- `compactor_truck` - Residential waste collection
- `tipper_truck` - Bulk waste transport
- `roll_off` - Container transport
- `recycling_truck` - Recyclables
- `flatbed` - Special items

### Fuel Types
- `diesel`
- `gasoline`
- `electric`
- `hybrid`
- `cng`

### Capacity Units
- `tons`
- `cubic_meters`
- `cubic_yards`

---

## 🧪 Test Scenarios

After seeding, you can test:

### ✅ Driver Features
- [ ] View drivers list
- [ ] Search driver by name/code
- [ ] Filter by status (active/inactive)
- [ ] View driver details
- [ ] Check current vehicle assignment
- [ ] View performance ratings

### ✅ Vehicle Features
- [ ] View vehicles list
- [ ] Search vehicle by plate/code
- [ ] Filter by status
- [ ] View vehicle details
- [ ] Check current driver
- [ ] View maintenance info (LAG-008-TR shows maintenance status)

### ✅ Assignment Features
- [ ] View current assignments
- [ ] See assigned vs unassigned vehicles
- [ ] Check assignment dates
- [ ] View driver-vehicle pairs

### ✅ Fleet Overview
- [ ] Total vehicles count (8)
- [ ] Active drivers count (5)
- [ ] Fleet utilization (5/8 = 62.5%)
- [ ] Maintenance alerts
- [ ] Today's deployments

---

## 🔧 Troubleshooting

### "No users available"
Create users first or the script will auto-create them.

### "Database connection failed"
Check `.env` file has correct `DATABASE_URL`.

### "Authentication failed" (API script)
Verify admin credentials in environment variables or script.

### Duplicate entries
Run cleanup SQL or use different plate numbers.

---

## 🗑️ Cleanup Commands

### Delete all mock data
```sql
DELETE FROM vehicle_assignments WHERE driver_id IN (SELECT id FROM drivers WHERE driver_code LIKE 'DR%');
DELETE FROM vehicles WHERE vehicle_code LIKE 'TR%';
DELETE FROM drivers WHERE driver_code LIKE 'DR%';
DELETE FROM users WHERE email IN (
  'john.driver@arms.com',
  'sarah.wheeler@arms.com',
  'mike.collins@arms.com',
  'emma.rodriguez@arms.com',
  'david.chen@arms.com'
);
```

### Delete specific driver
```sql
DELETE FROM vehicle_assignments WHERE driver_id = '<driver-id>';
DELETE FROM drivers WHERE id = '<driver-id>';
```

### Delete specific vehicle
```sql
DELETE FROM vehicle_assignments WHERE vehicle_id = '<vehicle-id>';
DELETE FROM vehicles WHERE id = '<vehicle-id>';
```

---

## 📞 Support

Issues with mock data? Check:
1. Backend server is running
2. Database connection is working
3. Admin user exists and is authenticated
4. All required tables exist (run migrations)
5. No foreign key constraint violations

For more details, see `MOCK_FLEET_DATA_GUIDE.md`
