import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_EDGE_FUNCTION_URL = 'https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get username from query parameter
  const { username } = req.query;
  const usernameStr = Array.isArray(username) ? username[0] : username || '';

  console.log(`[og-proxy] Request for username: ${usernameStr}`);

  try {
    // Proxy to Supabase Edge Function
    const response = await fetch(
      `${SUPABASE_EDGE_FUNCTION_URL}?username=${encodeURIComponent(usernameStr)}`
    );

    console.log(`[og-proxy] Supabase response status: ${response.status}`);

    // Get headers from Supabase response
    const xOgProfileFound = response.headers.get('X-Og-Profile-Found');

    // Force correct Content-Type for HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Lower cache for debugging
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    
    // Debug headers
    res.setHeader('X-Og-Source', 'vercel-proxy-stable');
    res.setHeader('X-Og-Username', usernameStr);
    res.setHeader('X-Og-Upstream-Status', response.status.toString());
    if (xOgProfileFound) {
      res.setHeader('X-Og-Profile-Found', xOgProfileFound);
    }

    const html = await response.text();
    console.log(`[og-proxy] Returning HTML (${html.length} bytes)`);
    
    return res.status(response.status).send(html);

  } catch (error) {
    console.error('[og-proxy] Error proxying to Supabase:', error);
    
    // Return a minimal fallback HTML with default OG tags
    const fallbackHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vibecoders</title>
  <meta property="og:title" content="The Official Home for Vibe Coders">
  <meta property="og:description" content="Crea tu perfil. Tu identidad no cabe en un CV. Se demuestra con productos.">
  <meta property="og:image" content="https://building.vibecoders.la/images/og-image.png">
  <meta property="og:url" content="https://building.vibecoders.la/@${usernameStr}">
  <meta property="og:type" content="profile">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <p>Vibecoders - The Official Home for Vibe Coders</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.setHeader('X-Og-Source', 'vercel-fallback');
    res.setHeader('X-Og-Error', 'proxy-failed');
    
    return res.status(200).send(fallbackHtml);
  }
}
