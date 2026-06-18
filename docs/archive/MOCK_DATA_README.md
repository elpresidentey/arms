# Mock Fleet Data - Complete Package

This package provides comprehensive mock data for testing the ARMS Fleet Management system.

## 📦 What's Included

### 1. **seed-fleet-data.js**
Direct database seeding script using PostgreSQL client.

**Best for:** Fast bulk data insertion, development environment  
**Location:** `backend/scripts/seed-fleet-data.js`  
**Usage:**
```bash
cd backend
node scripts/seed-fleet-data.js
```

**Creates:**
- 5 Users (supervisors/dispatchers)
- 5 Drivers (with complete license info)
- 8 Vehicles (various types and makes)
- 5 Vehicle-Driver assignments

### 2. **seed-fleet-via-api.js**
API-based seeding using HTTP endpoints.

**Best for:** Testing API endpoints, production-like data insertion  
**Location:** `backend/scripts/seed-fleet-via-api.js`  
**Usage:**
```bash
cd backend
node scripts/seed-fleet-via-api.js
```

**Requires:**
- Backend server running
- Admin credentials (default: admin@arms.com / Admin@123)
- Valid JWT authentication

### 3. **mock-fleet-data.json**
Structured JSON file with all mock data.

**Best for:** Reference, manual UI testing, custom scripts  
**Location:** `backend/scripts/mock-fleet-data.json`  
**Contains:**
- Sample user accounts
- Driver profiles with license details
- Vehicle specifications
- Enum value definitions
- Field descriptions

### 4. **MOCK_FLEET_DATA_GUIDE.md**
Comprehensive guide with detailed instructions.

**Includes:**
- Step-by-step setup instructions
- All three seeding methods explained
- Complete data tables
- Testing scenarios checklist
- Troubleshooting tips
- Cleanup procedures
- Production considerations

### 5. **MOCK_DATA_QUICK_REFERENCE.md**
Quick-access cheat sheet for developers.

**Features:**
- Copy-paste ready data entries
- Enum value reference
- Test scenario checklist
- Quick cleanup commands
- Common troubleshooting

## 🎯 Choose Your Method

### Method 1: Database Script ⚡ (Recommended for Development)

**Pros:**
- Fastest execution
- No server needed
- Bulk operations
- Direct SQL control

**Cons:**
- Requires database access
- Bypasses API validation
- Not testing API layer

**When to use:**
- Initial development setup
- Resetting test data quickly
- Bulk data generation

```bash
cd backend
node scripts/seed-fleet-data.js
```

---

### Method 2: API Script 🔒 (Recommended for Testing)

**Pros:**
- Tests actual API endpoints
- Goes through validation
- Production-like flow
- Tests authentication

**Cons:**
- Slower than direct DB
- Requires running server
- Network overhead

**When to use:**
- Testing API integration
- Validating business logic
- Pre-deployment testing

```bash
# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2: Run seeder
cd backend
node scripts/seed-fleet-via-api.js
```

---

### Method 3: Manual UI Entry 🎨 (Recommended for Learning)

**Pros:**
- Tests user interface
- Validates UI forms
- Best for learning flow
- See real user experience

**Cons:**
- Time-consuming
- Repetitive
- Manual process

**When to use:**
- First-time setup walkthrough
- UI/UX testing
- Training new developers
- Demonstrating features

**Steps:**
1. Open Fleet Management page
2. Use data from `MOCK_DATA_QUICK_REFERENCE.md`
3. Click "Add Driver" / "Add Vehicle"
4. Copy-paste from reference sheet
5. Submit and verify

---

## 📊 Mock Data Overview

### Users (5)
| Name | Email | Role | Use Case |
|------|-------|------|----------|
| John Driver | john.driver@arms.com | Supervisor | Experienced heavy vehicle driver |
| Sarah Wheeler | sarah.wheeler@arms.com | Supervisor | Urban route specialist |
| Mike Collins | mike.collins@arms.com | Dispatcher | Hazmat certified |
| Emma Rodriguez | emma.rodriguez@arms.com | Dispatcher | Night shift operations |
| David Chen | david.chen@arms.com | Dispatcher | Construction site specialist |

