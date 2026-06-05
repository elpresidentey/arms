# Quick Fix to Deploy Backend on Vercel

If you still want to deploy to Vercel despite the limitations, follow these steps:

## Step 1: Disable WebSocket Module

Edit `backend/src/app.module.ts`:

```typescript
// Comment out or remove NotificationsModule import
import { NotificationsModule } from './notifications/notifications.module'; // REMOVE THIS

@Module({
  imports: [
    // ... other imports ...
    // NotificationsModule, // COMMENT THIS OUT FOR VERCEL
  ],
})
```

## Step 2: Update Environment Variable

In `.env` or Vercel dashboard, remove or update:
```bash
# Remove this - it's a security risk in production
# NODE_TLS_REJECT_UNAUTHORIZED=0

# Don't set PORT - Vercel handles this automatically
# PORT=3001
```

## Step 3: Optimize api/index.ts

The current handler is good, but ensure proper typing:

```typescript
import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const server = await createServer();
  return server(req, res);
}
```

## Step 4: Add Vercel-Specific Config

Create `backend/.vercelignore`:
```
node_modules
dist
*.sqlite
.env
.env.local
tests
*.test.ts
*.spec.ts
```

## Step 5: Update Frontend WebSocket Connection

Edit your frontend Socket context to handle missing WebSocket:

```typescript
// frontend/src/contexts/SocketContext.tsx
const socket = process.env.REACT_APP_WS_DISABLED 
  ? null 
  : io(API_URL, options);

// Or use a separate WebSocket server URL
const WS_URL = process.env.REACT_APP_WS_URL || API_URL;
const socket = io(WS_URL, options);
```

## Step 6: Deploy

```bash
cd backend
vercel --prod
```

## What You'll Lose

Without WebSockets, these features won't work:
- Real-time notifications
- Live updates without page refresh
- Real-time chat features
- Live dashboard updates

You'll need to implement polling or manual refresh instead.

## Better Alternative

Deploy backend to Railway and frontend to Vercel:
```bash
# Backend
cd backend
railway up

# Frontend
cd frontend
vercel --prod
```
