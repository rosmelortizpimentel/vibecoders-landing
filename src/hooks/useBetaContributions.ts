import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PublicApp } from './usePublicProfile';

export interface BetaContribution {
  id: string;
  app_id: string;
  joined_at: string;
  feedback_count: number;
  app: PublicApp;
}

export function useBetaContributions(userId: string | undefined) {
  const [contributions, setContributions] = useState<BetaContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchContributions = async () => {
      try {
        // 1. Fetch beta testers with app details (excluding category relation that fails)
        const { data, error } = await supabase
          .from('beta_testers')
          .select(`
            id,
            app_id,
            joined_at,
            feedback_count,
            app:apps!beta_testers_app_id_fkey(
              id,
              name,
              tagline,
              description,
              logo_url,
              url,
              is_verified,
              hours_ideation,
              hours_building,
              screenshots,
              category_id,
              status:app_statuses(name, slug),
              stacks:app_stacks(
                stack:tech_stacks(id, name, logo_url)
              ),
              owner:profiles!apps_user_id_fkey(
                id,
                username,
                full_name:name,
                avatar_url,
                tagline
              )
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'accepted')
          .order('joined_at', { ascending: false });

        if (error) {
          console.error('Error fetching beta contributions:', error);
          throw error;
        }

        // 2. Fetch categories separately
        const { data: categories } = await supabase
          .from('app_categories')
          .select('id, name, slug');
        
        // Transform the data to match the expected structure
        const transformedData = data?.map(item => {
          const appData = item.app as any;
          
          // Find category manually
          const category = appData.category_id && categories 
            ? categories.find(c => c.id === appData.category_id)
            : null;

          return {
            ...item,
            app: {
              ...appData,
              category: category ? { name: category.name, slug: category.slug } : null,
              stacks: appData.stacks.map((s: any) => ({
                id: s.stack.id,
                name: s.stack.name,
                logo_url: s.stack.logo_url
              })),
              owner: appData.owner ? {
                id: appData.owner.id,
                username: appData.owner.username,
                full_name: appData.owner.full_name,
                avatar_url: appData.owner.avatar_url,
                tagline: appData.owner.tagline
              } : undefined
            }
          };
        });
        
        setContributions((transformedData || []) as unknown as BetaContribution[]);
      } catch (err) {
        console.error('Error fetching beta contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [userId]);

  return { contributions, loading };
}