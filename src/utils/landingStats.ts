import { supabase } from "@/integrations/supabase/client";

/**
 * Public function to fetch landing page statistics calling the Supabase Edge Function.
 * Returns null if the request fails, allowing the UI to hide the section.
 * 
 * @returns Object containing totalBuilders, spotsLeft, and totalApps OR null on error
 */
export const getLandingStats = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('get-landing-stats');
    
    if (error) {
      console.error("Supabase Function Error:", error);
      return null;
    }

    // Validate data structure
    if (!data || typeof data.totalApps === 'undefined') {
      return null;
    }

    return {
      totalBuilders: data.totalBuilders || 0,
      spotsLeft: data.spotsLeft || 0,
      totalApps: data.totalApps || 0
    };
  } catch (error) {
    console.error("Error fetching landing stats:", error);
    return null;
  }
};
