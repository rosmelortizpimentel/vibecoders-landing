
# Clean Subdomain URLs for Public Roadmap/Feedback

## Problem
When visiting `blanquiazul.vibecoders.la`, the current logic rewrites the URL to `/roadmap/blanquiazul`, and then tab switching appends more segments, resulting in ugly URLs like `/roadmap/blanquiazul/roadmap` or `/roadmap/blanquiazul/feedback`.

## Solution
Make subdomain URLs clean and short:
- `blanquiazul.vibecoders.la/` --> shows roadmap (default)
- `blanquiazul.vibecoders.la/roadmap` --> roadmap tab
- `blanquiazul.vibecoders.la/feedback` --> feedback tab

## Technical Steps

### 1. App.tsx - Change subdomain rewrite logic
- Instead of rewriting to `/roadmap/blanquiazul`, rewrite to just `/roadmap` (or keep `/` as-is and let new routes handle it).
- Export a global helper or use a simple global variable so `PublicRoadmap` can access the detected subdomain.
- Add new routes for subdomain mode: `/roadmap` and `/feedback` (without slug param) that render `PublicRoadmap`.
- On subdomain root (`/`), redirect to `/roadmap`.

### 2. PublicRoadmap.tsx - Use subdomain as slug
- Import/access the detected subdomain.
- In the data-fetching logic, use the subdomain value as the app slug when no URL param is present.
- Update `switchTab` to use clean paths (`/roadmap`, `/feedback`) when on a subdomain, instead of appending to a base path.
- Update the initial `activeTab` detection to work with these clean paths.

### Summary of URL behavior

| Access | URL shown |
|---|---|
| `blanquiazul.vibecoders.la` | Redirects to `blanquiazul.vibecoders.la/roadmap` |
| Click "Feedback" tab | `blanquiazul.vibecoders.la/feedback` |
| Click "Roadmap" tab | `blanquiazul.vibecoders.la/roadmap` |
| Invalid subdomain | Redirects to `vibecoders.la` (existing logic) |

### Files to modify
- `src/App.tsx` -- subdomain rewrite + new routes
- `src/pages/PublicRoadmap.tsx` -- subdomain-aware slug resolution + clean tab switching
