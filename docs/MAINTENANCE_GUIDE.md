# 🛠️ Maintenance Guide

## Code Cleanliness Standards

### Component Best Practices

#### ✅ DO:
- Keep components simple and focused on one responsibility
- Remove unused props and imports immediately
- Use TypeScript interfaces for clear prop definitions
- Keep component files under 200 lines when possible
- Extract complex logic into custom hooks or utility functions

#### ❌ DON'T:
- Leave commented-out code in production
- Import utilities that aren't used
- Add props "just in case" they might be needed later
- Mix multiple responsibilities in one component
- Use inline styles when Tailwind classes work

---

## File Organization

### Current Structure
```
ARMS/
├── backend/              # NestJS backend
│   ├── src/             # Source code
│   ├── scripts/         # Utility scripts
│   └── sql/             # Database migrations
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Route pages
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   └── types/       # TypeScript types
│   └── public/          # Static assets
├── docs/                # Documentation
│   ├── archive/         # Old/outdated docs
│   └── [guides]         # Active documentation
└── [root docs]          # Key documentation files
```

### When to Archive Documentation
Move to `docs/archive/` when:
- ✅ Issue is permanently fixed
- ✅ Guide is replaced by newer version
- ✅ Feature is deprecated or removed
- ✅ Temporary troubleshooting no longer needed

Keep in root when:
- ✅ Actively referenced by developers
- ✅ Part of deployment/setup process
- ✅ Security or system architecture docs
- ✅ Current troubleshooting guides

---

## Code Review Checklist

### Before Committing
- [ ] Remove all `console.log()` statements
- [ ] Delete unused imports
- [ ] Remove commented-out code
- [ ] Check for unused props in components
- [ ] Verify no hardcoded API URLs or secrets
- [ ] Run linter: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test affected features manually

### Component Review
- [ ] Props are all used in the component
- [ ] TypeScript types are accurate
- [ ] No inline complex logic (extract to functions)
- [ ] Accessible (proper ARIA labels, keyboard nav)
- [ ] Responsive (works on mobile and desktop)
- [ ] Loading and error states handled

### API Review
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] TypeScript types for responses
- [ ] No duplicate API calls
- [ ] Proper React Query caching strategy

---

## Regular Maintenance Tasks

### Weekly
- [ ] Review and update TODO comments
- [ ] Check for security updates: `npm audit`
- [ ] Review error logs (Sentry/console)
- [ ] Test critical user flows

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Archive outdated documentation
- [ ] Review and remove dead code
- [ ] Check bundle size: `npm run build --stats`
- [ ] Performance audit with Lighthouse

### Quarterly
- [ ] Major dependency upgrades
- [ ] Refactor complex components
- [ ] Database optimization review
- [ ] Security penetration testing
- [ ] Accessibility audit

---

## Common Cleanup Patterns

### Unused Imports
```typescript
// ❌ BAD
import { useEffect, useState, useMemo } from 'react'
import { formatDate } from '../utils/dates'
import clsx from 'clsx'

function MyComponent() {
  return <div>Hello</div>  // Nothing is used!
}

// ✅ GOOD
import React from 'react'

function MyComponent() {
  return <div>Hello</div>
}
```

### Unused Props
```typescript
// ❌ BAD
interface Props {
  title: string
  color?: string  // Never used
  size?: 'sm' | 'lg'  // Never used
}

function Card({ title }: Props) {
  return <div>{title}</div>
}

// ✅ GOOD
interface Props {
  title: string
}

function Card({ title }: Props) {
  return <div>{title}</div>
}
```

### Complex Components
```typescript
// ❌ BAD - One component doing too much
function Dashboard() {
  // 500 lines of logic
  // Multiple data fetches
  // Complex calculations
  // Rendering logic
}

// ✅ GOOD - Split into smaller components
function Dashboard() {
  return (
    <>
      <DashboardHeader />
      <DashboardMetrics />
      <DashboardContent />
    </>
  )
}
```

---

## Performance Optimization

