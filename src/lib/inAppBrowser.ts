/**
 * Utility functions to detect and handle in-app browsers (WebViews)
 * that block Google OAuth authentication.
 */

export interface InAppBrowserInfo {
  isInAppBrowser: boolean;
  isIOS: boolean;
  browserName: string | null;
}

/**
 * Detects if the current browser is an in-app browser (WebView) on iOS
 * that would block Google OAuth.
 */
export function detectInAppBrowser(): InAppBrowserInfo {
  const ua = navigator.userAgent;
  
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isMobile = /Mobile/.test(ua);
  
  // Detect specific in-app browsers
  const isLinkedIn = /LinkedInApp/.test(ua);
  const isFacebook = /FBAN|FBAV/.test(ua);
  const isInstagram = /Instagram/.test(ua);
  const isTwitter = /Twitter/.test(ua);
  
  let browserName: string | null = null;
  if (isLinkedIn) browserName = 'LinkedIn';
  else if (isFacebook) browserName = 'Facebook';
  else if (isInstagram) browserName = 'Instagram';
  else if (isTwitter) browserName = 'Twitter';
  
  // Only flag as problematic on iOS with detected in-app browser
  const isInAppBrowser = isIOS && isMobile && browserName !== null;
  
  return {
    isInAppBrowser,
    isIOS,
    browserName,
  };
}

/**
 * Attempts to redirect the user to Safari using the x-safari- scheme.
 * This only works on iOS 17+.
 * 
 * @returns true if redirect was attempted, false otherwise
 */
export function redirectToSafari(): boolean {
  const currentUrl = window.location.href;
  
  // The x-safari- scheme opens the URL in Safari
  // Format: x-safari-https://example.com
  const safariUrl = `x-safari-${currentUrl}`;
  
  try {
    window.location.href = safariUrl;
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies the current URL to clipboard
 */
export async function copyCurrentUrlToClipboard(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Check if we should show the in-app browser warning.
 * We use sessionStorage to track if user dismissed the warning.
 */
export function shouldShowWarning(): boolean {
  const info = detectInAppBrowser();
  if (!info.isInAppBrowser) return false;
  
  // Check if user already dismissed the warning this session
  const dismissed = sessionStorage.getItem('inAppBrowserWarningDismissed');
  return dismissed !== 'true';
}

/**
 * Mark the warning as dismissed for this session
 */
export function dismissWarning(): void {
  sessionStorage.setItem('inAppBrowserWarningDismissed', 'true');
}
