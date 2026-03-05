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
