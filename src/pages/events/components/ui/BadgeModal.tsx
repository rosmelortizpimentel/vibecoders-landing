import { useEffect, useState } from 'react';
import type { BadgeType } from '../../types';

interface BadgeModalProps {
  badge: BadgeType;
  onDismiss: () => void;
}

export function BadgeModal({ badge, onDismiss }: BadgeModalProps) {
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    const colors = ['#475DFF', '#68D391', '#FFD700', '#E85D9A', '#A855F7', '#E05C30'];
    const items = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[i % colors.length],
      delay: Math.random() * 0.5,
    }));
    setConfetti(items);
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-md">
      {/* Confetti */}
      {confetti.map((c, i) => (
        <div
          key={i}
          className="absolute w-2 h-3 rounded-sm"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            backgroundColor: c.color,
            animation: `confettiFall 2.5s ${c.delay}s ease-in forwards`,
          }}
        />
      ))}

      {/* Badge content */}
      <div className="text-center animate-[bounceIn_0.5s_ease-out] bg-white rounded-2xl shadow-xl px-10 py-8 border border-slate-100">
        <div className="w-16 h-16 rounded-full bg-[#475DFF] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">{badge.icon}</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{badge.name}</h2>
        <p className="text-slate-500 text-base">{badge.description}</p>
      </div>
    </div>
  );
}
