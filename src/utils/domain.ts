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
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return parts.length >= 2 ? parts[0] : null;
    }
  
    return parts.length >= 3 ? parts[0] : null;
  };
  
  export const detectedSubdomain = getSubdomain(window.location.hostname);
