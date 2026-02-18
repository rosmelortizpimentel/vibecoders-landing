

# Roadmap Board UI/UX Redesign + Roadmap Listing Fixes

## Overview
UI-only changes across two files: `RoadmapEditor.tsx` (board + configuration modal) and `Roadmap.tsx` (app listing page). No logic, data, or functionality changes.

---

## 1. Roadmap Board (`RoadmapEditor.tsx`)

### Header Changes
- **Remove** the "Agregar Carril" (`Plus` + `addLane`) button from the top header bar (lines 497-508)
- The top bar keeps: Back, Title, Preview, Feedback, Settings only

### Add Lane Button -- Inline at End of Columns
- After the last `SortableLaneWrapper` in the horizontal desktop lane list (line 594), add a **circular icon button** with:
  - `Plus` icon (already imported)
  - Dashed border (`border-dashed border-2`)
  - Same height alignment as columns (aligned to top)
  - `w-10 h-10 rounded-full` sizing
  - Clicking opens the lane creation modal (same existing handler)

### Add Card Button in Column Headers
- In each desktop lane header (line 533-557), add a small `Plus` icon button (`h-6 w-6`) to the right side of the header row, between the card count and the `MoreVertical` menu
- This button triggers `setAddingCardToLane(lane.id)` with empty form
- The existing "Agregar Tarjeta" button at the bottom of each lane (line 580-590) stays but changes to **dashed border style**: `variant="outline"` with added `border-dashed` class

### Mobile lanes -- Same pattern
- Add a `Plus` icon in each collapsible lane header for adding cards
- Bottom "Add Card" button gets dashed border style
- Add a dashed circular add-lane button at the bottom of the stacked lanes list

---

## 2. Configuration Modal Redesign (`RoadmapEditor.tsx`)

### Move "Publico" toggle to top
- Currently at line 806-809, move it to be the **first element** in the modal content
- Give it a visually distinct row with conditional background:
  - `bg-green-50 dark:bg-green-950/30` when enabled
  - `bg-muted/50` when disabled
  - Rounded container with padding
- Add a subtitle below the label:
  - When ON: "Cualquiera con el link puede verlo"
  - When OFF: "Solo tu puedes verlo"

### Uppercase small labels
- All field labels (`Label` components) in the settings modal get `text-xs uppercase tracking-wider font-medium text-muted-foreground` styling
- Applies to: Titulo Personalizado, Fuente, URL del Favicon

### Field order after toggle
1. Publico toggle (with colored row)
2. Titulo Personalizado
3. Fuente
4. URL del Favicon

---

## 3. Roadmap Listing Page (`Roadmap.tsx`)

### Unverified apps -- Active verify button
- Remove `opacity-50` from unverified app cards (line 39) -- the cards should look active/clickable
- Keep the visual distinction via the section header and lack of "Verificada" badge

### Public profile link
- Add a small link/button on each verified app card to view the public roadmap page (`/roadmap/:appSlug`)
- Use the `ExternalLink` icon (already imported as `ArrowRight`) or add `Eye` icon
- This opens in a new tab

---

## Technical Details

### Files to modify:
1. **`src/pages/RoadmapEditor.tsx`** -- Board layout changes, modal restructure
2. **`src/pages/Roadmap.tsx`** -- Remove opacity, add public link
3. **`src/i18n/en/roadmap.json`** (and es/fr/pt) -- Add subtitle keys for public toggle

### No new dependencies or components needed
All icons (`Plus`, `Eye`, `ExternalLink`) are already imported. All UI components already in use.

