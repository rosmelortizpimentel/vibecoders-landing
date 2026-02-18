

# Roadmap Responsive Overhaul + Navigation + Color Picker + Public Preview

## Overview

This plan addresses 5 key areas: making the editor and public page fully responsive, replacing the ugly native color picker, adding a "Roadmap" section to the sidebar navigation, adding a public preview link, and enhancing the scraper to capture favicons.

---

## 1. Responsive Redesign -- RoadmapEditor.tsx (Mobile/Tablet)

**Current problems (visible in screenshots):**
- Header buttons overflow and wrap awkwardly on mobile
- Kanban lanes use fixed `w-72` and horizontal scroll -- unusable on mobile
- Feedback panel uses `md:grid-cols-2` but doesn't optimize for small screens
- Dialogs don't use Drawer on mobile

**Changes:**
- **Header**: Stack buttons vertically on mobile. Use icon-only buttons on small screens (Feedback, Settings, Add Lane) with tooltips
- **Kanban board**: On mobile (`< md`), switch to vertical stacked layout (accordion-style collapsible lanes). On tablet/desktop keep horizontal scroll
- **Lane headers**: Compact layout on mobile -- smaller text, tighter spacing
- **Feedback panel**: Single column on mobile, 2 columns on tablet+
- **All dialogs**: Use Drawer (from vaul) on mobile instead of Dialog using the `useIsMobile()` hook pattern

---

## 2. Replace Native Color Picker with Premium Component

**Current problem (visible in screenshot):** The `<input type="color">` renders the ugly Android/native color picker with neon colors.

**Fix:** Replace the native `<input type="color">` in the Lane Dialog with the existing `ColorPicker` component from `src/components/me/ColorPicker.tsx` which already uses `react-colorful` (HexColorPicker) with professional preset colors.

The ColorPicker component already exists and has:
- HexColorPicker (smooth gradient picker)
- Professional matte preset colors
- Hex input field
- Popover-based UI

Just swap the lane color `<input type="color">` + `<Input>` for `<ColorPicker label={t('editor.laneColor')} value={laneForm.color} onChange={...} />`.

---

## 3. New Sidebar Navigation -- "Roadmap" Menu Item

**What:** Add a "Roadmap" entry to the sidebar nav between "My Ideas" and "Resource Library".

**New page: `/roadmap`** -- Lists verified apps as centered cards (similar to Ideas page layout):
- Each card shows app logo, name, tagline, and a "Manage Roadmap" button
- Only verified apps appear
- If no verified apps, show empty state with message
- A sub-header/breadcrumb bar at the top showing "Roadmap" context

**Files:**
- New `src/pages/Roadmap.tsx` -- App listing page
- Edit `src/components/layout/Sidebar.tsx` -- Add nav item with `Map` icon
- Edit `src/App.tsx` -- Add route `/roadmap` inside DashboardLayout
- Edit `src/i18n/{en,es,fr,pt}/common.json` -- Add `navigation.roadmap` key

---

## 4. Public Preview Button in Editor

**What:** Add a prominent "View Public Page" button in the editor header that opens `/roadmap/:appSlug` in a new tab. The existing link is tiny and easy to miss.

**Change in RoadmapEditor.tsx header:**
- Add a visible `Button` with `ExternalLink` icon labeled "Preview" that opens the public URL
- Only show when `is_public` is enabled

---

## 5. Scraper Enhancement -- Capture Favicon

**What:** When scraping app details, also extract the favicon URL and save it.

**Change in `supabase/functions/scrape-app-details/index.ts`:**
- After scraping, check `scrapData.metadata?.favicon` or construct `${origin}/favicon.ico`
- Upload it to storage like the logo
- Save as `favicon_url` on the app record (this field may need adding to the apps table -- will check if it exists or use the roadmap_settings table)

Actually, the favicon is stored in `roadmap_settings.favicon_url`, not in the `apps` table. So the scraper should save it there, or we add a `favicon_url` column to `apps` and use that as default for roadmap settings. Simpler approach: just populate `roadmap_settings.favicon_url` from the app logo_url or let the user set it manually (already implemented). We'll enhance the scraper to extract favicon metadata and store it in the apps table as a new column.

**Revised approach:** Add `favicon_url` text column to `apps` table via migration. Update scraper to extract and store it. In RoadmapEditor settings, auto-populate from `app.favicon_url` if roadmap `favicon_url` is empty.

---

## 6. Roadmap + Feedback Combined View Strategy

The user wants roadmap and feedback shown together but strategically separated. The current tab-based approach in PublicRoadmap.tsx already does this well. We'll enhance it:

- Keep the two tabs (Roadmap | Feedback) 
- On desktop, optionally show a small "Top Suggestions" sidebar next to the roadmap view (max 3 items)
- Feedback items linked to a card show a subtle badge on that card in the roadmap view

---

## Technical Details

### Files to create:
1. `src/pages/Roadmap.tsx` -- App listing for roadmap management

### Files to modify:
1. `src/pages/RoadmapEditor.tsx` -- Responsive overhaul, replace color picker, add preview button, use Drawer on mobile
2. `src/pages/PublicRoadmap.tsx` -- Responsive polish, linked feedback badges on cards
3. `src/components/layout/Sidebar.tsx` -- Add Roadmap nav item
4. `src/App.tsx` -- Add `/roadmap` route
5. `src/i18n/{en,es,fr,pt}/common.json` -- Add `navigation.roadmap`
6. `supabase/functions/scrape-app-details/index.ts` -- Extract favicon
7. New migration -- Add `favicon_url` column to `apps` table

### No breaking changes
All existing functionality preserved. New features are additive.

