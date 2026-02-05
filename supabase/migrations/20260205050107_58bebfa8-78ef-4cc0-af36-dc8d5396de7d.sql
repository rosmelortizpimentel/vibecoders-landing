-- Añadir columnas de verificación a apps
ALTER TABLE apps 
ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verified_url text;

-- Generar tokens para apps existentes
UPDATE apps 
SET verification_token = encode(gen_random_bytes(16), 'hex')
WHERE verification_token IS NULL;

-- Asegurar que apps nuevas tengan token
ALTER TABLE apps 
ALTER COLUMN verification_token SET DEFAULT encode(gen_random_bytes(16), 'hex');

-- Función para resetear verificación al cambiar URL
CREATE OR REPLACE FUNCTION public.reset_app_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.url IS DISTINCT FROM NEW.url THEN
    NEW.is_verified := false;
    NEW.verified_at := NULL;
    NEW.verified_url := NULL;
    NEW.verification_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para ejecutar la función
DROP TRIGGER IF EXISTS trigger_reset_app_verification ON apps;
CREATE TRIGGER trigger_reset_app_verification
BEFORE UPDATE ON apps
FOR EACH ROW
EXECUTE FUNCTION public.reset_app_verification();