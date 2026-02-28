import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, RefreshCw, Copy, CheckCircle2, BarChart3, Rocket, Zap, Plus, ChevronLeft, LayoutDashboard, Settings, ExternalLink, MoreHorizontal, Search, Settings2, Trash2 } from "lucide-react";
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

interface AnalyticsEvent {
  id: string;
  created_at: string;
  page_path: string;
  referrer: string;
  user_hash: string;
}

const Analytics = () => {
  const { profile, signOut } = useAuth();
  const { apps, loading: loadingApps, updateApp } = useApps();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'project'>('dashboard');
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchEvents = async (appId: string) => {
    if (!appId) return;
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from("vibe_analytics_events")
      .select("*")
      .eq("project_id", appId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setEvents(data);
    }
    setLoadingEvents(false);
  };

  useEffect(() => {
    if (selectedAppId && view === 'project') {
      fetchEvents(selectedAppId);
    }
  }, [selectedAppId, view]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Código copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const enabledApps = apps.filter(app => app.analytics_enabled);
  const availableApps = apps.filter(app => !app.analytics_enabled);
  const selectedApp = apps.find(a => a.id === selectedAppId);
  const scriptTag = `<script src="https://cdn.vibecoders.la/v1/sdk.js" data-project-id="${selectedAppId}" data-services="analytics"></script>`;

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
      setView('dashboard');
      setSelectedAppId(null);
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
                <div className="hidden sm:flex items-center border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 p-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-slate-100 dark:bg-slate-800">
                    <LayoutDashboard className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-400">
                    <Settings2 className="h-4 w-4" />
                  </Button>
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
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {/* Simulating an app logo with the first letter or icon */}
                        <div className="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {app.name ? app.name.charAt(0).toUpperCase() : <Rocket className="h-4 w-4" />}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                          {app.name || app.url}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                          {app.url}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5 opacity-70">
                          <span className="text-[10px] font-medium text-slate-500">1</span>
                          <div className="h-3 w-6 bg-blue-500 rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 bg-white h-2 w-2 rounded-full shadow-sm"></div>
                          </div>
                        </div>
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
                            setSelectedAppId(app.id);
                            setView('project');
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
          <div className="space-y-8">
            <header className="flex flex-col gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView('dashboard')}
                className="self-start -ml-2 text-slate-500 hover:text-blue-600 rounded-full"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Volver a Proyectos
              </Button>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white">
                      {selectedApp?.name || 'Vibe Analytics'}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                      Live
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Analíticas en tiempo real para <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedApp?.url}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInstallModal(true)}
                    className="rounded-full bg-white dark:bg-slate-900"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Script
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Settings className="h-5 w-5" />
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
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="lg:col-span-1 border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Eventos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-black text-blue-600">
                      {events.length}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Registros en esta sesión</p>
                  </CardContent>
               </Card>
               {/* Placeholders for future stats */}
               <Card className="lg:col-span-1 border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 opacity-50">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Usuarios Únicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-black text-slate-300 italic">Soon</div>
                  </CardContent>
               </Card>
               <Card className="lg:col-span-1 border-none shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 opacity-50">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Bounce Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-black text-slate-300 italic">Soon</div>
                  </CardContent>
               </Card>
            </div>

            <Card className="shadow-2xl border-none bg-white dark:bg-slate-900 backdrop-blur ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-6 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">Registro de Visitas</CardTitle>
                  <CardDescription>Eventos capturados recientemente.</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchEvents(selectedAppId!)} 
                  disabled={loadingEvents}
                  className="rounded-full px-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <RefreshCw className={`h-3 w-3 mr-2 ${loadingEvents ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="py-4 font-bold text-slate-800 dark:text-slate-200">Hora</TableHead>
                        <TableHead className="py-4 font-bold text-slate-800 dark:text-slate-200">Página</TableHead>
                        <TableHead className="py-4 font-bold text-slate-800 dark:text-slate-200">Origen</TableHead>
                        <TableHead className="py-4 font-bold text-slate-800 dark:text-slate-200 text-right">Usuario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingEvents ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-64 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <RefreshCw className="h-10 w-10 animate-spin text-primary opacity-30" />
                              <span className="text-slate-400 font-medium">Sincronizando...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : events.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-64 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <InfoIcon className="h-6 w-6" />
                              </div>
                              <span className="text-slate-500 font-medium">Sin datos aún</span>
                              <Button 
                                variant="link" 
                                size="sm" 
                                onClick={() => setShowInstallModal(true)}
                                className="text-blue-600"
                              >
                                Ver instrucciones de instalación
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        events.map((event) => (
                          <TableRow key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800/50 transition-colors">
                            <TableCell className="py-4 text-xs font-semibold tabular-nums text-slate-500">
                              {new Date(event.created_at).toLocaleTimeString()}
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/10">
                                {event.page_path}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 text-sm text-slate-400 truncate max-w-[140px]" title={event.referrer}>
                              {event.referrer || "Directo"}
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                                {event.user_hash.substring(0, 12)}
                              </code>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 max-w-2xl">
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
