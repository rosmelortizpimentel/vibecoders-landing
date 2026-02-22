import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TechStack {
  id: string;
  name: string;
  logo_url: string;
  tags: string[];
  display_order: number;
  website_url: string | null;
  referral_url: string | null;
  referral_param: string | null;
  default_referral_code: string | null;
}

// Build referral URL for a tech stack with optional custom code
export function buildStackReferralUrl(
  stack: TechStack, 
  customCode?: string | null
): string | null {
  const code = customCode || stack.default_referral_code;
  
  // If there's a referral template and a code, use it
  if (stack.referral_url && code) {
    return stack.referral_url.replace('{code}', code);
  }
  // If there's a param and code, append to website URL
  if (stack.referral_param && code && stack.website_url) {
    try {
      const url = new URL(stack.website_url);
      url.searchParams.set(stack.referral_param, code);
      return url.toString();
    } catch {
      return stack.website_url;
    }
  }
  // Default to website URL (can be null)
  return stack.website_url;
}

export function useTechStacks() {
  const { data: stacks = [], isLoading: loading, error } = useQuery({
    queryKey: ['tech-stacks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tech_stacks')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data?.map(stack => ({
        ...stack,
        tags: Array.isArray(stack.tags) ? (stack.tags as string[]) : [],
      })) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const groupedStacks = useMemo(() => {
    const groups: Record<string, TechStack[]> = {
      'Frontend': [],
      'Backend': [],
      'Database': [],
      'Cloud': [],
      'Mobile': [],
      'AI/ML': [],
      'Vibe Coding': [],
    };

    stacks.forEach(stack => {
      const tags = stack.tags;
      if (tags.includes('vibe-coding')) {
        groups['Vibe Coding'].push(stack);
      } else if (tags.includes('ai') || tags.includes('ml') || tags.includes('llm')) {
        groups['AI/ML'].push(stack);
      } else if (tags.includes('mobile')) {
        groups['Mobile'].push(stack);
      } else if (tags.includes('cloud') || tags.includes('hosting')) {
        groups['Cloud'].push(stack);
      } else if (tags.includes('database') || tags.includes('cache') || tags.includes('baas')) {
        groups['Database'].push(stack);
      } else if (tags.includes('backend') || tags.includes('runtime')) {
        groups['Backend'].push(stack);
      } else if (tags.includes('frontend') || tags.includes('framework')) {
        groups['Frontend'].push(stack);
      }
    });

    return groups;
  }, [stacks]);

  return { 
    stacks, 
    groupedStacks, 
    loading, 
    error: error instanceof Error ? error : error ? new Error('Error al cargar tech stacks') : null 
  };
}
