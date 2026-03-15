import { useState, useCallback, useEffect } from 'react';
import type { FairScreen, AvatarConfig, Workshop } from './types';
import { STAND_COLORS, LOCALSTORAGE_KEYS } from './constants';
import { useDeviceId } from './hooks/useDeviceId';
import { useWorkshops } from './hooks/useWorkshops';
import { useStandVisits } from './hooks/useStandVisits';
import { useBadges } from './hooks/useBadges';
import { usePresence } from './hooks/usePresence';
import { upsertVisitor, upsertPresence } from './supabaseEvents';
import { CharacterCreator } from './components/CharacterCreator';
import { FairWorld } from './components/FairWorld';
import { SpeakerRoom } from './components/SpeakerRoom';
import { FairToastContainer, fairToast } from './components/ui/Toast';
import { BadgeModal } from './components/ui/BadgeModal';

export default function EventsPage() {
  const { deviceId, savedName, savedAvatar, createDevice, hasExisting } = useDeviceId();
  const { workshops, loading } = useWorkshops();
  const { visitedIds, visit } = useStandVisits(deviceId);
  const { pendingBadge, checkBadges, dismissBadge } = useBadges();

  const [screen, setScreen] = useState<FairScreen>(hasExisting ? 'world' : 'creator');
  const [activeStandIndex, setActiveStandIndex] = useState<number | null>(null);
  const [currentName, setCurrentName] = useState(savedName || '');
  const [currentAvatar, setCurrentAvatar] = useState<AvatarConfig>(
    savedAvatar || { hoodie: '#FFD700', glasses: 'pixel', hat: 'none', gender: 'm' }
  );

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const currentStandId = activeStandIndex !== null && workshops[activeStandIndex]
    ? workshops[activeStandIndex].id
    : null;

  const { remotePlayers, publishPosition, joinedName, clearJoined } = usePresence(
    screen === 'world' || screen === 'speaker' ? deviceId : null,
    currentName,
    currentAvatar,
    currentStandId,
  );

  // Show join toast
  useEffect(() => {
    if (joinedName) {
      fairToast(`${joinedName} joined the fair`);
      clearJoined();
    }
  }, [joinedName, clearJoined]);

  const handleEnterFair = useCallback(async (name: string, avatar: AvatarConfig) => {
    let id = deviceId;
    if (!id) {
      id = createDevice(name, avatar);
    } else {
      localStorage.setItem(LOCALSTORAGE_KEYS.visitorName, name);
      localStorage.setItem(LOCALSTORAGE_KEYS.avatar, JSON.stringify(avatar));
    }
    setCurrentName(name);
    setCurrentAvatar(avatar);
    await upsertVisitor(id, name, avatar);
    await upsertPresence({ device_id: id, name, avatar, pos_x: 0, pos_z: 0, heading: 0, current_stand_id: null });
    setScreen('world');
  }, [deviceId, createDevice]);

  const handleContinue = useCallback(async () => {
    if (deviceId && savedName && savedAvatar) {
      setCurrentName(savedName);
      setCurrentAvatar(savedAvatar);
      await upsertPresence({ device_id: deviceId, name: savedName, avatar: savedAvatar, pos_x: 0, pos_z: 0, heading: 0, current_stand_id: null });
      setScreen('world');
    }
  }, [deviceId, savedName, savedAvatar]);

  const handleEnterStand = useCallback((index: number) => {
    if (index >= 0 && index < workshops.length) {
      setActiveStandIndex(index);
      setScreen('speaker');
    }
  }, [workshops]);

  const handleEditAvatar = useCallback(() => {
    setScreen('creator');
  }, []);

  const handleCloseStand = useCallback(async () => {
    if (activeStandIndex !== null && workshops[activeStandIndex]) {
      const workshopId = workshops[activeStandIndex].id;
      await visit(workshopId);

      const newVisitedCount = visitedIds.includes(workshopId) ? visitedIds.length : visitedIds.length + 1;
      const steps = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.steps) || '0', 10);
      checkBadges(newVisitedCount, workshops.length, steps);

      // Notification toasts
      if (newVisitedCount === 1 && !visitedIds.includes(workshopId)) {
        fairToast('First stand visited! Keep exploring.');
      } else if (newVisitedCount === Math.ceil(workshops.length / 2)) {
        fairToast(`Halfway there! ${workshops.length - newVisitedCount} more stands.`);
      } else if (newVisitedCount === workshops.length) {
        fairToast('You visited the whole fair! Vibecoder complete.');
      }
    }
    setActiveStandIndex(null);
    setScreen('world');
  }, [activeStandIndex, workshops, visit, visitedIds, checkBadges]);

  // ESC to close speaker room
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'speaker') {
        handleCloseStand();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, handleCloseStand]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-[#475DFF] rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading the fair...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-dvh overflow-hidden" style={{ background: '#F8FAFC' }}>
      {/* Toast container */}
      <FairToastContainer />

      {/* Badge celebration modal */}
      {pendingBadge && <BadgeModal badge={pendingBadge} onDismiss={dismissBadge} />}

      {/* Character Creator */}
      {screen === 'creator' && (
        <CharacterCreator
          onEnter={handleEnterFair}
          existingName={currentName || savedName}
          existingAvatar={currentAvatar || savedAvatar}
          onContinue={(hasExisting || currentName) ? handleContinue : undefined}
        />
      )}

      {/* 3D World */}
      {(screen === 'world' || screen === 'speaker') && (
        <FairWorld
          workshops={workshops}
          avatar={currentAvatar}
          name={currentName}
          deviceId={deviceId || ''}
          visitedIds={visitedIds}
          remotePlayers={remotePlayers}
          onPublishPosition={publishPosition}
          onEnterStand={handleEnterStand}
          onEditAvatar={handleEditAvatar}
          isMobile={isMobile}
        />
      )}

      {/* Speaker Room overlay */}
      {screen === 'speaker' && activeStandIndex !== null && workshops[activeStandIndex] && (
        <SpeakerRoom
          workshop={workshops[activeStandIndex]}
          color={STAND_COLORS[activeStandIndex % STAND_COLORS.length]}
          isVisited={visitedIds.includes(workshops[activeStandIndex].id)}
          onClose={handleCloseStand}
          isMobile={isMobile}
          visitors={Array.from(remotePlayers.values()).filter(
            (p) => p.current_stand_id === workshops[activeStandIndex].id
          )}
        />
      )}

      {/* Global animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
