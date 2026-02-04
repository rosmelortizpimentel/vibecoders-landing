import { useEffect, useRef } from 'react';

/**
 * Hook to dynamically change the browser favicon.
 * Restores the original favicon when the component unmounts.
 * 
 * @param faviconUrl - The URL to use as favicon. If undefined, no change is made.
 */
export function useFavicon(faviconUrl: string | undefined) {
  const originalFaviconRef = useRef<string | null>(null);

  useEffect(() => {
    // If no favicon URL provided, don't change anything
    if (!faviconUrl) return;

    // Find the existing favicon link element
    const faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    
    if (!faviconLink) return;

    // Store the original favicon URL (only on first run)
    if (originalFaviconRef.current === null) {
      originalFaviconRef.current = faviconLink.href;
    }

    // Update to the new favicon
    faviconLink.href = faviconUrl;

    // Cleanup: restore original favicon when component unmounts
    return () => {
      if (originalFaviconRef.current && faviconLink) {
        faviconLink.href = originalFaviconRef.current;
      }
    };
  }, [faviconUrl]);
}
