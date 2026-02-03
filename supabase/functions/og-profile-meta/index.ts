import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = 'https://vibecoders.la'
const DEFAULT_OG_IMAGE = 'https://vibecoders.la/og-image.png'
const DEFAULT_TITLE = 'Vibecoders — Comunidad de Vibe Coders Latinos'
const DEFAULT_DESCRIPTION = 'La comunidad donde los latinoamericanos construyen el futuro con IA'

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const username = url.searchParams.get('username')

    console.log(`[og-profile-meta] Request for username: ${username}`)

    // Validate username format
    if (!username || !/^[a-zA-Z0-9_]{1,20}$/.test(username)) {
      console.log(`[og-profile-meta] Invalid username, returning default meta`)
      return generateHtmlResponse(null, username || '')
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch profile data
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('username, name, tagline, bio, avatar_url')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (error) {
      console.error(`[og-profile-meta] Database error:`, error)
      return generateHtmlResponse(null, username)
    }

    if (!profile) {
      console.log(`[og-profile-meta] Profile not found for: ${username}`)
      return generateHtmlResponse(null, username)
    }

    console.log(`[og-profile-meta] Found profile: ${profile.name || profile.username}`)
    return generateHtmlResponse(profile, username)

  } catch (error) {
    console.error(`[og-profile-meta] Unexpected error:`, error)
    return generateHtmlResponse(null, '')
  }
})

interface ProfileData {
  username: string | null
  name: string | null
  tagline: string | null
  bio: string | null
  avatar_url: string | null
}

function generateHtmlResponse(profile: ProfileData | null, requestedUsername: string): Response {
  // Determine meta values
  const title = profile?.name || profile?.username || DEFAULT_TITLE
  const description = profile?.tagline || profile?.bio || DEFAULT_DESCRIPTION
  const image = profile?.avatar_url || DEFAULT_OG_IMAGE
  const canonicalUrl = profile 
    ? `${SITE_URL}/@${profile.username}` 
    : requestedUsername 
      ? `${SITE_URL}/@${requestedUsername}`
      : SITE_URL
  
  // Favicon - use avatar if available
  const favicon = profile?.avatar_url || '/favicon.ico'
  
  // Build full title with suffix for profiles
  const fullTitle = profile ? `${title} | Vibecoder` : title

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="title" content="${escapeHtml(fullTitle)}">
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${escapeHtml(favicon)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:site_name" content="Vibecoders">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  
  <!-- Canonical -->
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  
  <!-- Redirect real users to SPA -->
  <script>
    // Crawlers don't execute JS, so only real users will be redirected
    window.location.replace("${escapeHtml(canonicalUrl)}");
  </script>
  
  <noscript>
    <meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalUrl)}">
  </noscript>
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a>...</p>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
