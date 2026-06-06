# Features Architecture

This directory contains feature-based modules organized by business domain.

## Structure

Each feature follows this structure:
```
features/
├── auth/                   # Authentication & authorization
├── billing/                # Bills, payments, pricing
├── collections/            # Waste collection management  
├── recyclables/           # Recycling program
├── wallet/                # Wallet & payouts
├── reports/               # Issue reporting
├── operations/            # Staff operations
├── locations/             # Location services
└── dashboard/             # Main dashboard

Each feature contains:
├── components/            # Feature-specific UI components
├── hooks/                # Feature-specific React hooks
├── services/             # API calls and business logic
├── types/                # TypeScript interfaces
├── utils/                # Feature utilities
└── index.ts              # Public API exports
```

## Design Principles

1. **Feature Isolation**: Each feature is self-contained
2. **Clear Boundaries**: Features interact through well-defined APIs
3. **Shared Dependencies**: Common UI components in `/shared`
4. **Domain-Driven**: Structure matches business domains
5. **Testability**: Each feature can be tested independently

## Usage

```typescript
// Import from feature public API
import { LoginForm, useAuth } from '@/features/auth'
import { BillCard, useBills } from '@/features/billing'
```