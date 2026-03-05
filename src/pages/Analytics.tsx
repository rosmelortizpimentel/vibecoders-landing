import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoIcon, RefreshCw, Copy, CheckCircle2, BarChart3, Rocket, Zap, Plus, ChevronLeft, ChevronRight, Calendar, LayoutDashboard, Settings, ExternalLink, MoreHorizontal, Search, Settings2, Trash2, LucideIcon, Maximize2, Minimize2, Video, Flame, Cpu, Smartphone, Monitor, Tablet, Globe2, MapPin, Eye, MousePointerClick, X, Share2, Link, Mail, MessageSquare, Instagram, Facebook, Youtube, Twitter, ChevronUp, ChevronDown, Sparkles, Crown, ArrowRight } from "lucide-react";
import { formatDistanceToNow, format, differenceInDays, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, subMonths, startOfYear, parseISO, isSameDay, isSameHour, isSameWeek, eachHourOfInterval, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useApps } from "@/hooks/useApps";
import { toast } from "sonner";
import { DateRange, DayPicker } from "react-day-picker";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';
import { getCountryCode } from '@/utils/countryMapping';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { useTranslation } from '@/hooks/useTranslation';
import WorldMap from "@/components/analytics/WorldMap";
import { useHasFeature } from "@/hooks/useFeatures";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";
import { ProBadge } from "@/components/ui/ProBadge";
import { UpgradeBadge } from "@/components/ui/UpgradeBadge";

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

const BrowserIcon = ({ name, size = 16 }: { name: string, size?: number }) => {
  const iconName = name?.toLowerCase() || '';
  const imgClass = `mr-2 object-contain`;
  const style = { width: size, height: size };
  
  if (iconName.includes('chrome')) return <img src="/chrome-logo.png" alt="Chrome" className={imgClass} style={style} />;
  if (iconName.includes('firefox')) return <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/7.0.4/firefox/firefox_128x128.png" alt="Firefox" className={imgClass} style={style} />;
  if (iconName.includes('safari')) return <img src="/safari-logo.png" alt="Safari" className={imgClass} style={style} />;
  if (iconName.includes('edge')) return <img src="/edge-logo.png" alt="Edge" className={imgClass} style={style} />;
  if (iconName.includes('opera')) return <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/7.0.4/opera/opera_128x128.png" alt="Opera" className={imgClass} style={style} />;
  if (iconName.includes('samsung')) return <img src="/samsung-logo.png" alt="Samsung" className={imgClass} style={style} />;
  if (iconName.includes('in-app')) return <Smartphone size={size} className="mr-2 text-slate-400" />;
  return <Globe2 size={size} className="mr-2 text-slate-400" />;
}

const OsIcon = ({ name, size = 16 }: { name: string, size?: number }) => {
  const iconName = name?.toLowerCase() || '';
  const imgClass = `mr-2 object-contain`;
  const style = { width: size, height: size };

  if (iconName.includes('wind') || iconName.includes('pc')) return <img src="https://img.icons8.com/color/48/windows-10.png" alt="Windows" className={imgClass} style={style} />;
  if (iconName.includes('mac') || iconName.includes('ios') || iconName.includes('apple')) return <img src="https://img.icons8.com/ios-filled/50/mac-os.png" alt="Apple" className={`${imgClass} dark:invert`} style={style} />;
  if (iconName.includes('android')) return <img src="https://img.icons8.com/color/48/android-os.png" alt="Android" className={imgClass} style={style} />;
  if (iconName.includes('linux') || iconName.includes('cros')) return <img src="https://img.icons8.com/color/48/linux.png" alt="Linux" className={imgClass} style={style} />;
  return <Monitor size={size} className="mr-2 text-slate-400" />;
}

const DeviceIcon = ({ name, size = 16 }: { name: string, size?: number }) => {
  const iconName = name?.toLowerCase() || '';
  if (iconName === 'mobile' || iconName.includes('phone')) return <Smartphone size={size} className="mr-2 text-blue-500" />;
  if (iconName === 'tablet') return <Tablet size={size} className="mr-2 text-purple-500" />;
  return <Monitor size={size} className="mr-2 text-slate-600 dark:text-slate-400" />;
}

const cleanUrl = (url: string) => {
  if (!url) return "";
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
};

const AcquisitionIcon = ({ name, type, appLogo }: { name: string, type: 'channel' | 'source' | 'referrer', appLogo?: string | null }) => {
  const lowerName = name?.toLowerCase() || '';
  
  if (type === 'channel') {
    if (lowerName.includes('direct')) return <Zap className="w-4 h-4 mr-2 text-yellow-500" />;
    if (lowerName.includes('search')) return <Search className="w-4 h-4 mr-2 text-blue-500" />;
    if (lowerName.includes('social')) return <Share2 className="w-4 h-4 mr-2 text-purple-500" />;
    if (lowerName.includes('referral')) return <Link className="w-4 h-4 mr-2 text-emerald-500" />;
    if (lowerName.includes('email')) return <Mail className="w-4 h-4 mr-2 text-rose-500" />;
    return <Globe2 className="w-4 h-4 mr-2 text-slate-400" />;
  }

  // Handle dynamic app logo for yaku.today or direct/internal domains
  if (appLogo && (lowerName.includes('yaku.today') || lowerName.includes('localhost') || lowerName.includes('vibecoders'))) {
    return <img src={appLogo} alt="App Logo" className="w-4 h-4 mr-2 rounded-sm object-cover" />;
  }

  // Source specific icons
  if (lowerName.includes('google')) return <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2 rounded-sm" />;
  if (lowerName.includes('facebook')) return <Facebook className="w-4 h-4 mr-2 text-[#1877F2]" />;
  if (lowerName.includes('instagram')) return <Instagram className="w-4 h-4 mr-2 text-[#E4405F]" />;
  if (lowerName.includes('youtube')) return <Youtube className="w-4 h-4 mr-2 text-[#FF0000]" />;
  if (lowerName.includes('linkedin')) return <img src="https://www.linkedin.com/favicon.ico" alt="LinkedIn" className="w-4 h-4 mr-2 rounded-sm" />;
  if (lowerName.includes('twitter') || lowerName.includes('x.com')) return <Twitter className="w-4 h-4 mr-2 text-[#1DA1F2]" />;
  if (lowerName.includes('tiktok')) return <img src="https://tiktok.com/favicon.ico" alt="TikTok" className="w-4 h-4 mr-2 rounded-sm" />;
  if (lowerName.includes('whatsapp')) return <img src="https://whatsapp.com/favicon.ico" alt="WhatsApp" className="w-4 h-4 mr-2 rounded-sm" />;
  if (lowerName.includes('reddit')) return <img src="https://reddit.com/favicon.ico" alt="Reddit" className="w-4 h-4 mr-2 rounded-sm" />;

  return <Globe2 className="w-4 h-4 mr-2 text-slate-400" />;
}

interface AnalyticsEvent {
  id: string;
  created_at: string;
  page_path: string;
  referrer: string;
  user_hash: string;
  // Legacy root properties support
  region?: string;
  country?: string;
  city?: string;
  browser?: string;
  os?: string;
  device?: string;
  browser_info?: {
    country?: string;
    region?: string;
    city?: string;
    browser?: string;
    os?: string;
    device?: string;
    screen_width?: number;
    screen_height?: number;
    visitor_id?: string;
    session_id?: string;
    event_type?: string;
    extra_data?: Record<string, unknown>;
  };
  event_type?: string;
  custom_event_name?: string;
  target_url?: string;
}

