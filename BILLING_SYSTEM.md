# ARMS Billing System

## Overview
Monthly billing system for waste collection services with automatic late fee calculation and Paystack payment integration.

## Billing Rates
- **Residential**: ₦2,000/month
- **Commercial**: ₦3,500/month
- **Late Fee**: 10% after 7 days overdue
- **Grace Period**: 7 days after due date

## Features

### 1. Automatic Bill Generation
- Bills are generated monthly for all active users
- Due date: 7 days after month end
- Unique bill numbers (e.g., BILL-2026-05-0001)

### 2. Late Fee System
- Automatic 10% penalty after 7-day grace period
- Status changes from "pending" to "overdue"
- Late fees added to total amount

### 3. Payment Integration
- Paystack payment gateway
- Secure payment processing
- Payment verification
- Transaction history

### 4. User Features
- View all bills
- Check payment status
- Pay bills online
- Download receipts

### 5. Admin Features
- Generate monthly bills
- Apply late fees
- View all bills
- Track revenue
- Payment statistics

## API Endpoints

### Resident Endpoints
```
GET    /billing/my-bills              - Get my bills
GET    /billing/:id                   - Get single bill
POST   /billing/:id/pay               - Initiate payment
GET    /billing/verify/:reference     - Verify payment
```

### Admin Endpoints
```
GET    /billing                       - Get all bills
GET    /billing/stats                 - Get statistics
POST   /billing/generate              - Generate monthly bills
POST   /billing/apply-late-fees       - Apply late fees
```

## Database Tables

### bills
- Bill information
- Amount, late fees, total
- Status tracking
- Payment details

### bill_payments
- Payment transactions
- Paystack integration
- Payment status
- Transaction metadata

### billing_config
- Property type rates
- Late fee percentage
- Grace period days

## Usage

### Generate Bills (Admin)
```bash
POST /billing/generate
# Generates bills for current month
# Or specify period: ?period=2026-06
```

### Apply Late Fees (Admin)
```bash
POST /billing/apply-late-fees
# Checks all overdue bills
# Applies 10% penalty after grace period
```

### Pay Bill (Resident)
```bash
POST /billing/:billId/pay
# Returns Paystack payment URL
# Redirects to payment page
```

### Verify Payment
```bash
GET /billing/verify/:reference
# Verifies payment with Paystack
# Updates bill status
```

## Bill Lifecycle

1. **Generated** - Bill created at month start
2. **Pending** - Awaiting payment (due date not passed)
3. **Overdue** - Past due date + grace period
4. **Paid** - Payment successful
5. **Cancelled** - Bill cancelled by admin

## Next Steps

### Frontend Implementation Needed:
1. Bills page for residents
2. Payment flow with Paystack
3. Bill history view
4. Admin billing dashboard
5. Revenue reports

### Automation (Optional):
1. Cron job to generate bills monthly
2. Cron job to apply late fees daily
3. Email notifications for:
   - New bills
   - Payment reminders
   - Overdue notices
   - Payment confirmations

## Testing

### Generate Test Bills
```bash
# As admin, call:
POST http://localhost:3001/billing/generate

# This creates bills for all active users
```

### Test Payment Flow
1. Get bill ID from /billing/my-bills
2. Initiate payment: POST /billing/:id/pay
3. Complete payment on Paystack
4. Verify: GET /billing/verify/:reference

## Configuration

Billing rates are stored in `billing_config` table:
- Residential: ₦2,000
- Commercial: ₦3,500
- Late fee: 10%
- Grace period: 7 days

To modify rates, update the database directly or create an admin UI.
