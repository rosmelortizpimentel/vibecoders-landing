
# Plan: Enhanced App Cards Design for Profile Preview

## Summary
Redesign the app cards in the "Apps" section of the profile preview to display richer metadata including status badges, tech stack icons, and a clear CTA button, while maintaining a clean and premium aesthetic.

---

## Current State
The app cards in `ProfilePreview.tsx` (lines 189-220) show:
- App logo
- App name
- Tagline (optional)

The data model already supports:
- `status_id` - linked to `app_statuses` table with colors and icons
- `stacks` - array of tech stack IDs linked to `tech_stacks` table with logos
- `url` - for the visit button

---

## Visual Design

```text
+------------------------------------------------------------+
|  [Logo]  App Name               [Status Badge]    [Visitar]|
|          Description/tagline text here                     |
|          [React] [Tailwind] [Supabase]                     |
+------------------------------------------------------------+
```

**Design Principles:**
- Status badge: Pill-shaped with colored dot + text, positioned right of title
- Tech stack row: Small grey badges with logo icons (max 4 shown)
- Visit button: Subtle, right-aligned with external link icon
- Matte, professional colors (no bright/neon tones)

---

## Implementation Steps

### Step 1: Create a New Enhanced App Card Component

**File:** `src/components/me/PreviewAppCard.tsx`

This component will:
- Accept `app`, `statuses`, and `techStacks` as props
- Render the enhanced card layout with all metadata
- Handle the "Visitar" CTA button

### Step 2: Update ProfilePreview Component

**File:** `src/components/me/ProfilePreview.tsx`

Changes:
- Import `useStatuses` and `useTechStacks` hooks
- Pass statuses and stacks data to the new card component
- Replace the inline app card rendering with the new component

---

## Technical Details

### PreviewAppCard Component Structure

```tsx
interface PreviewAppCardProps {
  app: AppData;
  statuses: Status[];
  stacks: TechStack[];
}
```

**Status Badge Implementation:**
- Find status by `app.status_id`
- Display colored dot (using status.color) + status name
- Use matte background: `bg-gray-100` with colored text

**Tech Stack Row Implementation:**
- Filter `stacks` by `app.stacks` array (stack IDs)
- Display up to 4 tech icons with small logos from `logo_url`
- Use subtle grey badges: `bg-gray-100 text-gray-600`

**Visit Button Implementation:**
- Positioned on the right side of the card
- Uses `ExternalLink` icon from lucide-react
- Text: "Visitar" with hover effect
- Opens app URL in new tab with ref parameter

### Color Palette (Matte/Professional)
- Background: `bg-white`
- Borders: `border-gray-200`
- Text primary: `text-gray-900`
- Text secondary: `text-gray-500`
- Badge background: `bg-gray-100`
- Status badge: Uses status color with 20% opacity background

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/me/PreviewAppCard.tsx` | Create new component |
| `src/components/me/ProfilePreview.tsx` | Update to use new component and hooks |

---

## Considerations

- **Performance:** The hooks `useStatuses` and `useTechStacks` will be called in ProfilePreview. Since these are cached queries, minimal impact expected.
- **Responsive Design:** Card layout will adapt for mobile with stack wrap.
- **Empty States:** If no status or stacks, those sections will be hidden gracefully.
- **No Emojis:** Only Lucide icons and tech stack logos will be used.
