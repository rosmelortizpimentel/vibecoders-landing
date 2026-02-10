import { supabase } from "@/integrations/supabase/client";

export const migrateGoogleAvatars = async () => {
  console.log("🚀 Starting avatar migration via Edge Function...");
  
  try {
    const { data, error } = await supabase.functions.invoke('migrate-google-avatars');

    if (error) throw error;
    
    console.log(`🏁 Migration finished. Success: ${data.successCount}, Failed: ${data.failCount}`);
    return { 
      success: true, 
      successCount: data.successCount || 0, 
      failCount: data.failCount || 0 
    };
  } catch (err) {
    console.error("🚨 Critical error during migration:", err);
    return { success: false, error: err };
  }
};
