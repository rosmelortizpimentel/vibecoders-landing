 /**
  * Generates a simple device fingerprint for anonymous tracking.
  * Uses a hash of basic device characteristics.
  */
 export async function generateDeviceFingerprint(): Promise<string> {
   const components = [
     navigator.userAgent,
     Intl.DateTimeFormat().resolvedOptions().timeZone,
     navigator.language,
     `${screen.width}x${screen.height}`,
     screen.colorDepth?.toString() || '',
     navigator.hardwareConcurrency?.toString() || '',
   ];
 
   const fingerprint = components.join('|');
   
   // Create a simple hash using SubtleCrypto
   const encoder = new TextEncoder();
   const data = encoder.encode(fingerprint);
   const hashBuffer = await crypto.subtle.digest('SHA-256', data);
   const hashArray = Array.from(new Uint8Array(hashBuffer));
   const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
   
   return hashHex.substring(0, 32); // Return first 32 chars for brevity
 }
 
 /**
  * Get device type based on screen size and user agent
  */
 export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
   const ua = navigator.userAgent.toLowerCase();
   const width = window.innerWidth;
   
   if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
     return 'mobile';
   }
   if (/ipad|tablet|playbook|silk/i.test(ua) || (width >= 768 && width < 1024)) {
     return 'tablet';
   }
   return 'desktop';
 }