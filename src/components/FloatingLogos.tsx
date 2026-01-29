import { useState, useEffect, useCallback, useMemo } from 'react';
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
import ProfileFileCard from './ProfileFileCard';

type LogoState = 'floating' | 'falling' | 'absorbed';

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

// Desktop positions - 5 left, 5 right
const desktopPositions = [
  // Left side
  { position: 'top-[18%] left-[10%]', delay: '0s', size: 'h-[106px] w-[106px]', fallX: '40vw', fallY: '35vh' },
  { position: 'top-[34%] left-[6%]', delay: '0.5s', size: 'h-[84px] w-[84px]', fallX: '44vw', fallY: '20vh' },
  { position: 'top-[50%] left-[12%]', delay: '1s', size: 'h-[79px] w-[79px]', fallX: '38vw', fallY: '5vh' },
  { position: 'top-[66%] left-[8%]', delay: '0.7s', size: 'h-[84px] w-[84px]', fallX: '42vw', fallY: '-10vh' },
  { position: 'top-[80%] left-[14%]', delay: '1.2s', size: 'h-[82px] w-[82px]', fallX: '36vw', fallY: '-25vh' },
  // Right side
  { position: 'top-[18%] right-[10%]', delay: '0.3s', size: 'h-[106px] w-[106px]', fallX: '-40vw', fallY: '35vh' },
  { position: 'top-[34%] right-[6%]', delay: '0.8s', size: 'h-[84px] w-[84px]', fallX: '-44vw', fallY: '20vh' },
  { position: 'top-[50%] right-[12%]', delay: '0.6s', size: 'h-[79px] w-[79px]', fallX: '-38vw', fallY: '5vh' },
  { position: 'top-[66%] right-[8%]', delay: '0.7s', size: 'h-[84px] w-[84px]', fallX: '-42vw', fallY: '-10vh' },
  { position: 'top-[80%] right-[14%]', delay: '1.1s', size: 'h-[82px] w-[82px]', fallX: '-36vw', fallY: '-25vh' },
];

const FLOAT_DURATION = 2000; // 2s float before falling starts
const FALL_INTERVAL = 800; // 0.8s between each logo falling
const FALL_DURATION = 800; // 0.8s for fall animation
const VERIFIED_DISPLAY_DURATION = 3000; // 3s showing verified state
const TOTAL_CYCLE_DURATION = FLOAT_DURATION + (logos.length * FALL_INTERVAL) + VERIFIED_DISPLAY_DURATION;

const FloatingLogos = () => {
  const [logoStates, setLogoStates] = useState<LogoState[]>(
    logos.map(() => 'floating')
  );
  const [absorbedCount, setAbsorbedCount] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);

  const startFallingSequence = useCallback(() => {
    logos.forEach((_, index) => {
      // Start falling
      setTimeout(() => {
        setLogoStates(prev => {
          const newStates = [...prev];
          newStates[index] = 'falling';
          return newStates;
        });
      }, FLOAT_DURATION + (index * FALL_INTERVAL));

      // Mark as absorbed after fall animation completes
      setTimeout(() => {
        setLogoStates(prev => {
          const newStates = [...prev];
          newStates[index] = 'absorbed';
          return newStates;
        });
        setAbsorbedCount(prev => prev + 1);
      }, FLOAT_DURATION + (index * FALL_INTERVAL) + FALL_DURATION);
    });
  }, []);

  const resetAnimation = useCallback(() => {
    setLogoStates(logos.map(() => 'floating'));
    setAbsorbedCount(0);
    setCycleKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    startFallingSequence();

    // Reset and restart the cycle
    const cycleTimer = setTimeout(() => {
      resetAnimation();
    }, TOTAL_CYCLE_DURATION);

    return () => {
      clearTimeout(cycleTimer);
    };
  }, [cycleKey, startFallingSequence, resetAnimation]);

  const mobileAbsorbedCount = useMemo(() => {
    // For mobile, calculate based on scroll position simulation
    return absorbedCount;
  }, [absorbedCount]);

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
                will-change-transform
                ${state === 'floating' ? 'animate-float' : ''}
                ${state === 'falling' ? 'animate-fall-to-target' : ''}
                ${state === 'absorbed' ? 'opacity-0 pointer-events-none' : ''}
              `}
              style={{
                animationDelay: state === 'floating' ? pos.delay : '0s',
                '--fall-x': pos.fallX,
                '--fall-y': pos.fallY,
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

        {/* Profile File Card - Desktop */}
        <div className="absolute right-[8%] top-[50%] -translate-y-1/2 z-20">
          <ProfileFileCard 
            absorbedCount={absorbedCount}
            totalLogos={logos.length}
            className="w-[140px] h-[160px]"
          />
        </div>
      </div>

      {/* Mobile: Carousel with file card */}
      <div className="md:hidden">
        {/* Profile File Card - Mobile */}
        <div className="absolute left-4 top-[35%] -translate-y-1/2 z-20">
          <ProfileFileCard 
            absorbedCount={mobileAbsorbedCount}
            totalLogos={logos.length}
            className="w-[100px] h-[120px]"
          />
        </div>

        {/* Mobile carousel */}
        <div className="absolute bottom-24 left-0 right-0 overflow-hidden">
          <div className="flex animate-scroll-left">
            {/* Duplicate logos for seamless loop */}
            {[...logos, ...logos].map((logo, index) => {
              const originalIndex = index % logos.length;
              const state = logoStates[originalIndex];
              
              return (
                <div
                  key={`${logo.name}-mobile-${index}-${cycleKey}`}
                  className={`
                    flex-shrink-0 mx-3 h-14 w-14 flex items-center justify-center 
                    rounded-full bg-white overflow-hidden shadow-lg
                    transition-all duration-500
                    ${state === 'absorbed' ? 'opacity-30 scale-75' : 'opacity-100 scale-100'}
                  `}
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
      </div>
    </>
  );
};

export default FloatingLogos;
