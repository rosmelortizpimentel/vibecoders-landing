/**
 * Shared utility for URL validation in edge functions
 * Helps prevent SSRF by blocking private/internal IP ranges
 */

export function isSafeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow http and https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // Block common loopback/internal hostnames
    const internalHostnames = ['localhost', '127.0.0.1', '[::1]', '0.0.0.0'];
    if (internalHostnames.includes(hostname)) {
      return false;
    }

    // IP validation for private ranges
    // This is a basic check. In production, resolving DNS and checking IPs is more robust.
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      
      // 10.0.0.0/8
      if (parts[0] === 10) return false;
      
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
      
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return false;
      
      // 169.254.0.0/16 (Link-local/AWS Metadata)
      if (parts[0] === 169 && parts[1] === 254) return false;
      
      // 127.0.0.1/8
      if (parts[0] === 127) return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}
