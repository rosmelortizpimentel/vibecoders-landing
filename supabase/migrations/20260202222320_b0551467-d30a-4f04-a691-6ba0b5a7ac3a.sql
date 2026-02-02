-- Añadir columna para el logo del proyecto
ALTER TABLE showcase_gallery
ADD COLUMN project_logo_url text;

-- Comentario descriptivo
COMMENT ON COLUMN showcase_gallery.project_logo_url IS 
  'URL del logo cuadrado del proyecto (opcional)';