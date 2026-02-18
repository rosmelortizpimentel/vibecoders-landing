# Roadmap & Feedback -- Audit and Completion Plan

## Status: ~90% implemented

The core system (database, hooks, editor, public page, DnD, feedback, i18n) is already built. This plan addresses the gaps found during the audit.

---

## Gap 1: Favicon not applied on Public Roadmap

The `useFavicon` hook is imported but never called with `settings.favicon_url` in `PublicRoadmap.tsx`.

**Fix:** Add `useFavicon(settings?.favicon_url)` call inside the component.

Asegura que al registrar un app tanbien se pueda escrapear el favicon, OG imagen y logo y que se guarde.

---

## Gap 2: No favicon URL field in Editor Settings

The settings dialog only has Custom Title, Font, and Public toggle. There is no way for the owner to configure the favicon URL.

**Fix:** Add a text input for `favicon_url` inside the Settings dialog in `RoadmapEditor.tsx`, and include it in the `settingsForm` state and save logic.

---

## Gap 3: No lane reordering (DnD for lanes)

Currently only cards can be dragged. Lanes have no mechanism to change their `display_order`.

**Fix:** Add drag handles to lane headers with `@dnd-kit/sortable` horizontal sorting, calling `roadmap.reorderLanes()` on drag end.

---

## Gap 4: Delete Feedback missing from Editor

The feedback panel in the editor shows status, reply, and link buttons, but no delete button. The `deleteFeedback` function exists in the hook but is unused.

**Fix:** Add a delete button (Trash icon) to each feedback card in the editor panel, with an `AlertDialog` confirmation using existing i18n keys (`delete.feedbackTitle`, `delete.feedbackDescription`).

---

## Gap 5: Lane fonts not loaded on Public Page

If a lane uses a custom font (e.g., "Playfair Display"), it is referenced via `style={{ fontFamily }}` but the Google Fonts stylesheet is never loaded for lane-specific fonts.

**Fix:** Collect unique lane fonts, generate a single Google Fonts link for all of them alongside the global font.

---

## Gap 6: Hardcoded strings not translated

Several UI strings are hardcoded in English:

- "Unlink" and "Link to Card" in the link feedback dialog
- "Cancel" and "Add file" in the public feedback form
- "Error moving card" toast

**Fix:** Add these keys to the i18n roadmap files (en/es/fr/pt) and use `t()` for the editor and localized labels `l` for the public page.

---

## Technical Details

### Files to modify:

1. `**src/pages/PublicRoadmap.tsx**` -- Call `useFavicon`, load lane fonts
2. `**src/pages/RoadmapEditor.tsx**` -- Add favicon field in settings, lane DnD, feedback delete button + confirmation, translate hardcoded strings
3. `**src/i18n/{en,es,fr,pt}/roadmap.json**` -- Add missing keys: `editor.faviconUrlPlaceholder`, `editor.unlink`, `editor.linkToCard`, `public.addFile`, `public.cancel`

### No database changes needed

All tables, RLS policies, triggers, and storage are already in place and correct.