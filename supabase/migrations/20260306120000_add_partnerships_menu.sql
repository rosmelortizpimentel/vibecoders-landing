-- Add badge_text to sidebar_menu_items and insert Partnerships
ALTER TABLE public.sidebar_menu_items ADD COLUMN badge_text TEXT;

-- Insert Partnerships menu item
INSERT INTO public.sidebar_menu_items (
  key, 
  label_key, 
  path, 
  icon, 
  section, 
  display_order, 
  is_active, 
  requires_waitlist, 
  badge_text
) VALUES (
  'partnerships', 
  'navigation.partnerships', 
  '/partnerships', 
  'Handshake', 
  'community', 
  12, 
  true, 
  false, 
  'Beta'
);
