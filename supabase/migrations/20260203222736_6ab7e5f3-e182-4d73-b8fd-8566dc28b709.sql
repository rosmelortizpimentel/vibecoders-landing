-- Permitir a los administradores gestionar general_settings
CREATE POLICY "Admins can insert settings"
ON public.general_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.general_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete settings"
ON public.general_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));