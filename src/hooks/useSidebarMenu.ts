import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard, Bell, User, Lightbulb, Map, BookOpen,
  Users, FlaskConical, Rocket, Globe, Wrench, MessageSquare, Crown,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Bell, User, Lightbulb, Map, BookOpen,
  Users, FlaskConical, Rocket, Globe, Wrench, MessageSquare, Crown,
};

export interface SidebarMenuItem {
  key: string;
  labelKey: string;
  path: string;
  icon: LucideIcon;
  section: string;
  displayOrder: number;
  requiresWaitlist: boolean;
  cssClass: string | null;
}

export function useSidebarMenu() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['sidebar-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sidebar_menu_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data ?? []).map((item) => ({
        key: item.key,
        labelKey: item.label_key,
        path: item.path,
        icon: ICON_MAP[item.icon] || LayoutDashboard,
        section: item.section,
        displayOrder: item.display_order,
        requiresWaitlist: item.requires_waitlist,
        cssClass: item.css_class,
      })) as SidebarMenuItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  return { items, isLoading };
}
