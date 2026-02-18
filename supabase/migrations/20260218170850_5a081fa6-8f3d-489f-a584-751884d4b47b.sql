
-- Trigger to update likes_count on roadmap_cards when likes are added/removed
CREATE OR REPLACE FUNCTION public.update_card_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE roadmap_cards SET likes_count = likes_count + 1 WHERE id = NEW.card_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE roadmap_cards SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.card_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER trg_update_card_likes_count
AFTER INSERT OR DELETE ON public.roadmap_card_likes
FOR EACH ROW EXECUTE FUNCTION public.update_card_likes_count();
