import { Lock } from 'lucide-react';

const BrowserUrlMock = () => {
  return (
    <div className="w-full rounded-xl bg-[#F8F8F8] shadow-sm border border-stone-200 overflow-hidden">
      {/* Browser Chrome */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#ECECEC] border-b border-stone-200">
        {/* Traffic Lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
        </div>
        
        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 bg-white rounded-md px-3 py-1.5 border border-stone-200">
          <Lock className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-sm text-stone-700 font-medium tracking-tight">
            https://vibecoders.la/<span className="text-stone-900">@username</span>
          </span>
        </div>
      </div>
      
      {/* Browser Content Preview */}
      <div className="px-4 py-6 bg-gradient-to-b from-[#F8F8F8] to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-200 to-stone-300" />
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
