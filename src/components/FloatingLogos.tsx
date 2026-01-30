import { useState, useEffect, useCallback, useRef } from 'react';
import lovableLogo from '@/assets/logos/lovable.svg';
import replitLogo from '@/assets/logos/replit.svg';
import windsurfLogo from '@/assets/logos/windsurf.svg';
import arcLogo from '@/assets/logos/arc.png';
import v0Logo from '@/assets/logos/v0.png';
import stitchLogo from '@/assets/logos/stitch.png';
import base44Logo from '@/assets/logos/base44.png';
import boltLogo from '@/assets/logos/bolt.png';
import kilocodeLogo from '@/assets/logos/kilocode.gif';
import cursorLogo from '@/assets/logos/cursor.jpg';

interface FloatingLogosProps {
  onAbsorbedCountChange: (count: number) => void;
  triggerExplosion?: boolean;
  onExplosionComplete?: () => void;
  isMobileContainer?: boolean; // When true, renders only mobile logos positioned relative to parent
}

type LogoState = 'floating' | 'falling' | 'absorbed' | 'exploding';

const logos = [
  { name: 'Lovable', image: lovableLogo },
  { name: 'Replit', image: replitLogo },
  { name: 'Windsurf', image: windsurfLogo },
  { name: 'Arc', image: arcLogo },
  { name: 'Stitch', image: stitchLogo },
  { name: 'Cursor', image: cursorLogo },
  { name: 'v0', image: v0Logo },
  { name: 'Bolt', image: boltLogo },
  { name: 'Base44', image: base44Logo },
  { name: 'Kilocode', image: kilocodeLogo },
];

// Desktop positions - 5 left, 5 right - falling towards center (where ProfileFileCard is now)
const desktopPositions = [
  // Left side → fall to center-right
  { position: 'top-[18%] left-[10%]', delay: '0s', size: 'h-[106px] w-[106px]', fallX: '40vw', fallY: '37vh', explodeX: '-40vw', explodeY: '-37vh' },
  { position: 'top-[34%] left-[6%]', delay: '0.5s', size: 'h-[84px] w-[84px]', fallX: '44vw', fallY: '21vh', explodeX: '-44vw', explodeY: '-21vh' },
  { position: 'top-[50%] left-[12%]', delay: '1s', size: 'h-[79px] w-[79px]', fallX: '38vw', fallY: '5vh', explodeX: '-38vw', explodeY: '-5vh' },
  { position: 'top-[66%] left-[8%]', delay: '0.7s', size: 'h-[84px] w-[84px]', fallX: '42vw', fallY: '-11vh', explodeX: '-42vw', explodeY: '11vh' },
  { position: 'top-[80%] left-[14%]', delay: '1.2s', size: 'h-[82px] w-[82px]', fallX: '36vw', fallY: '-25vh', explodeX: '-36vw', explodeY: '25vh' },
  // Right side → fall to center-left
  { position: 'top-[18%] right-[10%]', delay: '0.3s', size: 'h-[106px] w-[106px]', fallX: '-40vw', fallY: '37vh', explodeX: '40vw', explodeY: '-37vh' },
  { position: 'top-[34%] right-[6%]', delay: '0.8s', size: 'h-[84px] w-[84px]', fallX: '-44vw', fallY: '21vh', explodeX: '44vw', explodeY: '-21vh' },
  { position: 'top-[50%] right-[12%]', delay: '0.6s', size: 'h-[79px] w-[79px]', fallX: '-38vw', fallY: '5vh', explodeX: '38vw', explodeY: '-5vh' },
  { position: 'top-[66%] right-[8%]', delay: '0.7s', size: 'h-[84px] w-[84px]', fallX: '-42vw', fallY: '-11vh', explodeX: '42vw', explodeY: '11vh' },
  { position: 'top-[80%] right-[14%]', delay: '1.1s', size: 'h-[82px] w-[82px]', fallX: '-36vw', fallY: '-25vh', explodeX: '36vw', explodeY: '25vh' },
];

