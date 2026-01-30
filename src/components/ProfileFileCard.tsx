import { useState, useEffect, useMemo, useRef } from 'react';
import { Folder, Eye, Heart } from 'lucide-react';
import profileAvatar from '@/assets/profile-avatar.png';

type CardState = 'file' | 'transforming' | 'verified' | 'counting' | 'exploding';

interface ProfileFileCardProps {
  absorbedCount: number;
  totalLogos: number;
  className?: string;
  onExplosion?: () => void;
  onCountingComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

// Counter configuration
const FINAL_VIEWS = 12847;
const FINAL_LIKES = 3256;
const COUNTER_DURATION = 5000; // 5 seconds for counters
const EXPLOSION_DURATION = 500; // 0.5s explosion

// Easing function: starts slow, accelerates
const easeInCubic = (t: number) => t * t * t;

const ProfileFileCard = ({ 
  absorbedCount, 
  totalLogos, 
  className = '',
  onExplosion,
  onCountingComplete
}: ProfileFileCardProps) => {
  const [cardState, setCardState] = useState<CardState>('file');
  const [isPulsing, setIsPulsing] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  
  // Ref to track timeouts for proper cleanup
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  // Ref to track if transformation has started (prevents re-triggering)
  const hasStartedTransformRef = useRef(false);
  // Ref to track animation frame
  const animationRef = useRef<number | null>(null);

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

  // Main transformation effect - uses absolute timing from start
  useEffect(() => {
    if (absorbedCount >= totalLogos && !hasStartedTransformRef.current) {
      console.log('ProfileFileCard: Starting transformation sequence...');
      hasStartedTransformRef.current = true;
      
      // Clear any existing timeouts
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
      
      // Phase 1: Transforming (immediate)
      setCardState('transforming');
      
      // Phase 2: Verified (after 500ms)
      const t1 = setTimeout(() => {
        console.log('ProfileFileCard: Phase 2 - Verified');
        setCardState('verified');
      }, 500);
      timeoutsRef.current.push(t1);
      
      // Phase 3: Counting (after 1500ms total)
      const t2 = setTimeout(() => {
        console.log('ProfileFileCard: Phase 3 - Counting');
        setCardState('counting');
      }, 1500);
      timeoutsRef.current.push(t2);
      
      // Phase 4: Exploding (after 1500 + COUNTER_DURATION)
      const t3 = setTimeout(() => {
        console.log('ProfileFileCard: Phase 4 - Exploding');
        setCardState('exploding');
        setShowExplosion(true);
        onCountingComplete?.();
        
        // Trigger explosion callback
        setTimeout(() => {
          onExplosion?.();
        }, 100);
      }, 1500 + COUNTER_DURATION);
      timeoutsRef.current.push(t3);
      
      // Phase 5: Cleanup explosion
      const t4 = setTimeout(() => {
        console.log('ProfileFileCard: Phase 5 - Cleanup');
        setShowExplosion(false);
      }, 1500 + COUNTER_DURATION + EXPLOSION_DURATION);
      timeoutsRef.current.push(t4);
    }
    
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, [absorbedCount, totalLogos, onExplosion, onCountingComplete]);

  // Counter animation effect
  useEffect(() => {
    if (cardState === 'counting') {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / COUNTER_DURATION, 1);
        const easedProgress = easeInCubic(progress);
        
        setViewCount(Math.floor(FINAL_VIEWS * easedProgress));
        setLikeCount(Math.floor(FINAL_LIKES * easedProgress));
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [cardState]);

  // Reset state when animation cycle restarts
  useEffect(() => {
    if (absorbedCount === 0 && hasStartedTransformRef.current) {
      console.log('ProfileFileCard: Resetting to file state');
      hasStartedTransformRef.current = false;
      setCardState('file');
      setShowExplosion(false);
      setViewCount(0);
      setLikeCount(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [absorbedCount]);

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center 
        rounded-2xl bg-white shadow-2xl overflow-visible
        border border-stone-200
        transition-all duration-300
        ${isPulsing ? 'animate-pulse-absorb' : ''}
        ${cardState === 'transforming' ? 'animate-transform-verified' : ''}
        ${cardState === 'counting' ? 'animate-shake' : ''}
        ${className}
      `}
    >

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

      {/* Content */}
      <div className="flex flex-col items-center justify-center py-6 px-6 md:px-8">
        {cardState === 'verified' || cardState === 'counting' || cardState === 'exploding' ? (
          <>
            {/* Avatar circular */}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-[#3D5AFE] mb-2">
              <img 
                src={profileAvatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Username */}
            <span className="text-sm md:text-base font-semibold text-gray-800 mb-3">
              @vibecoder
            </span>
            
            {/* Counters */}
            <div className="flex items-center gap-4 text-gray-600 mt-2">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#3D5AFE]" />
                <span className="text-xs md:text-sm font-medium tabular-nums">
                  {viewCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#3D5AFE] fill-[#3D5AFE]" />
                <span className="text-xs md:text-sm font-medium tabular-nums">
                  {likeCount.toLocaleString()}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <Folder className="w-12 h-12 md:w-16 md:h-16 text-blue-500" />
            <span className="mt-2 text-xs md:text-sm font-medium text-gray-700">
              Mis Apps
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
