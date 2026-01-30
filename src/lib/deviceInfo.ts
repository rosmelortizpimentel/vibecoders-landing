export interface DeviceInfo {
  user_agent: string;
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  timezone: string;
  language: string;
  screen_width: number;
  screen_height: number;
  viewport_width: number;
  viewport_height: number;
  referrer: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

function parseUserAgent(ua: string): {
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
} {
  let browser_name = 'Unknown';
  let browser_version = '';
  let os_name = 'Unknown';
  let os_version = '';
  let device_type: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  // Detect browser
  if (ua.includes('Firefox/')) {
    browser_name = 'Firefox';
    browser_version = ua.match(/Firefox\/(\d+(\.\d+)?)/)?.[1] || '';
  } else if (ua.includes('Edg/')) {
    browser_name = 'Edge';
    browser_version = ua.match(/Edg\/(\d+(\.\d+)?)/)?.[1] || '';
  } else if (ua.includes('Chrome/')) {
    browser_name = 'Chrome';
    browser_version = ua.match(/Chrome\/(\d+(\.\d+)?)/)?.[1] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser_name = 'Safari';
    browser_version = ua.match(/Version\/(\d+(\.\d+)?)/)?.[1] || '';
  }

  // Detect OS
  if (ua.includes('Windows NT')) {
    os_name = 'Windows';
    const ntVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1];
    if (ntVersion === '10.0') os_version = '10/11';
    else if (ntVersion === '6.3') os_version = '8.1';
    else if (ntVersion === '6.2') os_version = '8';
    else if (ntVersion === '6.1') os_version = '7';
    else os_version = ntVersion || '';
  } else if (ua.includes('Mac OS X')) {
    os_name = 'macOS';
    os_version = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (ua.includes('Linux')) {
    os_name = 'Linux';
  } else if (ua.includes('Android')) {
    os_name = 'Android';
    os_version = ua.match(/Android (\d+(\.\d+)?)/)?.[1] || '';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os_name = 'iOS';
    os_version = ua.match(/OS (\d+[_]\d+)/)?.[1]?.replace(/_/g, '.') || '';
  }

  // Detect device type
  if (ua.includes('Mobile') || ua.includes('Android') && !ua.includes('Tablet')) {
    device_type = 'mobile';
  } else if (ua.includes('iPad') || ua.includes('Tablet')) {
    device_type = 'tablet';
  }

  return { browser_name, browser_version, os_name, os_version, device_type };
}

function getUtmParams(): { utm_source: string | null; utm_medium: string | null; utm_campaign: string | null } {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  };
}

export function collectDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  const parsed = parseUserAgent(ua);
  const utmParams = getUtmParams();

  return {
    user_agent: ua,
    ...parsed,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    screen_width: screen.width,
    screen_height: screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    referrer: document.referrer,
    ...utmParams,
  };
}
