import { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  subDays,
  eachDayOfInterval,
  isToday,
  setHours,
  setMinutes
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TimezoneDisplay } from './TimezoneDisplay';

interface Speaker {
  id: string;
  display_name: string;
  photo_url: string | null;
}

interface Workshop {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  status: string;
  speakers: Speaker[];
}

interface WorkshopCalendarProps {
  workshops: Workshop[];
  onEdit: (w: Workshop) => void;
}

export function WorkshopCalendar({ workshops, onEdit }: WorkshopCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'week'>('month');

  const nextAction = () => {
    if (viewType === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 7));
  };

  const prevAction = () => {
    if (viewType === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -7));
  };

  const goToToday = () => setCurrentDate(new Date());

  const days = useMemo(() => {
    if (viewType === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else {
      const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      const endDate = endOfWeek(startDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: startDate, end: endDate });
    }
  }, [currentDate, viewType]);

  const getWorkshopsForDay = (day: Date) => {
    return workshops.filter(w => isSameDay(new Date(w.scheduled_at), day));
  };

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm flex flex-col min-h-[600px]">
      {/* Calendar Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium capitalize">
            {format(currentDate, viewType === 'month' ? 'MMMM yyyy' : "'Semana del' d 'de' MMMM", { locale: es })}
          </h3>
          <div className="flex items-center bg-white border rounded-lg p-0.5">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3 text-xs", viewType === 'month' && "bg-gray-100 font-medium")}
              onClick={() => setViewType('month')}
            >
              Mes
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-3 text-xs", viewType === 'week' && "bg-gray-100 font-medium")}
              onClick={() => setViewType('week')}
            >
              Semana
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="text-xs h-8">Hoy</Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevAction} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={nextAction} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 border-b bg-gray-50/30">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={cn(
        "grid grid-cols-7 flex-1",
        viewType === 'month' ? "auto-rows-fr" : "min-h-[400px]"
      )}>
        {days.map((day, idx) => {
          const dayWorkshops = getWorkshopsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "min-h-[100px] p-2 border-b border-r last:border-r-0 flex flex-col gap-1 transition-colors",
                !isCurrentMonth && viewType === 'month' && "bg-gray-50/50 opacity-40",
                isToday(day) && "bg-blue-50/30"
              )}
            >
              <div className="flex justify-end mb-1">
                <span className={cn(
                  "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                  isToday(day) ? "bg-[#3D5AFE] text-white" : "text-gray-500"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-0.5">
                {dayWorkshops.map(w => (
                  <TooltipProvider key={w.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onEdit(w)}
                          className={cn(
                            "text-left p-1.5 rounded-md text-[11px] leading-tight border transition-all hover:ring-1 hover:ring-primary/20",
                            w.status === 'published' ? "bg-white border-blue-100 text-blue-900 shadow-sm" : "bg-gray-50 border-gray-100 text-gray-500 opacity-80"
                          )}
                        >
                          <div className="font-medium truncate">{w.title}</div>
                          <div className="flex items-center gap-1 mt-1 opacity-70">
                            <Clock className="h-2.5 w-2.5" />
                            <span>{format(new Date(w.scheduled_at), "HH:mm")}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex -space-x-1.5 flex-1">
                              {w.speakers.slice(0, 3).map(s => (
                                <Avatar key={s.id} className="h-4 w-4 border border-white ring-px ring-black/5 shrink-0">
                                  <AvatarImage src={s.photo_url || ''} />
                                  <AvatarFallback className="text-[6px]">{s.display_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <span className="text-[9px] truncate opacity-80">
                              {w.speakers[0]?.display_name || 'Sin ponente'}
                            </span>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white border p-3 flex flex-col gap-2 max-w-[200px]">
                        <p className="font-bold text-xs">{w.title}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(w.scheduled_at), "HH:mm 'hs'")}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-1 border-t pt-2">
                          <p className="text-[10px] uppercase font-medium text-muted-foreground tracking-tight">Ponentes</p>
                          {w.speakers.map(s => (
                            <div key={s.id} className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={s.photo_url || ''} />
                                <AvatarFallback className="text-[8px]">{s.display_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{s.display_name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 border-t pt-2">
                          <TimezoneDisplay date={w.scheduled_at} className="bg-transparent border-none p-0" />
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
