

# Roadmap Page Enhancement + Subdomain Architecture

## 1. Bold "apps verificadas" + Unverified Apps Section

**File:** `src/pages/Roadmap.tsx`

- Change the description text so "apps verificadas" appears in bold (`<strong>`)
- Fetch ALL user apps (not just verified), split into two lists: `verifiedApps` and `unverifiedApps`
- Render verified apps first with the current card design
- Below, render unverified apps with `opacity-50` styling and a colored "Verificar" button instead of the green "Verified" badge
- Clicking "Verificar" opens the existing `VerifyDomainModal` component (reused from `src/components/me/VerifyDomainModal.tsx`)
- Need to import `useApps` hook to get `verifyApp` function and verification tokens
- On successful verification, refetch the apps list so the card moves to the verified section

## 2. Subdomain Architecture (appname.vibecoders.la)

Each app will be accessible at `appname.vibecoders.la` instead of `vibecoders.la/roadmap/appname`.

**Implementation approach:**

Since this is a Vite SPA deployed on Vercel, subdomain routing requires:

### a) Vercel Configuration (`vercel.json`)
- No changes needed -- Vercel wildcard domains handle this at the DNS/hosting level. The user needs to add a wildcard subdomain `*.vibecoders.la` in Vercel dashboard pointing to this project.

### b) App-level subdomain detection (`src/App.tsx`)
- At the top level, detect if the current hostname is a subdomain of `vibecoders.la` (e.g., `scalein.vibecoders.la`)
- Extract the subdomain name (e.g., `scalein`)
- If a subdomain is detected (and it's not `www` or the root), render a dedicated `SubdomainApp` component that shows the public roadmap + feedback for that app
- Otherwise, render the normal app routes

### c) New component: `src/components/SubdomainApp.tsx`
- Receives the subdomain slug
- Looks up the app by name slug in the database
- If found and has a public roadmap, renders `PublicRoadmap` directly
- If not found, shows a 404 page
- This is a clean page with no header/footer (same as current PublicRoadmap behavior)

### d) Keep the `/roadmap/:appName` route as fallback
- The existing path-based route stays for backward compatibility and for local development where subdomains aren't available

## Technical Details

### Files to create:
1. **`src/components/SubdomainApp.tsx`** -- Subdomain detection and routing wrapper

### Files to modify:
1. **`src/pages/Roadmap.tsx`** -- Bold text, fetch all apps, show unverified section with VerifyDomainModal
2. **`src/App.tsx`** -- Add subdomain detection logic before main Routes
3. **`src/i18n/{en,es,fr,pt}/roadmap.json`** -- Add keys for "verify" button label and section headers

### Infrastructure note:
The subdomain setup requires a DNS wildcard record (`*.vibecoders.la` -> Vercel) and adding `*.vibecoders.la` as a wildcard domain in the Vercel project settings. This is a one-time manual step outside of code.

