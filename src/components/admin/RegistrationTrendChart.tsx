import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface RegistrationTrendChartProps {
  data: Array<{ created_at: string | null }>;
  days?: number;
}

interface DailyCount {
  date: string;
  count: number;
  displayDate: string;
}

export function RegistrationTrendChart({ data, days = 30 }: RegistrationTrendChartProps) {
  const { t } = useTranslation('admin');
  const { language } = useLanguage();

  const chartData = useMemo(() => {
    // Helper to get YYYY-MM-DD in Toronto time
    const getTorontoDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    };

    const now = new Date();
    const torontoTodayStr = getTorontoDate(now);
    const [year, month, day] = torontoTodayStr.split('-').map(Number);
    // Use midday in Toronto to avoid day shifts when iterating
    const endDateMid = new Date(year, month - 1, day, 12, 0, 0);
    
    const startDateMid = new Date(endDateMid);
    startDateMid.setDate(endDateMid.getDate() - days + 1);

    // Create a map of date -> count
    const countByDate = new Map<string, number>();
    
    // Initialize all days with 0
    for (let d = new Date(startDateMid); d <= endDateMid; d.setDate(d.getDate() + 1)) {
      const dateKey = getTorontoDate(d);
      countByDate.set(dateKey, 0);
    }

    // Count registrations per day
    data.forEach((item) => {
      if (!item.created_at) return;
      const dateKey = getTorontoDate(new Date(item.created_at));
      if (countByDate.has(dateKey)) {
        countByDate.set(dateKey, (countByDate.get(dateKey) || 0) + 1);
      }
    });

    // Convert to array for chart
    const result: DailyCount[] = [];
    for (let d = new Date(startDateMid); d <= endDateMid; d.setDate(d.getDate() + 1)) {
      const dateKey = getTorontoDate(d);
      result.push({
        date: dateKey,
        count: countByDate.get(dateKey) || 0,
        displayDate: d.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'pt' ? 'pt-BR' : 'en-US', { 
          month: 'short', 
          day: 'numeric',
          timeZone: 'America/Toronto'
        }),
      });
    }

    return result;
  }, [data, days, language]);

  const totalInPeriod = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">{t('registrationTrend')}</h3>
          <p className="text-xs text-muted-foreground">{t('last30Days')}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{totalInPeriod}</p>
          <p className="text-xs text-muted-foreground">{t('registrations')}</p>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [value, t('registrations')]}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#colorCount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
