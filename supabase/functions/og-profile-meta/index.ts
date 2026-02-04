import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
}

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
  created_at: string | null
  updated_at: string | null
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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
      .select('username, name, tagline, bio, avatar_url, banner_url, og_image_url, created_at, updated_at')
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
  
  // Author and dates for LinkedIn
  const authorName = profile?.name || profile?.username || null
  const publishedTime = profile?.created_at || null
  const modifiedTime = profile?.updated_at || null

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:locale" content="es_LA">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)} - Vibecoders">
  <meta property="og:site_name" content="Vibecoders">
  <meta property="og:logo" content="${escapeHtml(settings.site_url)}/images/vibecoders-logo.png">${authorName ? `
  <meta property="article:author" content="${escapeHtml(authorName)}">` : ''}${publishedTime ? `
  <meta property="article:published_time" content="${escapeHtml(publishedTime)}">` : ''}${modifiedTime ? `
  <meta property="article:modified_time" content="${escapeHtml(modifiedTime)}">` : ''}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)} - Vibecoders">
  
  <!-- Canonical -->
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p><a href="${escapeHtml(canonicalUrl)}">Ver perfil en Vibecoders</a></p>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Content-Type-Options': 'nosniff',
      'X-Og-Username': requestedUsername || '',
      'X-Og-Profile-Found': profile ? 'true' : 'false',
      'X-Og-Source': 'supabase-edge',
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
