CREATE POLICY "Admins can view all apps"
ON public.apps FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all app_stacks"
ON public.app_stacks FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all app_clicks"
ON public.app_clicks FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));