import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAudioAnalyser } from '../hooks/useAudioAnalyser';
import { SheepModel } from './sheep/SheepModel';
import { BRAND } from '../constants';
import type { Workshop, AvatarConfig, RemotePlayer } from '../types';
import { format } from 'date-fns';
import { fairT } from '../i18n';

interface SpeakerRoomProps {
  workshop: Workshop;
  color: string;
  isVisited: boolean;
  onClose: () => void;
  isMobile: boolean;
  visitors?: RemotePlayer[];
}

const TIMEZONE_LIST = [
  { flag: '\u{1F1FA}\u{1F1F8}', label: 'NY', tz: 'America/New_York' },
  { flag: '\u{1F1F2}\u{1F1FD}', label: 'MX', tz: 'America/Mexico_City' },
  { flag: '\u{1F1E8}\u{1F1F4}', label: 'CO', tz: 'America/Bogota' },
  { flag: '\u{1F1E6}\u{1F1F7}', label: 'AR', tz: 'America/Argentina/Buenos_Aires' },
  { flag: '\u{1F1E7}\u{1F1F7}', label: 'BR', tz: 'America/Sao_Paulo' },
  { flag: '\u{1F1EA}\u{1F1F8}', label: 'ES', tz: 'Europe/Madrid' },
];

function formatInTz(dateStr: string, tz: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '--:--';
  }
}

