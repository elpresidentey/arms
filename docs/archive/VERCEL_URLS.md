# ARMS Vercel URLs Reference

## 🎯 Use These Stable URLs

### Production URLs (Recommended - Never Change!)

**Frontend:**
- ⭐ **https://arms-roan.vercel.app** ← Best choice!
- Alternative: https://frontend-psi-weld-dh3z0pv6q4.vercel.app

**Backend:**
- ✅ **https://backend-seven-chi-51.vercel.app**
- Alternative (Render): https://arms-c56l.onrender.com

**Additional ARMS Deployments:**
- https://arms-ubtp.vercel.app

### Why These URLs Are Stable

These are **production URLs** that:
- ✅ Always point to your latest successful deployment
- ✅ Never change or expire
- ✅ Safe to bookmark, share, and hardcode
- ✅ Automatically update when you deploy new code

## 🔄 How Vercel URLs Work

### 1. Temporary Preview URLs (Change Every Deploy)
```
https://frontend-j8gwv2eyr-ekenes-projects-c0862f30.vercel.app
https://frontend-4lrr1imko-ekenes-projects-c0862f30.vercel.app
https://frontend-oiizqm9d1-ekenes-projects-c0862f30.vercel.app
```
- ❌ **Don't use these!** They're temporary
- 🎯 Purpose: Individual deployment previews
- ⏰ Lifetime: Forever (but you shouldn't rely on them)

### 2. Stable Production URLs (Stay Forever)
```
https://arms-roan.vercel.app
https://frontend-psi-weld-dh3z0pv6q4.vercel.app
```
- ✅ **Use these!** They're permanent
- 🎯 Purpose: Always points to latest production deployment
- ⏰ Lifetime: Forever, auto-updates with each deploy

### 3. Custom Domains (Optional)
```
https://arms.yourdomain.com (if you add a custom domain)
```
- ⭐ Most professional option
- 💰 Requires domain purchase ($10-15/year)
- 🔧 Configure in Vercel dashboard

## 📊 Your Project Structure

You have **3 frontend projects** on Vercel:

| Project Name | Production URL | Status | Notes |
|--------------|----------------|--------|-------|
| **arms** | https://arms-roan.vercel.app | ✅ Active | **Use this!** Shortest and clearest |
| frontend | https://frontend-psi-weld-dh3z0pv6q4.vercel.app | ✅ Active | Alternative |
| arms-ubtp | https://arms-ubtp.vercel.app | ✅ Active | Another deployment |

**Recommendation:** Consolidate to just **arms** project and delete the others to avoid confusion.

## 🔗 Quick Links

### Vercel Dashboard
- **ARMS Project**: https://vercel.com/ekenes-projects-c0862f30/arms
- **Frontend Project**: https://vercel.com/ekenes-projects-c0862f30/frontend
- **Backend Project**: https://vercel.com/ekenes-projects-c0862f30/backend

### Settings
- **ARMS Environment Variables**: https://vercel.com/ekenes-projects-c0862f30/arms/settings/environment-variables
- **Frontend Env Variables**: https://vercel.com/ekenes-projects-c0862f30/frontend/settings/environment-variables
- **Backend Env Variables**: https://vercel.com/ekenes-projects-c0862f30/backend/settings/environment-variables

### Deployments
- **ARMS Deployments**: https://vercel.com/ekenes-projects-c0862f30/arms/deployments
- **Frontend Deployments**: https://vercel.com/ekenes-projects-c0862f30/frontend/deployments
- **Backend Deployments**: https://vercel.com/ekenes-projects-c0862f30/backend/deployments

## 🚀 Deployment Commands

### Check which URL is active
```bash
cd frontend
vercel project ls
```

### Deploy to production
```bash
cd frontend
vercel deploy --prod
```

### List all production deployments
```bash
cd frontend
vercel ls --prod
```

### Inspect a specific deployment
```bash
vercel inspect https://arms-roan.vercel.app
```

## 🎨 Add a Custom Domain (Optional)

If you want a branded URL like `arms.yourdomain.com`:

### Step 1: Buy a Domain
- Namecheap: https://www.namecheap.com (~$10/year)
- Google Domains: https://domains.google
- Any domain registrar

### Step 2: Add to Vercel
1. Go to: https://vercel.com/ekenes-projects-c0862f30/arms/settings/domains
2. Click "Add Domain"
3. Enter your domain: `arms.yourdomain.com`
4. Follow DNS configuration instructions

### Step 3: Configure DNS
Add these records at your domain registrar:

**For subdomain (arms.yourdomain.com):**
```
Type: CNAME
Name: arms
Value: cname.vercel-dns.com
```

**For root domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

### Popular Domain Options
- ✅ arms.ng (~$15/year for .ng Nigerian domain)
- ✅ arms.app (~$15/year)
- ✅ arms.io (~$30/year)
- ✅ armsng.com (~$12/year)
- ✅ wastearms.com (~$12/year)

## 📝 Update Environment Variables

Your backend needs to know the frontend URL. Update in:

**Backend .env (Render):**
```env
FRONTEND_URL=https://arms-roan.vercel.app
SUPABASE_PASSWORD_REDIRECT_URL=https://arms-roan.vercel.app/reset-password
```

**Render Dashboard:**
1. Go to: https://dashboard.render.com
2. Select your backend service
3. Environment → Edit
4. Update `FRONTEND_URL` to `https://arms-roan.vercel.app`
5. Save and redeploy

## ✅ Verification Checklist

After using the stable URL, verify:

- [ ] Can access https://arms-roan.vercel.app
- [ ] Registration works
- [ ] Login redirects correctly
- [ ] Email links point to stable URL
- [ ] Password reset uses correct redirect
- [ ] No CORS errors in browser console

## 🔍 Troubleshooting

### URL shows old version after deploying
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check deployment status in Vercel dashboard
4. Verify deployment succeeded (not failed)

### Different URLs show different versions
- This is normal! Only use the production URL
- Preview URLs are for specific deployments
- Production URL auto-updates with latest deploy

### Want to use a different project as primary
```bash
# Delete unused projects
vercel remove frontend
vercel remove arms-ubtp

# Or just ignore them and use arms project
```

## 💡 Best Practices

1. ✅ **Always use**: https://arms-roan.vercel.app
2. ✅ **Bookmark** this URL for easy access
3. ✅ **Share** this URL with testers/users
4. ✅ **Configure** this URL in all environment variables
5. ❌ **Never use** temporary preview URLs for production
6. ⭐ **Consider** adding a custom domain for branding

---

**Your Primary URL:** https://arms-roan.vercel.app  
**Updated:** June 8, 2026
