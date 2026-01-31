import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TechStack {
  id: string;
  name: string;
  logo_url: string;
  tags: string[];
  display_order: number;
}

export function useTechStacks() {
  const [stacks, setStacks] = useState<TechStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStacks() {
      try {
        const { data, error } = await supabase
          .from('tech_stacks')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setStacks(data?.map(stack => ({
          ...stack,
          tags: Array.isArray(stack.tags) ? (stack.tags as string[]) : [],
        })) || []);
      } catch (err) {
        console.error('Error fetching tech stacks:', err);
        setError(err instanceof Error ? err : new Error('Error al cargar tech stacks'));
      } finally {
        setLoading(false);
      }
    }

    fetchStacks();
  }, []);

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

  return { stacks, groupedStacks, loading, error };
}