// Mobile positions - 10 logos distributed in a circle around the ProfileFileCard
// Using a radius of ~85px to fit well on mobile screens without overflowing
const mobilePositions = [
  { startX: '0px', startY: '-85px', delay: '0s' },      // top
  { startX: '50px', startY: '-69px', delay: '0.15s' },   // top-right-1
  { startX: '81px', startY: '-26px', delay: '0.3s' },    // right-top
  { startX: '81px', startY: '26px', delay: '0.45s' },    // right-bottom
  { startX: '50px', startY: '69px', delay: '0.6s' },     // bottom-right-1
  { startX: '0px', startY: '85px', delay: '0.75s' },    // bottom
  { startX: '-50px', startY: '69px', delay: '0.9s' },    // bottom-left-1
  { startX: '-81px', startY: '26px', delay: '1.05s' },   // left-bottom
  { startX: '-81px', startY: '-26px', delay: '1.2s' },   // left-top
  { startX: '-50px', startY: '-69px', delay: '1.35s' },  // top-left-1
];

const FLOAT_DURATION = 2000; // 2s float before falling starts
const FALL_INTERVAL = 800; // 0.8s between each logo falling
const FALL_DURATION = 800; // 0.8s for fall animation
const EXPLODE_DURATION = 800; // 0.8s for explode animation
const RESET_PAUSE = 500; // 0.5s pause after explosion before reset

