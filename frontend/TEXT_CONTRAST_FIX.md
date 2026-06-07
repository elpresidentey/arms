# Text Contrast Fix Summary

## Issue
Balance amount text on the Wallet page was appearing in dark color (text-slate-950) against a dark green background (bg-primary-700), causing poor readability.

## Root Cause
The `heading-3` CSS class has a default `text-slate-950` color defined in `index.css`, which was overriding the parent container's `text-white` class.

## Solution Applied
Added explicit `text-white` class to the balance amount in `Wallet.tsx`:

```tsx
<p className="mt-2 heading-3 text-white">
  {isBalanceLoading ? 'Loading...' : formatCurrency(currentBalance)}
</p>
```

## Verification
Checked all other instances across the codebase:

✅ **Buttons**: All dark background buttons (bg-primary-600, bg-primary-700) already have `text-white`
✅ **Badges**: All dark background badges (bg-slate-900) already have `text-white`  
✅ **Metric Cards**: Use light backgrounds (bg-*-50/80) with appropriate dark text
✅ **Stats Cards**: Use light backgrounds with dark text via CSS classes
✅ **Other Components**: No other instances of large text on dark backgrounds found

## CSS Classes Involved

### Heading Classes (from index.css)
- `.heading-1`: text-slate-950 (3xl-4xl)
- `.heading-2`: text-slate-950 (2xl-3xl)
- `.heading-3`: text-slate-950 (xl-2xl) ← This was the issue

### Card Text Classes (from index.css)
- `.card-value`: text-slate-950 (2xl-3xl) - Used on light backgrounds
- `.card-value-compact`: text-slate-950 (xl-2xl) - Used on light backgrounds
- `.card-label`: text-slate-600 - Used on light backgrounds
- `.card-detail`: text-slate-500 - Used on light backgrounds

## Best Practice
When using heading or card classes on dark backgrounds, always explicitly add `text-white` or another light color class to override the default dark text color.

## Files Modified
- `frontend/src/pages/Wallet.tsx` - Added `text-white` to balance amount display
