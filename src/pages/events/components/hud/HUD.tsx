import { useState, useEffect } from 'react';
import { fetchOnlineCount } from '../../supabaseEvents';
import { BRAND } from '../../constants';
import { fairT } from '../../i18n';

interface HUDProps {
  steps: number;
  visitedCount: number;
  totalStands: number;
  isMobile: boolean;
}

const pill = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(8px)',
  color: '#0F172A',
  border: '1px solid rgba(0,0,0,0.06)',
} as const;

export function HUD({ steps, visitedCount, totalStands, isMobile }: HUDProps) {
  const [online, setOnline] = useState(1);

  useEffect(() => {
    fetchOnlineCount().then(setOnline);
    const interval = setInterval(() => {
      fetchOnlineCount().then(setOnline);
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top left pills */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
        <div className="px-4 py-2 rounded-full text-sm font-medium shadow-sm" style={pill}>
          {steps} {fairT('hud.steps')}
        </div>
        <div className="px-4 py-2 rounded-full text-sm font-medium shadow-sm" style={pill}>
          {visitedCount}/{totalStands} {fairT('hud.stands')}
        </div>
      </div>

      {/* Top right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2" style={pill}>
          <span className="w-2 h-2 rounded-full" style={{ background: BRAND.green }} />
          {online} {fairT('hud.online')}
        </div>
      </div>

      {/* Bottom center controls hint */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="px-4 py-2 rounded-full text-xs font-medium shadow-sm" style={{ ...pill, color: '#64748B' }}>
          {isMobile ? fairT('hud.move_mobile') : fairT('hud.move_desktop')}
        </div>
      </div>
    </>
  );
}
