
-- Table for fingerprint-based likes on roadmap cards (public view)
CREATE TABLE public.roadmap_card_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.roadmap_cards(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(card_id, device_fingerprint)
);

-- Enable RLS
ALTER TABLE public.roadmap_card_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes
CREATE POLICY "Anyone can read card likes" ON public.roadmap_card_likes FOR SELECT USING (true);

-- Anyone can insert likes (anonymous fingerprint-based)
CREATE POLICY "Anyone can insert card likes" ON public.roadmap_card_likes FOR INSERT WITH CHECK (true);

-- Anyone can delete their own likes (by fingerprint)
CREATE POLICY "Anyone can delete own card likes" ON public.roadmap_card_likes FOR DELETE USING (true);

-- Add likes_count to roadmap_cards for denormalized count
ALTER TABLE public.roadmap_cards ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;

-- Index for performance
CREATE INDEX idx_roadmap_card_likes_card ON public.roadmap_card_likes(card_id);
CREATE INDEX idx_roadmap_card_likes_fp ON public.roadmap_card_likes(device_fingerprint);
