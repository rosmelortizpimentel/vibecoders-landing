import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, EyeOff, FlaskConical, ArrowUpDown, Monitor, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

interface AppRow {
  id: string;
  name: string | null;
  url: string;
  is_visible: boolean;
  beta_active: boolean;
  hours_ideation: number | null;
  hours_building: number | null;
  created_at: string;
  custom_domain: string | null;
  stacks: { name: string; logo_url: string }[];
  clicks_count: number;
  author_name: string | null;
  author_username: string | null;
  author_avatar: string | null;
  status_name: string | null;
  status_color: string | null;
  status_icon: string | null;
}

type SortField = 'name' | 'clicks_count' | 'hours_ideation' | 'hours_building' | 'created_at';
type SortDir = 'asc' | 'desc';

export function AppsMonitor() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [betaFilter, setBetaFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [isAdmin, roleLoading, navigate]);

  // Fetch statuses for filter dropdown
  const { data: statuses } = useQuery({
    queryKey: ['admin-app-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_statuses')
        .select('id, name, slug, color, icon')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  // Fetch all apps with joins
  const { data: apps, isLoading } = useQuery({
    queryKey: ['admin-apps-monitor'],
    queryFn: async () => {
      // 1. Get all apps (admin RLS allows seeing all)
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select(`
          id, name, url, is_visible, beta_active, hours_ideation, hours_building, created_at, status_id, user_id,
          profiles:user_id(name, username, avatar_url),
          app_statuses:status_id(name, color, icon),
          roadmap_settings:app_id(custom_domain)
        `)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // 2. Get all stacks
      const { data: stacksData } = await supabase
        .from('app_stacks')
        .select('app_id, tech_stacks:stack_id(name, logo_url)');

      // 3. Get click counts
      const { data: clicksData } = await supabase
        .from('app_clicks')
        .select('app_id');

      const clicksMap: Record<string, number> = {};
      (clicksData || []).forEach((c) => {
        clicksMap[c.app_id] = (clicksMap[c.app_id] || 0) + 1;
      });

      const stacksMap: Record<string, { name: string; logo_url: string }[]> = {};
      (stacksData || []).forEach((s) => {
        if (!stacksMap[s.app_id]) stacksMap[s.app_id] = [];
        if (s.tech_stacks) stacksMap[s.app_id].push(s.tech_stacks as { name: string; logo_url: string });
      });

      return (appsData || []).map((app) => ({
        id: app.id,
        name: app.name,
        url: app.url,
        is_visible: app.is_visible,
        beta_active: app.beta_active,
        hours_ideation: app.hours_ideation,
        hours_building: app.hours_building,
        created_at: app.created_at,
        custom_domain: app.roadmap_settings?.[0]?.custom_domain || null,
        stacks: stacksMap[app.id] || [],
        clicks_count: clicksMap[app.id] || 0,
        author_name: app.profiles?.name || null,
        author_username: app.profiles?.username || null,
        author_avatar: app.profiles?.avatar_url || null,
        status_name: app.app_statuses?.name || null,
        status_color: app.app_statuses?.color || null,
        status_icon: app.app_statuses?.icon || null,
      })) as AppRow[];
    },
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    if (!apps) return [];
    let result = [...apps];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        (a.name || '').toLowerCase().includes(q) ||
        (a.author_name || '').toLowerCase().includes(q) ||
        (a.author_username || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status_name === statusFilter);
    }

    // Visibility
    if (visibilityFilter === 'visible') result = result.filter(a => a.is_visible);
    if (visibilityFilter === 'hidden') result = result.filter(a => !a.is_visible);

    // Beta
    if (betaFilter === 'yes') result = result.filter(a => a.beta_active);
    if (betaFilter === 'no') result = result.filter(a => !a.beta_active);

    // Sort
    result.sort((a, b) => {
      let av: string | number, bv: string | number;
      switch (sortField) {
        case 'name': av = (a.name || '').toLowerCase(); bv = (b.name || '').toLowerCase(); break;
        case 'clicks_count': av = a.clicks_count; bv = b.clicks_count; break;
        case 'hours_ideation': av = a.hours_ideation || 0; bv = b.hours_ideation || 0; break;
        case 'hours_building': av = a.hours_building || 0; bv = b.hours_building || 0; break;
        case 'created_at': av = a.created_at; bv = b.created_at; break;
        default: av = 0; bv = 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [apps, search, statusFilter, visibilityFilter, betaFilter, sortField, sortDir]);

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-primary' : 'text-muted-foreground/50'}`} />
    </button>
  );

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-2 pb-10">
      <div>
        <h1 className="text-xl font-bold text-[#1c1c1c]">Monitor de Apps</h1>
        <p className="text-sm text-gray-500">
          Vista general de todas las apps registradas ({apps?.length || 0} total)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por app o autor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {statuses?.map(s => (
              <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="Visibilidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="visible">Visibles</SelectItem>
            <SelectItem value="hidden">Inactivas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={betaFilter} onValueChange={setBetaFilter}>
          <SelectTrigger className="w-[130px] bg-white">
            <SelectValue placeholder="Beta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Beta: Todos</SelectItem>
            <SelectItem value="yes">Con Beta</SelectItem>
            <SelectItem value="no">Sin Beta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <Monitor className="h-12 w-12 text-gray-200 mb-3" />
            <p className="text-gray-500 text-sm">No se encontraron apps.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="min-w-[200px]">
                    <SortButton field="name" label="App" />
                  </TableHead>
                  <TableHead className="w-[80px]">
                    <SortButton field="clicks_count" label="Vistas" />
                  </TableHead>
                  <TableHead className="min-w-[120px]">Autor</TableHead>
                  <TableHead className="w-[100px]">Estado</TableHead>
                  <TableHead className="w-[70px]">
                    <SortButton field="hours_ideation" label="Plan" />
                  </TableHead>
                  <TableHead className="w-[70px]">
                    <SortButton field="hours_building" label="Build" />
                  </TableHead>
                   <TableHead className="w-[70px] text-center">Beta</TableHead>
                  <TableHead className="min-w-[150px]">Dominio Personalizado</TableHead>
                  <TableHead className="w-[70px] text-center">Visible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(app => (
                  <TableRow key={app.id} className={!app.is_visible ? 'opacity-50' : ''}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-gray-900 truncate max-w-[200px]">
                          {app.name || '(Sin nombre)'}
                        </p>
                        {app.stacks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {app.stacks.map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1">
                                {s.logo_url && <img src={s.logo_url} alt="" className="h-3 w-3 rounded-sm" />}
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-gray-700">{app.clicks_count}</span>
                    </TableCell>
                    <TableCell>
                      {app.author_username ? (
                        <Link
                          to={`/@${app.author_username}`}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          {app.author_name || app.author_username}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {app.status_name ? (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-semibold"
                          style={{ borderColor: app.status_color || undefined, color: app.status_color || undefined }}
                        >
                          {app.status_icon && <span className="mr-1">{app.status_icon}</span>}
                          {app.status_name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {app.hours_ideation || 0}h
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-600">
                      {app.hours_building || 0}h
                    </TableCell>
                       <TableCell className="text-center">
                      {app.beta_active ? (
                        <FlaskConical className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {app.custom_domain ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                          <Globe className="h-3.5 w-3.5" />
                          <a 
                            href={`https://${app.custom_domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline truncate max-w-[140px]"
                          >
                            {app.custom_domain}
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {app.is_visible ? (
                        <Eye className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-red-400 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
