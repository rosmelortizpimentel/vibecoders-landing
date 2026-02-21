export const isCustomDomain = (hostname: string) => {
    // Definimos los dominios base donde corre la aplicación principal
    const baseDomains = [
      'vibecoders.la',
      'localhost',
      '127.0.0.1',
      // Agregar otros dominios base si hay entornos de staging, etc.
    ];
  
    // Si el hostname actual NO termina en ninguno de los dominios base,
    // significa que es un dominio completamente personalizado.
    return !baseDomains.some(base => hostname === base || hostname.endsWith(`.${base}`));
  };
  
  export const getSubdomain = (hostname: string) => {
    if (isCustomDomain(hostname)) return null;
  
    const parts = hostname.split('.');
    let subdomain = null;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      subdomain = parts.length >= 2 ? parts[0] : null;
    } else {
      subdomain = parts.length >= 3 ? parts[0] : null;
    }
    
    // Ignore 'www' as a subdomain
    return subdomain === 'www' ? null : subdomain;
  };
  
  export const detectedSubdomain = getSubdomain(window.location.hostname);
