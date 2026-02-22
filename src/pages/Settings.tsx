import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Settings as SettingsIcon, AlertCircle, Loader2, Download, 
  Shield, User as UserIcon, Activity, Trash2, 
  Cookie, Globe, Copy, Check
} from 'lucide-react';
import { useProfileEditor } from '@/hooks/useProfileEditor';
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

type SettingsSection = 'account' | 'privacy';

const Settings = () => {
  const tCommon = useTranslation('common');
  const { setHeaderContent } = usePageHeader();
  const { profile, loading, isSaving, error, updateProfile } = useProfileEditor();
  const { language, setLanguage } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [hasCopiedUsername, setHasCopiedUsername] = useState(false);

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
        onClick={() => setActiveSection(id)}
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
      <div className="flex gap-1.5 mb-4">
        {renderNavTab('account', <UserIcon className="w-[14px] h-[14px]" />, 'Cuenta')}
        {renderNavTab('privacy', <Shield className="w-[14px] h-[14px]" />, 'Privacidad')}
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
