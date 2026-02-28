export const getCountryCode = (countryNameOrCode: string): string | null => {
  if (!countryNameOrCode || countryNameOrCode === 'Unknown') return null;
  
  // If it's already a 2-letter code
  if (countryNameOrCode.length === 2) {
    return countryNameOrCode.toLowerCase();
  }

  // Common mapping for full names to codes
  const map: Record<string, string> = {
    'peru': 'pe',
    'united states': 'us',
    'canada': 'ca',
    'mexico': 'mx',
    'spain': 'es',
    'colombia': 'co',
    'argentina': 'ar',
    'chile': 'cl',
    'brazil': 'br',
    'united kingdom': 'gb',
    'germany': 'de',
    'france': 'fr',
    'italy': 'it',
    'australia': 'au',
    'japan': 'jp',
    'china': 'cn',
    'india': 'in',
    'russia': 'ru',
    'south korea': 'kr',
    'ecuador': 'ec',
    'venezuela': 've',
    'uruguay': 'uy',
    'paraguay': 'py',
    'bolivia': 'bo',
    'costa rica': 'cr',
    'panama': 'pa',
    'dominican republic': 'do',
    'guatemala': 'gt',
    'honduras': 'hn',
    'el salvador': 'sv',
    'nicaragua': 'ni',
    'cuba': 'cu',
    'puerto rico': 'pr'
  };

  const normalized = countryNameOrCode.toLowerCase().trim();
  return map[normalized] || null;
};