export function SpeakerRoom({ workshop, color, isVisited, onClose, isMobile, visitors = [] }: SpeakerRoomProps) {
  const { isPlaying, progress, duration, volume, frequencies, togglePlay, seek } = useAudioAnalyser(workshop.audio_url);

  const speakerAvatar: AvatarConfig = useMemo(() => ({
    hoodie: color,
    glasses: 'none',
    hat: 'none',
    gender: 'm',
  }), [color]);

  const speakerName = workshop.speakers.map((s) => s.display_name).join(', ') || 'TBA';
  const speakerTagline = workshop.speakers[0]?.tagline || '';

  const formattedDate = useMemo(() => {
    try {
      return format(new Date(workshop.scheduled_at), 'MMM dd, yyyy');
    } catch {
      return workshop.scheduled_at;
    }
  }, [workshop.scheduled_at]);

  const freqBars = useMemo(() => {
    const bars: number[] = [];
    const step = Math.max(1, Math.floor(frequencies.length / 24));
    for (let i = 0; i < 24; i++) {
      bars.push((frequencies[i * step] || 0) / 255);
    }
    return bars;
  }, [frequencies]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: 'rgba(248,250,252,0.97)' }}>
      <div className={`w-full h-full max-w-6xl mx-auto flex ${isMobile ? 'flex-col' : 'flex-row'} gap-0 overflow-y-auto`}>
        {/* Left column — Speaker */}
        <div className={`${isMobile ? 'h-[40vh] min-h-[320px]' : 'w-1/2 h-full'} flex flex-col items-center justify-center p-4 relative`}>
          {/* 3D Speaker sheep — camera pulled back and up so full body is visible */}
          <div className="w-full flex-1 min-h-[220px]">
            <Canvas camera={{ position: [0, 1.2, 4.5], fov: 28 }} dpr={[1, 1.5]}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[3, 5, 3]} intensity={1.4} />
              <spotLight position={[0, 3, 1]} intensity={0.6} color={color} angle={0.5} penumbra={0.5} />
              <Suspense fallback={null}>
                <SheepModel
                  avatar={speakerAvatar}
                  position={[0, -0.3, 0]}
                  scale={1.2}
                  showName={false}
                  isSpeaker
                  speakerVolume={volume}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Waveform */}
          <div className="w-full max-w-sm h-10 flex items-end justify-center gap-[2px] mb-2">
            {freqBars.map((v, i) => (
              <div
                key={i}
                className="w-[5px] rounded-t-sm transition-all duration-75"
                style={{
                  height: `${Math.max(3, v * 40)}px`,
                  backgroundColor: color,
                  opacity: 0.5 + v * 0.5,
                }}
              />
            ))}
          </div>

          {/* Audio controls */}
          {workshop.audio_url ? (
            <div className="flex items-center gap-4 w-full max-w-sm">
              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold transition-transform hover:scale-105 active:scale-95 shrink-0"
                style={{ background: color }}
              >
                {isPlaying ? 'II' : '>'}
              </button>
              <div className="flex-1">
                <div
                  className="w-full h-2 rounded-full cursor-pointer relative overflow-hidden"
                  style={{ background: '#E2E8F0' }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    seek(pct * duration);
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{ width: `${duration ? (progress / duration) * 100 : 0}%`, background: color }}
                  />
                </div>
                <div className="flex justify-between text-slate-400 text-[10px] mt-1">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">{fairT('speaker.talk_soon')}</p>
          )}
        </div>

        {/* Right column — Info */}
        <div className={`${isMobile ? 'flex-1' : 'w-1/2'} p-6 lg:p-10 flex flex-col justify-center overflow-y-auto`}>
          {/* Speaker photo */}
          {workshop.speakers[0]?.photo_url && (
            <img
              src={workshop.speakers[0].photo_url}
              alt={speakerName}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 mb-3 shadow-sm"
            />
          )}

          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">{speakerName}</h2>
          {speakerTagline && <p className="text-slate-500 text-sm mb-4">{speakerTagline}</p>}

          <h3 className="text-xl lg:text-2xl font-bold mb-2" style={{ color }}>{workshop.title}</h3>
          {workshop.tagline && <p className="text-slate-600 mb-4">{workshop.tagline}</p>}

          {/* Date */}
          <p className="text-slate-600 text-sm font-medium mb-2">{formattedDate}</p>
          {workshop.duration_minutes && <p className="text-slate-400 text-xs mb-3">{workshop.duration_minutes} min</p>}

          {/* Timezone grid with flags */}
          {workshop.scheduled_at && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {TIMEZONE_LIST.map((tz) => (
                <div key={tz.tz} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                  <span className="text-base leading-none">{tz.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium leading-tight">{tz.label}</span>
                    <span className="text-xs text-slate-700 font-semibold leading-tight">{formatInTz(workshop.scheduled_at, tz.tz)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {workshop.description && (
            <p className="text-slate-500 text-sm mb-5 leading-relaxed">{workshop.description}</p>
          )}

          <div className="h-px bg-slate-200 mb-5" />

          {/* Luma registration */}
          {workshop.luma_url ? (
            <a
              href={workshop.luma_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg mb-3"
              style={{ background: BRAND.accent }}
            >
              {fairT('speaker.register')}
            </a>
          ) : (
            <a
              href="https://luma.com/embed/calendar/cal-DuvaWovHvFhmaIk/events"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg mb-3"
              style={{ background: BRAND.accent }}
            >
              {fairT('speaker.view_events')}
            </a>
          )}

          {/* Premium visited badge */}
          {isVisited && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-3"
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
                borderColor: '#F59E0B',
              }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
                }}
              >
                V
              </span>
              <div className="flex flex-col">
                <span className="text-amber-800 text-sm font-bold tracking-wide">{fairT('speaker.visited_title')}</span>
                <span className="text-amber-600 text-[10px]">{fairT('speaker.visited_desc')}</span>
              </div>
            </div>
          )}

          {/* Live visitors in this stand */}
          {visitors.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <div className="flex -space-x-2 overflow-hidden">
                {visitors.slice(0, 6).map((v) => (
                  <div
                    key={v.device_id}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: v.avatar.hoodie }}
                    title={v.name}
                  >
                    {v.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {visitors.length > 6 && (
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                    +{visitors.length - 6}
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-500 ml-1">
                {visitors.length} {visitors.length === 1 ? 'visitor' : 'visitors'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed bottom-6 left-6 z-[90] bg-white shadow-md text-slate-700 px-5 py-3 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-all"
      >
        {fairT('speaker.back')}
      </button>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