### Drivers (5)
| Code | License | Class | Specialization | Status |
|------|---------|-------|----------------|--------|
| DR001 | DL-A1234567 | A | Compactor, Long Distance | Active |
| DR002 | DL-B2345678 | B | Tipper, Urban Routes | Active |
| DR003 | DL-C3456789 | CDL | Recycling, Hazmat | Active |
| DR004 | DL-D4567890 | B | Compactor, Night Shift | Active |
| DR005 | DL-E5678901 | A | Roll-off, Construction | Active |

### Vehicles (8)
| Code | Plate | Make | Model | Type | Status |
|------|-------|------|-------|------|--------|
| TR001 | LAG-001-TR | Mercedes-Benz | Econic 2630 | Compactor | Operational |
| TR002 | LAG-002-TR | Volvo | FM 440 | Tipper | Operational |
| TR003 | LAG-003-TR | Isuzu | FVR 34 | Compactor | Operational |
| TR004 | LAG-004-TR | MAN | TGM 18.290 | Recycling | Operational |
| TR005 | LAG-005-TR | Scania | P 320 | Roll-off | Operational |
| TR006 | LAG-006-TR | Mercedes-Benz | Atego 1218 | Compactor | Operational |
| TR007 | LAG-007-TR | DAF | LF 180 | Tipper | Operational |
| TR008 | LAG-008-TR | Iveco | Eurocargo 150E28 | Compactor | Maintenance |

### Assignments (5)
| Driver | Vehicle | Notes |
|--------|---------|-------|
| DR001 (John) | TR001 (Mercedes Compactor) | Ward 1-5 routes |
| DR002 (Sarah) | TR002 (Volvo Tipper) | Landfill transport |
| DR003 (Mike) | TR003 (Isuzu Compactor) | Recycling routes |
| DR004 (Emma) | TR004 (MAN Recycling) | Night operations |
| DR005 (David) | TR005 (Scania Roll-off) | Construction sites |

---

## ✅ Quick Start Checklist

### Before Running Scripts

- [ ] PostgreSQL database is running
- [ ] Backend `.env` file is configured
- [ ] Database migrations are complete
- [ ] Node.js and npm are installed
- [ ] Required npm packages installed (`npm install`)

### For API Script Only

- [ ] Backend server is running (`npm run start:dev`)
- [ ] Admin account exists
- [ ] Admin credentials are correct
- [ ] API is accessible (test with health check)

### After Seeding

- [ ] Check console output for success messages
- [ ] Verify driver count in database/UI
- [ ] Verify vehicle count in database/UI
- [ ] Check vehicle assignments
- [ ] Test Fleet Management page loads
- [ ] Try filtering and searching
- [ ] Verify one vehicle is in maintenance status

---

## 🧪 Testing Scenarios

Use the seeded data to test these features:

### Driver Management
1. **List View**
   - Should show 5 drivers
   - Filter by status (all active)
   - Search by name or code

2. **Driver Details**
   - View license information
   - Check emergency contacts
   - See current vehicle assignment

3. **Performance**
   - View performance rating (default 4.5)
   - Check total/completed routes
   - See specializations

### Vehicle Management
1. **List View**
   - Should show 8 vehicles
   - 7 operational, 1 in maintenance
   - Filter by status
   - Search by plate or code

2. **Vehicle Details**
   - View make/model/year
   - Check insurance/registration expiry
   - See current mileage
   - View current location

3. **Maintenance**
   - LAG-008-TR should show maintenance status
   - Check service due dates
   - View maintenance history

### Fleet Overview
1. **Statistics**
   - Total Vehicles: 8
   - Active Drivers: 5
   - Fleet Utilization: ~62%
   - Assignments: 5

2. **Deployments**
   - See today's active assignments
   - View driver-vehicle pairs
   - Check route information

3. **Alerts**
   - Maintenance alerts (1 vehicle)
   - License expiry warnings
   - Document expiration notices

---

## 🔄 Reset & Cleanup

### Quick Reset (Keep Structure)
```bash
cd backend
node scripts/seed-fleet-data.js
```
This will create new entries without removing old ones.