const FloatingLogos = ({ 
  onAbsorbedCountChange, 
  triggerExplosion = false,
  onExplosionComplete,
  isMobileContainer = false
}: FloatingLogosProps) => {
  const [logoStates, setLogoStates] = useState<LogoState[]>(
    logos.map(() => 'floating')
  );
  const [cycleKey, setCycleKey] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const absorbedCountRef = useRef(0);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const startFallingSequence = useCallback(() => {
    absorbedCountRef.current = 0;
    
    logos.forEach((_, index) => {
      // Start falling
      const fallStartTimer = setTimeout(() => {
        setLogoStates(prev => {
          const newStates = [...prev];
          newStates[index] = 'falling';
          return newStates;
        });
      }, FLOAT_DURATION + (index * FALL_INTERVAL));
      timeoutsRef.current.push(fallStartTimer);

      // Mark as absorbed after fall animation completes
      const absorbTimer = setTimeout(() => {
        setLogoStates(prev => {
          const newStates = [...prev];
          newStates[index] = 'absorbed';
          return newStates;
        });
        // Update absorbed count using ref to avoid stale closure
        absorbedCountRef.current += 1;
        onAbsorbedCountChange(absorbedCountRef.current);
      }, FLOAT_DURATION + (index * FALL_INTERVAL) + FALL_DURATION);
      timeoutsRef.current.push(absorbTimer);
    });
  }, [onAbsorbedCountChange]);

  const triggerExplosionAnimation = useCallback(() => {
    // Set all logos to exploding state (they'll animate from center outward)
    setLogoStates(logos.map(() => 'exploding'));

    // After explosion animation completes, reset everything
    const resetTimer = setTimeout(() => {
      setLogoStates(logos.map(() => 'floating'));
      absorbedCountRef.current = 0;
      onAbsorbedCountChange(0);
      setCycleKey(prev => prev + 1);
      onExplosionComplete?.();
    }, EXPLODE_DURATION + RESET_PAUSE);
    timeoutsRef.current.push(resetTimer);
  }, [onAbsorbedCountChange, onExplosionComplete]);

  // Handle explosion trigger from parent
  useEffect(() => {
    if (triggerExplosion) {
      triggerExplosionAnimation();
    }
  }, [triggerExplosion, triggerExplosionAnimation]);

  // Start the falling sequence when component mounts or cycle restarts
  useEffect(() => {
    startFallingSequence();

    return () => {
      clearAllTimeouts();
    };
  }, [cycleKey, startFallingSequence, clearAllTimeouts]);

  return (
    <>
      {/* Desktop: Floating logos on sides */}
      <div className="hidden md:block">
        {logos.map((logo, index) => {
          const state = logoStates[index];
          const pos = desktopPositions[index];
          
          return (
            <div
              key={`${logo.name}-${cycleKey}`}
              className={`
                absolute ${pos.position} ${pos.size} 
                flex items-center justify-center rounded-full bg-white overflow-hidden shadow-lg
                will-change-transform z-20
                ${state === 'floating' ? 'animate-float' : ''}
                ${state === 'falling' ? 'animate-fall-to-target' : ''}
                ${state === 'absorbed' ? 'opacity-0 pointer-events-none' : ''}
                ${state === 'exploding' ? 'animate-explode-out' : ''}
              `}
              style={{
                animationDelay: state === 'floating' ? pos.delay : '0s',
                '--fall-x': pos.fallX,
                '--fall-y': pos.fallY,
                '--explode-x': pos.explodeX,
                '--explode-y': pos.explodeY,
              } as React.CSSProperties}
              title={logo.name}
            >
              <img 
                src={logo.image} 
                alt={logo.name} 
                className="h-3/4 w-3/4 object-contain"
              />
            </div>
          );
        })}
      </div>

      {/* Mobile: Logos in circle - render based on context */}
      {isMobileContainer ? (
        // Render mobile logos directly when inside the mobile container
        <>
          {logos.map((logo, index) => {
            const state = logoStates[index];
            const pos = mobilePositions[index];
            
            return (
              <div
                key={`${logo.name}-mobile-${cycleKey}`}
                className={`
                  absolute left-1/2 top-1/2
                  h-10 w-10 flex items-center justify-center 
                  rounded-full bg-white overflow-hidden shadow-lg
                  will-change-transform
                  ${state === 'floating' ? 'animate-float' : ''}
                  ${state === 'falling' ? 'animate-fall-to-center-mobile' : ''}
                  ${state === 'absorbed' ? 'opacity-0 pointer-events-none' : ''}
                  ${state === 'exploding' ? 'animate-explode-from-center-mobile' : ''}
                `}
                style={{
                  '--start-x': pos.startX,
                  '--start-y': pos.startY,
                  transform: state === 'floating' 
                    ? `translate(calc(-50% + ${pos.startX}), calc(-50% + ${pos.startY}))` 
                    : undefined,
                  animationDelay: state === 'floating' ? pos.delay : '0s',
                } as React.CSSProperties}
                title={logo.name}
              >
                <img 
                  src={logo.image} 
                  alt={logo.name} 
                  className="h-3/4 w-3/4 object-contain"
                />
              </div>
            );
          })}
        </>
      ) : (
        // Original mobile container for non-container usage (hidden on md+)
        <div className="md:hidden absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {logos.map((logo, index) => {
              const state = logoStates[index];
              const pos = mobilePositions[index];
              
              return (
                <div
                  key={`${logo.name}-mobile-fallback-${cycleKey}`}
                  className={`
                    absolute left-1/2 top-1/2
                    h-10 w-10 flex items-center justify-center 
                    rounded-full bg-white overflow-hidden shadow-lg
                    will-change-transform
                    ${state === 'floating' ? 'animate-float' : ''}
                    ${state === 'falling' ? 'animate-fall-to-center-mobile' : ''}
                    ${state === 'absorbed' ? 'opacity-0 pointer-events-none' : ''}
                    ${state === 'exploding' ? 'animate-explode-from-center-mobile' : ''}
                  `}
                  style={{
                    '--start-x': pos.startX,
                    '--start-y': pos.startY,
                    transform: state === 'floating' 
                      ? `translate(calc(-50% + ${pos.startX}), calc(-50% + ${pos.startY}))` 
                      : undefined,
                    animationDelay: state === 'floating' ? pos.delay : '0s',
                  } as React.CSSProperties}
                  title={logo.name}
                >
                  <img 
                    src={logo.image} 
                    alt={logo.name} 
                    className="h-3/4 w-3/4 object-contain"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingLogos;
