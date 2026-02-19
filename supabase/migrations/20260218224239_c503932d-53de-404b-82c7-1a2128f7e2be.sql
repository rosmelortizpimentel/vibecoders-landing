
CREATE TABLE public.sidebar_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label_key TEXT NOT NULL,
  path TEXT NOT NULL,
  icon TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'personal',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_waitlist BOOLEAN NOT NULL DEFAULT false,
  css_class TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sidebar_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
  ON public.sidebar_menu_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage menu items"
  ON public.sidebar_menu_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.sidebar_menu_items (key, label_key, path, icon, section, display_order, is_active, requires_waitlist, css_class) VALUES
  ('home',                'navigation.home',              '/home',                'LayoutDashboard', 'personal',  1,  true, false, NULL),
  ('notifications',       'notifications.title',          '/notifications',       'Bell',            'personal',  2,  true, false, NULL),
  ('my-profile',          'navigation.myProfile',         '/me',                  'User',            'personal',  3,  true, false, NULL),
  ('ideas',               'navigation.myIdeas',           '/ideas',               'Lightbulb',       'personal',  4,  true, false, NULL),
  ('roadmap',             'navigation.roadmap',           '/roadmap',             'Map',             'personal',  5,  true, false, NULL),
  ('prompts',             'navigation.prompts',           '/prompts',             'BookOpen',        'personal',  6,  true, false, NULL),
  ('connections',         'navigation.vibers',            '/connections',         'Users',           'personal',  7,  true, false, NULL),
  ('beta-testing',        'navigation.betaTesting',       '/beta-testing',        'FlaskConical',    'personal',  8,  true, false, NULL),
  ('public-beta-testing', 'navigation.publicBetaTesting', '/public-beta-testing', 'Rocket',          'community', 10, true, false, NULL),
  ('explore',             'navigation.startups',          '/explore',             'Globe',           'community', 11, true, false, NULL),
  ('tools',               'navigation.tools',             '/tools',               'Wrench',          'utilities', 20, true, false, NULL),
  ('feedback',            'navigation.feedback',          '/feedback',            'MessageSquare',   'utilities', 21, true, false, NULL),
  ('buildlog',            'navigation.buildLog',          '/buildlog',            'Crown',           'utilities', 22, true, true,  'text-amber-500');
