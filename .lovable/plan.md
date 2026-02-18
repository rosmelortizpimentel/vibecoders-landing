

## Dynamic Sidebar Menu from Database

### Goal
Replace the hardcoded navigation menu in the Sidebar (and mobile header) with items loaded from a new `sidebar_menu_items` database table, allowing admin activation/deactivation. Items with dynamic counters (badges) will keep their runtime values.

### How It Works

1. **New database table `sidebar_menu_items`** stores menu configuration:
   - `key` (unique text, e.g. "home", "notifications", "beta-testing") -- maps to the icon and badge logic
   - `label_key` (text) -- the i18n translation key (e.g. "navigation.home")
   - `path` (text) -- the route path (e.g. "/home")
   - `icon` (text) -- icon name from Lucide (e.g. "LayoutDashboard")
   - `section` (text) -- grouping: "personal", "community", "utilities"
   - `display_order` (integer) -- sort order
   - `is_active` (boolean, default true) -- toggle visibility
   - `requires_waitlist` (boolean, default false) -- only show for waitlist users
   - `css_class` (text, nullable) -- optional extra class (e.g. "text-amber-500")

2. **Seed the table** with all current menu items pre-populated.

3. **New hook `useSidebarMenu`** fetches active items, sorted by section + display_order. Results are cached with React Query.

4. **Sidebar.tsx and AuthenticatedHeader.tsx** will consume the hook, map `icon` string to the actual Lucide component, and apply badge logic based on the `key` field:
   - `key === "notifications"` -> uses `unreadCount`
   - `key === "beta-testing"` -> uses `ownedAppsCount`
   - `key === "public-beta-testing"` -> uses `publicSquadsCount`

5. **Admin panel** gets a new "Menu" section (or added to Settings) where admins can toggle `is_active` and reorder items using a simple table with switches.

---

### Technical Details

#### Database Migration

```sql
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

-- Anyone can read (needed for sidebar rendering)
CREATE POLICY "Anyone can view menu items"
  ON public.sidebar_menu_items FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage menu items"
  ON public.sidebar_menu_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed with current items
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
```

#### New Hook: `src/hooks/useSidebarMenu.ts`

- Fetches from `sidebar_menu_items` where `is_active = true`, ordered by `display_order`
- Filters `requires_waitlist` items based on user's waitlist status
- Maps icon strings to Lucide components via a lookup object
- Injects runtime badge counts based on `key`

#### Icon Mapping

A simple object mapping string names to Lucide components:

```typescript
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Bell, User, Lightbulb, Map, BookOpen,
  Users, FlaskConical, Rocket, Globe, Wrench, MessageSquare, Crown
};
```

#### Badge Mapping

Counters remain dynamic and are resolved at render time:

```typescript
const badgeMap: Record<string, number> = {
  'notifications': unreadCount,
  'beta-testing': ownedAppsCount,
  'public-beta-testing': publicSquadsCount,
};
```

#### Admin UI

A new sub-section in the admin panel (or under Settings) with:
- Table listing all menu items: Name, Path, Section, Active toggle
- Toggle switch to activate/deactivate each item
- Changes saved immediately via Supabase update

#### Files to Create/Modify

| File | Action |
|------|--------|
| Database migration | Create table + seed |
| `src/hooks/useSidebarMenu.ts` | Create -- fetch + transform |
| `src/components/layout/Sidebar.tsx` | Modify -- use hook instead of hardcoded array |
| `src/components/AuthenticatedHeader.tsx` | Modify -- use same hook for mobile nav |
| `src/components/admin/MenuManager.tsx` | Create -- admin toggle UI |
| `src/pages/Admin.tsx` | Modify -- add Menu route |
| `src/components/admin/AdminSidebar.tsx` | Modify -- add Menu link |
| `src/integrations/supabase/types.ts` | Auto-updated by migration |

