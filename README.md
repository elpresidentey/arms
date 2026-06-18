# ARMS - Automated Refuse Management System

Modern waste management system for Lagos residents and administrators.

## 🚀 Quick Start

### Development
```bash
# Start both frontend and backend
start-local-dev.bat

# Or individually:
cd backend && npm run start:dev
cd frontend && npm run dev
```

### Production
See **[DEPLOY_NOW.md](DEPLOY_NOW.md)** for deployment instructions.

## 📚 Documentation

- **[DEPLOY_NOW.md](DEPLOY_NOW.md)** - Deployment guide
- **[SECURITY.md](SECURITY.md)** - Security guidelines
- **[PRD.md](PRD.md)** - Product requirements
- **[docs/](docs/)** - Additional documentation
- **[docs/MAINTENANCE_GUIDE.md](docs/MAINTENANCE_GUIDE.md)** - Code maintenance standards

## 🔑 Admin Access

### First Admin Setup
1. Set `BOOTSTRAP_ADMIN_TOKEN` in backend/.env
2. Visit: `http://localhost:3000/bootstrap?token=YOUR_TOKEN`
3. Complete the registration form

### Additional Admins
Use the admin invite system after first admin is created.

## 🏗️ Tech Stack

**Frontend:** React, TypeScript, TailwindCSS, React Query  
**Backend:** NestJS, TypeScript, PostgreSQL (Supabase)  
**Payment:** Paystack  
**Auth:** Supabase Auth

## 📦 Key Features

- ✅ Waste collection scheduling
- ✅ Billing & payments (Paystack)
- ✅ Recyclables tracking & wallet
- ✅ Fleet management
- ✅ Service requests & reports
- ✅ Real-time notifications
- ✅ Admin dashboard

## 🔗 Links

**Production:**
- Frontend: https://arms-roan.vercel.app
- Backend: https://arms-c56l.onrender.com

**Local:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📞 Support

Check the [docs/](docs/) folder for detailed guides and troubleshooting.
