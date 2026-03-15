import { useRef, useCallback, useEffect, useState } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

export function VirtualJoystick({ onMove }: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const originRef = useRef({ x: 0, y: 0 });
  const radius = 50;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    originRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setActive(true);
    handleMove(clientX, clientY);
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!active && !originRef.current.x) return;
    const dx = clientX - originRef.current.x;
    const dy = clientY - originRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, radius);
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * clamped;
    const ny = Math.sin(angle) * clamped;
    setKnobPos({ x: nx, y: ny });
    onMove(nx / radius, ny / radius);
  }, [active, onMove]);

  const handleEnd = useCallback(() => {
    setActive(false);
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove]);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!active) return;
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handleEnd();
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [active, handleMove, handleEnd]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 left-8 z-50 md:hidden"
      style={{ width: radius * 2 + 20, height: radius * 2 + 20 }}
      onTouchStart={(e) => {
        e.preventDefault();
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
    >
      {/* Base */}
      <div
        className="absolute rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm"
        style={{
          width: radius * 2,
          height: radius * 2,
          left: 10,
          top: 10,
        }}
      />
      {/* Knob */}
      <div
        className="absolute rounded-full bg-white/30 backdrop-blur-sm border border-white/40"
        style={{
          width: 40,
          height: 40,
          left: 10 + radius - 20 + knobPos.x,
          top: 10 + radius - 20 + knobPos.y,
          transition: active ? 'none' : 'all 0.2s ease-out',
        }}
      />
    </div>
  );
}
