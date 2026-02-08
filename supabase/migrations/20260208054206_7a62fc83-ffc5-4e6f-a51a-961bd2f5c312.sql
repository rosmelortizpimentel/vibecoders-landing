
-- Table: prompts
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  tool_used TEXT,
  is_public BOOLEAN DEFAULT false,
  price DECIMAL,
  is_for_sale BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public prompts viewable by everyone"
  ON public.prompts FOR SELECT
  USING (is_public = true);

CREATE POLICY "Owners can view own prompts"
  ON public.prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert own prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own prompts"
  ON public.prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete own prompts"
  ON public.prompts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- Table: prompt_files
CREATE TABLE public.prompt_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View files of public or own prompts"
  ON public.prompt_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts
      WHERE prompts.id = prompt_files.prompt_id
        AND (prompts.is_public = true OR prompts.user_id = auth.uid())
    )
  );

CREATE POLICY "Insert files for own prompts"
  ON public.prompt_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompts
      WHERE prompts.id = prompt_files.prompt_id
        AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Delete files for own prompts"
  ON public.prompt_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts
      WHERE prompts.id = prompt_files.prompt_id
        AND prompts.user_id = auth.uid()
    )
  );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-attachments', 'prompt-attachments', true);

-- Storage policies
CREATE POLICY "Anyone can view prompt attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'prompt-attachments');

CREATE POLICY "Authenticated users can upload prompt attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'prompt-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own prompt attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'prompt-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
