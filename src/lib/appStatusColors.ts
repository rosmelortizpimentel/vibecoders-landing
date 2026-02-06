/**
 * Premium color palette for app status badges
 * Consistent styling across all components
 */

export interface StatusColors {
  bg: string;
  text: string;
  dot: string;
}

/**
 * Get premium colors for an app status based on slug
 * - Live/Active: Emerald green (premium)
 * - Building: Matte turquoise
 * - Others: Neutral gray
 */
export function getStatusColors(slug: string | undefined): StatusColors {
  switch (slug) {
    case 'live':
    case 'active':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
      };
    case 'building':
    case 'development':
    case 'in-progress':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        dot: 'bg-teal-500',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        dot: 'bg-gray-400',
      };
  }
}
