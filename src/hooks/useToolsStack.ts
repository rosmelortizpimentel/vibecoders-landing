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
   referral_url: string | null;
   referral_param: string | null;
   default_referral_code: string | null;
}
 
 // Build the final referral URL from tool data
 export function buildReferralUrl(tool: Tool): string {
   // If there's a referral template and a code, use it
   if (tool.referral_url && tool.default_referral_code) {
     return tool.referral_url.replace('{code}', tool.default_referral_code);
   }
   // If there's a param and code, append to website URL
   if (tool.referral_param && tool.default_referral_code && tool.website_url) {
     try {
       const url = new URL(tool.website_url);
       url.searchParams.set(tool.referral_param, tool.default_referral_code);
       return url.toString();
     } catch {
       return tool.website_url;
     }
   }
   // Default to website URL
   return tool.website_url;
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