const IN_APP_BROWSERS = ['linkedin', 'instagram', 'facebook', 'tiktok', 'twitter', 'pinterest', 'snapchat', 'fban', 'fbav'];

// Helper to adjust percentages to sum exactly to 100.0%
const adjustDataWithPercentages = <T extends { name?: string; path?: string; count?: number; value?: number; views?: number }>(
  data: T[],
  valueKey: string = 'count'
) => {
  const total = data.reduce((acc, item) => acc + (Number(item[valueKey]) || 0), 0);
  if (total === 0) return data.map(item => ({ ...item, percentage: 0 }));

  const rawItems = data.map(item => ({
    ...item,
    percentage: ((Number(item[valueKey]) || 0) / total) * 100
  })) as (T & { percentage: number })[];

  // Adjust to sum exactly to 100% using 1 decimal place
  const roundedTotal = rawItems.reduce((acc, item) => acc + Math.round(item.percentage * 10) / 10, 0);
  const diff = 100 - roundedTotal;
  
  if (Math.abs(diff) > 0.01 && rawItems.length > 0) {
    rawItems[0].percentage = Number((rawItems[0].percentage + diff).toFixed(1));
  }
  
  return rawItems;
};

// Generic expandable list component
function ExpandableList<T>({ 
  items, 
  limit = 10, 
  renderItem, 
  emptyMessage,
  listClassName = "flex flex-col gap-1 w-full"
}: { 
  items: T[], 
  limit?: number, 
  renderItem: (item: T, index: number, isExpanded: boolean) => React.ReactNode, 
  emptyMessage?: React.ReactNode,
  listClassName?: string
}) {
  const [expanded, setExpanded] = useState(false);
  
  if (!items || items.length === 0) {
    return <>{emptyMessage}</>;
  }

  const hasMore = items.length > limit;
  const visibleItems = expanded ? items : items.slice(0, limit);
  const hiddenCount = items.length - limit;

  return (
    <div className={listClassName}>
      {visibleItems.map((item, index) => renderItem(item, index, expanded))}
      
      {hasMore && (
        <div 
          onClick={() => setExpanded(!expanded)}
          className="relative flex items-center justify-center text-[11px] py-1.5 px-2 rounded cursor-pointer transition-colors bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-medium"
        >
          {expanded ? (
            <span className="flex items-center gap-1"><ChevronUp className="w-3 h-3" /> Ver menos</span>
          ) : (
            <span className="flex items-center gap-1">Otros ({hiddenCount}) <ChevronDown className="w-3 h-3" /></span>
          )}
        </div>
      )}
    </div>
  );
}

