UPDATE general_settings 
SET value = 'https://building.vibecoders.la', updated_at = NOW() 
WHERE key = 'site_url';