---
name: UI Components Reference
description: Documentation of reusable premium-related UI components and their locations to avoid redundant searches.
---

# UI Components Reference

This skill documents the reusable components used for premium features and upgrades across the Vibecoders platform.

## Core Components

### 1. `ProBadge`

- **Location**: [ProBadge.tsx](file:///d:/Projects/vibecoders.la/src/components/ui/ProBadge.tsx)
- **Purpose**: A small "PRO" badge (crown icon + text) to indicate premium status or locked features.
- **Usage Example**:
  ```tsx
  <ProBadge className="ml-2" />
  ```

### 2. `UpgradeBadge`

- **Location**: [UpgradeBadge.tsx](file:///d:/Projects/vibecoders.la/src/components/ui/UpgradeBadge.tsx)
- **Purpose**: A clickable badge that triggers the `PremiumComparisonModal`.
- **Usage Example**:
  ```tsx
  <UpgradeBadge className="ml-1" />
  ```

### 3. `PremiumComparisonModal`

- **Location**: [PremiumComparisonModal.tsx](file:///d:/Projects/vibecoders.la/src/components/ui/PremiumComparisonModal.tsx)
- **Purpose**: The main modal showing the pricing ladder and feature comparison. Triggered by `UpgradeBadge`.

## Usage Locations (Reference)

- **Profile Page**: [Settings.tsx](file:///d:/Projects/vibecoders.la/src/pages/Settings.tsx) (used in user info section)
- **Analytics Page**: [Analytics.tsx](file:///d:/Projects/vibecoders.la/src/pages/Analytics.tsx) (in header and premium overlays)
- **Sidebar**: [Sidebar.tsx](file:///d:/Projects/vibecoders.la/src/components/layout/Sidebar.tsx) (next to Analytics link)

## Rules for Implementation

1. **Consistency**: Always use `ProBadge` and `UpgradeBadge` together when prompting for an upgrade.
2. **Icons**: Use `Crown` from `lucide-react` for premium indicators if building custom elements.
3. **Text Colors**: Use `text-primary` for green highlighting (#22c55e) in premium contexts.
