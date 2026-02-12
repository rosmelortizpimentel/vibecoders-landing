

## Problem

Currently, `useAuth.ts` redirects to Stripe **every time** `signupSource === 'paid_card'` is detected on a `SIGNED_IN` event. While `signupSource` is cleared from localStorage immediately, the `pendingStripeRedirect` flag lingers, and if a user presses "back" from Stripe or returns without completing payment, they can get stuck in a loop where they can't access the dashboard.

The redirect to Stripe should only happen on the **first signup** -- not on subsequent logins or when the user already has a paid subscription.

## Root Cause

1. **`useAuth.ts`**: When `signupSource === 'paid_card'`, it always calls `create-checkout-session` and redirects, without checking if the user already has an active subscription (tier = `pro` or `founder`).
2. **`pendingStripeRedirect`** in localStorage is never cleaned up properly after the redirect attempt, causing DashboardLayout to behave incorrectly on subsequent page loads.
3. **`check-founder-status`** already returns the user's `tier` in its response, but useAuth ignores it -- it should use this to decide whether to redirect.

## Plan

### 1. Fix `useAuth.ts` -- Only redirect to Stripe on first-time paid signup

- After `check-founder-status` returns, check the `tier` from the response.
- Only redirect to Stripe if the user does NOT already have a paid tier (`pro`, `founder`) and does NOT already have a `subscription_id`.
- If they already have a paid subscription, skip Stripe and go to `/me/profile`.
- Always clean up `pendingStripeRedirect` after the logic completes (success or failure).

### 2. Fix `DashboardLayout.tsx` -- Clean up `pendingStripeRedirect` on mount

- On component mount, if `pendingStripeRedirect` is set but `signupSource` is NOT `paid_card` (meaning the initial redirect already happened or was abandoned), clean it up immediately.
- This prevents stale flags from blocking the normal access check flow.

### 3. Summary of behavior after fix

- **First signup via "Reservar por $9.90"**: signupSource=paid_card is set, user is redirected to Stripe checkout.
- **User presses back from Stripe**: pendingStripeRedirect is cleaned up, dashboard loads normally.
- **User logs in again later**: signupSource is already gone, no Stripe redirect happens, dashboard loads normally.
- **User who already paid logs in**: check-founder-status returns tier=pro, no redirect.

---

### Technical Details

**`src/hooks/useAuth.ts`** (lines 40-56):

```typescript
supabase.functions.invoke('check-founder-status', { body }).then(async ({ data }) => {
  if (signupSource === 'paid_card') {
    // Only redirect to Stripe if user doesn't already have a paid subscription
    const userTier = data?.tier;
    if (userTier === 'pro' || userTier === 'founder') {
      // Already paid -- go to dashboard
      localStorage.removeItem('pendingStripeRedirect');
      window.location.href = '/me/profile';
      return;
    }
    
    try {
      const { data: checkoutData } = await supabase.functions.invoke('create-checkout-session');
      if (checkoutData?.url) {
        localStorage.removeItem('pendingStripeRedirect');
        window.location.href = checkoutData.url;
        return;
      }
    } catch (e) {
      console.error('Checkout error:', e);
    }
    localStorage.removeItem('pendingStripeRedirect');
    window.location.href = '/choose-plan';
  } else if (window.location.pathname === '/') {
    window.location.href = '/me/profile';
  }
})
```

**`src/layouts/DashboardLayout.tsx`** (lines 36-57):

- Remove the `pendingStripeRedirect` / `signupSource` early-return guard entirely.
- Instead, clean up stale `pendingStripeRedirect` on mount and proceed with the normal access check flow.

```typescript
useEffect(() => {
  if (authLoading || !user) {
    setCheckingAccess(false);
    return;
  }
  
  // Clean up stale Stripe redirect flag (only relevant during initial OAuth callback)
  localStorage.removeItem('pendingStripeRedirect');
  
  let cancelled = false;
  supabase.functions.invoke('check-founder-status').then(() => {
    if (!cancelled) setCheckingAccess(false);
  }).catch(() => {
    if (!cancelled) setCheckingAccess(false);
  });
  return () => { cancelled = true; };
}, [user, authLoading]);
```

This way, the DashboardLayout never blocks on a stale flag, and `useAuth.ts` handles the one-time Stripe redirect intelligently based on the user's actual subscription tier.
