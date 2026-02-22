import { useEffect } from 'react';
import { useProfileEditor } from '@/hooks/useProfileEditor';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useProfileEditor();

  useEffect(() => {
    if (loading) return;

    // Load Clarity only if the user has explicitly allowed analytics
    const shouldLoadAnalytics = profile?.allow_analytics === true;

    if (shouldLoadAnalytics) {
      // 1. Load Microsoft Clarity
      if (!(window as any).clarity) {
        (function (c: any, l: any, a: string, r: string, i: string, t?: any, y?: any) {
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
          t = l.createElement(r);
          t.async = 1;
          t.src = "https://www.clarity.ms/tag/" + i;
          y = l.getElementsByTagName(r)[0];
          y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", "v9sjcnt588");
      }

      // 2. Load Google Tag (GA4)
      if (!document.getElementById('google-tag')) {
        const script = document.createElement('script');
        script.id = 'google-tag';
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-60QQ3NHG70";
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-60QQ3NHG70');
        `;
        document.head.appendChild(inlineScript);
      }
    }
  }, [profile?.allow_analytics, loading]);

  return <>{children}</>;
}
