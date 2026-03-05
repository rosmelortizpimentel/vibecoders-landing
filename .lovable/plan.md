

# Analysis: OG Preview Failing - 307 Redirect + 404

## What the screenshots show

The debug tools reveal the exact problem chain:

```text
vibecoders.la/@rosmelortiz
  → 307 Redirect → www.vibecoders.la/@rosmelortiz
    → 404 Failure
```

## Root cause

There are **two separate issues**:

### Issue 1: Domain redirect (307)
`vibecoders.la` (apex) is redirecting to `www.vibecoders.la` with a 307. This redirect happens **before** Vercel's rewrite rules in `vercel.json` can process the bot user-agent match. So the bot never hits `/api/og` -- it follows the redirect to `www.` instead.

### Issue 2: 404 on www
After the redirect, `www.vibecoders.la/@rosmelortiz` returns 404. This means either:
- The `www.vibecoders.la` domain is not properly connected to the same Vercel project, OR
- The latest deployment with `api/og.ts` hasn't been pushed to Vercel yet (we just restored this file)

## Solution

### Step 1: Verify Vercel deployment
The `api/og.ts` file was just restored in Lovable. You need to **deploy this to Vercel** (push to GitHub / redeploy) for the serverless function to be available.

### Step 2: Fix domain configuration in Vercel
In your **Vercel dashboard** > Project Settings > Domains:
- Make sure both `vibecoders.la` and `www.vibecoders.la` point to the **same project**
- Set the **primary domain** to `vibecoders.la` (without www), and let `www` redirect to it -- OR vice versa, but both must be on the same Vercel project
- The 307 redirect must happen **within** Vercel (not at DNS level) so that Vercel's rewrite rules process first for bot user-agents

### Step 3 (optional): Add www handling to vercel.json
As a safety net, we can duplicate the bot rewrite rules to also match `www.` requests. But this only works if `www.vibecoders.la` is actually connected to the Vercel project (currently it seems it's not, given the 404).

## Summary
**No code changes needed.** The fix is operational:
1. Deploy the latest code (with `api/og.ts`) to Vercel
2. Verify that both `vibecoders.la` and `www.vibecoders.la` are configured as domains on the same Vercel project
3. Test with `https://vibecoders.la/@rosmelortiz?og=1` in a browser to confirm the proxy returns HTML with OG tags

