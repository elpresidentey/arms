# Service Schedules Module

## Overview

The Service Schedules module enables staff to create, manage, and publish service timetables for residents. This includes waste collection schedules, bulky pickup schedules, bin replacement schedules, and other recurring services.

## Features

- **Draft & Publish Workflow**: Create schedules as drafts and publish when ready
- **Ward-Based Distribution**: Organize schedules by ward and street
- **Flexible Frequency**: Support for daily, weekly, biweekly, monthly, quarterly, and as-needed services
- **Time Windows**: Define service availability windows (e.g., 08:00 - 17:00)
- **Effective Dates**: Set when schedules become active and expire
- **Status Management**: Draft, Published, Archived, and Suspended states
- **Public Access**: Residents can view published schedules for their ward
- **Real-time Notifications**: Notify residents when schedules are published or suspended
- **Statistics**: Track schedule distribution by service type and ward

## API Endpoints

### Staff Operations (Admin, Ward Officer, Supervisor, Dispatcher)

#### Create Schedule
```
POST /service-schedules
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceType": "waste_collection",
  "ward": "Ward A",
  "street": "Main Street",
  "zone": "Zone 1",
  "frequency": "weekly",
  "serviceDays": ["Monday", "Wednesday", "Friday"],
  "startTimeWindow": "08:00",
  "endTimeWindow": "17:00",
  "description": "Regular waste collection",
  "operatorName": "John Doe",
  "operatorPhoneNumber": "+234801234567",
  "operatorEmail": "john@example.com",
  "serviceProviders": ["Provider A", "Provider B"],
  "effectiveFromDate": "2026-06-01T00:00:00Z",
  "effectiveToDate": "2026-12-31T23:59:59Z",
  "notes": "Additional notes"
}
```

#### List All Schedules
```
GET /service-schedules
Authorization: Bearer <token>

Query Parameters:
- status: draft | published | archived | suspended
- ward: Ward name
- serviceType: Service type
```

#### Get Schedule Statistics
```
GET /service-schedules/stats
Authorization: Bearer <token>

Response:
{
  "total": 45,
  "published": 30,
  "draft": 10,
  "archived": 4,
  "suspended": 1,
  "byServiceType": {
    "waste_collection": 25,
    "bulky_pickup": 15,
    "bin_replacement": 5
  },
  "byWard": {
    "Ward A": 15,
    "Ward B": 20,
    "Ward C": 10
  }
}
```

#### Get Single Schedule
```
GET /service-schedules/:id
Authorization: Bearer <token>
```

#### Update Schedule
```
PATCH /service-schedules/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "operatorName": "Jane Doe",
  "notes": "Updated notes"
}
```

#### Publish Schedule
```
PATCH /service-schedules/:id/publish
Authorization: Bearer <token>

Response: Published schedule with publishedDate and status = "published"
```

#### Archive Schedule
```
PATCH /service-schedules/:id/archive
Authorization: Bearer <token>

Response: Archived schedule with status = "archived"
```

#### Suspend Schedule
```
PATCH /service-schedules/:id/suspend
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Temporary service disruption due to maintenance"
}
```

#### Delete Schedule
```
DELETE /service-schedules/:id
Authorization: Bearer <token>

Note: Only draft schedules can be deleted
```

### Public Operations (All Users)

#### Get Published Schedules
```
GET /service-schedules/published
No authentication required

Query Parameters:
- ward: Filter by ward
- serviceType: Filter by service type
```

#### Get Schedules by Ward
```
GET /service-schedules/ward/:ward
No authentication required

Query Parameters:
- published: true | false (default: false)
```

#### Get Schedules by Service Type
```
GET /service-schedules/type/:serviceType
No authentication required

Query Parameters:
- published: true | false (default: false)
```

## Data Model

### ServiceSchedule Entity

```typescript
{
  id: UUID;                          // Unique identifier
  scheduleCode: string;              // Auto-generated unique code (e.g., SCH-WAS-WAR-123456)
  serviceType: string;               // Type of service
  ward: string;                      // Ward name
  street?: string;                   // Street name (optional)
  zone: string;                      // Service zone
  frequency: string;                 // daily | weekly | biweekly | monthly | quarterly | as_needed
  serviceDays: string[];             // Days of week (e.g., ["Monday", "Wednesday", "Friday"])
  startTimeWindow: string;           // Start time (e.g., "08:00")
  endTimeWindow: string;             // End time (e.g., "17:00")
  description?: string;              // Service description
  operatorName?: string;             // Name of service operator
  operatorPhoneNumber?: string;      // Operator contact number
  operatorEmail?: string;            // Operator email
  serviceProviders?: string[];       // List of service providers
  publishedDate?: Date;              // When schedule was published
  effectiveFromDate?: Date;          // When schedule becomes active
  effectiveToDate?: Date;            // When schedule expires
  status: string;                    // draft | published | archived | suspended
  notes?: string;                    // Additional notes
  publishedById?: string;            // User ID who published
  publishedBy?: User;                // User who published
  createdAt: Date;                   // Creation timestamp
  updatedAt: Date;                   // Last update timestamp
}
```

