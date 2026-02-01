import { Lock } from 'lucide-react';
import vibecodersLogo from '@/assets/vibecoders-logo.png';

const BrowserUrlMock = () => {
  return (
    <div className="w-full rounded-xl bg-[#F8F8F8] shadow-sm border border-stone-200 overflow-hidden">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 bg-[#ECECEC] border-b border-stone-200">
        {/* Traffic Lights - hidden on mobile */}
        <div className="hidden md:flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
        </div>
        
        {/* URL Bar - left aligned, compact on mobile */}
        <div className="flex items-center gap-1.5 md:gap-2 bg-white rounded-md px-2 md:px-3 py-1 md:py-1.5 border border-stone-200">
          <Lock className="w-3 h-3 md:w-3.5 md:h-3.5 text-stone-400 flex-shrink-0" />
          <span className="text-xs md:text-sm text-stone-700 font-medium tracking-tight truncate">
            vibecoders.la/<span className="text-stone-900">@username</span>
          </span>
        </div>
      </div>
      
      {/* Browser Content Preview */}
      <div className="px-4 py-6 bg-gradient-to-b from-[#F8F8F8] to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-stone-900 overflow-hidden shadow-sm">
            <img src={vibecodersLogo} alt="Vibecoders" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-24 bg-stone-200 rounded" />
            <div className="h-2 w-16 bg-stone-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserUrlMock;
