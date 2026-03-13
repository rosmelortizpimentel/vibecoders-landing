import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimezoneDisplayProps {
  date: Date | string | null;
  className?: string;
  variant?: 'default' | 'compact';
}

const COUNTRIES = [
  { code: 'PE', name: 'Perú', zone: 'America/Lima' },
  { code: 'CO', name: 'Colombia', zone: 'America/Bogota' },
  { code: 'MX', name: 'México', zone: 'America/Mexico_City' },
  { code: 'CL', name: 'Chile', zone: 'America/Santiago' },
  { code: 'AR', name: 'Argentina', zone: 'America/Buenos_Aires' },
  { code: 'ES', name: 'España', zone: 'Europe/Madrid' },
];

export const TimezoneDisplay: React.FC<TimezoneDisplayProps> = ({ date, className, variant = 'default' }) => {
  const parsedDate = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }, [date]);

  const groupedTimes = useMemo(() => {
    if (!parsedDate) return [];
    
    const groups: { [time: string]: typeof COUNTRIES } = {};
    
    COUNTRIES.forEach(country => {
      try {
        const timeStr = new Intl.DateTimeFormat('es-ES', {
          timeZone: country.zone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(parsedDate);
        
        if (!groups[timeStr]) groups[timeStr] = [];
        groups[timeStr].push(country);
      } catch (e) {
        console.error(`Error formatting time for ${country.zone}:`, e);
      }
    });
    
    return Object.entries(groups).sort();
  }, [parsedDate]);

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        {groupedTimes.map(([time, countries]) => (
          <div key={time} className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1">
              {countries.map(c => (
                <img 
                  key={c.code}
                  src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} 
                  width="14" 
                  height="10"
                  alt={c.name}
                  className="object-contain ring-1 ring-white rounded-[1px] shadow-sm"
                  title={c.name}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-gray-700">{time}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 p-3 bg-gray-50/50 rounded-lg border border-dashed border-gray-200", className)}>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Horarios de referencia</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {groupedTimes.map(([time, countries]) => (
          <div key={time} className="flex items-center gap-2 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5">
              {countries.map(c => (
                <img 
                  key={c.code}
                  src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} 
                  width="16" 
                  height="12"
                  alt={c.name}
                  className="object-contain ring-2 ring-white rounded-sm shadow-sm"
                  title={c.name}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-gray-900">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