## Workflow

### Creating and Publishing a Schedule

1. **Create Draft**: Staff creates a schedule in draft status
   - Schedule is not visible to residents
   - Can be freely edited or deleted

2. **Review**: Staff reviews the draft schedule
   - Check all details are correct
   - Verify dates and times

3. **Publish**: Staff publishes the schedule
   - Schedule becomes visible to residents
   - Residents in the ward receive notification
   - publishedDate is set to current time
   - Status changes to "published"

4. **Active**: Schedule is active and visible
   - Residents can view the schedule
   - Schedule is filtered by effective dates

5. **Archive/Suspend**: 
   - **Archive**: Schedule is no longer active but kept for records
   - **Suspend**: Schedule is temporarily unavailable (e.g., due to disruption)

### Resident View

Residents can:
- View published schedules for their ward
- Filter by service type
- See operator contact information
- Check service days and time windows
- View effective dates

## Business Rules

1. **Draft Schedules**: Can be edited or deleted freely
2. **Published Schedules**: Cannot be directly edited; must be archived and a new one created
3. **Effective Dates**: Schedules are only visible if current date is within effective date range
4. **Status Transitions**:
   - draft → published (via publish endpoint)
   - published → archived (via archive endpoint)
   - any status → suspended (via suspend endpoint)
   - draft → deleted (via delete endpoint)

## Notifications

When a schedule is published or suspended, residents in the affected ward receive notifications:

```json
{
  "type": "SCHEDULE_PUBLISHED",
  "scheduleId": "uuid",
  "serviceType": "waste_collection",
  "message": "New waste_collection schedule published for Ward A"
}
```

```json
{
  "type": "SCHEDULE_SUSPENDED",
  "scheduleId": "uuid",
  "reason": "Temporary service disruption",
  "message": "waste_collection schedule suspended for Ward A"
}
```

## Database Schema

The `service_schedules` table includes:
- Indexes on (ward, street) for fast filtering
- Indexes on (status, publishedDate) for status queries
- Indexes on (serviceType, status) for service type filtering
- Foreign key to users table for publishedBy relationship

## Integration Points

### With Collection Routes
- Service schedules provide the timetable context
- Collection routes implement the actual collections
- Schedules inform residents when collections will occur

### With Notifications
- Publishes notifications when schedules change
- Notifies ward residents of new or suspended schedules

### With Waste Collection
- Schedules define when waste collections should occur
- Waste collection records reference the schedule context

## Example Usage

### Create a Weekly Waste Collection Schedule

```bash
curl -X POST http://localhost:3001/service-schedules \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "waste_collection",
    "ward": "Ikoyi",
    "street": "Banana Island Road",
    "zone": "Zone 1",
    "frequency": "weekly",
    "serviceDays": ["Monday", "Wednesday", "Friday"],
    "startTimeWindow": "08:00",
    "endTimeWindow": "17:00",
    "description": "Regular waste collection for Ikoyi residents",
    "operatorName": "Waste Management Ltd",
    "operatorPhoneNumber": "+234801234567",
    "operatorEmail": "ops@wastemanagement.com",
    "effectiveFromDate": "2026-06-01T00:00:00Z",
    "effectiveToDate": "2026-12-31T23:59:59Z"
  }'
```

### Publish the Schedule

```bash
curl -X PATCH http://localhost:3001/service-schedules/:id/publish \
  -H "Authorization: Bearer <token>"
```

### View Published Schedules (Resident)

```bash
curl http://localhost:3001/service-schedules/published?ward=Ikoyi
```

## Future Enhancements

- Schedule templates for recurring patterns
- Bulk schedule creation
- Schedule versioning and history
- Integration with calendar exports (iCal, Google Calendar)
- SMS/Email notifications for schedule changes
- Schedule performance analytics
- Resident feedback on schedule adherence
