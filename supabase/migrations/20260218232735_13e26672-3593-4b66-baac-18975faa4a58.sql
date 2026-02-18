
-- Deactivate items that disappear
UPDATE public.sidebar_menu_items SET is_active = false, updated_at = now()
WHERE key IN ('roadmap', 'beta-testing', 'public-beta-testing');

-- Insert new "my-apps" item
INSERT INTO public.sidebar_menu_items (key, label_key, path, icon, section, display_order, is_active, requires_waitlist)
VALUES ('my-apps', 'navigation.myApps', '/my-apps', 'Layers', 'maker', 4, true, false);

-- Update sections and display_order for remaining active items
UPDATE public.sidebar_menu_items SET section = 'personal', display_order = 1, updated_at = now() WHERE key = 'home';
UPDATE public.sidebar_menu_items SET section = 'personal', display_order = 2, updated_at = now() WHERE key = 'notifications';
UPDATE public.sidebar_menu_items SET section = 'maker', display_order = 3, updated_at = now() WHERE key = 'my-profile';
UPDATE public.sidebar_menu_items SET section = 'maker', display_order = 5, updated_at = now() WHERE key = 'ideas';
UPDATE public.sidebar_menu_items SET section = 'community', display_order = 6, updated_at = now() WHERE key = 'connections';
UPDATE public.sidebar_menu_items SET section = 'community', display_order = 7, updated_at = now() WHERE key = 'feedback';
