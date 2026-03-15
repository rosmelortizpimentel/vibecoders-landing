import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Settings as SettingsIcon, AlertCircle, Loader2, Download, 
  Shield, User as UserIcon, Activity, Trash2, 
  Cookie, Globe, Copy, Check, Mic, Camera, Upload, ExternalLink, Clock, Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileEditor } from '@/hooks/useProfileEditor';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SettingsSection = 'account' | 'privacy' | 'speaker';

const Settings = () => {
  const tCommon = useTranslation('common');
  const { setHeaderContent } = usePageHeader();
  const { profile, loading, isSaving, error, updateProfile } = useProfileEditor();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  
  const { tab } = useParams<{tab: string}>();
  const navigate = useNavigate();
  const activeSection = (tab as SettingsSection) || 'account';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [hasCopiedUsername, setHasCopiedUsername] = useState(false);

  // Speaker state
  const [isSpeakerLoading, setIsSpeakerLoading] = useState(true);
  const [speakerData, setSpeakerData] = useState<any>(null);
  const [isSavingSpeaker, setIsSavingSpeaker] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(false);
  const [activeWorkshopTab, setActiveWorkshopTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const fetchSpeakerData = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('speakers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setSpeakerData(data);
      } catch (err) {
        console.error('Error fetching speaker data:', err);
      } finally {
        setIsSpeakerLoading(false);
      }
    };

    fetchSpeakerData();
  }, [user?.id]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      if (!speakerData?.id) return;
      setIsLoadingWorkshops(true);
      try {
        const { data, error } = await supabase
          .from('workshops')
          .select(`
            *,
            workshop_speakers!inner(speaker_id)
          `)
          .eq('workshop_speakers.speaker_id', speakerData.id)
          .eq('is_confirmed', true)
          .order('scheduled_at', { ascending: false });

        if (error) throw error;
        setWorkshops(data || []);
      } catch (err) {
        console.error('Error fetching workshops:', err);
      } finally {
        setIsLoadingWorkshops(false);
      }
    };

    if (speakerData?.id && activeSection === 'speaker') {
      fetchWorkshops();
    }
  }, [speakerData?.id, activeSection]);

  const getTimeInTimezone = (date: string, timeZone: string) => {
    try {
      return new Intl.DateTimeFormat('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone,
        hour12: true
      }).format(new Date(date));
    } catch (e) {
      return '--:--';
    }
  };

  const TIMEZONES = [
    { label: 'UTC', code: 'gb', zone: 'UTC', flag: 'https://flagcdn.com/w20/gb.png' },
    { label: 'MAD', code: 'es', zone: 'Europe/Madrid', flag: 'https://flagcdn.com/w20/es.png' },
    { label: 'STG', code: 'cl', zone: 'America/Santiago', flag: 'https://flagcdn.com/w20/cl.png' },
    { label: 'LIM', code: 'pe', zone: 'America/Lima', flag: 'https://flagcdn.com/w20/pe.png' },
    { label: 'MEX', code: 'mx', zone: 'America/Mexico_City', flag: 'https://flagcdn.com/w20/mx.png' },
    { label: 'MIA', code: 'us', zone: 'America/New_York', flag: 'https://flagcdn.com/w20/us.png' },
  ];

  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-1.5 min-w-0">
        <SettingsIcon className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-sm text-foreground truncate">{tCommon.t('navigation.settings') || 'Ajustes'}</span>
      </div>
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent, tCommon]);

  const handleExportData = async () => {
    if (!profile) return;
    setIsExporting(true);

    try {
      const { data: userApps, error: appsError } = await supabase
        .from('apps')
        .select('*')
        .eq('user_id', profile.id);

      if (appsError) throw appsError;

      const appIds = userApps?.map(app => app.id) || [];
      const { data: userRoadmaps, error: roadmapsError } = appIds.length > 0 
        ? await supabase.from('roadmap_cards').select('app_id, title, description, created_at, completed_at').in('app_id', appIds)
        : { data: [], error: null };
        
      if (roadmapsError) throw roadmapsError;

      const securityExport = {
        account_profile: {
          name: profile.name,
          username: profile.username,
          bio: profile.bio,
          location: profile.location,
          social_links: {
            website: profile.website,
            twitter: profile.twitter,
            github: profile.github,
            linkedin: profile.linkedin,
          },
          privacy_preferences: {
            telemetry_analytics_enabled: profile.allow_analytics,
            marketing_communications_enabled: profile.allow_marketing
          },
        },
        my_apps: userApps?.map(app => ({
          app_name: app.name,
          app_url: app.url,
          tagline: app.tagline,
          description: app.description,
          tags: app.tags,
          metrics_provided: {
            hours_ideation: app.hours_ideation,
            hours_building: app.hours_building
          },
          app_created_at: app.created_at
        })) || [],
        my_roadmaps: userApps?.map(app => {
          const cardsForApp = userRoadmaps?.filter(card => card.app_id === app.id) || [];
          if (cardsForApp.length === 0) return null;
          return {
            app_name: app.name,
            cards_created: cardsForApp.map(card => ({
              title: card.title,
              description: card.description,
              is_completed: !!card.completed_at,
              created_at: card.created_at
            }))
          };
        }).filter(Boolean) || []
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(securityExport, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `vibecoders_data_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success('Descarga iniciada de forma segura');
    } catch (err: unknown) {
      console.error('Data export error', err);
      toast.error('Ocurrió un error compilando tus datos: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExporting(false);
    }
  };

  const copyUsername = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(profile.username);
      setHasCopiedUsername(true);
      toast.success('Nombre de usuario copiado');
      setTimeout(() => setHasCopiedUsername(false), 2000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== profile?.username) {
      toast.error('El nombre de usuario no coincide');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Invoking delete-user function...');
      const { data, error: invokeErr } = await supabase.functions.invoke('delete-user', {
        method: 'POST',
      });
      
      if (invokeErr) {
        console.error('Edge Function invocation error:', invokeErr);
        throw invokeErr;
      }

      console.log('Delete user response:', data);
      
      await supabase.auth.signOut();
      toast.success('Cuenta eliminada correctamente');
      window.location.href = '/';
    } catch (err: unknown) {
      console.error('Account deletion error:', err);
      let errorMsg = 'Error al intentar eliminar la cuenta';
      
      if (err instanceof Error) {
        errorMsg += ': ' + err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMsg += ': ' + (err as { message: string }).message;
      }
      
      toast.error(errorMsg);
      setIsDeleting(false);
    }
  };

  const renderNavTab = (id: SettingsSection, icon: React.ReactNode, label: string) => {
    const isActive = activeSection === id;
    return (
      <button
        onClick={() => navigate(`/settings/${id}`)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all border",
          isActive 
            ? "bg-white text-slate-900 border-slate-200 shadow-sm" 
            : "bg-transparent text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-100/50"
        )}
      >
        <span className={cn("flex items-center justify-center", isActive ? "text-slate-900" : "text-slate-400")}>
          {icon}
        </span>
        {label}
      </button>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </main>
    );
  }

  if (!profile) return null;

  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'pt', label: 'Português' },
    { code: 'fr', label: 'Français' },
  ] as const;

  const handleSpeakerSave = async () => {
    if (!speakerData || !speakerData.id) return;
    setIsSavingSpeaker(true);
    try {
      const { error } = await supabase
        .from('speakers')
        .update({
          display_name: speakerData.display_name,
          email: speakerData.email,
          tagline: speakerData.tagline,
          photo_url: speakerData.photo_url,
        })
        .eq('id', speakerData.id)
        .eq('user_id', profile?.id); // Extra safety

      if (error) throw error;
      toast.success('Perfil de ponente actualizado');
    } catch (err: any) {
      console.error('Error saving speaker profile:', err);
      toast.error('Error al guardar datos: ' + err.message);
    } finally {
      setIsSavingSpeaker(false);
    }
  };
  
  const handleSpeakerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    
    // 10MB limit (10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('La foto es demasiado grande. Debe pesar menos de 10MB.');
      return;
    }
    
    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `speakers/${profile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-assets')
        .getPublicUrl(filePath);
      
      setSpeakerData({ ...speakerData, photo_url: publicUrl });
      toast.success('Foto cargada correctamente');
    } catch (error) {
      toast.error('Error al cargar la foto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="container px-3 sm:px-4 pt-4 sm:pt-6 pb-20 sm:pb-8 flex-1 max-w-2xl mx-auto">
      
      {/* Save Status / Error Feedback */}
      {(isSaving || error) && (
        <div className={cn(
          "fixed top-4 right-4 flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border shadow-sm transition-all duration-300 z-50",
          error ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-slate-200 text-slate-600"
        )}>
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="font-medium">Guardando...</span>
            </>
          ) : error ? (
            <>
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span className="font-medium text-red-600">Error: {error.message}</span>
            </>
          ) : null}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-3 sm:mx-0 px-3 sm:px-0 hide-scrollbar">
        {renderNavTab('account', <UserIcon className="w-[14px] h-[14px]" />, 'Cuenta')}
        {renderNavTab('privacy', <Shield className="w-[14px] h-[14px]" />, 'Privacidad')}
        {!isSpeakerLoading && speakerData && renderNavTab('speaker', <Mic className="w-[14px] h-[14px]" />, 'Perfil Ponente')}
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
        
        {activeSection === 'account' && (
          <div className="divide-y divide-slate-100 flex flex-col w-full animate-in fade-in duration-300">
            {/* Sector: Idioma */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-5 items-start">
              <div className="shrink-0 pt-0.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Idioma de la plataforma</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">Selecciona el idioma principal de la interfaz y notificaciones.</p>
                </div>
                
                <div className="flex gap-1.5">
                  {LANGUAGES.map(lang => (
                    <Button
                      key={lang.code}
                      variant="outline"
                      size="sm"
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "h-7 text-[11px] font-medium px-2.5 rounded-md",
                        language === lang.code 
                          ? "bg-[#3D5AFE] text-white border-[#3D5AFE] hover:bg-[#3D5AFE]/90 hover:text-white" 
                          : "text-slate-600 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {lang.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="divide-y divide-slate-100 flex flex-col w-full animate-in fade-in duration-300">
            
            {/* Sector 1: Cookies */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-5 items-start">
              <div className="shrink-0 pt-0.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                  <Cookie className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Preferencias de Cookies</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Gestiona qué cookies aceptas de terceros.</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <Label className="text-[12px] font-semibold text-slate-900">Esenciales</Label>
                      <p className="text-[10px] text-slate-500 mt-0.5 max-w-[200px]">Autenticación y seguridad. Siempre activas.</p>
                    </div>
                    <Switch checked disabled className="data-[state=checked]:bg-[#3D5AFE] scale-[0.65] origin-right" />
                  </div>
                  
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <Label className="text-[12px] font-semibold text-slate-900">Analíticas (Clarity)</Label>
                      <p className="text-[10px] text-slate-500 mt-0.5 max-w-[200px]">Métricas anonimizadas de uso.</p>
                    </div>
                    <Switch 
                      checked={profile.allow_analytics} 
                      onCheckedChange={(checked) => updateProfile({ allow_analytics: checked })} 
                      className="data-[state=checked]:bg-[#3D5AFE] scale-[0.65] origin-right" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sector 2: Derechos */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-5 items-start">
              <div className="shrink-0 pt-0.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Ejercer mis Derechos</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">Solicita información o restricción de tratamiento de tus datos.</p>
                </div>
                
                <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm">
                  Para ejercer tus derechos de acceso, rectificación o eliminación de datos (GDPR 15-22 / LGPD 18), puedes contactarnos directamente en{' '}
                  <a href="mailto:privacy@vibecoders.la" className="text-[#3D5AFE] font-semibold hover:underline">
                    privacy@vibecoders.la
                  </a>.
                </p>
              </div>
            </div>

            {/* Sector 3: Mis Datos */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-5 items-start">
              <div className="shrink-0 pt-0.5">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                  <Download className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Mis Datos</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Descarga tus datos en formato estructurado JSON.</p>
                </div>
                
                <Button size="sm" onClick={handleExportData} disabled={isExporting} className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white font-semibold rounded-md h-7 px-3 text-[11px]">
                  {isExporting ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Download className="w-3 h-3 mr-1.5" />}
                  {isExporting ? 'Procesando...' : 'Exportar JSON'}
                </Button>
              </div>
            </div>

            {/* Sector 4: Eliminar Cuenta */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-5 items-start">
              <div className="shrink-0 pt-0.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-sm">
                  <Trash2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-[13px] font-bold text-red-600 tracking-tight">Zona de Peligro</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-[260px]">Borrado permanente de perfil, apps y progreso sin recuperación.</p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="text-red-600 border-red-200 hover:bg-red-50 font-semibold rounded-md h-7 px-3 text-[11px]"
                >
                  <Trash2 className="w-3 h-3 mr-1.5" />
                  Eliminar mi cuenta permanentemente
                </Button>
              </div>
            </div>

          </div>
         )}
         {activeSection === 'speaker' && speakerData && (
          <div className="divide-y divide-slate-100 flex flex-col w-full animate-in fade-in duration-300">
            <div className="p-4 md:p-5">
              <div className="w-full mb-6 text-center sm:text-left">
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">Perfil de Ponente</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Actualiza tus datos públicos que se mostrarán en los workshops en los que participes. Solo tú puedes editar esta información.
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-[12px] font-semibold text-slate-900">Nombre Público</Label>
                      <Input 
                        value={speakerData.display_name || ''} 
                        onChange={e => setSpeakerData({...speakerData, display_name: e.target.value})} 
                        className="h-9 text-[13px]"
                        placeholder="Tu nombre (e.g., Rosmel)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[12px] font-semibold text-slate-900">Tagline / Profesión</Label>
                      <Input 
                        value={speakerData.tagline || ''} 
                        onChange={e => setSpeakerData({...speakerData, tagline: e.target.value})} 
                        className="h-9 text-[13px]"
                        placeholder="Frontend Engineer @ VibeCoders"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[12px] font-semibold text-slate-900">Email (para agendarte, no será público)</Label>
                      <Input 
                        value={speakerData.email || ''} 
                        onChange={e => setSpeakerData({...speakerData, email: e.target.value})} 
                        type="email"
                        placeholder="contacto@ejemplo.com"
                      />
                    </div>

                    <div className="pt-2">
                      <Button 
                        onClick={handleSpeakerSave} 
                        disabled={isSavingSpeaker}
                        className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white font-semibold rounded-md h-8 px-4 text-[12px] w-full sm:w-auto"
                      >
                        {isSavingSpeaker ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
                        Guardar Perfil de Ponente
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="lg:w-[240px] space-y-4">
                  <div className="space-y-3">
                    <Label className="text-[12px] font-semibold text-slate-900">Foto del Ponente</Label>
                    <div className="flex flex-col gap-3">
                      {/* Removed manual button, now integrated as overlay */}
                      
                          <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center relative group">
                            {speakerData.photo_url ? (
                              <>
                                <img 
                                  src={speakerData.photo_url} 
                                  alt="Vista previa ponente" 
                                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                                />
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-white gap-2">
                                  {isUploadingPhoto ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <>
                                      <Camera className="h-6 w-6" />
                                      <span className="text-[11px] font-medium">Reemplazar foto</span>
                                    </>
                                  )}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleSpeakerPhotoUpload}
                                    disabled={isUploadingPhoto}
                                  />
                                </label>
                              </>
                            ) : (
                              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full text-slate-400 hover:text-slate-600 transition-colors">
                                {isUploadingPhoto ? (
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                  <>
                                    <Camera className="h-8 w-8" />
                                    <span className="text-[12px] font-medium">Cargar Foto</span>
                                  </>
                                )}
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={handleSpeakerPhotoUpload}
                                  disabled={isUploadingPhoto}
                                />
                              </label>
                            )}
                          </div>
                          <div className="mt-2 text-[10px] text-slate-400 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <Camera className="w-3 h-3" />
                              Foto exclusiva para eventos.
                            </div>
                          </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separate section for workshops below the profile card */}
            <div className="pt-2 px-4 md:px-5 pb-8 animate-in slide-in-from-bottom-2 duration-500">
              <div className="pt-4 border-t border-slate-100 flex flex-col space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Mis Charlas Confirmadas</h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">Listado de eventos públicos y privados.</p>
                  </div>
                  <Link 
                    to="/clases-en-vivo" 
                    className="text-[12px] bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    Ver calendario público
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>

                {/* Internal Tabs for Filtering Workshops */}
                <div className="flex gap-1 p-1 bg-slate-50 rounded-lg w-fit border border-slate-100">
                  <button 
                    onClick={() => setActiveWorkshopTab('upcoming')}
                    className={cn(
                      "px-4 py-1.5 text-[12px] font-bold rounded-md transition-all",
                      activeWorkshopTab === 'upcoming' 
                        ? "bg-white text-[#3D5AFE] shadow-sm border border-slate-100" 
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Próximas
                  </button>
                  <button 
                    onClick={() => setActiveWorkshopTab('past')}
                    className={cn(
                      "px-4 py-1.5 text-[12px] font-bold rounded-md transition-all",
                      activeWorkshopTab === 'past' 
                        ? "bg-white text-[#3D5AFE] shadow-sm border border-slate-100" 
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    Pasadas
                  </button>
                </div>

                {isLoadingWorkshops ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-200" />
                  </div>
                ) : (() => {
                  const now = new Date();
                  const filteredWorkshops = workshops
                    .filter(w => {
                      const date = new Date(w.scheduled_at);
                      return activeWorkshopTab === 'upcoming' ? date >= now : date < now;
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.scheduled_at).getTime();
                      const dateB = new Date(b.scheduled_at).getTime();
                      return activeWorkshopTab === 'upcoming' ? dateA - dateB : dateB - dateA;
                    });

                  if (filteredWorkshops.length === 0) {
                    return (
                      <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-xl">
                        <Calendar className="w-8 h-8 text-slate-100 mx-auto mb-3" />
                        <p className="text-[13px] text-slate-400 font-medium">
                          {activeWorkshopTab === 'upcoming' 
                            ? "No tienes charlas programadas próximamente." 
                            : "No se encontraron charlas en el historial."}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-4">
                      {filteredWorkshops.map((workshop) => (
                        <div 
                          key={workshop.id} 
                          className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-[#3D5AFE]/20 transition-all duration-300 group"
                        >
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div className="space-y-1.5">
                              <h4 className="text-[15px] font-bold text-slate-900 leading-tight group-hover:text-[#3D5AFE] transition-colors">
                                {workshop.title}
                              </h4>
                              {workshop.tagline && (
                                <p className="text-[13px] text-slate-500 italic leading-relaxed border-l-2 border-slate-100 pl-3">
                                  {workshop.tagline}
                                </p>
                              )}
                            </div>
                            {activeWorkshopTab === 'past' && (
                              <div className="shrink-0 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-extrabold uppercase tracking-widest border border-green-100">
                                Realizada
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 py-4 border-y border-slate-50">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#3D5AFE]/5 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-[#3D5AFE]" />
                              </div>
                              <span className="text-[12px] font-bold text-slate-700 capitalize">
                                {format(new Date(workshop.scheduled_at), "eeee, d 'de' MMMM", { locale: es })}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-100">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <div className="flex gap-5">
                                {[...TIMEZONES]
                                  .sort((a, b) => {
                                    // Chronological sorting based on local time
                                    const getNumericTime = (tz: string) => {
                                      const d = new Date(workshop.scheduled_at);
                                      const parts = new Intl.DateTimeFormat('en-US', {
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hourCycle: 'h23',
                                        timeZone: tz,
                                      }).formatToParts(d);
                                      const h = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
                                      const m = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
                                      return h * 60 + m;
                                    };
                                    return getNumericTime(a.zone) - getNumericTime(b.zone);
                                  })
                                  .map((tz) => (
                                  <div key={tz.label} className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1">
                                      <img 
                                        src={tz.flag} 
                                        alt={tz.label} 
                                        className="w-3.5 h-auto object-contain rounded-[1px] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]" 
                                      />
                                      <span className="text-[10px] font-extrabold text-slate-400 leading-none">{tz.label}</span>
                                    </div>
                                    <span className="text-[10px] font-normal text-slate-800 tabular-nums whitespace-nowrap">
                                      {getTimeInTimezone(workshop.scheduled_at, tz.zone)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end pt-2">
                            {workshop.luma_url && (
                              <a 
                                href={workshop.luma_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[13px] font-bold text-[#3D5AFE] flex items-center gap-1.5 hover:translate-x-1 transition-transform"
                              >
                                Ver en Luma
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={(open) => {
        if (!isDeleting) {
          setShowDeleteConfirm(open);
          if (!open) setDeleteConfirmText('');
        }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              ¿Eliminar cuenta permanentemente?
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-[13px] pt-2">
              Esta acción es irreversible. Se borrarán todas tus aplicaciones, roadmaps, perfil y acceso a la plataforma.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Confirma tu nombre de usuario</p>
              <div className="flex items-center justify-between gap-2">
                <code className="bg-white border border-slate-200 px-2 py-1 rounded text-[13px] font-mono text-slate-900 flex-1 truncate">
                  {profile.username}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-500 hover:text-slate-900"
                  onClick={copyUsername}
                >
                  {hasCopiedUsername ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-input" className="text-[12px] font-semibold text-slate-700">
                Escribe tu nombre de usuario para confirmar
              </Label>
              <Input
                id="verification-input"
                name="verification_field"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={profile.username || ''}
                className="h-9 text-[13px]"
                autoComplete="one-time-code"
                spellCheck={false}
                type="text"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="text-slate-500 hover:text-slate-900 text-[13px]"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== profile.username}
              className="bg-red-600 hover:bg-red-700 text-[13px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Entiendo, eliminar mi cuenta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
