import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ProfileData {
  username: string | null;
  name: string | null;
  tagline: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  og_image_url: string | null;
}

interface GeneralSettings {
  site_url: string;
  default_og_image: string;
  default_og_title: string;
  default_og_description: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHtml(
  profile: ProfileData | null,
  requestedUsername: string,
  settings: GeneralSettings
): string {
  const title = profile?.name || profile?.username || settings.default_og_title;
  const description = profile?.tagline || profile?.bio || settings.default_og_description;
  const image = profile?.og_image_url || profile?.avatar_url || profile?.banner_url || settings.default_og_image;
  const canonicalUrl = profile
    ? `${settings.site_url}/@${profile.username}`
    : requestedUsername
      ? `${settings.site_url}/@${requestedUsername}`
      : settings.site_url;
  const favicon = profile?.avatar_url || '/favicon.ico';

  return `<!DOCTYPE html>
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
  <meta property="og:logo" content="${escapeHtml(settings.site_url)}/images/vibecoders-logo.png">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)} - Vibecoders">
  
  <!-- Canonical -->
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  
  <!-- Redirect real users to SPA -->
  <script>
    window.location.replace("${escapeHtml(canonicalUrl)}");
  </script>
  
  <noscript>
    <meta http-equiv="refresh" content="0; url=${escapeHtml(canonicalUrl)}">
  </noscript>
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a>...</p>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { username } = req.query;
  const usernameStr = Array.isArray(username) ? username[0] : username || '';

  console.log(`[og-profile-meta] Request for username: ${usernameStr}`);

  // Default settings
  const settings: GeneralSettings = {
    site_url: 'https://building.vibecoders.la',
    default_og_image: 'https://building.vibecoders.la/images/og-image.png',
    default_og_title: 'The Official Home for Vibe Coders',
    default_og_description: 'Crea tu perfil. Tu identidad no cabe en un CV. Se demuestra con productos.'
  };

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkotnnmrehzqonlyeorv.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[og-profile-meta] Missing SUPABASE_SERVICE_ROLE_KEY');
      const html = generateHtml(null, usernameStr, settings);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).send(html);
    }

    // Validate username format
    if (!usernameStr || !/^[a-zA-Z0-9_]{1,20}$/.test(usernameStr)) {
      console.log(`[og-profile-meta] Invalid username, returning default meta`);
      const html = generateHtml(null, usernameStr, settings);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).send(html);
    }

    // Fetch settings from database
    const settingsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/general_settings?key=in.(site_url,default_og_image,default_og_title,default_og_description)&select=key,value`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        }
      }
    );

    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      for (const setting of settingsData) {
        if (setting.key === 'site_url') settings.site_url = setting.value;
        if (setting.key === 'default_og_image') settings.default_og_image = setting.value;
        if (setting.key === 'default_og_title') settings.default_og_title = setting.value;
        if (setting.key === 'default_og_description') settings.default_og_description = setting.value;
      }
    }

    // Fetch profile data
    const profileResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?username=eq.${usernameStr.toLowerCase()}&select=username,name,tagline,bio,avatar_url,banner_url,og_image_url`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        }
      }
    );

    let profile: ProfileData | null = null;

    if (profileResponse.ok) {
      const profiles = await profileResponse.json();
      if (profiles && profiles.length > 0) {
        profile = profiles[0];
        console.log(`[og-profile-meta] Found profile: ${profile?.name || profile?.username}`);
      } else {
        console.log(`[og-profile-meta] Profile not found for: ${usernameStr}`);
      }
    }

    const html = generateHtml(profile, usernameStr, settings);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(html);

  } catch (error) {
    console.error(`[og-profile-meta] Unexpected error:`, error);
    const html = generateHtml(null, usernameStr, settings);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(html);
  }
}
