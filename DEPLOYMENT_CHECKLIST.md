# Deployment Checklist

## Pre-Deployment (Local Testing) ✅
- [x] Backend builds successfully
- [x] Frontend builds successfully  
- [x] TypeScript type checking passes
- [x] Project cleanup completed
- [x] All unnecessary files removed
- [x] Documentation updated
- [x] Environment variables documented

---

## Step 1: GitHub Push

### Prepare Commit
```bash
cd c:\Users\hp\ARMS
git status  # Verify clean state
```

### Stage and Commit
```bash
git add .
git commit -m "Release: Clean codebase with tested builds

- Backend builds successfully (no errors)
- Frontend builds successfully (no errors)
- All TypeScript type checking passes
- Removed ~37 unused/deprecated files
- Project structure cleaned and optimized
- Ready for production deployment"
```

### Push to GitHub
```bash
git push origin main
# or if on different branch:
# git push origin <branch-name>
```

---

## Step 2: Deploy Frontend to Vercel

### Prerequisites
- GitHub repository connected to Vercel
- Environment variables configured

### Vercel Configuration
Add environment variables in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.com
```

### Deploy
1. Go to Vercel dashboard
2. Select your project
3. Connect GitHub repository (if not already done)
4. Deploy will trigger automatically on push to main

---

## Step 3: Deploy Backend

### Option A: Render (Recommended)

**Prerequisites:**
- Render account
- GitHub repository connected

**Steps:**
1. Go to render.com
2. Create new Web Service
3. Connect GitHub repository
4. Select `backend` directory as root
5. Configure environment variables:
   ```
   DATABASE_URL=your-supabase-postgres-url
   REDIS_URL=your-redis-url
   JWT_SECRET=your-jwt-secret
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-frontend.vercel.app
   ```
6. Deploy (uses `render.yaml` configuration)

**Reference:** See `RENDER_DEPLOYMENT.md` for details

---

### Option B: Railway

**Prerequisites:**
- Railway account
- GitHub repository connected

**Steps:**
1. Go to railway.app
2. Create new project from GitHub
3. Select your repository
4. Configure environment variables
5. Deploy

**Reference:** See `RAILWAY_DEPLOYMENT.md` for details

---

### Option C: Docker (Self-Hosted)

**Prerequisites:**
- Docker and Docker Compose installed
- Server with public IP

**Steps:**
1. Clone repository on server
2. Create `.env` with production values
3. Run: `docker-compose -f docker-compose.yml up -d`
4. Configure reverse proxy (Nginx/Apache)
5. Set up SSL certificate

---

## Step 4: Verify Deployment

### Frontend Checks
```bash
# Open in browser
https://your-frontend.vercel.app

# Check:
- [ ] Landing page loads
- [ ] Login page works
- [ ] Can navigate to dashboard
- [ ] Responsive design works
```

### Backend Checks
```bash
# Test health endpoint
curl https://your-backend-url/health

# Expected response: HTTP 200

# Check:
- [ ] Health endpoint responds
- [ ] Database connection works
- [ ] API endpoints accessible
- [ ] WebSocket connection works (if applicable)
```

### Integration Tests
```bash
# From frontend, test:
- [ ] Login with credentials
- [ ] View dashboard
- [ ] Submit a request/transaction
- [ ] View real-time updates
- [ ] File uploads work
- [ ] API responses are correct
```

---

## Step 5: Post-Deployment

### Monitor
- Monitor error logs on backend
- Check frontend console for errors
- Monitor database performance
- Monitor API response times

### Update DNS (if needed)
```bash
# Point your domain to:
# Frontend: Vercel deployment URL
# Backend: Render/Railway deployment URL
```

### Enable HTTPS
- Vercel: Automatic via Letsencrypt
- Render/Railway: Automatic via Letsencrypt
- Self-hosted: Use Certbot or manual certificate

### Backup Strategy
- Enable automatic backups for database
- Set up daily backup verification
- Document recovery procedures

---

## Quick Reference

### GitHub Commands
```bash
# Check status
git status

# Stage everything
git add .

# Commit with message
git commit -m "Your message"

# Push to main
git push origin main

# Check recent commits
git log --oneline -10
```

### Environment Variables Needed

**Frontend (.env):**
```
VITE_API_URL=https://your-backend-url.com
```

**Backend (.env):**
```
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRATION=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=3001
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

---

## Troubleshooting

### Build Fails on Vercel/Render
1. Check build logs for specific error
2. Ensure all dependencies are in package.json
3. Verify environment variables are set
4. Check Node version compatibility

### Database Connection Error
1. Verify DATABASE_URL is correct
2. Check database is accessible from server
3. Verify firewall rules allow connection
4. Check database credentials

### CORS Errors
1. Verify `ALLOWED_ORIGINS` environment variable
2. Check `FRONTEND_URL` matches actual frontend domain
3. Verify CORS configuration in backend

### WebSocket Connection Fails
1. Verify backend supports WebSockets
2. Check firewall allows WebSocket protocol
3. Verify `Socket.IO` is properly configured

---

## Current Status

**As of June 5, 2026:**
- ✅ All builds passing
- ✅ TypeScript strict mode passing
- ✅ Project cleaned up
- ✅ Ready for GitHub push
- ✅ Ready for Vercel/Render deployment

**Next Action:** Execute Step 1 (GitHub Push)

