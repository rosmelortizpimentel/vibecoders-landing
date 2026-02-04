-- Recrear política de general_settings con roles explícitos
DROP POLICY IF EXISTS "Anyone can view settings" ON public.general_settings;

CREATE POLICY "Anyone can view settings"
  ON public.general_settings 
  FOR SELECT 
  TO anon, authenticated
  USING (true);