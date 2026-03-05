-- Función para asegurar que el roadmap público y el dominio personalizado solo estén disponibles para usuarios PRO o Founder
CREATE OR REPLACE FUNCTION check_roadmap_settings_pro_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id UUID;
  v_tier TEXT;
BEGIN
  -- Si intenta activar is_public o asignar un custom_domain
  IF (NEW.is_public = true OR NEW.custom_domain IS NOT NULL) THEN
    -- Obtenemos el owner de la app
    SELECT owner_id INTO v_owner_id FROM apps WHERE id = NEW.app_id;
    
    IF v_owner_id IS NOT NULL THEN
      -- Obtenemos el tier del usuario
      SELECT tier INTO v_tier FROM user_subscriptions WHERE user_id = v_owner_id;
      
      -- Si no es PRO ni Founder, forzamos a que no pueda tener esos features
      IF v_tier IS NULL OR (v_tier != 'pro' AND v_tier != 'founder') THEN
        NEW.is_public := false;
        NEW.custom_domain := NULL;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminamos el trigger si ya existe
DROP TRIGGER IF EXISTS trg_check_roadmap_settings_pro_limits ON roadmap_settings;

-- Creamos el trigger antes de insertar o actualizar
CREATE TRIGGER trg_check_roadmap_settings_pro_limits
BEFORE INSERT OR UPDATE ON roadmap_settings
FOR EACH ROW
EXECUTE FUNCTION check_roadmap_settings_pro_limits();
