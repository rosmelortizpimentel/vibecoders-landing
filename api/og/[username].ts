// Legacy fallback - external rewrite in vercel.json handles this now
// This file is kept for reference but should not be used

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const username = pathParts[pathParts.length - 1];
  
  if (!username) {
    return new Response('Username required', { status: 400 });
  }

  try {
    console.log(`[og-proxy-fallback] Fetching OG metadata for: ${username}`);
    
    const response = await fetch(
      `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=${encodeURIComponent(username)}`
    );
    
    if (!response.ok) {
      console.error(`[og-proxy-fallback] Supabase function returned ${response.status}`);
      return new Response('Error fetching profile metadata', { status: response.status });
    }
    
    const html = await response.text();
    
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'x-og-proxy': 'vercel-function-fallback',
      },
    });
    
  } catch (error) {
    console.error(`[og-proxy-fallback] Error:`, error);
    return new Response('Internal server error', { status: 500 });
  }
}
