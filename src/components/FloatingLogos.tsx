import lovableLogo from '@/assets/logos/lovable.png';
import replitLogo from '@/assets/logos/replit.svg';
import windsurfLogo from '@/assets/logos/windsurf.svg';

const logos = [
  { 
    name: 'Lovable', 
    image: lovableLogo,
    position: 'top-[12%] left-1/2 -translate-x-1/2 md:top-[8%] md:left-[42%]', 
    delay: '0s',
    size: 'h-12 w-auto md:h-16'
  },
  { 
    name: 'Cursor', 
    initials: 'Cursor',
    position: 'top-[22%] left-[8%] md:top-[18%] md:left-[18%]', 
    delay: '0.5s',
    size: 'h-10 md:h-12 px-3'
  },
  { 
    name: 'v0', 
    initials: 'v0',
    position: 'top-[18%] right-[8%] md:top-[15%] md:right-[18%]', 
    delay: '1s',
    size: 'h-10 md:h-12 px-3'
  },
  { 
    name: 'Bolt', 
    initials: 'Bolt',
    position: 'top-[42%] left-[5%] md:top-[38%] md:left-[8%]', 
    delay: '0.3s',
    size: 'h-9 md:h-11 px-3',
    hidden: 'hidden sm:flex'
  },
  { 
    name: 'Replit', 
    image: replitLogo,
    position: 'top-[38%] right-[5%] md:top-[35%] md:right-[10%]', 
    delay: '0.8s',
    size: 'h-8 w-auto md:h-10',
    hidden: 'hidden sm:flex'
  },
  { 
    name: 'Windsurf', 
    image: windsurfLogo,
    position: 'bottom-[28%] left-[12%] md:bottom-[22%] md:left-[22%]', 
    delay: '0.6s',
    size: 'h-8 w-auto md:h-10',
    hidden: 'hidden md:flex'
  },
];

const FloatingLogos = () => {
  return (
    <>
      {logos.map((logo) => (
        <div
          key={logo.name}
          className={`absolute ${logo.position} ${logo.size} ${logo.hidden || 'flex'} animate-float items-center justify-center`}
          style={{ animationDelay: logo.delay }}
          title={logo.name}
        >
          {logo.image ? (
            <img 
              src={logo.image} 
              alt={logo.name} 
              className="h-full w-auto object-contain"
            />
          ) : (
            <span className="text-sm md:text-base font-bold text-white">{logo.initials}</span>
          )}
        </div>
      ))}
    </>
  );
};

export default FloatingLogos;
