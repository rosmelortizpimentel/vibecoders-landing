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
  { position: 'top-[18%] left-[10%]', delay: '0s', size: 'h-24 w-24' },
  { position: 'top-[34%] left-[6%]', delay: '0.5s', size: 'h-[76px] w-[76px]' },
  { position: 'top-[50%] left-[12%]', delay: '1s', size: 'h-[72px] w-[72px]' },
  { position: 'top-[66%] left-[8%]', delay: '0.7s', size: 'h-[76px] w-[76px]' },
  { position: 'top-[80%] left-[14%]', delay: '1.2s', size: 'h-[68px] w-[68px]' },
  // Right side
  { position: 'top-[18%] right-[10%]', delay: '0.3s', size: 'h-24 w-24' },
  { position: 'top-[34%] right-[6%]', delay: '0.8s', size: 'h-[76px] w-[76px]' },
  { position: 'top-[50%] right-[12%]', delay: '0.6s', size: 'h-[72px] w-[72px]' },
  { position: 'top-[66%] right-[8%]', delay: '0.9s', size: 'h-[76px] w-[76px]' },
  { position: 'top-[80%] right-[14%]', delay: '1.1s', size: 'h-[68px] w-[68px]' },
];

const FloatingLogos = () => {
  return (
    <>
      {/* Desktop: Floating logos on sides */}
      <div className="hidden md:block">
        {logos.map((logo, index) => (
          <div
            key={logo.name}
            className={`absolute ${desktopPositions[index].position} ${desktopPositions[index].size} flex animate-float items-center justify-center rounded-full bg-white overflow-hidden shadow-lg`}
            style={{ animationDelay: desktopPositions[index].delay }}
            title={logo.name}
          >
            <img 
              src={logo.image} 
              alt={logo.name} 
              className="h-3/4 w-3/4 object-contain"
            />
          </div>
        ))}
      </div>

      {/* Mobile: Carousel below text */}
      <div className="md:hidden absolute bottom-24 left-0 right-0 overflow-hidden">
        <div className="flex animate-scroll-left">
          {/* Duplicate logos for seamless loop */}
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex-shrink-0 mx-3 h-14 w-14 flex items-center justify-center rounded-full bg-white overflow-hidden shadow-lg"
              title={logo.name}
            >
              <img 
                src={logo.image} 
                alt={logo.name} 
                className="h-3/4 w-3/4 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FloatingLogos;
