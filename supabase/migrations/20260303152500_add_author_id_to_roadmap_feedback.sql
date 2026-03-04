ALTER TABLE public.roadmap_feedback ADD COLUMN author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
