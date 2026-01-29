import lovableLogo from '@/assets/logos/lovable.svg';
import replitLogo from '@/assets/logos/replit.svg';
import windsurfLogo from '@/assets/logos/windsurf.svg';

const logos = [
  // Left side logos
  { 
    name: 'Lovable', 
    image: lovableLogo,
    position: 'top-[25%] left-[5%] md:left-[12%]', 
    delay: '0s',
    size: 'h-[68px] w-[68px] md:h-24 md:w-24'
  },
  { 
    name: 'Replit', 
    image: replitLogo,
    position: 'top-[42%] left-[3%] md:left-[8%]', 
    delay: '0.5s',
    size: 'h-[58px] w-[58px] md:h-[76px] md:w-[76px]'
  },
  { 
    name: 'Windsurf', 
    image: windsurfLogo,
    position: 'top-[58%] left-[6%] md:left-[14%]', 
    delay: '1s',
    size: 'h-[52px] w-[52px] md:h-[72px] md:w-[72px]',
    hidden: 'hidden sm:flex'
  },
  // Right side logos - placeholders for now
  { 
    name: 'Cursor', 
    initials: 'C',
    position: 'top-[22%] right-[4%] md:right-[10%]', 
    delay: '0.3s',
    size: 'h-[58px] w-[58px] md:h-[76px] md:w-[76px]'
  },
  { 
    name: 'v0', 
    initials: 'v0',
    position: 'top-[40%] right-[2%] md:right-[6%]', 
    delay: '0.8s',
    size: 'h-[68px] w-[68px] md:h-[86px] md:w-[86px]',
    hidden: 'hidden sm:flex'
  },
  { 
    name: 'Bolt', 
    initials: '⚡',
    position: 'top-[56%] right-[5%] md:right-[12%]', 
    delay: '0.6s',
    size: 'h-[52px] w-[52px] md:h-[72px] md:w-[72px]',
    hidden: 'hidden md:flex'
  },
];

const FloatingLogos = () => {
  return (
    <>
      {logos.map((logo) => (
        <div
          key={logo.name}
          className={`absolute ${logo.position} ${logo.size} ${logo.hidden || 'flex'} animate-float items-center justify-center rounded-full bg-white overflow-hidden shadow-lg`}
          style={{ animationDelay: logo.delay }}
          title={logo.name}
        >
          {logo.image ? (
            <img 
              src={logo.image} 
              alt={logo.name} 
              className="h-3/4 w-3/4 object-contain"
            />
          ) : (
            <span className="text-sm md:text-base font-bold text-slate-900">{logo.initials}</span>
          )}
        </div>
      ))}
    </>
  );
};

export default FloatingLogos;
