import { useState, useEffect } from 'react';
import { Folder, UserCheck, CheckCircle } from 'lucide-react';

type CardState = 'file' | 'transforming' | 'verified';

interface ProfileFileCardProps {
  absorbedCount: number;
  totalLogos: number;
  className?: string;
}

const ProfileFileCard = ({ absorbedCount, totalLogos, className = '' }: ProfileFileCardProps) => {
  const [cardState, setCardState] = useState<CardState>('file');
  const [isPulsing, setIsPulsing] = useState(false);

  // Trigger pulse animation when a new logo is absorbed
  useEffect(() => {
    if (absorbedCount > 0 && absorbedCount <= totalLogos) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [absorbedCount, totalLogos]);

  // Transform to verified when all logos are absorbed
  useEffect(() => {
    if (absorbedCount >= totalLogos && cardState === 'file') {
      setCardState('transforming');
      const timer = setTimeout(() => setCardState('verified'), 500);
      return () => clearTimeout(timer);
    }
  }, [absorbedCount, totalLogos, cardState]);

  // Reset state when animation cycle restarts
  useEffect(() => {
    if (absorbedCount === 0 && cardState !== 'file') {
      setCardState('file');
    }
  }, [absorbedCount, cardState]);

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center 
        rounded-xl bg-white shadow-2xl overflow-hidden
        transition-all duration-300
        ${isPulsing ? 'animate-pulse-absorb' : ''}
        ${cardState === 'transforming' ? 'animate-transform-verified' : ''}
        ${className}
      `}
    >
      {/* macOS-style title bar */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 flex items-center px-2 gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center pt-6 pb-4 px-4">
        {cardState === 'verified' ? (
          <>
            <div className="relative">
              <UserCheck className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
              <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 text-green-500 fill-white" />
            </div>
            <span className="mt-2 text-xs md:text-sm font-medium text-gray-700">
              Perfil Verificado
            </span>
          </>
        ) : (
          <>
            <Folder className="w-12 h-12 md:w-16 md:h-16 text-blue-500" />
            <span className="mt-2 text-xs md:text-sm font-medium text-gray-700">
              vibecoders.la
            </span>
            {/* Progress indicator */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(absorbedCount / totalLogos) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileFileCard;
