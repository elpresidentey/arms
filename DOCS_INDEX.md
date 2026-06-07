# ARMS Documentation Index

## 🚀 Deployment

### Quick Start
- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - ⭐ Start here! Single-page deployment guide
- **[frontend/VERCEL_ENV_SETUP.md](frontend/VERCEL_ENV_SETUP.md)** - Detailed Vercel configuration
- **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** - Backend deployment on Render
- **[QUICK_START.md](QUICK_START.md)** - Local development setup

## 📋 Product Documentation

- **[PRD.md](PRD.md)** - Product Requirements Document (main specification)
- **[BILLING_SYSTEM.md](BILLING_SYSTEM.md)** - Billing and payment system documentation
- **[SECURITY.md](SECURITY.md)** - Security features and best practices

## 🔧 Feature Guides

- **[docs/ADMIN_INVITE_GUIDE.md](docs/ADMIN_INVITE_GUIDE.md)** - Admin invitation system

## 📊 Scripts

### Backend Scripts (`backend/scripts/`)
- `check-database-state.js` - View current database state and user data
- `fix-auth-sync.js` - Check for auth sync issues
- `fix-auth-sync-simple.js` - Fix auth sync issues (simple version)
- `generate-sample-bills.js` - Generate test billing data
- `apply-sql.js` - Apply SQL migrations
- `cleanup-all.js` - Clear all data (database + auth)

## 🎯 Quick Reference

### Common Tasks

**Deploy to production:**
```bash
# 1. Push code
git push origin main

# 2. Configure Vercel env vars (one time)
# See DEPLOY_NOW.md

# 3. Redeploy on Vercel
# Done automatically or manually trigger
```

**Check system health:**
```bash
# Backend
curl https://arms-c56l.onrender.com/health

# Database state
cd backend && node scripts/check-database-state.js
```

**Local development:**
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm run dev
```

## 🔗 Important Links

- **Frontend (Vercel)**: https://vercel.com/ekenes-projects-c08862f30
- **Backend (Render)**: https://dashboard.render.com
- **Database (Supabase)**: https://supabase.com/dashboard
- **GitHub Repo**: https://github.com/elpresidentey/arms

## 📝 Documentation Philosophy

- **DEPLOY_NOW.md** = Single source of truth for deployment
- **Detailed guides** = In-depth explanations (Vercel, Render, etc.)
- **Feature docs** = System-specific documentation (billing, security)
- **Scripts** = Automation and maintenance tools

---

**Last Updated**: June 7, 2026
