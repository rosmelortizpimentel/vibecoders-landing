import arcLogo from '@/assets/logos/arc.png';
import base44Logo from '@/assets/logos/base44.png';
import boltLogo from '@/assets/logos/bolt.png';
import cursorLogo from '@/assets/logos/cursor.jpg';
import kilocodeLogo from '@/assets/logos/kilocode.gif';
import lovableLogo from '@/assets/logos/lovable.png';
import replitLogo from '@/assets/logos/replit.svg';
import stitchLogo from '@/assets/logos/stitch.png';
import v0Logo from '@/assets/logos/v0.png';
import windsurfLogo from '@/assets/logos/windsurf.svg';

const TechStackCarousel = () => {
  const logos = [
    { name: 'Arc', src: arcLogo },
    { name: 'Base44', src: base44Logo },
    { name: 'Bolt', src: boltLogo },
    { name: 'Cursor', src: cursorLogo },
    { name: 'Kilocode', src: kilocodeLogo },
    { name: 'Lovable', src: lovableLogo },
    { name: 'Replit', src: replitLogo },
    { name: 'Stitch', src: stitchLogo },
    { name: 'V0', src: v0Logo },
    { name: 'Windsurf', src: windsurfLogo },
  ];

  // Duplicate for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex animate-marquee hover:[animation-play-state:paused]">
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="flex-shrink-0 mx-4 flex items-center justify-center w-14 h-14 transition-all duration-300 hover:scale-110 group"
          >
            <img 
              src={logo.src} 
              alt={logo.name} 
              className="w-14 h-14 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackCarousel;
