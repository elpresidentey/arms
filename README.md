# ARMS - Automated Refuse Management Systems

ARMS is an MVP for resident-facing waste service visibility in Oriade LCDA. The first release focuses on a simple loop: onboard residents, let them schedule or track collection, report issues, submit recyclables, and request wallet payouts for review.

## MVP Features

- **Resident onboarding**: Register and log in with address, ward, and street.
- **Personal waste timeline**: Track scheduled and completed collections.
- **Collection requests**: Request a future waste pickup.
- **Issue reporting**: Report missed pickups or service issues with location and photos.
- **Recyclables tracking**: Submit recyclable items and track their status.
- **Wallet and payout requests**: View balance and request manual payout review.
- **Operations overview**: Non-resident roles can review route, request, and report queues.

## Tech Stack

- **Frontend**: React + TypeScript + Three.js
- **Backend**: Node.js + NestJS + PostgreSQL
- **Real-time**: WebSocket connections
- **Payments**: Paystack/Flutterwave integration

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

## Project Structure

```
arms-waste-management/
├── frontend/          # React TypeScript app
├── backend/           # NestJS API server
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

## MVP Scope

See [MVP_PRODUCT_BRIEF.md](./MVP_PRODUCT_BRIEF.md) for the current MVP definition, non-goals, success metrics, and launch checklist.

## Admin Onboarding

Admin access is invite-only. The first admin is bootstrapped by the system owner, then existing admins issue one-time invite links for additional staff from Operations. See [ADMIN_ONBOARDING.md](./ADMIN_ONBOARDING.md) for the exact flow.

## Development

- Frontend runs on http://localhost:3000
- Backend API runs on http://localhost:3001
- Database runs on localhost:5432

## License

MIT
