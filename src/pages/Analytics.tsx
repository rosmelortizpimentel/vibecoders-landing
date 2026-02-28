import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { InfoIcon, RefreshCw, Copy, CheckCircle2, BarChart3, Rocket, Zap, Plus, ChevronLeft, ChevronRight, Calendar, LayoutDashboard, Settings, ExternalLink, MoreHorizontal, Search, Settings2, Trash2, Smartphone, Monitor, Tablet, Globe2, MapPin, Eye, MousePointerClick } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useApps } from "@/hooks/useApps";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';
import { 
  format, formatDistanceToNow, subDays, startOfDay, endOfDay, subMonths, 
  startOfWeek, startOfMonth, startOfYear, eachHourOfInterval, 
  eachDayOfInterval, eachWeekOfInterval, isSameHour, isSameDay, 
  isSameWeek, parseISO 
} from 'date-fns';
import { getCountryCode } from '@/utils/countryMapping';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { useTranslation } from '@/hooks/useTranslation';

const CountryWithFlag = ({ country }: { country: string }) => {
  const code = getCountryCode(country);
  if (!code) {
    return <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {country}</span>;
  }
  return (
    <span className="flex items-center">
      <img src={`https://flagcdn.com/w20/${code}.png`} srcSet={`https://flagcdn.com/w40/${code}.png 2x`} width="16" alt={country} className="mr-1.5 shadow-sm rounded-sm" />
      {country}
    </span>
  );
};

const BrowserIcon = ({ name }: { name: string }) => {
  const iconName = name?.toLowerCase() || '';
  if (iconName.includes('chrome')) return <img src="/chrome-logo.png" alt="Chrome" className="w-4 h-4 mr-2" />;
  if (iconName.includes('firefox')) return <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/7.0.4/firefox/firefox_128x128.png" alt="Firefox" className="w-4 h-4 mr-2" />;
  if (iconName.includes('safari')) return <img src="/safari-logo.png" alt="Safari" className="w-4 h-4 mr-2" />;
  if (iconName.includes('edge')) return <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/7.0.4/edge/edge_128x128.png" alt="Edge" className="w-4 h-4 mr-2" />;
  if (iconName.includes('opera')) return <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/7.0.4/opera/opera_128x128.png" alt="Opera" className="w-4 h-4 mr-2" />;
  return <Globe2 className="w-4 h-4 mr-2 text-slate-400" />;
}

const OsIcon = ({ name }: { name: string }) => {
  const iconName = name?.toLowerCase() || '';
  if (iconName.includes('wind') || iconName.includes('pc')) return <img src="https://img.icons8.com/color/48/windows-10.png" alt="Windows" className="w-4 h-4 mr-2" />;
  if (iconName.includes('mac') || iconName.includes('ios') || iconName.includes('apple')) return <img src="https://img.icons8.com/ios-filled/50/mac-os.png" alt="Apple" className="w-4 h-4 mr-2 dark:invert" />;
  if (iconName.includes('android')) return <img src="https://img.icons8.com/color/48/android-os.png" alt="Android" className="w-4 h-4 mr-2" />;
  if (iconName.includes('linux') || iconName.includes('cros')) return <img src="https://img.icons8.com/color/48/linux.png" alt="Linux" className="w-4 h-4 mr-2" />;
  return <Monitor className="w-4 h-4 mr-2 text-slate-400" />;
}

const DeviceIcon = ({ name }: { name: string }) => {
  const iconName = name?.toLowerCase() || '';
  if (iconName === 'mobile' || iconName.includes('phone')) return <Smartphone className="w-4 h-4 mr-2 text-blue-500" />;
  if (iconName === 'tablet') return <Tablet className="w-4 h-4 mr-2 text-purple-500" />;
  return <Monitor className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />;
}

