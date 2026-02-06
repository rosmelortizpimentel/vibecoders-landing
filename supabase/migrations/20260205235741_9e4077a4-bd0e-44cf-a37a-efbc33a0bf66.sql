-- =============================================
-- Sistema de Feedback "Hablemos"
-- =============================================

-- Tabla de threads (conversaciones)
CREATE TABLE public.feedback_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de mensajes
CREATE TABLE public.feedback_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.feedback_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Tabla de adjuntos
CREATE TABLE public.feedback_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.feedback_messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_feedback_threads_user_id ON public.feedback_threads(user_id);
CREATE INDEX idx_feedback_threads_last_message ON public.feedback_threads(last_message_at DESC);
CREATE INDEX idx_feedback_messages_thread_id ON public.feedback_messages(thread_id);
CREATE INDEX idx_feedback_attachments_message_id ON public.feedback_attachments(message_id);

-- =============================================
-- RLS para feedback_threads
-- =============================================
ALTER TABLE public.feedback_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own threads" ON public.feedback_threads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all threads" ON public.feedback_threads
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create threads" ON public.feedback_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update threads" ON public.feedback_threads
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS para feedback_messages
-- =============================================
ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own thread messages" ON public.feedback_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.feedback_threads WHERE id = thread_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all messages" ON public.feedback_messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert messages in own threads" ON public.feedback_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.feedback_threads WHERE id = thread_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can insert messages" ON public.feedback_messages
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS para feedback_attachments
-- =============================================
ALTER TABLE public.feedback_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attachments" ON public.feedback_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback_messages m
      JOIN public.feedback_threads t ON t.id = m.thread_id
      WHERE m.id = message_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all attachments" ON public.feedback_attachments
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert attachments" ON public.feedback_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback_messages m
      JOIN public.feedback_threads t ON t.id = m.thread_id
      WHERE m.id = message_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert attachments" ON public.feedback_attachments
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Trigger para actualizar last_message_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.feedback_threads 
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_feedback_message_insert
  AFTER INSERT ON public.feedback_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_last_message();

-- =============================================
-- Storage Bucket para attachments
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-attachments', 'feedback-attachments', true);

-- Políticas de storage
CREATE POLICY "Feedback users upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'feedback-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Feedback public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'feedback-attachments');

CREATE POLICY "Feedback users delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'feedback-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Feedback admins full access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'feedback-attachments' AND
    public.has_role(auth.uid(), 'admin')
  );