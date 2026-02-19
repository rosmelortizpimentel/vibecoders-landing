

# Fix: Stay on Public Roadmap After Login

## Problem
When a user clicks "Continue with Google/LinkedIn" from the public roadmap (to like or submit feedback), after authentication they get redirected to `/me/profile` instead of staying on the roadmap page.

## Root Cause
The `useAuth` hook has a `SIGNED_IN` handler that checks for `localStorage.getItem('authReturnUrl')`. If not set, it defaults to redirecting to `/me/profile`. The `PublicRoadmap` component calls OAuth but never saves the return URL.

## Solution
In `PublicRoadmap.tsx`, save `window.location.href` to `localStorage` as `authReturnUrl` before initiating OAuth. The existing `useAuth` logic will then redirect back to the roadmap automatically.

---

## Technical Details

### File: `src/pages/PublicRoadmap.tsx`

**Change the `handleOAuthLogin` function** (line ~379):

Before:
```tsx
const handleOAuthLogin = async (provider: 'google' | 'linkedin_oidc') => {
  await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.href } });
};
```

After:
```tsx
const handleOAuthLogin = async (provider: 'google' | 'linkedin_oidc') => {
  localStorage.setItem('authReturnUrl', window.location.href);
  await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.href } });
};
```

This single line addition ensures the `useAuth` hook picks up the return URL and redirects the user back to the exact roadmap/feedback page they were on.

