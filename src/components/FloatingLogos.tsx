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

const logos = [
  // Left side logos (5)
  { 
    name: 'Lovable', 
    image: lovableLogo,
    position: 'top-[18%] left-[4%] md:left-[10%]', 
    delay: '0s',
    size: 'h-[68px] w-[68px] md:h-24 md:w-24'
  },
  { 
    name: 'Replit', 
    image: replitLogo,
    position: 'top-[34%] left-[2%] md:left-[6%]', 
    delay: '0.5s',
    size: 'h-[58px] w-[58px] md:h-[76px] md:w-[76px]'
  },
  { 
    name: 'Windsurf', 
    image: windsurfLogo,
    position: 'top-[50%] left-[4%] md:left-[12%]', 
    delay: '1s',
    size: 'h-[52px] w-[52px] md:h-[72px] md:w-[72px]',
    hidden: 'hidden sm:flex'
  },
  { 
    name: 'Arc', 
    image: arcLogo,
    position: 'top-[66%] left-[2%] md:left-[8%]', 
    delay: '0.7s',
    size: 'h-[58px] w-[58px] md:h-[76px] md:w-[76px]',
    hidden: 'hidden md:flex'
  },
  { 
    name: 'Stitch', 
    image: stitchLogo,
    position: 'top-[80%] left-[5%] md:left-[14%]', 
    delay: '1.2s',
    size: 'h-[48px] w-[48px] md:h-[68px] md:w-[68px]',
    hidden: 'hidden lg:flex'
  },
  // Right side logos (5)
  { 
    name: 'Cursor', 
    image: cursorLogo,
    position: 'top-[18%] right-[4%] md:right-[10%]', 
    delay: '0.3s',
    size: 'h-[68px] w-[68px] md:h-24 md:w-24'
  },
  { 
    name: 'v0', 
    image: v0Logo,
    position: 'top-[34%] right-[2%] md:right-[6%]', 
    delay: '0.8s',
    size: 'h-[58px] w-[58px] md:h-[76px] md:w-[76px]',
    hidden: 'hidden sm:flex'
  },
  { 
    name: 'Bolt', 
    image: boltLogo,
    position: 'top-[50%] right-[5%] md:right-[12%]', 
    delay: '0.6s',
    size: 'h-[52px] w-[52px] md:h-[72px] md:w-[72px]',
    hidden: 'hidden sm:flex'
  },
  { 
    name: 'Base44', 
    image: base44Logo,
    position: 'top-[66%] right-[2%] md:right-[8%]', 
    delay: '0.9s',
    size: 'h-[58px] w-[58px] md:h-[76px] md:w-[76px]',
    hidden: 'hidden md:flex'
  },
  { 
    name: 'Kilocode', 
    image: kilocodeLogo,
    position: 'top-[80%] right-[5%] md:right-[14%]', 
    delay: '1.1s',
    size: 'h-[48px] w-[48px] md:h-[68px] md:w-[68px]',
    hidden: 'hidden lg:flex'
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
          <img 
            src={logo.image} 
            alt={logo.name} 
            className="h-3/4 w-3/4 object-contain"
          />
        </div>
      ))}
    </>
  );
};

export default FloatingLogos;
