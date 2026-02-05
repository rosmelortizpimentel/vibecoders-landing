 import { useEffect, useRef } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { generateDeviceFingerprint, getDeviceType } from '@/lib/deviceFingerprint';
 
 export function useProfileTracking(profileId: string | null) {
   const hasTracked = useRef(false);
 
   useEffect(() => {
     if (!profileId || hasTracked.current) return;
 
     const trackView = async () => {
       try {
         const fingerprint = await generateDeviceFingerprint();
         const deviceType = getDeviceType();
 
         await supabase.functions.invoke('track-profile-view', {
           body: {
             profile_id: profileId,
             device_fingerprint: fingerprint,
             device_type: deviceType,
             referrer: document.referrer || null,
           },
         });
 
         hasTracked.current = true;
       } catch (error) {
         console.error('Error tracking profile view:', error);
       }
     };
 
     trackView();
   }, [profileId]);
 }
 
 export async function trackAppClick(appId: string, profileId: string) {
   try {
     const fingerprint = await generateDeviceFingerprint();
 
     await supabase.functions.invoke('track-app-click', {
       body: {
         app_id: appId,
         profile_id: profileId,
         device_fingerprint: fingerprint,
       },
     });
   } catch (error) {
     console.error('Error tracking app click:', error);
   }
 }