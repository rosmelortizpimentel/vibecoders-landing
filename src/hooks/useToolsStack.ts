import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Tool {
  id: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  website_url: string;
  category: string;
  pricing_model: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

async function fetchTools(): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('tools_library')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as Tool[]) || [];
}

export function useToolsStack() {
  return useQuery({
    queryKey: ['tools-stack'],
    queryFn: fetchTools,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get unique categories from tools
export function getCategories(tools: Tool[]): string[] {
  const categories = new Set(tools.map(t => t.category));
  return ['Todos', ...Array.from(categories).sort()];
}
