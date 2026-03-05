import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

export interface SidebarMenuItem {
  id: string;
  key: string;
  labelKey: string;
  path: string;
  icon: LucideIcon;
  section: string;
  displayOrder: number;
  isActive: boolean;
  requiresWaitlist: boolean;
  requiredFeatureKey?: string | null;
  requiredRole?: string | null;
  cssClass?: string;
}

interface SidebarMenuItemRow {
  id: string;
  key: string;
  label_key: string;
  path: string;
  icon: string;
  section: string;
  display_order: number;
  is_active: boolean;
  requires_waitlist: boolean;
  required_feature_key?: string | null;
  required_role?: string | null;
  css_class?: string;
}

const mapItem = (item: SidebarMenuItemRow): SidebarMenuItem => {
  const IconComponent = (Icons as Record<string, unknown>)[item.icon] as LucideIcon || Icons.LayoutDashboard;
  return {
    id: item.id,
    key: item.key,
    labelKey: item.label_key,
    path: item.path,
    icon: IconComponent,
    section: item.section,
    displayOrder: item.display_order,
    isActive: item.is_active,
    requiresWaitlist: item.requires_waitlist,
    requiredFeatureKey: item.required_feature_key,
    requiredRole: item.required_role,
    cssClass: item.css_class,
  };
};

/** Centralized hook for all items - used for internal logic */
function useBaseSidebarMenu() {
  return useQuery({
    queryKey: ['sidebar-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sidebar_menu_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data ?? []).map(mapItem);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Returns only active menu items (for sidebar rendering) */
export function useSidebarMenu() {
  const { data: items = [], isLoading } = useBaseSidebarMenu();
  const activeItems = items.filter(item => item.isActive);
  return { items: activeItems, isLoading };
}

/** Returns ALL menu items (active + inactive) for route guarding */
export function useAllMenuItems() {
  const { data: items = [], isLoading } = useBaseSidebarMenu();
  return { items, isLoading };
}
