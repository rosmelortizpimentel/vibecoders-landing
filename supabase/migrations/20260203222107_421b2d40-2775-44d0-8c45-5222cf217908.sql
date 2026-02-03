-- Insertar configuraciones globales para OG meta tags
INSERT INTO general_settings (key, value, description) VALUES
  ('site_url', 'https://vibecoders.la', 'URL base del sitio'),
  ('default_og_image', 'https://vibecoders.la/og-image.png', 'Imagen OG por defecto para compartir en redes sociales'),
  ('default_og_title', 'The Official Home for Vibe Coders', 'Título OG por defecto'),
  ('default_og_description', 'Crea tu perfil. Tu identidad no cabe en un CV. Se demuestra con productos.', 'Descripción OG por defecto');