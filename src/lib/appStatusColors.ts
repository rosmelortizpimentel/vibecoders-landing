/**
 * Premium color palette for app status badges
 * Consistent styling across all components
 */

export interface StatusColors {
  bg: string;
  text: string;
  dot: string;
  border: string;
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
        bg: 'bg-emerald-100/80',
        text: 'text-emerald-800',
        dot: 'bg-emerald-600',
        border: 'border-emerald-200',
      };
    case 'building':
    case 'development':
    case 'in-progress':
      return {
        bg: 'bg-blue-100/80',
        text: 'text-blue-800',
        dot: 'bg-blue-600',
        border: 'border-blue-200',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        dot: 'bg-gray-500',
        border: 'border-gray-200',
      };
  }
}