interface AnalyticsEvent {
  id: string;
  created_at: string;
  page_path: string;
  referrer: string;
  user_hash: string;
  browser_info?: {
    country?: string;
    region?: string;
    city?: string;
    browser?: string;
    os?: string;
    device?: string;
    screen_width?: number;
    visitor_id?: string;
    session_id?: string;
    event_type?: string;
    extra_data?: any;
  };
}

const Analytics = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  const { profile, signOut } = useAuth();
  const { apps, loading: loadingApps, updateApp } = useApps();
  const { setHeaderContent } = usePageHeader();
  const tCommon = useTranslation('common');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(appId || null);
  
  // If we have an appId in the URL, we're in the project view
  const view = appId ? 'project' : 'dashboard';
  
  // The truly active project is either from URL or the local selection (for modal)
  const activeAppId = appId || selectedAppId;
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dateRange, setDateRange] = useState("today");
  const [granularity, setGranularity] = useState("hourly");

  const isHourlyAllowed = ["today", "yesterday", "24hours", "7days", "week_to_date"].includes(dateRange);

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    const allowsHourly = ["today", "yesterday", "24hours", "7days", "week_to_date"].includes(value);
    if (!allowsHourly && granularity === "hourly") {
      setGranularity("daily");
    }
  };

  const getDateBoundaries = (range: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (range) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "yesterday":
        startDate = startOfDay(subDays(now, 1));
        endDate = endOfDay(subDays(now, 1));
        break;
      case "24hours":
        startDate = subDays(now, 1);
        break;
      case "7days":
        startDate = subDays(now, 7);
        break;
      case "30days":
        startDate = subDays(now, 30);
        break;
      case "12months":
        startDate = subMonths(now, 12);
        break;
      case "week_to_date":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case "month_to_date":
        startDate = startOfMonth(now);
        break;
      case "year_to_date":
        startDate = startOfYear(now);
        break;
      case "all_time":
      default:
        startDate = subMonths(now, 60); // 5 years ago
        break;
    }
    return { startDate, endDate };
  };

  const fetchEvents = async (appId: string) => {
    if (!appId) return;
    setLoadingEvents(true);

    const { startDate, endDate } = getDateBoundaries(dateRange);

    const query = supabase
      .from("vibe_analytics_events")
      .select("*")
      .eq("project_id", appId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000);

    const { data, error } = await query;

    if (!error && data) {
      setEvents(data);
    }
    setLoadingEvents(false);
  };

  // --- Data Aggregation for Charts ---
  
  // --- User Journey Data ---
  const usersMap = new Map<string, AnalyticsEvent[]>();
  events.forEach(e => {
    // try to use visitor_id from new payload, fallback to user_hash
    const uid = e.browser_info?.visitor_id || e.user_hash;
    if (!uid) return;
    if (!usersMap.has(uid)) usersMap.set(uid, []);
    usersMap.get(uid)!.push(e);
  });

  const uniqueUsers = Array.from(usersMap.entries()).map(([uid, userEvents]) => {
    // events are sorted desc by created_at from DB
    const firstEvent = userEvents[userEvents.length - 1];
    const lastEvent = userEvents[0];
    
    // Deterministic fake name generator based on UID
    const seed = Array.from(uid).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const fakeName = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      separator: ' ',
      seed: seed
    });
    
    const browserInfo = lastEvent.browser_info || {};
    let source = lastEvent.referrer || 'Direct/None';
    try { if (source !== 'Direct/None') source = new URL(source).hostname; } catch(e) { /* Ignore invalid URIs */ }
    
    return {
      uid,
      fakeName: fakeName.replace(/-/g, ' '),
      source,
      lastSeen: new Date(lastEvent.created_at),
      firstSeen: new Date(firstEvent.created_at),
      events: userEvents,
      country: browserInfo.country,
      device: browserInfo.device,
      os: browserInfo.os,
      browser: browserInfo.browser,
      pageviews: userEvents.length
    };
  });

  const totalVisitors = uniqueUsers.length;
  const pageViews = events.length;
  const onlineNow = events.filter(e => new Date(e.created_at).getTime() > Date.now() - 5 * 60 * 1000).length;

  const { startDate, endDate } = getDateBoundaries(dateRange);

  let intervals: Date[] = [];
  try {
    if (granularity === 'hourly') {
      intervals = eachHourOfInterval({ start: startDate, end: endDate });
    } else if (granularity === 'daily') {
      intervals = eachDayOfInterval({ start: startDate, end: endDate });
    } else {
      intervals = eachWeekOfInterval({ start: startDate, end: endDate });
    }
  } catch(e) {
    intervals = [];
  }

  const chartData = intervals.map(intervalDate => {
    const bucketEvents = events.filter(e => {
      const eventDate = parseISO(e.created_at);
      if (granularity === 'hourly') return isSameHour(eventDate, intervalDate);
      if (granularity === 'daily') return isSameDay(eventDate, intervalDate);
      return isSameWeek(eventDate, intervalDate);
    });
    
    let timeLabel = '';
    if (granularity === 'hourly') {
      timeLabel = format(intervalDate, "h a");
      if (!["today", "yesterday", "24hours"].includes(dateRange)) {
        timeLabel = format(intervalDate, "MMM d, h a");
      }
    } else if (granularity === 'daily') {
      timeLabel = format(intervalDate, "MMM d");
    } else {
      timeLabel = 'W' + format(intervalDate, "wo, MMM d");
    }

    return {
      time: timeLabel,
      unique: new Set(bucketEvents.map(e => e.browser_info?.visitor_id || e.user_hash).filter(Boolean)).size,
      visitors: bucketEvents.length
    };
  });

  const referrersData = Object.entries(events.reduce((acc, curr) => {
    let source = curr.referrer || 'Direct';
    try {
      if (source !== 'Direct') source = new URL(source).hostname;
    } catch (e) {
      // Ignore URL parsing errors and use Raw Referrer
    }
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const pagesData = Object.entries(events.reduce((acc, curr) => {
    acc[curr.page_path] = (acc[curr.page_path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([path, views]) => ({ path, views })).sort((a,b) => b.views - a.views);

  const countOccurrences = (keyExtract: (e: AnalyticsEvent) => string | undefined) => {
    return Object.entries(events.reduce((acc, curr) => {
      const val = keyExtract(curr) || 'Unknown';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>))
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const countriesData = countOccurrences(e => e.browser_info?.country);
  const regionsData = countOccurrences(e => e.browser_info?.region);
  const citiesData = countOccurrences(e => e.browser_info?.city);
  const browsersData = countOccurrences(e => e.browser_info?.browser);
  const osData = countOccurrences(e => e.browser_info?.os);
  const devicesData = countOccurrences(e => e.browser_info?.device);

  // Colors for Donut Chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  const enabledApps = apps.filter(app => app.analytics_enabled);
  const availableApps = apps.filter(app => !app.analytics_enabled);
  const selectedApp = apps.find(a => a.id === activeAppId);
  const scriptTag = `<script src="https://cdn.vibecoders.la/v1/sdk.js" data-project-id="${activeAppId}" data-services="analytics"></script>`;

  useEffect(() => {
    if (appId) {
      fetchEvents(appId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, dateRange]);

  useEffect(() => {
    if (selectedApp) {
      setHeaderContent(
        <div className="flex items-center gap-2 min-w-0">
          {selectedApp.logo_url ? (
            <img src={selectedApp.logo_url} alt={selectedApp.name || ""} className="h-5 w-5 rounded-md object-cover shrink-0" />
          ) : (
            <BarChart3 className="h-4 w-4 text-primary shrink-0" />
          )}
          <span className="font-semibold text-foreground truncate">Analytics / {selectedApp.name}</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold uppercase tracking-wider ml-2 shrink-0">
            Live
          </span>
        </div>
      );
    } else {
      setHeaderContent(
        <div className="flex items-center gap-2 min-w-0">
          <BarChart3 className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground truncate">Analytics</span>
        </div>
      );
    }
    return () => setHeaderContent(null);
  }, [setHeaderContent, selectedApp]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Código copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnableAnalytics = async (appId: string) => {
    setIsUpdating(true);
    try {
      await updateApp(appId, { analytics_enabled: true });
      toast.success("Analytics activado para este proyecto");
      setShowAddModal(false);
      setSelectedAppId(appId);
      setView('project');
    } catch (error) {
      toast.error("Error al activar analytics");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisableAnalytics = async (appId: string) => {
    setIsUpdating(true);
    try {
      await updateApp(appId, { analytics_enabled: false });
      toast.success("Analytics desactivado");
      if (activeAppId === appId) {
        navigate('/analytics');
      }
    } catch (error) {
      toast.error("Error al desactivar analytics");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loadingApps) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="container px-3 sm:px-8 py-4 sm:py-8 flex-1 max-w-5xl mx-auto text-slate-900 dark:text-slate-50">
      
      <main className="w-full">
        {view === 'dashboard' ? (
          <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Proyectos
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Gestiona las analíticas de tus sitios web y aplicaciones.
                </p>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Buscar proyectos..." 
                    className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="rounded-lg px-4 h-10 bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </header>

            {enabledApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-[#f9fafb] dark:bg-slate-900/30">
                <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <Rocket className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No hay proyectos activos</h3>
                <p className="text-slate-500 max-w-sm mb-6 text-sm">
                  Aún no has activado las analíticas para ningún proyecto. Selecciona una de tus apps para comenzar.
                </p>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="rounded-lg bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 shadow-sm"
                >
                  Configurar primer proyecto
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {enabledApps.map(app => (
                  <div 
                    key={app.id}
                    onClick={() => navigate(`/analytics/${app.id}`)}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {app.logo_url ? (
                          <img src={app.logo_url} alt={app.name || "App Logo"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                            {app.name ? app.name.charAt(0).toUpperCase() : <Rocket className="h-4 w-4" />}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                          {app.name || app.url}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                          {app.url}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          className="cursor-pointer font-medium text-xs"
                          onClick={() => {
                            setSelectedAppId(app.id);
                            setShowInstallModal(true);
                          }}
                        >
                          <Zap className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Install Script</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer font-medium text-xs"
                          onClick={() => {
                            navigate(`/analytics/${app.id}`);
                          }}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Ver Analíticas</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 font-medium text-xs"
                          onClick={() => handleDisableAnalytics(app.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Desactivar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1C1C1E] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/analytics')}
                  className="text-slate-500 hover:text-blue-600 rounded-lg h-8 px-2 flex-shrink-0"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Atrás
                </Button>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                <div className="text-xs font-medium text-slate-500 truncate flex-1 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 shrink-0" />
                  {selectedApp?.url}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center h-8 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <Button variant="ghost" size="icon" className="h-full w-8 rounded-none border-r border-slate-200 dark:border-slate-800 hidden sm:flex text-slate-400 hover:text-slate-600" disabled>
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Select value={dateRange} onValueChange={handleDateRangeChange}>
                      <SelectTrigger className="h-full border-0 bg-transparent rounded-none text-xs font-medium w-[130px] sm:w-[150px] focus:ring-0 focus:ring-offset-0 px-3">
                        <SelectValue placeholder="Date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="24hours">Last 24 hours</SelectItem>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="12months">Last 12 months</SelectItem>
                        <SelectItem value="week_to_date">Week to date</SelectItem>
                        <SelectItem value="month_to_date">Month to date</SelectItem>
                        <SelectItem value="year_to_date">Year to date</SelectItem>
                        <SelectItem value="all_time">All time</SelectItem>
                        <SelectItem value="custom" disabled className="flex items-center justify-between">
                          <span>Custom</span> <Calendar className="h-3 w-3 opacity-50 ml-2 inline-block" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-full w-8 rounded-none border-l border-slate-200 dark:border-slate-800 hidden sm:flex text-slate-400 hover:text-slate-600" disabled>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Select value={granularity} onValueChange={setGranularity}>
                    <SelectTrigger className="w-[90px] h-8 bg-white dark:bg-[#1C1C1E] border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium shadow-sm focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Granularity" />
                    </SelectTrigger>
                    <SelectContent>
                      {isHourlyAllowed && <SelectItem value="hourly">Hourly</SelectItem>}
                      <SelectItem value="daily">Daily</SelectItem>
                      {!isHourlyAllowed && <SelectItem value="weekly">Weekly</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowInstallModal(true)}
                    className="h-8 rounded-lg bg-white dark:bg-slate-900 px-2.5"
                  >
                    <Zap className="h-3.5 w-3.5 sm:mr-1.5 text-blue-500 fill-blue-500" />
                    <span className="hidden sm:inline">Script</span>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                        <Settings className="h-4 w-4 text-slate-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Configuración de Analytics</DialogTitle>
                        <DialogDescription>
                          Gestiona la integración de analíticas para este proyecto.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-6 border-t border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-red-600 mb-2">Zona de Peligro</h4>
                        <p className="text-xs text-slate-500 mb-4">
                          Si desactivas las analíticas, dejarás de recibir datos de este proyecto en tu dashboard, aunque conservaremos tu historial.
                        </p>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => handleDisableAnalytics(selectedAppId!)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                          Desactivar Analytics
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
            </header>

            {/* New Analytics Layout */}
            <div className="flex flex-col gap-4">
              {/* Main Chart Card */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] overflow-hidden">
                <div className="flex items-center gap-6 p-4 border-b border-slate-100 dark:border-slate-800/50 overflow-x-auto bg-slate-50/50 dark:bg-[#1C1C1E]/50">
                  <div className="flex flex-col gap-1 min-w-max cursor-pointer text-blue-600 border-b-2 border-blue-600 pb-2 transition-all px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-blue-600 flex items-center justify-center">
                            <CheckCircle2 className="h-2 w-2 text-white" />
                        </div>
                        Unique Visitors
                    </span>
                    <span className="text-3xl font-black">{totalVisitors}</span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-max cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 px-3 rounded-xl transition-colors">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm border border-slate-300 dark:border-slate-600 bg-transparent"></div>
                        Total Views
                    </span>
                    <span className="text-3xl font-black text-slate-700 dark:text-slate-300">{pageViews}</span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-max pl-6 ml-auto border-l border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">Online <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div></span>
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{onlineNow}</span>
                  </div>
                </div>
                <CardContent className="p-0 pt-4 pb-2">
                  <div className="h-[220px] w-full px-2" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Acquisition Donut */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] flex flex-col">
                  <CardHeader className="p-4 pb-0 border-b border-slate-100 dark:border-slate-800/50">
                    <Tabs defaultValue="referrer" className="w-full">
                      <div className="flex items-center justify-between">
                        <TabsList className="bg-transparent p-0 h-auto">
                          <TabsTrigger value="channel" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-blue-600 p-0 mr-4 text-slate-500">Channel</TabsTrigger>
                          <TabsTrigger value="referrer" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-foreground p-0 mr-4">Referrer</TabsTrigger>
                          <TabsTrigger value="campaign" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-foreground p-0 mr-4 text-slate-500">Campaign</TabsTrigger>
                        </TabsList>
                      </div>
                    </Tabs>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-6 min-h-[300px]">
                    {referrersData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={referrersData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {referrersData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <span className="text-slate-500 text-sm py-20 flex flex-col items-center gap-2">
                        <BarChart3 className="h-8 w-8 opacity-20" />
                        No data available
                      </span>
                    )}
                    <div className="flex flex-wrap gap-4 mt-4 justify-center">
                      {referrersData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Geolocation and Technology Cards */}
                <div className="flex flex-col gap-4">
                    {/* Geolocation Card */}
                    <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] flex flex-col">
                    <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/50 pb-0">
                        <Tabs defaultValue="country" className="w-full">
                        <div className="flex items-center justify-between">
                            <TabsList className="bg-transparent p-0 h-auto">
                            <TabsTrigger value="country" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-foreground p-0 mr-4">Country</TabsTrigger>
                            <TabsTrigger value="region" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-foreground p-0 mr-4 text-slate-500">Region</TabsTrigger>
                            <TabsTrigger value="city" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-foreground p-0 mr-4 text-slate-500">City</TabsTrigger>
                            <TabsTrigger value="page" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-foreground p-0 mr-4 text-slate-500">Page</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="country" className="m-0 pt-2 pb-2">
                            <div className="flex flex-col max-h-[250px] overflow-y-auto">
                            {countriesData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 px-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <span className="text-sm font-medium truncate max-w-[70%] text-slate-800 dark:text-slate-200"><CountryWithFlag country={item.name} /></span>
                                <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{item.count}</span>
                                </div>
                            ))}
                            {countriesData.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No location data available</div>}
                            </div>
                        </TabsContent>
                        <TabsContent value="region" className="m-0 pt-2 pb-2">
                            <div className="flex flex-col max-h-[250px] overflow-y-auto">
                            {regionsData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 px-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <span className="text-sm font-medium truncate max-w-[70%] text-slate-800 dark:text-slate-200">{item.name}</span>
                                <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{item.count}</span>
                                </div>
                            ))}
                            {regionsData.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No location data available</div>}
                            </div>
                        </TabsContent>
                        <TabsContent value="city" className="m-0 pt-2 pb-2">
                            <div className="flex flex-col max-h-[250px] overflow-y-auto">
                            {citiesData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 px-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <span className="text-sm font-medium truncate max-w-[70%] text-slate-800 dark:text-slate-200">{item.name}</span>
                                <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{item.count}</span>
                                </div>
                            ))}
                            {citiesData.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No location data available</div>}
                            </div>
                        </TabsContent>
                        <TabsContent value="page" className="m-0 pt-2 pb-2">
                            <div className="flex flex-col max-h-[250px] overflow-y-auto">
                            {pagesData.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 px-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <span className="text-sm font-medium truncate max-w-[70%] text-slate-800 dark:text-slate-200">{p.path}</span>
                                <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{p.views}</span>
                                </div>
                            ))}
                            {pagesData.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No page data available</div>}
                            </div>
                        </TabsContent>
                        </Tabs>
                    </CardHeader>
                    </Card>

                    {/* Technology Card */}
                    <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] flex flex-col">
                    <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/50 pb-0">
                        <Tabs defaultValue="browser" className="w-full">
                        <div className="flex items-center justify-between">
                            <TabsList className="bg-transparent p-0 h-auto">
                            <TabsTrigger value="browser" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold p-0 mr-4">Browser</TabsTrigger>
                            <TabsTrigger value="os" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold p-0 mr-4 text-slate-500">OS</TabsTrigger>
                            <TabsTrigger value="device" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold p-0 mr-4 text-slate-500">Device</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="browser" className="m-0 pt-2 pb-2">
                            <div className="flex flex-col max-h-[250px] overflow-y-auto">
                                {browsersData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 px-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center">
                                      <BrowserIcon name={item.name} />
                                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{item.count}</span>
                                    </div>
                                ))}
                                {browsersData.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No browser data</div>}
                            </div>
                        </TabsContent>
                        <TabsContent value="os" className="m-0 pt-2 pb-2">
                            <div className="flex flex-col max-h-[250px] overflow-y-auto">
                                {osData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 px-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center">
                                      <OsIcon name={item.name} />
                                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{item.count}</span>
                                    </div>
                                ))}
                                {osData.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No OS data</div>}
                            </div>
                        </TabsContent>
                        <TabsContent value="device" className="m-0 pt-2 pb-2">
                            <div className="flex flex-col max-h-[250px] overflow-y-auto">
                                {devicesData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 px-4 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center">
                                      <DeviceIcon name={item.name} />
                                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{item.count}</span>
                                    </div>
                                ))}
                                {devicesData.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No device data</div>}
                            </div>
                        </TabsContent>
                        </Tabs>
                    </CardHeader>
                    </Card>
                </div>

              </div>
            </div>

            {/* Users / Visitors Tracker Card */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E]">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/50">
                <Tabs defaultValue="user" className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <TabsList className="bg-transparent p-0 h-auto w-full justify-start overflow-x-auto">
                      <TabsTrigger value="user" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-foreground p-0 mr-4">User</TabsTrigger>
                      <TabsTrigger value="journey" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:text-foreground p-0 mr-4 text-slate-500">Journey</TabsTrigger>
                    </TabsList>
                    <div className="relative shrink-0 w-full sm:w-auto">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="Search user..." className="h-9 pl-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800/50 w-full sm:w-48 ml-auto" />
                    </div>
                  </div>
                </Tabs>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-transparent">
                      <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800/50">
                        <TableHead className="w-[400px] text-xs font-semibold text-slate-500">Visitor</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Source</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">Last seen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniqueUsers.map((user, i) => (
                        <Sheet key={user.uid}>
                          <SheetTrigger asChild>
                            <TableRow className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/50">
                              <TableCell className="py-4">
                                <div className="flex items-center gap-4 min-w-[300px]">
                                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fakeName.replace(/\s+/g, '')}&backgroundColor=transparent`} alt={user.fakeName} />
                                    <AvatarFallback>{user.fakeName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">{user.fakeName}</span>
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                      {user.country && user.country !== 'Unknown' && <CountryWithFlag country={user.country} />}
                                      {user.device && user.device !== 'Unknown' && <span className="flex items-center"><DeviceIcon name={user.device} /> {user.device}</span>}
                                      {user.os && user.os !== 'Unknown' && <span className="flex items-center"><OsIcon name={user.os} /> {user.os}</span>}
                                      {user.browser && <span className="flex items-center text-slate-500"><BrowserIcon name={user.browser} /> <span className="ml-[2px]">{user.browser}</span></span>}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 align-top pt-5 min-w-[200px]">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                                  {user.source}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 align-top pt-5">
                                <div className="flex flex-col gap-2">
                                  <span className="text-sm text-slate-900 dark:text-slate-100">
                                    {formatDistanceToNow(user.lastSeen, { addSuffix: true })}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-50">
                                    {/* Timeline dots representing pageviews/events */}
                                    {[...Array(Math.min(user.pageviews, 8))].map((_, idx) => (
                                      <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                                    ))}
                                    {user.pageviews > 8 && <span className="text-[10px] text-slate-400 ml-1">+{user.pageviews - 8}</span>}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                            <SheetHeader className="text-left space-y-4 mb-8">
                              <div className="flex items-center gap-4 pt-4">
                                <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fakeName.replace(/\s+/g, '')}&backgroundColor=transparent`} alt={user.fakeName} />
                                  <AvatarFallback>{user.fakeName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <SheetTitle className="text-xl capitalize">{user.fakeName}</SheetTitle>
                                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                    <CountryWithFlag country={user.country || 'Unknown Location'} />
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                <div>
                                  <p className="text-slate-500 mb-1">Acquisition Source</p>
                                  <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.source}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 mb-1">Total Events</p>
                                  <p className="font-medium text-slate-900 dark:text-slate-100">{user.pageviews}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 mb-1">Operating Sys</p>
                                  <div className="flex items-center font-medium text-slate-900 dark:text-slate-100">
                                    {user.os && <OsIcon name={user.os} />} {user.os}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-slate-500 mb-1">Browser</p>
                                  <div className="flex items-center font-medium text-slate-900 dark:text-slate-100">
                                    {user.browser && <BrowserIcon name={user.browser} />} <span className={user.browser ? "ml-1" : ""}>{user.browser}</span>
                                  </div>
                                </div>
                              </div>
                            </SheetHeader>
                            
                            <div className="space-y-6 relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-4 pb-8">
                              {user.events.map((evt, idx) => {
                                const type = evt.browser_info?.event_type || 'pageview';
                                return (
                                  <div key={evt.id} className="relative">
                                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-white dark:bg-slate-950 border-2 border-blue-500"></div>
                                    <div className="text-xs font-semibold text-slate-500 mb-1.5 flex justify-between">
                                      <span>{format(new Date(evt.created_at), 'MMM d, h:mm a')}</span>
                                      {idx === 0 && <span className="text-blue-500">Latest</span>}
                                    </div>
                                    <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        {type === 'pageview' ? <Eye className="w-4 h-4 text-blue-500" /> : type === 'external_link' ? <ExternalLink className="w-4 h-4 text-orange-500" /> : <MousePointerClick className="w-4 h-4 text-purple-500" />}
                                        <span className="font-bold text-sm capitalize text-slate-800 dark:text-slate-200">{type.replace('_', ' ')}</span>
                                      </div>
                                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 break-all">
                                        {type === 'pageview' ? evt.page_path : (evt.browser_info?.extra_data?.custom_event_name || evt.browser_info?.extra_data?.target_url || 'Custom Interaction')}
                                      </p>
                                      {type !== 'pageview' && evt.browser_info?.extra_data && (
                                        <pre className="mt-3 text-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-2 rounded-lg text-slate-500 overflow-x-auto">
                                          {JSON.stringify(evt.browser_info.extra_data, null, 2)}
                                        </pre>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </SheetContent>
                        </Sheet>
                      ))}
                      {uniqueUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                            No users found in the selected period.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 max-w-2xl mt-6">
              <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertTitle className="text-amber-800 dark:text-amber-400 font-bold">Importante</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-500/80 text-sm leading-relaxed">
                Los datos de analíticas son anónimos por defecto. No vinculamos ninguna visita con cuentas de usuario específicas de tu plataforma para mantener el cumplimiento de privacidad.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </main>

      {/* Add Project Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Proyecto</DialogTitle>
            <DialogDescription>
              Selecciona una de tus aplicaciones para habilitar las analíticas de Vibe.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            {availableApps.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                No tienes más aplicaciones disponibles.
                <Button variant="link" onClick={() => window.location.href='/dashboard'}>Crear nueva app</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2">
                {availableApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleEnableAnalytics(app.id)}
                    disabled={isUpdating}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all text-left"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Rocket className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{app.name || app.url}</div>
                      <div className="text-xs text-slate-500 truncate">{app.url}</div>
                    </div>
                    <Plus className="h-5 w-5 text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Install Script Modal - REDESIGNED */}
      <Dialog open={showInstallModal} onOpenChange={setShowInstallModal}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 space-y-8">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <span>Install Script — {selectedApp?.name || 'Vibe'}</span>
                </DialogTitle>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FFF9F2] dark:bg-amber-900/10 border border-[#FFE4CC] dark:border-amber-900/20">
                <div className="mt-1">
                  <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <InfoIcon className="h-3 w-3 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold">Paste this once</span> in your website's <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;head&gt;</code>. This single script controls <span className="font-bold">all analytics</span> for this project.
                </p>
              </div>
            </DialogHeader>
            
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Embed Code</h4>
              <div className="relative group">
                <pre className="p-8 rounded-2xl bg-[#121212] text-white overflow-x-auto text-sm font-mono border border-white/5 leading-relaxed">
                  {scriptTag}
                </pre>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed italic">
              This script automatically works on <span className="font-bold text-slate-600 dark:text-slate-300">{selectedApp?.url?.replace('https://', '').replace('/', '')}</span> and all subdomains.
            </p>

            <Button 
              className="w-full h-14 rounded-2xl bg-[#121212] hover:bg-slate-800 text-white font-bold text-base shadow-xl transition-all active:scale-[0.98]"
              onClick={() => copyToClipboard(scriptTag)}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-3 text-green-400" />
                  Copiado con éxito
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-3" />
                  Copy Script
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
