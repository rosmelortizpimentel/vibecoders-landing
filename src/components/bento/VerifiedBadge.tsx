import { Check } from 'lucide-react';

const VerifiedBadge = () => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative group">
        {/* Shimmer Effect Background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-shimmer" />
        
        {/* Badge Container */}
        <div className="relative px-6 py-4 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 shadow-xl overflow-hidden">
          {/* Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer-slide" />
          
          {/* Content */}
          <div className="flex items-center gap-3">
            {/* Checkmark Circle */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            
            {/* Text */}
            <div className="text-left">
              <div className="text-white font-bold text-lg tracking-tight">Verified</div>
              <div className="text-stone-400 text-sm font-medium">Builder</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiedBadge;
