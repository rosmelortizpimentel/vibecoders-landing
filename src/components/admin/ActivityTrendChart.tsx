import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

interface ActivityTrendChartProps {
  data: Array<{ date: string; count: number }>;
}

export function ActivityTrendChart({ data }: ActivityTrendChartProps) {
  const { t } = useTranslation('admin');

  const chartData = useMemo(() => {
    return data.map((item) => {
      // item.date is 'YYYY-MM-DD' from the Edge Function (Toronto relative)
      // We use midday UTC to ensure the date doesn't shift when converting to Toronto time
      const date = new Date(`${item.date}T12:00:00Z`);
      return {
        ...item,
        displayDate: date.toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric',
          timeZone: 'America/Toronto'
        }),
      };
    });
  }, [data]);

  const totalInPeriod = chartData.reduce((sum, d) => sum + d.count, 0);
  const avgPerDay = chartData.length > 0 ? Math.round(totalInPeriod / chartData.length) : 0;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">{t('dailyActiveUsers')}</h3>
          <p className="text-xs text-muted-foreground">{t('last30Days')}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{avgPerDay}</p>
          <p className="text-xs text-muted-foreground">{t('avgPerDay')}</p>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
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
              formatter={(value: number) => [value, t('activeUsers')]}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              fill="url(#colorActivity)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
