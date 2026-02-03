import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface GeneralSettings {
  site_url: string
  default_og_image: string
  default_og_title: string
  default_og_description: string
}

interface ProfileData {
  username: string | null
  name: string | null
  tagline: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  og_image_url: string | null
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const username = url.searchParams.get('username')

    console.log(`[og-profile-meta] Request for username: ${username}`)

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch global settings from database
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('general_settings')
      .select('key, value')
      .in('key', ['site_url', 'default_og_image', 'default_og_title', 'default_og_description'])

    if (settingsError) {
      console.error(`[og-profile-meta] Error fetching settings:`, settingsError)
    }

    // Parse settings into object with fallbacks
    const settings: GeneralSettings = {
      site_url: 'https://vibecoders.la',
      default_og_image: 'https://vibecoders.la/og-image.png',
      default_og_title: 'The Official Home for Vibe Coders',
      default_og_description: 'Crea tu perfil. Tu identidad no cabe en un CV. Se demuestra con productos.'
    }

    if (settingsData) {
      for (const setting of settingsData) {
        if (setting.key === 'site_url') settings.site_url = setting.value
        if (setting.key === 'default_og_image') settings.default_og_image = setting.value
        if (setting.key === 'default_og_title') settings.default_og_title = setting.value
        if (setting.key === 'default_og_description') settings.default_og_description = setting.value
      }
    }

    console.log(`[og-profile-meta] Settings loaded:`, settings)

    // Validate username format
    if (!username || !/^[a-zA-Z0-9_]{1,20}$/.test(username)) {
      console.log(`[og-profile-meta] Invalid username, returning default meta`)
      return generateHtmlResponse(null, username || '', settings)
    }

    // Fetch profile data
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('username, name, tagline, bio, avatar_url, banner_url, og_image_url')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (error) {
      console.error(`[og-profile-meta] Database error:`, error)
      return generateHtmlResponse(null, username, settings)
    }

    if (!profile) {
      console.log(`[og-profile-meta] Profile not found for: ${username}`)
      return generateHtmlResponse(null, username, settings)
    }

    console.log(`[og-profile-meta] Found profile: ${profile.name || profile.username}`)
    return generateHtmlResponse(profile, username, settings)

  } catch (error) {
    console.error(`[og-profile-meta] Unexpected error:`, error)
    // Fallback settings in case of complete failure
    const fallbackSettings: GeneralSettings = {
      site_url: 'https://vibecoders.la',
      default_og_image: 'https://vibecoders.la/og-image.png',
      default_og_title: 'The Official Home for Vibe Coders',
      default_og_description: 'Crea tu perfil. Tu identidad no cabe en un CV. Se demuestra con productos.'
    }
    return generateHtmlResponse(null, '', fallbackSettings)
  }
})

function generateHtmlResponse(
  profile: ProfileData | null, 
  requestedUsername: string,
  settings: GeneralSettings
): Response {
  // Determine meta values - no suffix added to title
  const title = profile?.name || profile?.username || settings.default_og_title
  const description = profile?.tagline || profile?.bio || settings.default_og_description
  // Priority: og_image_url > avatar_url > banner_url > default_og_image
  const image = profile?.og_image_url || profile?.avatar_url || profile?.banner_url || settings.default_og_image
  const canonicalUrl = profile
    ? `${settings.site_url}/@${profile.username}` 
    : requestedUsername 
      ? `${settings.site_url}/@${requestedUsername}`
      : settings.site_url
  
  // Favicon - use avatar if available
  const favicon = profile?.avatar_url || '/favicon.ico'

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${escapeHtml(favicon)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:site_name" content="Vibecoders">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
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
