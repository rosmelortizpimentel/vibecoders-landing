import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;
  
  // Validate username
  if (!username || typeof username !== 'string') {
    return res.status(400).send('Username required');
  }

  try {
    console.log(`[og-proxy] Fetching OG metadata for: ${username}`);
    
    const response = await fetch(
      `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=${encodeURIComponent(username)}`
    );
    
    if (!response.ok) {
      console.error(`[og-proxy] Supabase function returned ${response.status}`);
      return res.status(response.status).send('Error fetching profile metadata');
    }
    
    const html = await response.text();
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(html);
    
  } catch (error) {
    console.error(`[og-proxy] Error:`, error);
    return res.status(500).send('Internal server error');
  }
}
