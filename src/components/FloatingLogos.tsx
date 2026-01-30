import { useState, useEffect, useCallback, useRef } from 'react';
import lovableLogo from '@/assets/logos/lovable.svg';
import replitLogo from '@/assets/logos/replit.svg';
import windsurfLogo from '@/assets/logos/windsurf.svg';
import arcLogo from '@/assets/logos/arc.png';
import v0Logo from '@/assets/logos/v0.png';
import stitchLogo from '@/assets/logos/stitch.png';
import base44Logo from '@/assets/logos/base44.png';
import boltLogo from '@/assets/logos/bolt.png';
import kilocodeLogo from '@/assets/logos/kilocode.jpg';
import cursorLogo from '@/assets/logos/cursor.jpg';

interface FloatingLogosProps {
  onAbsorbedCountChange: (count: number) => void;
  triggerExplosion?: boolean;
  onExplosionComplete?: () => void;
  isMobileContainer?: boolean; // When true, renders only mobile logos positioned relative to parent
}

type LogoState = 'floating' | 'sliding' | 'falling' | 'absorbed' | 'exploding';

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

// Mobile positions - logos stack on top of each other (front to back based on z-index)
// Front logos (higher z-index) enter first, back logos enter last
// Each logo has a unique startX for slight variation and z-index for stacking
const mobilePositions = [
  { startX: -120, slideDelay: 0, zIndex: 10 },     // Logo 0 - front (enters first)
  { startX: -130, slideDelay: 0.4, zIndex: 9 },   // Logo 1
  { startX: -125, slideDelay: 0.8, zIndex: 8 },   // Logo 2
  { startX: -135, slideDelay: 1.2, zIndex: 7 },   // Logo 3
  { startX: -128, slideDelay: 1.6, zIndex: 6 },   // Logo 4
  { startX: -132, slideDelay: 2.0, zIndex: 5 },   // Logo 5
  { startX: -126, slideDelay: 2.4, zIndex: 4 },   // Logo 6
  { startX: -130, slideDelay: 2.8, zIndex: 3 },   // Logo 7
  { startX: -124, slideDelay: 3.2, zIndex: 2 },   // Logo 8
  { startX: -128, slideDelay: 3.6, zIndex: 1 },   // Logo 9 - back (enters last)
];

// Desktop timing
const FLOAT_DURATION = 2000; // 2s float before falling starts
const FALL_INTERVAL = 800; // 0.8s between each logo falling
const FALL_DURATION = 800; // 0.8s for fall animation
const EXPLODE_DURATION = 800; // 0.8s for explode animation
const RESET_PAUSE = 500; // 0.5s pause after explosion before reset

// Mobile timing
const MOBILE_SLIDE_DURATION = 600; // 0.6s slide from left to center
const MOBILE_FALL_DURATION = 400; // 0.4s fall down to file

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
    
    // Desktop: original behavior
    if (!isMobileContainer) {
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
          absorbedCountRef.current += 1;
          onAbsorbedCountChange(absorbedCountRef.current);
        }, FLOAT_DURATION + (index * FALL_INTERVAL) + FALL_DURATION);
        timeoutsRef.current.push(absorbTimer);
      });
    } else {
      // Mobile: slide from left → center → fall down
      logos.forEach((_, index) => {
        const pos = mobilePositions[index];
        const slideStartTime = pos.slideDelay * 1000;
        
        // Start sliding to center
        const slideTimer = setTimeout(() => {
          setLogoStates(prev => {
            const newStates = [...prev];
            newStates[index] = 'sliding';
            return newStates;
          });
        }, slideStartTime);
        timeoutsRef.current.push(slideTimer);

        // Start falling after slide completes
        const fallTimer = setTimeout(() => {
          setLogoStates(prev => {
            const newStates = [...prev];
            newStates[index] = 'falling';
            return newStates;
          });
        }, slideStartTime + MOBILE_SLIDE_DURATION);
        timeoutsRef.current.push(fallTimer);

        // Mark as absorbed after fall completes
        const absorbTimer = setTimeout(() => {
          setLogoStates(prev => {
            const newStates = [...prev];
            newStates[index] = 'absorbed';
            return newStates;
          });
          absorbedCountRef.current += 1;
          onAbsorbedCountChange(absorbedCountRef.current);
        }, slideStartTime + MOBILE_SLIDE_DURATION + MOBILE_FALL_DURATION);
        timeoutsRef.current.push(absorbTimer);
      });
    }
  }, [onAbsorbedCountChange, isMobileContainer]);

  const triggerExplosionAnimation = useCallback(() => {
    // Clear any pending fall/absorb timers to avoid state conflicts
    clearAllTimeouts();
    
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

      {/* Mobile: Logos slide from left → center → fall down */}
      {isMobileContainer && (
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          {logos.map((logo, index) => {
            const state = logoStates[index];
            const pos = mobilePositions[index];
            
            // Determine animation class based on state
            const getAnimationClass = () => {
              switch (state) {
                case 'floating':
                  return 'animate-float-left-mobile';
                case 'sliding':
                  return 'animate-slide-to-center-mobile';
                case 'falling':
                  return 'animate-fall-down-mobile';
                case 'absorbed':
                  return 'opacity-0 pointer-events-none';
                case 'exploding':
                  return 'animate-explode-left-mobile';
                default:
                  return '';
              }
            };
            
            // Calculate position based on state
            const getTransform = () => {
              if (state === 'floating') {
                return `translateX(${pos.startX}px)`;
              }
              return undefined;
            };
            
            return (
              <div
                key={`${logo.name}-mobile-${cycleKey}`}
                className={`
                  absolute
                  h-10 w-10 flex items-center justify-center 
                  rounded-full bg-white overflow-hidden shadow-lg
                  will-change-transform
                  ${getAnimationClass()}
                `}
                style={{
                  '--start-x': `${pos.startX}px`,
                  '--slide-delay': `${pos.slideDelay}s`,
                  transform: getTransform(),
                  zIndex: pos.zIndex,
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
      )}
    </>
  );
};

export default FloatingLogos;
