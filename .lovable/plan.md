

# Plan: Restore the `/api/og` Vercel Serverless Function

## Problem
The file `api/og.ts` (Vercel Serverless Function) was deleted at some point during recent iterations. The `vercel.json` rewrites still correctly route bot/crawler requests to `/api/og?username=:username`, but since the function no longer exists, those requests fall through to the SPA catch-all and return generic HTML without OG meta tags.

## Solution
Create `api/og.ts` — a lightweight Vercel Serverless Function that proxies requests to the existing Supabase Edge Function `og-profile-meta`.

### File to create: `api/og.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    res.status(400).send('Missing username');
    return;
  }

  const supabaseUrl = 'https://zkotnnmrehzqonlyeorv.supabase.co';
  const response = await fetch(
    `${supabaseUrl}/functions/v1/og-profile-meta?username=${encodeURIComponent(username)}`
  );

  const html = await response.text();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(response.status).send(html);
}
```

### Why this works
- `vercel.json` already has the rewrite rules sending bot traffic and `?og=1` requests to `/api/og?username=:username`
- The Supabase Edge Function `og-profile-meta` is deployed and functional (confirmed in config.toml with `verify_jwt = false`)
- This proxy avoids cross-domain redirect issues that LinkedIn rejects

### Technical detail
- Single file creation: `api/og.ts`
- No other files need changes
- No database changes needed