### Full Cleanup (Delete All Mock Data)
```sql
-- Run in psql or database client
DELETE FROM vehicle_assignments 
WHERE driver_id IN (SELECT id FROM drivers WHERE driver_code LIKE 'DR%');

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

### Selective Cleanup (Keep Some Data)
```sql
-- Delete only vehicles
DELETE FROM vehicle_assignments WHERE vehicle_id IN (SELECT id FROM vehicles WHERE vehicle_code LIKE 'TR%');
DELETE FROM vehicles WHERE vehicle_code LIKE 'TR%';

-- Delete only drivers
DELETE FROM vehicle_assignments WHERE driver_id IN (SELECT id FROM drivers WHERE driver_code LIKE 'DR%');
DELETE FROM drivers WHERE driver_code LIKE 'DR%';
```

---

## 🚨 Common Issues & Solutions

### Issue: "No eligible users found"
**Solution:** Script auto-creates users. If it fails, check database connection.

### Issue: "Duplicate key violation"
**Solution:** Codes auto-increment. If you have existing data, cleanup first.

### Issue: "Cannot connect to database"
**Solution:** Check `.env` file `DATABASE_URL` and PostgreSQL is running.

### Issue: "Authentication failed" (API script)
**Solution:** Verify admin credentials or update `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### Issue: "Foreign key constraint violation"
**Solution:** Ensure all migrations are run and tables exist.

### Issue: "Module not found: pg"
**Solution:** Run `npm install pg` in backend directory.

---

## 📈 Extending the Mock Data

### Adding More Drivers
1. Edit `mock-fleet-data.json`
2. Add new driver object to `drivers` array
3. Update script to use new data
4. Run seeder

### Adding More Vehicles
1. Edit vehicle templates in scripts
2. Follow existing format
3. Update plate numbers (LAG-009-TR, etc.)
4. Run seeder

### Custom Scenarios
Create your own seeding script:
```javascript
const { Client } = require('pg');
// Use seed-fleet-data.js as template
// Customize data as needed
```

---

## 🎓 Learning Resources

### Understanding the Data Model

**Users → Drivers (1:1)**
- Each driver must be linked to a user account
- User provides authentication
- Driver holds license and employment data

**Drivers ↔ Vehicles (M:N via Assignments)**
- Multiple assignments over time
- Only one active assignment per driver
- Only one active assignment per vehicle
- Historical tracking of all assignments

**Vehicles → Maintenance (1:M)**
- Each vehicle can have multiple maintenance records
- Track service history
- Schedule future maintenance

---

## 📞 Support & Questions

If you encounter issues:

1. **Check Console Output**
   - Scripts provide detailed error messages
   - Look for SQL errors or API responses

2. **Verify Prerequisites**
   - All dependencies installed
   - Database accessible
   - Server running (for API script)

3. **Review Logs**
   - Backend logs for API errors
   - PostgreSQL logs for database issues

4. **Reference Documentation**
   - `MOCK_FLEET_DATA_GUIDE.md` - Full guide
   - `MOCK_DATA_QUICK_REFERENCE.md` - Quick answers
   - `mock-fleet-data.json` - Data structure

---

## 🎉 Success Indicators

You know it worked when:

✅ Console shows success messages  
✅ Fleet Management page loads without errors  
✅ Driver list shows 5 drivers  
✅ Vehicle list shows 8 vehicles  
✅ Assignments tab shows 5 active assignments  
✅ Statistics show correct counts  
✅ Search and filter work correctly  
✅ Can view individual driver/vehicle details

---

## 📝 Next Steps

After seeding mock data:

1. **Explore the UI**
   - Navigate through all Fleet Management tabs
   - Test search and filter functions
   - View individual records

2. **Test Features**
   - Try adding a new driver
   - Add a new vehicle
   - Assign vehicles to drivers
   - Update driver/vehicle info

3. **Run Scenarios**
   - Complete maintenance on LAG-008-TR
   - Reassign a vehicle to different driver
   - Add maintenance records

4. **Clean Up**
   - Before production, remove all mock data
   - Replace with real data
   - Update documentation

---

## 🔐 Security Notes

⚠️ **Important:** This is TEST DATA ONLY!

- Mock emails use @arms.com domain
- Passwords are simple (Driver@123, etc.)
- License numbers are fake
- Phone numbers are placeholders
- All data is for testing purposes

**Before Production:**
- Delete all mock data
- Use real user accounts
- Verify all licenses
- Update contact information
- Use secure passwords
- Implement document verification

---

Happy Testing! 🚀
