import { useState, useEffect } from "react";
import { usePopups, useCreatePopup, useUpdatePopup, useDeletePopup, type PopupConfig, type PopupRules, DEFAULT_MODAL_CONFIG, DEFAULT_BANNER_CONFIG, DEFAULT_RULES, type Popup } from "@/hooks/usePopups";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDomainScrape, useUpdateDomainBranding } from "@/hooks/useDomainBranding";
import { useFounderStatus } from "@/hooks/useFounderStatus";
import { SidebarEditor } from "@/components/banners-editor/SidebarEditor";
import { Loader2, Plus, Code, Monitor, Smartphone, Layout, Settings2, ExternalLink, ShieldCheck, Sparkles, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { InstallScriptModal } from "./InstallScriptModal";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BannersTabProps {
  appId: string;
  appName?: string;
  bannerId?: string;
}

export function BannersTab({ appId, appName, bannerId }: BannersTabProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data, isLoading: isLoadingPopups } = usePopups(appId, appName);
  const popups = data?.popups;
  const projectId = data?.projectId;
  const apiKey = data?.api_key;
  
  const { data: founderStatus } = useFounderStatus();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  
  const [selectedPopupId, setSelectedPopupId] = useState<string | null>(bannerId || null);

  // Sync selectedPopupId when bannerId from URL changes
  useEffect(() => {
    if (bannerId) {
      setSelectedPopupId(bannerId);
    }
  }, [bannerId]);

  const handleSelectPopup = (id: string | null) => {
    setSelectedPopupId(id);
    if (id) {
      navigate(`/apps/${appId}/banners/${id}`);
    } else {
      navigate(`/apps/${appId}/banners`);
    }
  };

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [popupToDelete, setPopupToDelete] = useState<string | null>(null);
  
  const createPopupMutation = useCreatePopup();
  const updatePopupMutation = useUpdatePopup();
  const deletePopupMutation = useDeletePopup();
  
  const { data: domainScrape } = useDomainScrape(appId);
  const updateBrandingMutation = useUpdateDomainBranding();

  const selectedPopup = popups?.find(p => p.id === selectedPopupId) || null;

  const [popupName, setPopupName] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [layoutType, setLayoutType] = useState<"modal" | "bar">("modal");
  const [designConfig, setDesignConfig] = useState<PopupConfig>(DEFAULT_MODAL_CONFIG);
  const [rulesConfig, setRulesConfig] = useState<PopupRules>(DEFAULT_RULES);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  useEffect(() => {
    if (selectedPopup) {
      setPopupName(selectedPopup.name);
      setIsActive(selectedPopup.is_active);
      setDesignConfig(selectedPopup.config as PopupConfig);
      setRulesConfig(selectedPopup.rules as PopupRules);
      setLayoutType((selectedPopup.config as PopupConfig).type);
      setStartAt(selectedPopup.start_at || "");
      setEndAt(selectedPopup.end_at || "");
    }
  }, [selectedPopup]);

  const handleCreatePopup = async () => {
    try {
      const newPopupAndKey = await createPopupMutation.mutateAsync({
        vibecodersAppId: appId,
        appName,
        popupData: {
          name: t('banners.new_banner'),
          config: DEFAULT_MODAL_CONFIG,
          rules: DEFAULT_RULES,
          is_active: false
        }
      });
      handleSelectPopup(newPopupAndKey.popup.id);
      toast.success(t('editor.banner_updated'));
    } catch (error) {
      toast.error(t('editor.banner_update_error'));
    }
  };

  const handleSave = async (silent = false) => {
    if (!selectedPopupId) return false;
    try {
      await updatePopupMutation.mutateAsync({
        popupId: selectedPopupId,
        updates: {
          name: popupName,
          is_active: isActive,
          config: designConfig,
          rules: rulesConfig,
          start_at: startAt || null,
          end_at: endAt || null
        }
      });
      if (!silent) toast.success(t('editor.changes_saved'));
      return true;
    } catch (error) {
      if (!silent) toast.error(t('editor.save_error'));
      return false;
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!currentActive) {
      const tier = founderStatus?.tier;
      const isPremium = tier === 'pro' || tier === 'founder';
      if (!isPremium) {
        setIsPremiumModalOpen(true);
        return;
      }
    }

    try {
      await updatePopupMutation.mutateAsync({ 
        popupId: id, 
        updates: { is_active: !currentActive } 
      });
      if (id === selectedPopupId) setIsActive(!currentActive);
      toast.success(!currentActive ? t('editor.banner_activated') : t('editor.banner_deactivated'));
    } catch (error) {
      toast.error(t('editor.status_update_error'));
    }
  };

  const handleSetIsActive = (newActive: boolean) => {
    if (newActive) {
      const tier = founderStatus?.tier;
      const isPremium = tier === 'pro' || tier === 'founder';
      if (!isPremium) {
        setIsPremiumModalOpen(true);
        return;
      }
    }
    setIsActive(newActive);
  };

  const renderPremiumModal = () => (
    <Dialog open={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl bg-zinc-950 rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="p-8 relative">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6 border border-indigo-400/20">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          
          <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-3">
            Activa tus Banners Premium
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed text-zinc-400 mb-8 font-medium">
            Atrae la atención de tus usuarios y aumenta tus conversiones. Desbloquea banners dinámicos, creador IA y más funciones con Vibecoders Pro o Founder. Promoción por tiempo limitado: 9.90/año.
          </DialogDescription>
          
          <Button 
            onClick={() => navigate('/settings/billing')}
            className="w-full h-14 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl text-[16px] font-bold shadow-[0_10px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] transition-all active:scale-[0.98] gap-3"
          >
            <Crown className="h-5 w-5 text-indigo-500" />
            Actualizar a Pro
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const handleDeletePopup = (id: string) => {
    setPopupToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!popupToDelete) return;
    try {
      await deletePopupMutation.mutateAsync({ popupId: popupToDelete });
      if (popupToDelete === selectedPopupId) handleSelectPopup(null);
      toast.success(t('editor.banner_deleted'));
    } catch (error) {
      toast.error(t('editor.banner_delete_error'));
    } finally {
      setIsDeleteDialogOpen(false);
      setPopupToDelete(null);
    }
  };

  const handleLayoutChange = (newType: "modal" | "bar") => {
    setLayoutType(newType);
    setDesignConfig(newType === "modal" ? DEFAULT_MODAL_CONFIG : DEFAULT_BANNER_CONFIG);
  };

  if (isLoadingPopups) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedPopupId) {
    return (
      <div className="flex flex-col min-h-[500px] w-full max-w-5xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b pb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-bold tracking-tight">{t('banners.title')}</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">Beta</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('banners.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
             {apiKey && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsInstallModalOpen(true)}
                className="h-9 px-4 border-dashed hover:bg-black hover:text-white hover:border-black transition-all"
              >
                <Code className="h-4 w-4 mr-2" />
                {t('banners.install_script')}
              </Button>
             )}
             <Button 
               onClick={handleCreatePopup} 
               disabled={createPopupMutation.isPending}
               className="h-9 px-4 shadow-sm"
             >
               <Plus className="h-4 w-4 mr-2" />
               {t('banners.new_banner')}
             </Button>
          </div>
        </div>

        {/* Content Section */}
        {popups && popups.length > 0 ? (
          <div className="flex-1 space-y-8">
            <div className="grid gap-4">
              {popups.map(popup => (
                <div 
                  key={popup.id} 
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all cursor-pointer overflow-hidden" 
                  onClick={() => handleSelectPopup(popup.id)}
                >
                   {/* Background Accent */}
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${popup.is_active ? 'bg-green-500' : 'bg-muted-foreground/20'}`} />
                   
                   <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${popup.is_active ? 'bg-green-50 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                        {(popup.config as PopupConfig)?.type === 'modal' ? <Layout className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-base truncate">{popup.name}</p>
                          {popup.is_active && (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          <span className="flex items-center gap-1">
                            <Settings2 className="h-3 w-3" />
                            {(popup.config as PopupConfig)?.type || t('editor.popup')}
                           </span>
                           <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                           <span>{t('banners.updated')} {new Date(popup.updated_at).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>

                    <div className="flex items-center gap-6 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
                       <div className="flex flex-col items-center gap-1.5 px-4">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">{popup.is_active ? t('banners.active') : t('banners.draft')}</span>
                         <Switch 
                          checked={popup.is_active} 
                          onCheckedChange={(c) => handleToggleActive(popup.id, popup.is_active)}
                          onClick={(e) => e.stopPropagation()}
                          className="scale-75 data-[state=checked]:bg-green-500"
                        />
                       </div>
                       <Button variant="secondary" size="sm" className="h-9 px-4 rounded-lg hidden sm:flex">
                         {t('banners.edit')}
                       </Button>
                    </div>
                </div>
              ))}
            </div>
            
            </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-muted/5 rounded-[32px] border-2 border-dashed border-muted/30">
             <div className="bg-primary/10 p-6 rounded-[24px] mb-6 shadow-sm">
               <Plus className="h-10 w-10 text-primary" />
             </div>
             <p className="text-muted-foreground mb-8 text-center max-w-sm text-sm leading-relaxed">
               {t('banners.empty.description')}
             </p>
             <Button onClick={handleCreatePopup} disabled={createPopupMutation.isPending} size="lg" className="px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
               {createPopupMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
               {t('banners.empty.button')}
             </Button>
          </div>
        )}

        {/* Powered by Section */}
          <div className="mt-auto py-10 flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 rounded-lg border border-transparent hover:border-border transition-colors">
               <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">{t('banners.powered_by')}</span>
               <div className="h-4 flex items-center">
                <Logo className="h-4 grayscale" />
              </div>
           </div>
        </div>

        {apiKey && (
          <InstallScriptModal 
            isOpen={isInstallModalOpen} 
            onClose={() => setIsInstallModalOpen(false)} 
            projectId={apiKey} 
            appName={domainScrape?.url || appName || t('banners.your_app')} 
          />
        )}
        {renderPremiumModal()}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-165px)] overflow-hidden border-t bg-background relative z-10">
      <SidebarEditor
        projectId={appId}
        projectName={popupName}
        projectDomain=""
        apiKey=""
        popups={popups}
        selectedPopupId={selectedPopupId}
        onSelectPopup={handleSelectPopup}
        popupName={popupName}
        setPopupName={setPopupName}
        isActive={isActive}
        setIsActive={handleSetIsActive}
        designConfig={designConfig}
        setDesignConfig={setDesignConfig}
        layoutType={layoutType}
        handleLayoutChange={handleLayoutChange}
        rulesConfig={rulesConfig}
        setRulesConfig={setRulesConfig}
        startAt={startAt}
        setStartAt={setStartAt}
        endAt={endAt}
        setEndAt={setEndAt}
        handleSave={handleSave}
        isSaving={updatePopupMutation.isPending}
        onCreatePopup={handleCreatePopup}
        onToggleActive={handleToggleActive}
        onDeletePopup={handleDeletePopup}
        onBackToOverview={() => handleSelectPopup(null)}
        domainScrape={domainScrape}
        brandingOverrides={domainScrape?.branding || null}
        onSaveBranding={(overrides) => updateBrandingMutation.mutate({ vibecodersAppId: appId, branding: overrides })}
        isSavingBranding={updateBrandingMutation.isPending}
      />

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>{t('banners.delete.title')}</AlertDialogTitle>
             <AlertDialogDescription>
               {t('banners.delete.description')}
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={() => setPopupToDelete(null)}>{t('banners.delete.cancel')}</AlertDialogCancel>
             <AlertDialogAction 
               onClick={confirmDelete}
               className="bg-red-600 hover:bg-red-700 text-white"
             >
               {t('banners.delete.confirm')}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
       {renderPremiumModal()}
    </div>
  );
}