const Analytics = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  const { user, signOut } = useAuth();
  const { apps, loading: loadingApps, updateApp } = useApps();
  const { setHeaderContent } = usePageHeader();
  const tCommon = useTranslation('common');
  const { hasFeature: isPremium, isLoading: isLoadingTier } = useHasFeature('analytics_advanced');
  const { data: generalSettings, isLoading: isLoadingSettings } = useGeneralSettings();
  const { createCheckout } = useSubscription();
  const planPrice = generalSettings?.find(s => s.key === 'stripe_active_price_amount')?.value || "9.90";
  const planName = generalSettings?.find(s => s.key === 'stripe_active_product_name')?.value || "Pro";
  const [selectedAppId, setSelectedAppId] = useState<string | null>(appId || null);
  
  const handlePro = async () => {
    try {
      const result = await createCheckout.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (e) {
      toast.error('No se pudo crear la sesión de pago.');
    }
  };
  
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
  const [dateRange, setDateRange] = useState(() => localStorage.getItem('vibe_analytics_dateRange') || "today");
  const [granularity, setGranularity] = useState(() => localStorage.getItem('vibe_analytics_granularity') || "hourly");
  const [lastXDays, setLastXDays] = useState(() => Number(localStorage.getItem('vibe_analytics_lastXDays')) || 3);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(() => {
    const saved = localStorage.getItem('vibe_analytics_customRange');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          from: parsed.from ? new Date(parsed.from) : undefined,
          to: parsed.to ? new Date(parsed.to) : undefined,
        };
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  });
  const [tempRangeType, setTempRangeType] = useState("today");
  const [tempDays, setTempDays] = useState(3);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Global Cross-Filtering State
  const [filters, setFilters] = useState<{ key: string, value: string, label: string }[]>([]);

  const addFilter = (key: string, value: string, label: string) => {
    setFilters(prev => {
      // If filter already exists for this exact key and value, remove it (toggle off)
      if (prev.some(f => f.key === key && f.value === value)) {
        return prev.filter(f => !(f.key === key && f.value === value));
      }
      // Remove any existing filter for the same key to avoid contradictory AND logic which yields 0 results
      const withoutKey = prev.filter(f => f.key !== key);
      return [...withoutKey, { key, value, label }];
    });
  };

  const removeFilter = (key: string, value: string) => {
    setFilters(prev => prev.filter(f => !(f.key === key && f.value === value)));
  };

  const clearFilters = () => setFilters([]);

  const filteredEvents = useMemo(() => {
    if (filters.length === 0) return events;
    return events.filter(e => {
      // AND logic: event must match ALL active filters
      return filters.every(f => {
        if (f.key === 'browser') return (e.browser_info?.browser || 'Unknown') === f.value;
        if (f.key === 'os') return (e.browser_info?.os || 'Unknown') === f.value;
        if (f.key === 'device') return (e.browser_info?.device || 'Unknown') === f.value;
        if (f.key === 'country') return (e.browser_info?.country || 'Unknown') === f.value;
        if (f.key === 'region') return (e.browser_info?.region || e.region || 'Unknown') === f.value;
        if (f.key === 'city') return (e.browser_info?.city || e.city || 'Unknown') === f.value;
        if (f.key === 'page_path') return e.page_path === f.value;
        if (f.key === 'channel') return getReferrerClassification(e.referrer).channel === f.value;
        if (f.key === 'source') return getReferrerClassification(e.referrer).source === f.value;
        if (f.key === 'referrer') return getReferrerClassification(e.referrer).referrer === f.value;
        return true;
      });
    });
  }, [events, filters]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('vibe_analytics_dateRange', dateRange);
  }, [dateRange]);

  useEffect(() => {
    localStorage.setItem('vibe_analytics_granularity', granularity);
  }, [granularity]);

  useEffect(() => {
    localStorage.setItem('vibe_analytics_lastXDays', lastXDays.toString());
  }, [lastXDays]);

  useEffect(() => {
    if (customRange) {
      localStorage.setItem('vibe_analytics_customRange', JSON.stringify(customRange));
    }
  }, [customRange]);


  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    const allowsHourly = ["today", "yesterday", "24hours", "7days", "week_to_date"].includes(value);
    if (!allowsHourly && granularity === "hourly") {
      setGranularity("daily");
    }
  };

  const getDateBoundaries = useCallback((range: string) => {
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
      case "last_x_days":
        startDate = startOfDay(subDays(now, lastXDays));
        break;
      case "custom":
        startDate = customRange?.from ? startOfDay(customRange.from) : subDays(now, 7);
        endDate = customRange?.to ? endOfDay(customRange.to) : now;
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
  }, [lastXDays, customRange]);

  const isHourlyAllowed = useMemo(() => {
    if (["today", "yesterday", "24hours"].includes(dateRange)) return true;
    const { startDate, endDate } = getDateBoundaries(dateRange);
    const diffDays = Math.abs(differenceInDays(endDate, startDate));
    return diffDays <= 7;
  }, [dateRange, getDateBoundaries]);

  const fetchEvents = async (appId: string) => {
    if (!appId) return;
    setLoadingEvents(true);

    if (!isLoadingTier && !isPremium) {
      setEvents([]);
      setLoadingEvents(false);
      return;
    }

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
      setEvents(data as AnalyticsEvent[]);
    }
    setLoadingEvents(false);
  };

  // --- Data Aggregation for Charts ---
  
  // --- User Journey Data ---
  const usersMap = new Map<string, AnalyticsEvent[]>();
  filteredEvents.forEach(e => {
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
      referrer: lastEvent.referrer,
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
  const pageViews = filteredEvents.length;
  const onlineNow = filteredEvents.filter(e => new Date(e.created_at).getTime() > Date.now() - 5 * 60 * 1000).length;

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
    const bucketEvents = filteredEvents.filter(e => {
      const eventDate = parseISO(e.created_at);
      if (granularity === 'hourly') return isSameHour(eventDate, intervalDate);
      if (granularity === 'daily') return isSameDay(eventDate, intervalDate);
      return isSameWeek(eventDate, intervalDate);
    });
    
    let timeLabel = '';
    let fullDateLabel = '';
    
    if (granularity === 'hourly') {
      timeLabel = format(intervalDate, "h a"); // Short label for X-Axis
      fullDateLabel = format(intervalDate, "MMM d, h:mm a"); // Detailed for Tooltip
    } else if (granularity === 'daily') {
      timeLabel = format(intervalDate, "MMM d");
      fullDateLabel = format(intervalDate, "MMMM d, yyyy");
    } else {
      timeLabel = 'W' + format(intervalDate, "wo, MMM d");
      fullDateLabel = 'Week of ' + format(intervalDate, "MMM d, yyyy");
    }

    return {
      time: timeLabel,
      fullDate: fullDateLabel,
      unique: new Set(bucketEvents.map(e => e.browser_info?.visitor_id || e.user_hash).filter(Boolean)).size,
      visitors: bucketEvents.length
    };
  });

  const getReferrerClassification = (referrer: string | undefined | null) => {
    const urlString = referrer || '';
    if (!urlString || urlString === 'Direct/None' || urlString === 'Direct' || urlString === 'null' || urlString.trim() === '') {
      return { channel: 'Direct', source: 'Direct', referrer: 'Direct' };
    }
    
    let hostname = urlString;
    try {
      hostname = new URL(urlString).hostname;
    } catch (e) {
      // Ignore URL parsing errors and use Raw Referrer
    }

    const lowerHost = hostname.toLowerCase();

    // Social
    if (lowerHost.includes('linkedin')) return { channel: 'Social', source: 'LinkedIn', referrer: hostname };
    if (lowerHost.includes('instagram')) return { channel: 'Social', source: 'Instagram', referrer: hostname };
    if (lowerHost.includes('facebook') || lowerHost.includes('fb.me')) return { channel: 'Social', source: 'Facebook', referrer: hostname };
    if (lowerHost.includes('twitter') || lowerHost.includes('t.co') || lowerHost.includes('x.com')) return { channel: 'Social', source: 'X / Twitter', referrer: hostname };
    if (lowerHost.includes('tiktok')) return { channel: 'Social', source: 'TikTok', referrer: hostname };
    if (lowerHost.includes('youtube')) return { channel: 'Social', source: 'YouTube', referrer: hostname };
    if (lowerHost.includes('reddit')) return { channel: 'Social', source: 'Reddit', referrer: hostname };
    if (lowerHost.includes('whatsapp')) return { channel: 'Social', source: 'WhatsApp', referrer: hostname };

    // Organic Search
    if (lowerHost.includes('google')) return { channel: 'Organic Search', source: 'Google', referrer: hostname };
    if (lowerHost.includes('bing')) return { channel: 'Organic Search', source: 'Bing', referrer: hostname };
    if (lowerHost.includes('yahoo')) return { channel: 'Organic Search', source: 'Yahoo', referrer: hostname };
    if (lowerHost.includes('duckduckgo')) return { channel: 'Organic Search', source: 'DuckDuckGo', referrer: hostname };
    if (lowerHost.includes('yandex')) return { channel: 'Organic Search', source: 'Yandex', referrer: hostname };
    if (lowerHost.includes('ecosia')) return { channel: 'Organic Search', source: 'Ecosia', referrer: hostname };

    // Default to Referral
    return { channel: 'Referral', source: hostname, referrer: hostname };
  };

  const channelCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  const referrerCounts: Record<string, number> = {};

  filteredEvents.forEach(e => {
    const { channel, source, referrer } = getReferrerClassification(e.referrer);
    channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
  });

  const channelsData = Object.entries(channelCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const sourcesData = Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const referrersData = Object.entries(referrerCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const pagesData = Object.entries(filteredEvents.reduce((acc, curr) => {
    acc[curr.page_path] = (acc[curr.page_path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([path, views]) => ({ path, views })).sort((a,b) => b.views - a.views);

  // Group events by session to find entry and exit pages
  const sessions = new Map<string, AnalyticsEvent[]>();
  filteredEvents.forEach(e => {
    const sid = e.browser_info?.session_id;
    if (!sid) return;
    if (!sessions.has(sid)) sessions.set(sid, []);
    sessions.get(sid)!.push(e);
  });

  const entryPagesRaw: Record<string, number> = {};
  const exitPagesRaw: Record<string, number> = {};

  sessions.forEach(sessionEvents => {
    // events are sorted desc by created_at from DB
    // so last event in array is entry, first is exit
    const entryPath = sessionEvents[sessionEvents.length - 1].page_path;
    const exitPath = sessionEvents[0].page_path;
    
    entryPagesRaw[entryPath] = (entryPagesRaw[entryPath] || 0) + 1;
    exitPagesRaw[exitPath] = (exitPagesRaw[exitPath] || 0) + 1;
  });

  const entryPagesData = Object.entries(entryPagesRaw)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views);

  const exitPagesData = Object.entries(exitPagesRaw)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views);

  const countSessionOccurrences = (keyExtract: (e: AnalyticsEvent) => string | undefined) => {
    // Group events by session first
    const sessionAttributes = new Map<string, string>();
    filteredEvents.forEach(e => {
      const sid = e.browser_info?.session_id;
      if (!sid) return;
      if (!sessionAttributes.has(sid)) {
        const val = keyExtract(e);
        if (val) sessionAttributes.set(sid, val);
      }
    });

    const counts: Record<string, number> = {};
    sessionAttributes.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const countriesData = countSessionOccurrences(e => e.browser_info?.country);
  const countriesWithPercentages = useMemo(() => adjustDataWithPercentages(countriesData), [countriesData]);

  const regionsData = useMemo(() => {
    const counts: Record<string, { count: number; country: string }> = {};
    const sessions = new Set<string>();
    filteredEvents.forEach(e => {
      const sid = e.browser_info?.session_id || e.user_hash || e.browser_info?.visitor_id;
      if (!sid || sessions.has(sid)) return;
      sessions.add(sid);
      // Fallback to root properties if browser_info is missing data
      const r = e.browser_info?.region || e.region || 'Unknown';
      const c = e.browser_info?.country || e.country || 'Unknown';
      if (!counts[r]) counts[r] = { count: 0, country: c as string };
      counts[r].count++;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, count: data.count, country: data.country }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEvents]);

  const regionsWithPercentages = useMemo(() => adjustDataWithPercentages(regionsData), [regionsData]);

  const citiesData = useMemo(() => {
    const counts: Record<string, { count: number; country: string }> = {};
    const sessions = new Set<string>();
    filteredEvents.forEach(e => {
      const sid = e.browser_info?.session_id || e.user_hash || e.browser_info?.visitor_id;
      if (!sid || sessions.has(sid)) return;
      sessions.add(sid);
      // Fallback to root properties if browser_info is missing data
      const city = e.browser_info?.city || e.city || 'Unknown';
      const country = e.browser_info?.country || e.country || 'Unknown';
      if (!counts[city as string]) counts[city as string] = { count: 0, country: country as string };
      counts[city as string].count++;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, count: data.count, country: data.country }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEvents]);

  const citiesWithPercentages = useMemo(() => adjustDataWithPercentages(citiesData), [citiesData]);

  const IN_APP_BROWSERS = ['linkedin', 'instagram', 'facebook', 'tiktok', 'twitter', 'pinterest', 'snapchat', 'fban', 'fbav'];
  const browsersData = countSessionOccurrences(e => {
    const raw = e.browser_info?.browser;
    if (!raw) return undefined;
    const lower = raw.toLowerCase();
    if (IN_APP_BROWSERS.some(app => lower.includes(app))) return 'In-App Browser';
    return raw;
  });
  const osData = countSessionOccurrences(e => e.browser_info?.os);
  const devicesData = countSessionOccurrences(e => e.browser_info?.device);

  const browsersWithPercentages = useMemo(() => adjustDataWithPercentages(browsersData), [browsersData]);
  const osWithPercentages = useMemo(() => adjustDataWithPercentages(osData), [osData]);
  const devicesWithPercentages = useMemo(() => adjustDataWithPercentages(devicesData), [devicesData]);

  const pagesWithPercentages = useMemo(() => adjustDataWithPercentages(pagesData, 'views'), [pagesData]);
  const entryPagesWithPercentages = useMemo(() => adjustDataWithPercentages(entryPagesData, 'views'), [entryPagesData]);
  const exitPagesWithPercentages = useMemo(() => adjustDataWithPercentages(exitPagesData, 'views'), [exitPagesData]);


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
          <span className="font-semibold text-foreground truncate flex items-center gap-1.5">
            Analytics 
            <span className="text-slate-300 dark:text-slate-600 font-normal">|</span> 
            {cleanUrl(selectedApp.url || selectedApp.name)}
          </span>
          {!isPremium && !isLoadingTier && (
            <div className="flex items-center gap-1.5 ml-1">
              <ProBadge />
              <UpgradeBadge />
            </div>
          )}
          {onlineNow > 0 && (
            <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider ml-1 shrink-0">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              {onlineNow} {onlineNow === 1 ? 'usuario' : 'usuarios'} en línea
            </span>
          )}
        </div>
      );
    } else {
      setHeaderContent(
        <div className="flex items-center gap-2 min-w-0">
          <BarChart3 className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground truncate">Analytics</span>
          {!isPremium && !isLoadingTier && (
            <div className="flex items-center gap-1.5 ml-1">
              <ProBadge />
              <UpgradeBadge />
            </div>
          )}
        </div>
      );
    }
    return () => setHeaderContent(null);
  }, [setHeaderContent, selectedApp, onlineNow, isPremium, isLoadingTier]);

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
      navigate(`/analytics/${appId}`);
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

  const renderAcquisitionTab = (data: {name: string, value: number}[], type: 'channel' | 'source' | 'referrer', labelPrefix: string) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    
    // Calculate raw percentages
    const itemsWithPercentages = data.map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    }));

    // Adjust percentages to sum exactly to 100% using Largest Remainder Method or simple adjustment
    if (itemsWithPercentages.length > 0 && total > 0) {
      const roundedTotal = itemsWithPercentages.reduce((acc, item) => acc + Math.round(item.percentage * 10) / 10, 0);
      const diff = 100 - roundedTotal;
      if (Math.abs(diff) > 0.01) {
        // Apply adjustment to the largest item
        itemsWithPercentages[0].percentage += diff;
      }
    }

    return (
      <TabsContent value={type} className="m-0 data-[state=inactive]:hidden flex-1 flex flex-col min-h-0 md:min-h-[300px]" forceMount>
        <ExpandableList
          items={itemsWithPercentages}
          limit={10}
          listClassName="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar px-4 py-2 gap-1 w-full"
          emptyMessage={
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <BarChart3 className="h-8 w-8 opacity-20" />
              Sin datos disponibles
            </div>
          }
          renderItem={(item, i) => {
            const max = itemsWithPercentages[0]?.value || 1;
            const barPct = (item.value / max) * 100;
            const displayPct = (Math.round(item.percentage * 10) / 10).toFixed(1);
            
            return (
              <div 
                key={i} 
                className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === type && f.value === item.name) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                onClick={() => addFilter(type, item.name, `${labelPrefix}: ${item.name}`)}
              >
                <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                <div className="flex items-center gap-2 relative z-10 min-w-0 pl-4">
                  {filters.some(f => f.key === type && f.value === item.name) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1" />}
                  <AcquisitionIcon name={item.name} type={type} appLogo={selectedApp?.logo_url} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate tracking-tight">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.value}</span>
                </div>
              </div>
            );
          }}
        />
      </TabsContent>
    );
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
            <header className="flex justify-end">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="rounded-lg px-4 h-9 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
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
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
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
                          {app.name || cleanUrl(app.url)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                          {cleanUrl(app.url)}
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
                <Select
                  value={appId}
                  onValueChange={(val) => navigate(`/analytics/${val}`)}
                >
                  <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-xs font-semibold px-2 gap-2 focus:ring-0 focus:ring-offset-0 transition-colors shadow-none w-auto max-w-none">
                    <div className="flex items-center gap-1.5 truncate">
                      {selectedApp?.logo_url ? (
                        <img src={selectedApp.logo_url} alt={selectedApp.name || ''} className="w-4 h-4 rounded-sm object-cover shrink-0" />
                      ) : (
                        <Globe2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      )}
                        <span className="truncate">{cleanUrl(selectedApp?.url || selectedApp?.name)}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {enabledApps.map(app => (
                      <SelectItem key={app.id} value={app.id} className="text-xs">
                        <div className="flex items-center gap-2">
                          {app.logo_url ? (
                            <img src={app.logo_url} alt={app.name || ''} className="w-4 h-4 rounded-sm object-cover shrink-0" />
                          ) : (
                            <Globe2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          )}
                          <span>{app.name || cleanUrl(app.url)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center h-8 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                    <Button variant="ghost" size="icon" className="h-full w-8 rounded-none border-r border-slate-200 dark:border-slate-800 hidden sm:flex text-slate-400 hover:text-slate-600" disabled>
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-full border-0 bg-transparent rounded-none text-xs font-medium w-[140px] sm:w-[150px] justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          {dateRange === "today" && "Hoy"}
                          {dateRange === "yesterday" && "Ayer"}
                          {dateRange === "last_x_days" && `Últimos ${lastXDays} días`}
                          {dateRange === "custom" && "Personalizado"}
                          {dateRange === "7days" && "Últimos 7 días"}
                          {dateRange === "30days" && "Últimos 30 días"}
                          {dateRange === "12months" && "Últimos 12 meses"}
                          <Calendar className="h-3.5 w-3.5 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-4" align="start">
                        <RadioGroup 
                          value={tempRangeType} 
                          onValueChange={setTempRangeType}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 cursor-pointer">
                            <RadioGroupItem value="today" id="today" />
                            <Label htmlFor="today" className="text-sm font-medium cursor-pointer flex-1">Hoy</Label>
                          </div>
                          <div className="flex items-center space-x-3 cursor-pointer">
                            <RadioGroupItem value="yesterday" id="yesterday" />
                            <Label htmlFor="yesterday" className="text-sm font-medium cursor-pointer flex-1">Ayer</Label>
                          </div>
                          <div className="flex items-center space-x-3 cursor-pointer">
                            <RadioGroupItem value="last_x_days" id="last_x_days" />
                            <div className="flex items-center gap-2 flex-1">
                              <Label htmlFor="last_x_days" className="text-sm font-medium cursor-pointer">Últimos</Label>
                              <Input 
                                type="number" 
                                value={tempDays} 
                                onChange={(e) => setTempDays(parseInt(e.target.value) || 1)}
                                className="w-16 h-8 text-center font-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTempRangeType("last_x_days");
                                }}
                              />
                              <span className="text-sm font-medium">días</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                             <div className="flex items-center space-x-3 cursor-pointer">
                                <RadioGroupItem value="custom" id="custom" />
                                <Label htmlFor="custom" className="text-sm font-medium cursor-pointer flex-1">Personalizado</Label>
                             </div>
                             {tempRangeType === "custom" && (
                               <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                 <CalendarComponent
                                    initialFocus
                                    mode="range"
                                    defaultMonth={customRange?.from || new Date()}
                                    selected={customRange}
                                    onSelect={setCustomRange}
                                    numberOfMonths={1}
                                    className="scale-90 origin-top"
                                 />
                               </div>
                             )}
                          </div>
                        </RadioGroup>
                        <div className="flex justify-end mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-6 rounded-lg"
                            onClick={() => {
                              setLastXDays(tempDays);
                              handleDateRangeChange(tempRangeType);
                              setIsPopoverOpen(false);
                            }}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
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
                </div>
            </header>

            {/* Active Filters Badges */}
            {filters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
                <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
                   Filtros activos:
                </span>
                {filters.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800">
                    <span>{f.label}</span>
                    <button 
                      onClick={() => removeFilter(f.key, f.value)}
                      className="ml-1 text-blue-500 hover:text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-800 dark:text-blue-400 p-0.5 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={clearFilters}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline ml-2"
                >
                  Limpiar todo
                </button>
              </div>
            )}

            {/* New Analytics Layout */}
            <div className="relative">
              {!isPremium && !isLoadingTier && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-start pt-32 pb-6 px-6 bg-white/40 dark:bg-[#1C1C1E]/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 transition-all duration-500">
                  <div className="bg-zinc-950 px-8 py-10 rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col items-center text-center max-w-[320px] w-full animate-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 mb-6">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <ProBadge />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                      Analíticas avanzadas
                    </h3>
                    
                    <p className="text-xs leading-relaxed text-zinc-500 mb-8 font-medium">
                      Entiende a tu audiencia con datos detallados. Upgrade para desbloquear.
                    </p>
                    
                    <div className="w-full">
                      <UpgradeBadge 
                        text="Quiero escalar con Pro →"
                        className="w-full h-12 bg-white hover:bg-zinc-200 text-zinc-950 rounded-2xl text-sm font-bold transition-all shadow-xl active:scale-[0.98] inline-flex items-center justify-center no-underline" 
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className={`flex flex-col gap-4 ${!isPremium && !isLoadingTier ? 'opacity-30 pointer-events-none select-none blur-[2px] transition-all' : ''}`}>
              {/* Main Chart Card */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] overflow-hidden">
                <div className="flex items-center justify-between gap-1 sm:gap-6 p-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#1C1C1E]/50 overflow-x-auto no-scrollbar">
                  <div className="flex flex-col gap-1 min-w-[100px] cursor-pointer text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 px-3 rounded-xl transition-all">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2 cursor-help">
                              <div className="h-3 w-3 rounded-sm bg-blue-600 flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="h-2 w-2 text-white" />
                              </div>
                              <span className="truncate">Visitantes</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[250px] text-xs">
                          Personas distintas que visitaron tu proyecto. Una misma persona cuenta solo 1 vez sin importar cuántas veces entre.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-2xl sm:text-3xl font-semibold">{totalVisitors}</span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[80px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 px-3 rounded-xl transition-all">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2 cursor-help">
                              <div className="h-3 w-3 rounded-sm bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                  <Eye className="h-2.5 w-2.5 text-slate-500 dark:text-slate-400" />
                              </div>
                              <span className="truncate">Vistas</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[250px] text-xs">
                          El número total de veces que alguna página fue cargada. Cada recarga cuenta como 1 vista extra.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-2xl sm:text-3xl font-semibold text-slate-700 dark:text-slate-300">{pageViews}</span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[100px] sm:pl-6 ml-auto sm:border-l border-slate-200 dark:border-slate-700 p-2 sm:p-0">
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <span className="truncate">En línea</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                    </span>
                    <span className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100">{onlineNow}</span>
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
                        <XAxis 
                          dataKey="time" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#64748b' }} 
                          dy={10} 
                          interval="preserveStartEnd"
                          minTickGap={30}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <RechartsTooltip 
                          labelFormatter={(_label, payload) => {
                            if (payload && payload[0]) return payload[0].payload.fullDate;
                            return _label;
                          }}
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
              {/* Combined Demographics Row */}
              {/* Combined Demographics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
                {/* Geography (Single Card with Tabs inside) */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] flex flex-col">
                  <Tabs defaultValue="country" className="w-full">
                    <CardHeader className="p-4 py-3 border-b border-slate-100 dark:border-slate-800/50 flex flex-row items-center justify-between space-y-0">
                      <TabsList className="bg-transparent p-0 h-auto justify-start border-none">
                        <TabsTrigger value="country" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold p-0 mr-4 border-none text-slate-500 data-[state=active]:text-foreground">País</TabsTrigger>
                        <TabsTrigger value="region" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold p-0 mr-4 border-none text-slate-500 data-[state=active]:text-foreground">Estado</TabsTrigger>
                        <TabsTrigger value="city" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold p-0 mr-4 border-none text-slate-500 data-[state=active]:text-foreground">Ciudad</TabsTrigger>
                        <TabsTrigger value="map" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold p-0 border-none text-slate-500 data-[state=active]:text-foreground">Mapa</TabsTrigger>
                      </TabsList>
                    </CardHeader>
                    <CardContent className="p-0">
                      <TabsContent value="country" className="m-0">
                        {countriesData.length > 0 ? (
                          <div className="w-full flex flex-col items-center">
                            {/* Pie chart hidden */}
                            <div className="w-full flex flex-col px-4 py-3 gap-1 max-h-[350px] overflow-y-auto custom-scrollbar">
                              {countriesWithPercentages.map((item, i) => {
                                const max = countriesWithPercentages[0]?.count || 1;
                                const barPct = (item.count / max) * 100;
                                const displayPct = item.percentage.toFixed(1);
                                return (
                                  <div 
                                    key={i} 
                                    className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === 'country' && f.value === item.name) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                    onClick={() => addFilter('country', item.name, `País: ${item.name}`)}
                                  >
                                    <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                                    <div className="flex items-center gap-2 relative z-10 min-w-0">
                                      {filters.some(f => f.key === 'country' && f.value === item.name) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1 -ml-4" />}
                                      <CountryWithFlag country={item.name} />
                                    </div>
                                    <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.count}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-xs py-20">Sin datos de región</div>
                        )}
                      </TabsContent>
                      <TabsContent value="region" className="m-0 data-[state=inactive]:hidden" forceMount>
                        <div className="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar px-4 py-2 gap-1">
                          {regionsWithPercentages.length > 0 ? regionsWithPercentages.map((item, i) => {
                            const max = regionsWithPercentages[0]?.count || 1;
                            const barPct = (item.count / max) * 100;
                            const displayPct = item.percentage.toFixed(1);
                            return (
                              <div 
                                key={i} 
                                className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === 'region' && f.value === item.name) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                onClick={() => addFilter('region', item.name, `Estado: ${item.name}`)}
                              >
                                <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                                <div className="flex items-center gap-2 relative z-10 min-w-0">
                                  {filters.some(f => f.key === 'region' && f.value === item.name) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1 -ml-4" />}
                                  {(() => { const code = getCountryCode(item.country); return code ? <img src={`https://flagcdn.com/w20/${code}.png`} width="14" alt={item.country} className="shadow-sm rounded-sm shrink-0" /> : <MapPin className="w-3 h-3 shrink-0 text-slate-400" />; })()}
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate tracking-tight">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.count}</span>
                                </div>
                              </div>
                            );
                          }) : (
                            <div className="p-12 text-center text-slate-400 text-xs">
                              Sin datos de estado
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="city" className="m-0 data-[state=inactive]:hidden" forceMount>
                        <ExpandableList
                          items={citiesWithPercentages}
                          limit={10}
                          listClassName="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar px-4 py-2 gap-1"
                          emptyMessage={<div className="p-12 text-center text-slate-400 text-xs">Sin datos de ciudad</div>}
                          renderItem={(item, i) => {
                            const max = citiesWithPercentages[0]?.count || 1;
                            const barPct = (item.count / max) * 100;
                            const displayPct = item.percentage.toFixed(1);
                            return (
                              <div 
                                key={i} 
                                className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === 'city' && f.value === item.name) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                onClick={() => addFilter('city', item.name, `Ciudad: ${item.name}`)}
                              >
                                <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                                <div className="flex items-center gap-2 relative z-10 min-w-0">
                                  {filters.some(f => f.key === 'city' && f.value === item.name) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1 -ml-4" />}
                                  {(() => { const code = getCountryCode(item.country); return code ? <img src={`https://flagcdn.com/w20/${code}.png`} width="14" alt={item.country} className="shadow-sm rounded-sm shrink-0" /> : <MapPin className="w-3 h-3 shrink-0 text-slate-400" />; })()}
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate tracking-tight">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.count}</span>
                                </div>
                              </div>
                            );
                          }}
                        />
                      </TabsContent>
                      <TabsContent value="map" className="m-0 pt-0 h-[350px]">
                        <WorldMap 
                          data={countriesData} 
                          onCountryClick={(name) => addFilter('country', name, `País: ${name}`)} 
                        />
                      </TabsContent>
                    </CardContent>
                  </Tabs>
                </Card>

                {/* Browsers */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] flex flex-col h-auto md:h-[400px]">
                  <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex flex-row items-center justify-between space-y-0">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Navegadores</span>
                    <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                  </CardHeader>
                  <CardContent className="p-0 overflow-hidden">
                    <ExpandableList
                      items={browsersWithPercentages}
                      limit={10}
                      listClassName="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar px-4 py-2 gap-1"
                      emptyMessage={<div className="p-8 text-center text-slate-400 text-xs">Sin datos de navegador</div>}
                      renderItem={(item, i) => {
                        const max = browsersWithPercentages[0]?.count || 1;
                        const barPct = (item.count / max) * 100;
                        const displayPct = item.percentage.toFixed(1);
                        return (
                          <div 
                            key={i} 
                            className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === 'browser' && f.value === item.name) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            onClick={() => addFilter('browser', item.name, `Navegador: ${item.name}`)}
                          >
                            <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                            <div className="flex items-center gap-2 relative z-10 min-w-0 pl-4">
                              {filters.some(f => f.key === 'browser' && f.value === item.name) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1" />}
                              <BrowserIcon name={item.name} />
                              <span className="text-xs text-slate-600 dark:text-slate-400 truncate tracking-tight">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.count}</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Devices */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] flex flex-col">
                  <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex flex-row items-center justify-between space-y-0">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Dispositivos</span>
                    <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                  </CardHeader>
                  <CardContent className="p-0 overflow-hidden">
                    <ExpandableList
                      items={devicesWithPercentages}
                      limit={10}
                      listClassName="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar px-4 py-2 gap-1"
                      emptyMessage={<div className="p-8 text-center text-slate-400 text-xs">Sin datos de dispositivo</div>}
                      renderItem={(item, i) => {
                        const max = devicesWithPercentages[0]?.count || 1;
                        const barPct = (item.count / max) * 100;
                        const displayPct = item.percentage.toFixed(1);
                        return (
                          <div 
                            key={i} 
                            className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === 'device' && f.value === item.name) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            onClick={() => addFilter('device', item.name, `Dispositivo: ${item.name}`)}
                          >
                            <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                            <div className="flex items-center gap-2 relative z-10 min-w-0 pl-4">
                              {filters.some(f => f.key === 'device' && f.value === item.name) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1" />}
                              <DeviceIcon name={item.name} />
                              <span className="text-xs text-slate-600 dark:text-slate-400 truncate tracking-tight">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.count}</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Operating Systems */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] flex flex-col">
                  <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex flex-row items-center justify-between space-y-0">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Sistemas operativos</span>
                    <Cpu className="h-3.5 w-3.5 text-slate-400" />
                  </CardHeader>
                  <CardContent className="p-0 overflow-hidden">
                    <ExpandableList
                      items={osWithPercentages}
                      limit={10}
                      listClassName="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar px-4 py-2 gap-1"
                      emptyMessage={<div className="p-8 text-center text-slate-400 text-xs">Sin datos de SO</div>}
                      renderItem={(item, i) => {
                        const max = osWithPercentages[0]?.count || 1;
                        const barPct = (item.count / max) * 100;
                        const displayPct = item.percentage.toFixed(1);
                        return (
                          <div 
                            key={i} 
                            className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === 'os' && f.value === item.name) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            onClick={() => addFilter('os', item.name, `SO: ${item.name}`)}  
                          >
                            <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                            <div className="flex items-center gap-2 relative z-10 min-w-0 pl-4">
                              {filters.some(f => f.key === 'os' && f.value === item.name) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1" />}
                              <OsIcon name={item.name} />
                              <span className="text-xs text-slate-600 dark:text-slate-400 truncate tracking-tight">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.count}</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Acquisition Card Row (Moved down) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Tabs defaultValue="channel" className="w-full flex flex-col">
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] flex flex-col h-full">
                    <CardHeader className="p-4 pb-0 border-b border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <TabsList className="bg-transparent p-0 h-auto justify-start">
                          <TabsTrigger value="channel" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-blue-600 p-0 pr-6 border-none text-slate-500">Canales</TabsTrigger>
                          <TabsTrigger value="source" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-blue-600 p-0 pr-6 border-none text-slate-500">Fuentes</TabsTrigger>
                          <TabsTrigger value="referrer" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-blue-600 p-0 border-none text-slate-500">URLs</TabsTrigger>
                        </TabsList>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col">
                      {renderAcquisitionTab(channelsData, 'channel', 'Canal')}
                      {renderAcquisitionTab(sourcesData, 'source', 'Fuente')}
                      {renderAcquisitionTab(referrersData, 'referrer', 'URL Referente')}
                    </CardContent>
                  </Card>
                </Tabs>

                {/* Top Pages Card - Side by side with Channels */}
                <Tabs defaultValue="all" className="w-full flex flex-col">
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] flex flex-col h-full">
                    <CardHeader className="p-4 pb-0 border-b border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <TabsList className="bg-transparent p-0 h-auto justify-start">
                          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-blue-600 p-0 pr-6 border-none">Páginas principales</TabsTrigger>
                          <TabsTrigger value="entry" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-blue-600 p-0 pr-6 border-none text-slate-500">Páginas de entrada</TabsTrigger>
                          <TabsTrigger value="exit" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-blue-600 p-0 border-none text-slate-500">Páginas de salida</TabsTrigger>
                        </TabsList>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col">
                      <TabsContent value="all" className="m-0 data-[state=inactive]:hidden flex-1 flex flex-col min-h-0 md:min-h-[300px]" forceMount>
                        <ExpandableList
                          items={pagesWithPercentages}
                          limit={10}
                          listClassName="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar px-4 py-2 gap-1"
                          emptyMessage={<div className="p-12 text-center text-slate-400 text-xs">Sin datos de páginas</div>}
                          renderItem={(p, i) => {
                            const max = pagesWithPercentages[0]?.views ?? 1;
                            const barPct = (p.views / max) * 100;
                            const displayPct = p.percentage.toFixed(1);
                            return (
                              <div 
                                key={i} 
                                className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === 'page_path' && f.value === (p.path || '/')) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                onClick={() => addFilter('page_path', p.path || '/', `Página: ${p.path || '/'}`)}
                              >
                                <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                                <div className="flex items-center gap-2 relative z-10 min-w-0 pl-4">
                                  {filters.some(f => f.key === 'page_path' && f.value === (p.path || '/')) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1" />}
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate tracking-tight">{p.path || '/'}</span>
                                </div>
                                <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{p.views}</span>
                                </div>
                              </div>
                            );
                          }}
                        />
                      </TabsContent>
                      <TabsContent value="entry" className="m-0 data-[state=inactive]:hidden flex-1 flex flex-col min-h-0 md:min-h-[300px]" forceMount>
                        <ExpandableList
                          items={entryPagesWithPercentages}
                          limit={10}
                          listClassName="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar px-4 py-2 gap-1"
                          emptyMessage={<div className="p-12 text-center text-slate-400 text-xs">Sin datos de páginas de entrada</div>}
                          renderItem={(p, i) => {
                            const max = entryPagesWithPercentages[0]?.views ?? 1;
                            const barPct = (p.views / max) * 100;
                            const displayPct = p.percentage.toFixed(1);
                            return (
                              <div 
                                key={i} 
                                className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === 'page_path' && f.value === (p.path || '/')) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                onClick={() => addFilter('page_path', p.path || '/', `Página: ${p.path || '/'}`)}
                              >
                                <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                                <div className="flex items-center gap-2 relative z-10 min-w-0 pl-4">
                                  {filters.some(f => f.key === 'page_path' && f.value === (p.path || '/')) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1" />}
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate tracking-tight">{p.path || '/'}</span>
                                </div>
                                <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{p.views}</span>
                                </div>
                              </div>
                            );
                          }}
                        />
                      </TabsContent>
                      <TabsContent value="exit" className="m-0 data-[state=inactive]:hidden flex-1 flex flex-col min-h-0 md:min-h-[300px]" forceMount>
                        <ExpandableList
                          items={exitPagesWithPercentages}
                          limit={10}
                          listClassName="flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar px-4 py-2 gap-1"
                          emptyMessage={<div className="p-12 text-center text-slate-400 text-xs">Sin datos de páginas de salida</div>}
                          renderItem={(p, i) => {
                            const max = exitPagesWithPercentages[0]?.views ?? 1;
                            const barPct = (p.views / max) * 100;
                            const displayPct = p.percentage.toFixed(1);
                            return (
                              <div 
                                key={i} 
                                className={`relative flex items-center justify-between text-xs py-2 px-2 rounded cursor-pointer transition-colors ${filters.some(f => f.key === 'page_path' && f.value === (p.path || '/')) ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                onClick={() => addFilter('page_path', p.path || '/', `Página: ${p.path || '/'}`)}
                              >
                                <div className="absolute inset-0 rounded bg-blue-100 dark:bg-blue-900/30" style={{ width: `${barPct}%` }}></div>
                                <div className="flex items-center gap-2 relative z-10 min-w-0 pl-4">
                                  {filters.some(f => f.key === 'page_path' && f.value === (p.path || '/')) && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute -left-1" />}
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate tracking-tight">{p.path || '/'}</span>
                                </div>
                                <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{displayPct}%</span>
                                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{p.views}</span>
                                </div>
                              </div>
                            );
                          }}
                        />
                      </TabsContent>
                    </CardContent>
                  </Card>
                </Tabs>
              </div>
            </div>

            {/* Users / Visitors Tracker Card */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E]">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/50">
                <Tabs defaultValue="user" className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <TabsList className="bg-transparent p-0 h-auto w-full justify-start overflow-x-auto">
                      <TabsTrigger value="user" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold data-[state=active]:text-foreground p-0 mr-4">Usuarios</TabsTrigger>
                    </TabsList>
                    <div className="relative shrink-0 w-full sm:w-auto">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="Buscar usuario..." className="h-9 pl-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800/50 w-full sm:w-48 ml-auto" />
                    </div>
                  </div>
                </Tabs>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-transparent">
                      <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800/50">
                        <TableHead className="w-[400px] text-xs font-medium text-slate-500">Visitante Anónimo</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">Fuente</TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">Última visita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniqueUsers.map((user, i) => {
                        const isOnline = new Date(user.lastSeen).getTime() > Date.now() - 5 * 60 * 1000;
                        return (
                        <Sheet key={user.uid}>
                          <SheetTrigger asChild>
                            <TableRow className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/50 group">
                              <TableCell className="py-2.5">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 group-hover:ring-2 ring-blue-500/20 transition-all">
                                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fakeName.replace(/\s+/g, '')}&backgroundColor=transparent`} alt={user.fakeName} />
                                      <AvatarFallback>{user.fakeName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {isOnline && (
                                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1C1C1E] shadow-sm"></div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-0.5 overflow-hidden">
                                    <span className="text-[13px] font-normal text-slate-700 dark:text-slate-300 capitalize truncate">{user.fakeName}</span>
                                    <div className="flex items-center gap-3">
                                      {user.country && user.country !== 'Unknown' && (
                                        <div className="text-[11px] text-slate-500 flex items-center">
                                          <CountryWithFlag country={user.country} />
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1.5 opacity-60">
                                        <DeviceIcon name={user.device || 'Unknown'} size={11} />
                                        <OsIcon name={user.os || 'Unknown'} size={11} />
                                        <BrowserIcon name={user.browser || 'Unknown'} size={11} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5">
                                {(() => {
                                  const classification = getReferrerClassification(user.referrer);
                                  return (
                                    <div className="flex items-center gap-1.5 text-[13px] font-normal text-slate-600 dark:text-slate-400">
                                      <AcquisitionIcon name={classification.source} type="source" appLogo={selectedApp?.logo_url} />
                                      <span className="truncate max-w-[120px]">{classification.source}</span>
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell className="py-2.5 text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[13px] font-normal text-slate-500 dark:text-slate-400">
                                    {formatDistanceToNow(user.lastSeen, { addSuffix: true, locale: es })}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {[...Array(Math.min(user.pageviews, 5))].map((_, idx) => (
                                      <div key={idx} className={`w-1 h-1 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                    ))}
                                    {user.pageviews > 5 && <span className="text-[9px] text-slate-300 font-mono">+{user.pageviews - 5}</span>}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col p-0 border-l border-slate-200 dark:border-slate-800">
                            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                              <SheetHeader className="text-left">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-14 w-14 border-2 border-primary/10 bg-slate-100 dark:bg-slate-800 ring-4 ring-slate-100 dark:ring-slate-900 shadow-sm">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fakeName.replace(/\s+/g, '')}&backgroundColor=transparent`} alt={user.fakeName} />
                                    <AvatarFallback>{user.fakeName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <SheetTitle className="text-lg capitalize font-medium tracking-tight">{user.fakeName}</SheetTitle>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                      <span className="flex items-center gap-1.5 font-medium">
                                        <MapPin className="w-3.5 h-3.5 opacity-70" />
                                        {user.country || 'Unknown'}, {user.events[0].browser_info?.city || 'Unknown'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </SheetHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 custom-scrollbar">
                              {/* Attributes Matrix */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col justify-center">
                                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Fuente</p>
                                  {(() => {
                                    const classification = getReferrerClassification(user.referrer);
                                    return (
                                      <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-800 dark:text-slate-200">
                                        <AcquisitionIcon name={classification.source} type="source" appLogo={selectedApp?.logo_url} />
                                        <span className="truncate">{classification.source}</span>
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col justify-center">
                                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Interacciones</p>
                                  <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200">{user.pageviews} eventos</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col justify-center">
                                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Dispositivo</p>
                                  <p className="text-[13px] font-medium flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                                    <span className="opacity-70 flex items-center"><DeviceIcon name={user.device || 'Unknown'} size={14} /></span>
                                    {user.device}
                                  </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col justify-center">
                                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">S. O.</p>
                                  <p className="text-[13px] font-medium flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                                    <span className="opacity-70 flex items-center"><OsIcon name={user.os || 'Unknown'} size={14} /></span>
                                    {user.os}
                                  </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col justify-center">
                                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Navegador</p>
                                  <p className="text-[13px] font-medium flex items-center gap-1.5 capitalize text-slate-800 dark:text-slate-200">
                                    <span className="opacity-70 flex items-center"><BrowserIcon name={user.browser || 'Unknown'} size={14} /></span>
                                    {user.browser}
                                  </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col justify-center">
                                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Resolución</p>
                                  <p className="text-[13px] font-medium flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                                    {user.events[0].browser_info?.screen_width || '---'} x {user.events[0].browser_info?.screen_height || user.events.find(e => e.browser_info?.screen_height)?.browser_info?.screen_height || '---'}
                                  </p>
                                </div>
                              </div>

                              {/* Navigation Timeline */}
                              <div className="space-y-5 pb-6">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Ruta de navegación</h4>
                                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                                    {user.events.length} pasos
                                  </span>
                                </div>
                                <div className="relative pl-6 space-y-6 before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                                  {user.events.map((evt, idx) => {
                                    const eventType = evt.browser_info?.event_type || 'pageview';
                                    const isCustom = eventType !== 'pageview';
                                    return (
                                      <div key={evt.id} className="relative group/step">
                                        <div className={`absolute -left-[26px] top-1.5 w-2 h-2 rounded-full border-2 border-white dark:border-[#1C1C1E] z-10 transition-transform group-hover/step:scale-125 ${isCustom ? 'bg-amber-500 ring-2 ring-amber-500/20' : 'bg-blue-500 ring-2 ring-blue-500/20'}`}></div>
                                        <div className="flex flex-col gap-1.5">
                                          <div className="flex items-center justify-between gap-4">
                                            <span className={`text-[13px] font-medium transition-colors ${isCustom ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                              {isCustom ? (evt.custom_event_name as string || 'Evento personalizado') : (evt.page_path || '/')}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-400 font-medium">
                                              {format(new Date(evt.created_at), 'HH:mm:ss')}
                                            </span>
                                          </div>
                                          {isCustom && (
                                            <div className="flex items-center gap-1.5">
                                              <div className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-[10px] text-amber-600 dark:text-amber-500 font-semibold uppercase tracking-tight">
                                                {eventType.replace('_', ' ')}
                                              </div>
                                              <span className="text-[11px] text-slate-500 font-medium truncate italic max-w-[200px]">
                                                en {evt.page_path}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                        );
                      })}
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
              <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {availableApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleEnableAnalytics(app.id)}
                    disabled={isUpdating}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all text-left"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {app.logo_url ? (
                        <img src={app.logo_url} alt={app.name || ''} className="w-full h-full object-cover" />
                      ) : app.url ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(app.url)}&sz=64`}
                          alt={app.name || ''}
                          className="w-7 h-7 object-contain"
                          onError={e => {
                            const t = e.currentTarget;
                            t.style.display = 'none';
                            if (t.nextSibling) (t.nextSibling as HTMLElement).style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span
                        className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm"
                        style={{ display: 'none' }}
                      >
                        {app.name?.charAt(0).toUpperCase() || '?'}
                      </span>
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
                <pre className="p-4 sm:p-6 rounded-2xl bg-[#121212] text-white/90 text-[11px] sm:text-xs font-mono border border-white/10 leading-relaxed whitespace-pre-wrap break-all">
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
