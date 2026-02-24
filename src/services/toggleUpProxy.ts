import { supabase } from "@/integrations/supabase/client";

// This service proxies all ToggleUp operations through
// Vibecoders' secure Edge Function (toggleup-proxy).
// The proxy handles:
//   - JWT validation
//   - Vibecoders app → ToggleUp project mapping (with auto-creation)
//   - Ownership verification (users can only access their own data)

export const ToggleUpProxyService = {
  
  /**
   * Gets all popups/banners for a Vibecoders app.
   * The proxy resolves the ToggleUp project_id from the mapping.
   */
  async getPopups(vibecodersAppId: string, appName?: string, appDomain?: string) {
    const { data, error } = await supabase.functions.invoke('toggleup-proxy', {
      body: { action: 'get_popups', payload: { vibecodersAppId, appName, appDomain } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return {
      popups: data.popups || [],
      projectId: data.projectId,
      api_key: data.api_key
    };
  },

  /**
   * Creates a new popup/banner for a Vibecoders app.
   * Auto-creates the ToggleUp project on first use.
   */
  async createPopup(vibecodersAppId: string, popupData: Record<string, unknown>, appName?: string, appDomain?: string) {
    const { data, error } = await supabase.functions.invoke('toggleup-proxy', {
      body: { action: 'create_popup', payload: { vibecodersAppId, appName, appDomain, popupData } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return { popup: data.popup, api_key: data.api_key };
  },

  /**
   * Updates an existing popup/banner.
   * The proxy verifies the user owns it before allowing the update.
   */
  async updatePopup(popupId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke('toggleup-proxy', {
      body: { action: 'update_popup', payload: { popupId, updates } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.popup;
  },

  /**
   * Deletes a popup/banner after verifying ownership.
   */
  async deletePopup(popupId: string) {
    const { data, error } = await supabase.functions.invoke('toggleup-proxy', {
      body: { action: 'delete_popup', payload: { popupId } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  },

  /**
   * Gets branding configuration for a Vibecoders app.
   */
  async getBranding(vibecodersAppId: string) {
    const { data, error } = await supabase.functions.invoke('toggleup-proxy', {
      body: { action: 'get_branding', payload: { vibecodersAppId } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  },

  /**
   * Updates branding configuration for a Vibecoders app.
   */
  async updateBranding(vibecodersAppId: string, branding: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke('toggleup-proxy', {
      body: { action: 'update_branding', payload: { vibecodersAppId, branding } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }
};
