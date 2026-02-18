

# Roadmap Editor Header Redesign + Feedback Section Independence

## Overview
Redesign the RoadmapEditor header to show app logo, name, and a Public/Private toggle inline. Add independent feedback section with its own URL and public visibility toggle. Remove "Vista Previa" button.

---

## 1. Header Redesign (`RoadmapEditor.tsx`)

### New header layout (left to right):
- **Back arrow** (existing)
- **App logo** (`app.logo_url`) -- small 32x32 rounded image
- **App name** (bold) on line 1, below it a **Public/Private switch** styled as a compact inline toggle tag
- When **Public** is active, show a "Pagina Publica" link to the right that opens in a new tab
- **Remove** the "Vista Previa" button entirely

### Header right side:
- **Feedback** button (navigates to feedback view within the editor)
- **Branding** button (opens sidebar, same as now)

## 2. Feedback as Independent Section with Own URL

### Editor view modes:
- Add a `viewMode` state: `'roadmap' | 'feedback'`
- Default: `'roadmap'` (shows Kanban columns)
- When "Feedback" is clicked: switch to `'feedback'` mode
  - Hide the Kanban board (columns)
  - Show the feedback panel full-width
  - URL stays the same (internal state, no route change needed in the editor)

### Feedback public toggle:
- Add `is_feedback_public` field to `roadmap_settings` (requires DB migration)
- In the Branding sidebar, add a second toggle for "Feedback Publico" below the existing "Publico" toggle -- independent from the roadmap public toggle
- The public roadmap page (`PublicRoadmap.tsx`) checks `is_feedback_public` before showing the Feedback tab

## 3. Database Migration

Add `is_feedback_public BOOLEAN DEFAULT false` to `roadmap_settings` table.

## 4. Hook Update (`useRoadmap.ts`)

- Add `is_feedback_public` to `RoadmapSettings` interface
- Include it in `updateSettings` flow

## 5. Public Roadmap Update (`PublicRoadmap.tsx`)

- Only show the Feedback tab/section when `settings.is_feedback_public` is true
- If someone navigates to `/@handle/slug/feedback` but feedback is not public, show "not found" or redirect to roadmap

## 6. i18n Updates

Add keys:
- `editor.feedbackPublic`: "Feedback Publico"
- `editor.feedbackPublicOnHint`: "Cualquiera puede enviar feedback"
- `editor.feedbackPublicOffHint`: "El feedback esta desactivado"
- `editor.publicPage`: "Pagina Publica"

---

## Technical Details

### Files to modify:
1. **`src/pages/RoadmapEditor.tsx`** -- Header redesign, view mode toggle, feedback public toggle in sidebar
2. **`src/hooks/useRoadmap.ts`** -- Add `is_feedback_public` to interface
3. **`src/pages/PublicRoadmap.tsx`** -- Conditionally show feedback based on `is_feedback_public`
4. **`src/integrations/supabase/types.ts`** -- Update types
5. **`src/i18n/{en,es,fr,pt}/roadmap.json`** -- New keys

### Files to create:
- New SQL migration for `is_feedback_public` column

### Header mockup (text-based):
```text
[<-] [logo] App Name              [Feedback (5)] [Branding]
           [* Publico] [Pagina Publica ->]
```

When "Privado" is selected, the "Pagina Publica" link disappears.

