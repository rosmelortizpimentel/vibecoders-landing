UPDATE general_settings 
SET value = 'https://vibecoders.la/images/og-image.png', updated_at = now() 
WHERE key = 'default_og_image';