### Code Splitting
```typescript
// ✅ Lazy load heavy components
const FleetManagement = lazy(() => import('./pages/FleetManagement'))
const Reports = lazy(() => import('./pages/Reports'))
```

### Memoization
```typescript
// ✅ Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateComplexMetrics(data)
}, [data])

// ✅ Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### Image Optimization
```typescript
// ✅ Use OptimizedImage component
<OptimizedImage
  src={imagePath}
  alt="Description"
  priority={false}
  shouldLoad={isVisible}
/>
```

---

## Testing Strategy

### Component Testing
```bash
# Run tests
npm test

# Watch mode during development
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Manual Testing Checklist
After major changes, test:
- [ ] Login (resident and admin)
- [ ] Dashboard loads correctly
- [ ] Create new record (collection, recyclable, etc.)
- [ ] Update existing record
- [ ] Delete record
- [ ] Navigation between pages
- [ ] Mobile responsiveness
- [ ] Error handling (network failure, validation)

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors in production build
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Backup created
- [ ] Changelog updated

### Post-Deployment
- [ ] Health check passes
- [ ] Login works (test both roles)
- [ ] Critical features functional
- [ ] No 404 or 500 errors
- [ ] Monitor error rates (first hour)
- [ ] Performance within acceptable range

---

## Debugging Tips

### Frontend Issues
```typescript
// Check React Query cache
import { useQueryClient } from '@tanstack/react-query'
const queryClient = useQueryClient()
console.log(queryClient.getQueryData(['queryKey']))

// Check auth state
console.log(localStorage.getItem('auth-token'))
console.log(sessionStorage.getItem('auth-storage'))

// Network requests
// F12 → Network tab → Filter by XHR/Fetch
```

### Backend Issues
```bash
# Check logs
npm run start:dev  # Shows all logs

# Database queries
# Check backend/src/**/*.service.ts for SQL queries

# Test endpoint directly
curl -X GET http://localhost:3001/api/endpoint \
  -H "Authorization: Bearer TOKEN"
```

---

## When Things Break

### Emergency Response
1. **Check Logs**: Backend console, browser console, Sentry
2. **Verify Environment**: Check .env files, API URLs
3. **Test Auth**: Login/logout, token validation
4. **Database**: Check connections, migrations applied
5. **Rollback**: If needed, revert to last known good commit

### Common Issues
| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| White screen | JS error | Check browser console |
| 401 errors | Auth expired | Re-login |
| 404 errors | Missing routes | Check routing config |
| Slow loading | Large bundle | Code splitting |
| CORS error | Backend config | Check FRONTEND_URL env var |

---

## Getting Help

### Internal Resources
- `README.md` - Project overview
- `DOCS_INDEX.md` - Documentation index
- `docs/archive/` - Historical issues and fixes
- Git history - See past solutions

### External Resources
- React Query docs: https://tanstack.com/query/latest
- NestJS docs: https://docs.nestjs.com
- Tailwind docs: https://tailwindcss.com/docs

---

## Contributing Guidelines

### Code Style
- Follow existing patterns in the codebase
- Use Prettier for formatting (runs on save)
- TypeScript strict mode enabled
- ESLint rules enforced

### Commit Messages
```
Format: <type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code restructuring
- docs: Documentation changes
- style: Formatting changes
- test: Adding tests
- chore: Maintenance tasks

Example:
feat: add vehicle maintenance scheduling
fix: resolve dashboard loading issue
refactor: simplify StatsCard component
docs: update deployment guide
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation

## Testing
- [ ] Tested locally
- [ ] No console errors
- [ ] Works on mobile
- [ ] Checked affected features

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
```

---

## Conclusion

**Maintaining clean code is ongoing work**. Follow these guidelines to keep the codebase:
- ✅ **Readable**: Easy for new developers to understand
- ✅ **Maintainable**: Simple to update and extend
- ✅ **Performant**: Fast and efficient
- ✅ **Reliable**: Few bugs, good error handling

**Remember**: Clean code today = Happy developers tomorrow! 🚀
