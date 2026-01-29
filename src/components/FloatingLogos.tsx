const logos = [
  { 
    name: 'Lovable', 
    initials: 'L',
    position: 'top-[12%] left-1/2 -translate-x-1/2 md:top-[8%] md:left-[42%]', 
    delay: '0s',
    gradient: 'from-pink-500 to-violet-600',
    size: 'h-14 w-14 md:h-20 md:w-20'
  },
  { 
    name: 'Cursor', 
    initials: 'C',
    position: 'top-[22%] left-[8%] md:top-[18%] md:left-[18%]', 
    delay: '0.5s',
    gradient: 'from-slate-700 to-slate-900',
    size: 'h-12 w-12 md:h-16 md:w-16'
  },
  { 
    name: 'v0', 
    initials: 'v0',
    position: 'top-[18%] right-[8%] md:top-[15%] md:right-[18%]', 
    delay: '1s',
    gradient: 'from-neutral-800 to-black',
    size: 'h-12 w-12 md:h-16 md:w-16'
  },
  { 
    name: 'Bolt', 
    initials: '⚡',
    position: 'top-[42%] left-[5%] md:top-[38%] md:left-[8%]', 
    delay: '0.3s',
    gradient: 'from-yellow-400 to-orange-500',
    size: 'h-11 w-11 md:h-14 md:w-14',
    hidden: 'hidden sm:flex'
  },
  { 
    name: 'Replit', 
    initials: 'R',
    position: 'top-[38%] right-[5%] md:top-[35%] md:right-[10%]', 
    delay: '0.8s',
    gradient: 'from-orange-500 to-red-600',
    size: 'h-11 w-11 md:h-14 md:w-14',
    hidden: 'hidden sm:flex'
  },
  { 
    name: 'Windsurf', 
    initials: 'W',
    position: 'bottom-[28%] left-[12%] md:bottom-[22%] md:left-[22%]', 
    delay: '0.6s',
    gradient: 'from-cyan-400 to-blue-600',
    size: 'h-10 w-10 md:h-14 md:w-14',
    hidden: 'hidden md:flex'
  },
];

const FloatingLogos = () => {
  return (
    <>
      {logos.map((logo) => (
        <div
          key={logo.name}
          className={`absolute ${logo.position} ${logo.size} ${logo.hidden || 'flex'} animate-float items-center justify-center rounded-full border-4 border-slate-900 bg-gradient-to-br ${logo.gradient} font-bold text-white shadow-lg`}
          style={{ animationDelay: logo.delay }}
          title={logo.name}
        >
          <span className="text-xs md:text-sm">{logo.initials}</span>
        </div>
      ))}
    </>
  );
};

export default FloatingLogos;
