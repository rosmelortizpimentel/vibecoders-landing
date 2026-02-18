
# Roadmap Improvements: Favicon Upload, Public Footer, Settings Redesign & Done Date

## 1. Favicon Upload (file-based instead of URL)

**File: `RoadmapEditor.tsx`** -- Settings modal

- Replace the `Input` text field for favicon URL with a **file upload** input
- When a file is selected, upload it to Supabase Storage bucket `roadmap-attachments` (already exists) under a path like `favicons/{appId}-{timestamp}.{ext}`
- Get the public URL and store it in `settingsForm.favicon_url`
- Show a small preview of the current favicon next to the upload button
- Accept `.ico`, `.png`, `.svg`, `.webp` formats only

## 2. Public Roadmap Footer Fix

**File: `PublicRoadmap.tsx`**

- Make the page layout `min-h-screen flex flex-col` so the footer is always at the bottom
- Wrap `<main>` in `flex-1`
- In the footer:
  - Add the vibecoders logo (small, ~16px) next to "Powered by"
  - Make "vibecoders.la" a clickable link opening in a new tab (already is, just ensure logo is there)
- Import `vibecodersLogo` from `@/assets/vibecoders-logo.png` (same pattern as other components)

## 3. Settings Modal Redesign -- Branding Focus + Column Colors

**File: `RoadmapEditor.tsx`**

- **Public/Private toggle** stays at top (already done) -- keep as-is
- **Branding section** below: Title, Font, Favicon upload (grouped under a visual section header)
- **Column Colors section**: List each lane name with a `ColorPicker` next to it. Changes save immediately to the lane's color
- Update default lane colors in `useRoadmap.ts`:
  - Backlog: `#6B7280` (gray -- already correct)
  - Planned: `#F59E0B` (amber/yellow from palette)
  - In Progress: `#3B82F6` (blue from palette -- already correct)
  - Done: `#10B981` (green from palette -- already correct)

## 4. Optional Date Tag on "Done" Cards

**Database migration**: Add `completed_at DATE` column to `roadmap_cards` table (nullable)

**File: `useRoadmap.ts`**:
- Update `RoadmapCard` interface to include `completed_at: string | null`
- In `moveCard`, when `newLaneId` corresponds to the "Done" lane, optionally set `completed_at`

**File: `RoadmapEditor.tsx`**:
- When a card is moved to a "Done" lane (via drag or move dialog), show an optional date picker dialog
- If the user selects a date, save it as `completed_at` on the card
- If skipped, the card moves without a date
- Display the date as a small `Badge` tag on the card (e.g., "Feb 18, 2026")

**File: `PublicRoadmap.tsx`**:
- Also display the `completed_at` badge on cards in the public view

## Technical Details

### Files to create:
- New migration SQL for `completed_at` column on `roadmap_cards`

### Files to modify:
1. **`src/pages/RoadmapEditor.tsx`** -- Favicon upload, column colors in settings, date picker on Done move
2. **`src/pages/PublicRoadmap.tsx`** -- Footer layout fix, logo import, completed_at badge display
3. **`src/hooks/useRoadmap.ts`** -- Update `RoadmapCard` interface, update `DEFAULT_LANES` colors, handle `completed_at` in moveCard
4. **`src/integrations/supabase/types.ts`** -- Add `completed_at` to roadmap_cards type

### Default Lane Colors Update:
```text
Backlog:     #6B7280 (gray)      -- no change
Planned:     #F59E0B (amber)     -- was #3B82F6
In Progress: #3B82F6 (blue)      -- was #F59E0B
Done:        #10B981 (green)     -- no change
```

### Date Picker Approach:
- Use a simple `Input type="date"` inside the move-to-Done confirmation, keeping it lightweight
- Store as a `DATE` column (no timezone issues)
- Display formatted with `date-fns` `format()` function (already installed)
