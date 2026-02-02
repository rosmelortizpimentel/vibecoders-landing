-- 1. Crear enum para roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- 2. Crear tabla de roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Política: usuarios pueden ver sus propios roles
CREATE POLICY "Users can view own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

-- 5. Función security definer para verificar roles sin recursión RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Crear bucket público para showcase
INSERT INTO storage.buckets (id, name, public)
VALUES ('showcase-assets', 'showcase-assets', true);

-- 7. Políticas de storage para showcase-assets
CREATE POLICY "Public read showcase assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'showcase-assets');

CREATE POLICY "Admins can upload showcase assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'showcase-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update showcase assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'showcase-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete showcase assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'showcase-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

-- 8. Políticas RLS para showcase_gallery (solo admins pueden modificar)
CREATE POLICY "Admins can insert showcase" 
ON public.showcase_gallery FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update showcase" 
ON public.showcase_gallery FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete showcase" 
ON public.showcase_gallery FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));