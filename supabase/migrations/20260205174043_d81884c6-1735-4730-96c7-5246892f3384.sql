UPDATE general_settings 
SET value = 'https://vibecoders.la', updated_at = now() 
WHERE key = 'site_url';