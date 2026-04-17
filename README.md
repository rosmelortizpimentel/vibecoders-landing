# vibecoders.la — Landing Page

Public marketing site for the VibeCoders community.

## Stack

- **Astro 5** with SSR
- **Tailwind CSS v4**
- **Supabase** — Read-only data via edge functions
- **Vercel** — Hosting

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

Create a `.env` file with:

```
PUBLIC_SUPABASE_URL=https://zkotnnmrehzqonlyeorv.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Supabase Edge Functions

- `get_verified_founders` — Verified builders for landing
- `get_showcase_apps` — Apps to showcase
- `get-public-profile` — Builder profile detail
- `get-app-detail` — App detail page

## Deployment

Deploys automatically to Vercel from the `main` branch.

## License

MIT