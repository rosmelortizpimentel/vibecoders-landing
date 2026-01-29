import { useState, useEffect, useMemo } from 'react';
import { Folder, UserCheck, CheckCircle } from 'lucide-react';

type CardState = 'file' | 'transforming' | 'verified' | 'counting' | 'exploding';

interface ProfileFileCardProps {
  absorbedCount: number;
  totalLogos: number;
  className?: string;
  onExplosion?: () => void;
  onCountingComplete?: () => void;
}

interface RisingNumber {
  id: number;
  value: string;
  delay: number;
  xOffset: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

const COUNTING_DURATION = 4000; // 4s of numbers rising
const EXPLOSION_DURATION = 500; // 0.5s explosion

const ProfileFileCard = ({ 
  absorbedCount, 
  totalLogos, 
  className = '',
  onExplosion,
  onCountingComplete
}: ProfileFileCardProps) => {
  const [cardState, setCardState] = useState<CardState>('file');
  const [isPulsing, setIsPulsing] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);

  // Generate random numbers for the counting phase
  const risingNumbers = useMemo<RisingNumber[]>(() => {
    const numbers: RisingNumber[] = [];
    const values = ['+127', '+89', '+256', '+43', '+512', '+31', '+178', '+64', '+203', '+95'];
    for (let i = 0; i < 10; i++) {
      numbers.push({
        id: i,
        value: values[i],
        delay: i * 0.3,
        xOffset: (Math.random() - 0.5) * 60, // Random horizontal offset
      });
    }
    return numbers;
  }, []);

  // Generate particles for explosion
  const particles = useMemo<Particle[]>(() => {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.cos((i / 10) * Math.PI * 2) * 80,
      y: Math.sin((i / 10) * Math.PI * 2) * 80,
      color: colors[i % colors.length],
    }));
  }, []);

  // Trigger pulse animation when a new logo is absorbed
  useEffect(() => {
    if (absorbedCount > 0 && absorbedCount <= totalLogos && cardState === 'file') {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [absorbedCount, totalLogos, cardState]);

  // Transform to verified when all logos are absorbed
  useEffect(() => {
    if (absorbedCount >= totalLogos && cardState === 'file') {
      setCardState('transforming');
      const timer = setTimeout(() => {
        setCardState('verified');
        // Start counting phase after a brief pause
        setTimeout(() => {
          setCardState('counting');
          setShowNumbers(true);
        }, 1000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [absorbedCount, totalLogos, cardState]);

  // Handle counting phase completion
  useEffect(() => {
    if (cardState === 'counting') {
      const timer = setTimeout(() => {
        setShowNumbers(false);
        setCardState('exploding');
        setShowExplosion(true);
        onCountingComplete?.();
        
        // Trigger explosion callback
        setTimeout(() => {
          onExplosion?.();
        }, 100);

        // Clean up explosion
        setTimeout(() => {
          setShowExplosion(false);
        }, EXPLOSION_DURATION);
      }, COUNTING_DURATION);
      return () => clearTimeout(timer);
    }
  }, [cardState, onExplosion, onCountingComplete]);

  // Reset state when animation cycle restarts
  useEffect(() => {
    if (absorbedCount === 0 && cardState !== 'file') {
      setCardState('file');
      setShowNumbers(false);
      setShowExplosion(false);
    }
  }, [absorbedCount, cardState]);

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center 
        rounded-xl bg-white shadow-2xl overflow-visible
        transition-all duration-300
        ${isPulsing ? 'animate-pulse-absorb' : ''}
        ${cardState === 'transforming' ? 'animate-transform-verified' : ''}
        ${cardState === 'counting' ? 'animate-shake' : ''}
        ${className}
      `}
    >
      {/* Rising Numbers */}
      {showNumbers && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {risingNumbers.map((num) => (
            <span
              key={num.id}
              className="absolute bottom-0 left-1/2 text-sm md:text-base font-bold text-green-500 animate-number-rise"
              style={{
                '--rise-x': `${num.xOffset}px`,
                animationDelay: `${num.delay}s`,
                transform: 'translateX(-50%)',
              } as React.CSSProperties}
            >
              {num.value}
            </span>
          ))}
        </div>
      )}

      {/* Explosion Effect */}
      {showExplosion && (
        <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
          {/* Central flash */}
          <div className="absolute w-20 h-20 rounded-full bg-white animate-flash-explosion" />
          
          {/* Particles */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-3 h-3 rounded-full animate-particle-burst"
              style={{
                '--particle-x': `${particle.x}px`,
                '--particle-y': `${particle.y}px`,
                backgroundColor: particle.color,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* macOS-style title bar */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 flex items-center px-2 gap-1.5 z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center pt-6 pb-4 px-4">
        {cardState === 'verified' || cardState === 'counting' || cardState === 'exploding' ? (
          <>
            <div className="relative">
              <UserCheck className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
              <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 text-green-500 fill-white" />
            </div>
            <span className="mt-2 text-xs md:text-sm font-medium text-gray-700">
              Perfil Verificado
            </span>
          </>
        ) : (
          <>
            <Folder className="w-12 h-12 md:w-16 md:h-16 text-blue-500" />
            <span className="mt-2 text-xs md:text-sm font-medium text-gray-700">
              vibecoders.la
            </span>
            {/* Progress indicator */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(absorbedCount / totalLogos) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileFileCard;
