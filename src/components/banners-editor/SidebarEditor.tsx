import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowLeft, Play, Save, Loader2, Monitor, Smartphone, Pencil, Check, X, Menu, SlidersHorizontal, List } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApps } from "@/hooks/useApps";
import { type PopupConfig, type PopupRules, type Popup, useUpdatePopup } from "@/hooks/usePopups";
import { type BrandingOverrides, type DomainScrape } from "@/hooks/useDomainBranding";
import { useDynamicFont } from "@/hooks/useDynamicFont";
import { PopupListSidebar } from "./PopupListSidebar";
import { GlobalBrandingDrawer } from "./GlobalBrandingModal";
import { ConfigPanel } from "./ConfigPanel";
import { AIPopupChat } from "./AIPopupChat";
import { toast } from "sonner";
import { useResizable } from "@/hooks/useResizable";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

type LayoutType = "modal" | "bar";
type DeviceFrame = "desktop" | "phone";

const SDK_URL = "https://cdn.toggleup.io/v1/sdk.js";

declare global {
  interface Window {
    ToggleupSDK?: {
      init: () => void;
      showPopup: (config: unknown, options?: { target?: HTMLElement }) => { cleanup?: () => void } | void;
    };
  }
}

interface SidebarEditorProps {
  projectId: string | undefined;
  projectName: string | undefined;
  projectDomain: string | undefined;
  apiKey: string | undefined;
  popups: Popup[] | undefined;
  selectedPopupId: string | null;
  onSelectPopup: (id: string | null) => void;
  popupName: string;
  setPopupName: (name: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  designConfig: PopupConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
  layoutType: LayoutType;
  handleLayoutChange: (value: LayoutType) => void;
  rulesConfig: PopupRules;
  setRulesConfig: React.Dispatch<React.SetStateAction<PopupRules>>;
  startAt: string;
  setStartAt: (value: string) => void;
  endAt: string;
  setEndAt: (value: string) => void;
  defaultLogoUrl?: string | null;
  handleSave: (silent?: boolean) => Promise<boolean>;
  isSaving: boolean;
  onCreatePopup: () => void;
  onToggleActive: (popupId: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDeletePopup: (popupId: string, e?: React.MouseEvent) => void;
  onBackToOverview: () => void;
  domainScrape: DomainScrape | null | undefined;
  brandingOverrides: BrandingOverrides | null;
  onSaveBranding: (overrides: BrandingOverrides) => void;
  isSavingBranding: boolean;
  initialBrandingOpen?: boolean;
}

// Custom Icons based on user design
import { ModalIcon, BannerIcon } from "@/components/icons/PopupIcons";

export const SidebarEditor = ({
  projectId,
  projectName,
  projectDomain,
  apiKey,
  popups,
  selectedPopupId,
  onSelectPopup,
  popupName,
  setPopupName,
  isActive,
  setIsActive,
  designConfig,
  setDesignConfig,
  layoutType,
  handleLayoutChange,
  rulesConfig,
  setRulesConfig,
  startAt,
  setStartAt,
  endAt,
  setEndAt,
  defaultLogoUrl,
  handleSave,
  isSaving,
  onCreatePopup,
  onToggleActive,
  onDeletePopup,
  onBackToOverview,
  domainScrape,
  brandingOverrides,
  onSaveBranding,
  isSavingBranding,
  initialBrandingOpen = false,
}: SidebarEditorProps) => {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();

  // Mobile sheet states
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [rightSheetOpen, setRightSheetOpen] = useState(false);
  const [brandingDrawerOpen, setBrandingDrawerOpen] = useState(false);
  // Ensure font is loaded globally for the preview
  useDynamicFont(designConfig.style?.fontFamily);


  const [isExecuting, setIsExecuting] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>(isMobile ? "phone" : "desktop");
  const [sdkReady, setSdkReady] = useState(false);
  const [forceRenderKey, setForceRenderKey] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update device frame when mobile state changes
  useEffect(() => {
    if (isMobile) {
      setDeviceFrame("phone");
    }
  }, [isMobile]);

  // Resizable sidebars (only for desktop)
  const { width: leftWidth, startResize: startLeftResize } = useResizable({
    initialWidth: 180,
    minWidth: 180,
    maxWidth: 270,
    direction: 'right',
    storageKey: 'toggleup-left-sidebar-width',
  });

  const { width: rightWidth, startResize: startRightResize } = useResizable({
    initialWidth: 260,
    minWidth: 260,
    maxWidth: 390,
    direction: 'left',
    storageKey: 'toggleup-right-sidebar-width',
  });

  // Project Name Editing
  const { updateApp } = useApps();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState(projectName || "");

  useEffect(() => {
    if (projectName) setTempProjectName(projectName);
  }, [projectName]);

  const handleSaveProjectName = async () => {
    if (!selectedPopupId || !tempProjectName.trim()) return;
    try {
      await updatePopup.mutateAsync({ 
        popupId: selectedPopupId, 
        updates: { name: tempProjectName.trim() } 
      });
      setPopupName(tempProjectName.trim());
      setIsEditingName(false);
      toast.success(t('editor.banner_updated'));
    } catch (error) {
      toast.error(t('editor.banner_update_error'));
    }
  };

  const getProjectFaviconUrl = (
    storedImages: { favicon?: string } | null | undefined,
    branding: { images?: { favicon?: string } } | null | undefined
  ): string | null => {
    if (storedImages?.favicon) return storedImages.favicon;
    if (branding?.images?.favicon) return branding.images.favicon;
    return null;
  };

  const faviconUrl = getProjectFaviconUrl(domainScrape?.stored_images, domainScrape?.branding);

  // Load SDK dynamically
  const loadSDK = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.ToggleupSDK) {
        resolve();
        return;
      }
      const existingScript = document.querySelector(`script[src = "${SDK_URL}"]`);
      if (existingScript) {
        const checkSDK = setInterval(() => {
          if (window.ToggleupSDK) {
            clearInterval(checkSDK);
            resolve();
          }
        }, 100);
        return;
      }
      const script = document.createElement("script");
      script.src = SDK_URL;
      script.setAttribute("data-manual", "");
      script.async = true;
      script.onload = () => {
        const checkSDK = setInterval(() => {
          if (window.ToggleupSDK) {
            clearInterval(checkSDK);
            window.ToggleupSDK.init();
            resolve();
          }
        }, 100);
      };
      script.onerror = () => reject(new Error("Failed to load SDK"));
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    loadSDK()
      .then(() => setSdkReady(true))
      .catch((error) => console.error("[Editor] Error loading SDK:", error));
  }, [loadSDK]);

  useEffect(() => {
    return () => {
      const script = document.querySelector(`script[src = "${SDK_URL}"]`);
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      (window as unknown as Record<string, unknown>).ToggleupSDK = undefined;
    };
  }, []);

  // Build SDK config
  const buildSdkConfig = useCallback(() => {
    const bgColor = designConfig.colors?.background || designConfig.style?.backgroundColor || '#ffffff';
    return {
      id: selectedPopupId,
      name: popupName,
      design: {
        type: designConfig.type,
        position: designConfig.position || 'top',
        fixed: designConfig.fixed ?? false,
        showCloseButton: designConfig.showCloseButton ?? true,
        size: designConfig.size || 'medium',
        customWidth: designConfig.customWidth,
        customHeight: designConfig.customHeight,
        content: {
          headline: {
            text: designConfig.content?.headline?.text || '',
            style: { color: designConfig.content?.headline?.style?.color || '#1a1a1a' }
          },
          body: {
            text: designConfig.content?.body?.text || '',
            style: { color: designConfig.content?.body?.style?.color || '#666666' }
          },
          image: designConfig.content?.image,
        },
        buttons: designConfig.buttons?.map(b => ({
          text: b.text,
          action: b.action || 'close',
          url: b.url || '',
          style: b.style || { backgroundColor: '#3b82f6', textColor: '#ffffff', borderRadius: '8px' },
        })) || [],
        colors: {
          background: bgColor,
          overlay: designConfig.colors?.overlay || 'rgba(0,0,0,0.5)',
        },
        style: {
          fontFamily: designConfig.style?.fontFamily || 'Inter',
          borderRadius: designConfig.style?.borderRadius || '12px',
          backgroundColor: bgColor,
          padding: designConfig.style?.padding || '24px',
        },
      },
    };
  }, [selectedPopupId, popupName, designConfig]);

  // Render popup in canvas (debounced)
  useEffect(() => {
    if (!sdkReady || !selectedPopupId || !canvasRef.current) return;

    if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);

    renderTimeoutRef.current = setTimeout(() => {
      if (!window.ToggleupSDK || !canvasRef.current) return;
      canvasRef.current.innerHTML = '';
      window.ToggleupSDK.showPopup(buildSdkConfig(), { target: canvasRef.current });
    }, 300);

    return () => { if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current); };
  }, [sdkReady, selectedPopupId, buildSdkConfig, forceRenderKey]);

  // Force re-render when designConfig changes
  useEffect(() => {
    setForceRenderKey(k => k + 1);
  }, [designConfig]);

  const handleExecute = async () => {
    if (!selectedPopupId) return;
    setIsExecuting(true);
    try {
      const saved = await handleSave(true);
      if (!saved) { setIsExecuting(false); return; }
      if (!window.ToggleupSDK) await loadSDK();
      if (window.ToggleupSDK) window.ToggleupSDK.showPopup(buildSdkConfig());
    } catch (error) {
      console.error("[Editor] Error executing popup:", error);
      toast.error(t('editor.popup_execute_error'));
    } finally {
      setIsExecuting(false);
    }
  };

  const updatePopup = useUpdatePopup();

  const handleRenamePopup = (popupId: string, newName: string) => {
    if (popupId === selectedPopupId) {
      setPopupName(newName);
    }
    updatePopup.mutate({ popupId, updates: { name: newName } });
  };

  const handleApplyAIConfig = (config: PopupConfig) => {
    setDesignConfig(config);
  };

  // Close sheets when popup is selected on mobile
  const handleMobileSelectPopup = (id: string | null) => {
    onSelectPopup(id);
    setLeftSheetOpen(false);
  };

  // Popup list sidebar content (reusable for both desktop and mobile)
  const popupListContent = (
    <PopupListSidebar
      popups={popups}
      selectedPopupId={selectedPopupId}
      onSelectPopup={isMobile ? handleMobileSelectPopup : onSelectPopup}
      onCreatePopup={() => {
        onCreatePopup();
        if (isMobile) setLeftSheetOpen(false);
      }}
      onToggleActive={onToggleActive}
      onDeletePopup={onDeletePopup}
      onRenamePopup={handleRenamePopup}
      domainScrape={domainScrape}
      brandingOverrides={brandingOverrides}
      onSaveBranding={onSaveBranding}
      isSavingBranding={isSavingBranding}
      projectId={projectId}
      projectDomain={projectDomain}
      width={isMobile ? undefined : leftWidth}
      onStartResize={isMobile ? undefined : startLeftResize}
      onBrandingOpen={() => {
        // Close left sheet when branding opens on mobile
        if (isMobile) setLeftSheetOpen(false);
      }}
      onRequestBrandingOpen={() => setBrandingDrawerOpen(true)}
    />
  );

  // Config panel content (reusable for both desktop and mobile)
  const configPanelContent = selectedPopupId ? (
    <ConfigPanel
      selectedPopupId={selectedPopupId}
      popupName={popupName}
      setPopupName={setPopupName}
      isActive={isActive}
      setIsActive={setIsActive}
      designConfig={designConfig}
      setDesignConfig={setDesignConfig}
      layoutType={layoutType}
      handleLayoutChange={handleLayoutChange}
      rulesConfig={rulesConfig}
      setRulesConfig={setRulesConfig}
      brandingOverrides={brandingOverrides}
      projectId={projectId}
      projectDomain={projectDomain}
      onPreview={handleExecute}
      onSave={handleSave}
      isSaving={isSaving}
      width={isMobile ? undefined : rightWidth}
      onStartResize={isMobile ? undefined : startRightResize}
    />
  ) : null;

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-muted/30">
      {isMobile && (
        <GlobalBrandingDrawer
          open={brandingDrawerOpen}
          onOpenChange={setBrandingDrawerOpen}
          domainScrape={domainScrape}
          currentOverrides={brandingOverrides}
          onSave={onSaveBranding}
          isSaving={isSavingBranding}
          projectId={projectId}
          projectDomain={projectDomain}
        />
      )}
      {/* Mobile Header */}
      <header className="md:hidden h-14 bg-card border-b border-border flex items-center justify-between px-3 flex-shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToOverview}
            className="p-2 -ml-1 rounded-md hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          {/* Left Sheet Trigger - Popups List */}
          <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md hover:bg-muted">
                <List className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              {popupListContent}
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-1 min-w-0 flex-1 justify-center px-2">
          {faviconUrl && (
            <img
              src={faviconUrl}
              alt=""
              className="w-4 h-4 object-contain flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
            {popupName || projectName || t('editor.project')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Right Sheet Trigger - Config */}
          {selectedPopupId && (
            <Sheet open={rightSheetOpen} onOpenChange={setRightSheetOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md hover:bg-muted">
                  <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 overflow-y-auto">
                {configPanelContent}
              </SheetContent>
            </Sheet>
          )}
          
          {/* Save Button */}
          <Button
            size="sm"
            onClick={() => handleSave()}
            disabled={isSaving || !selectedPopupId}
            className="h-8 px-3"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden md:block">
          {popupListContent}
        </div>

        {/* Center - Canvas with Header */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Desktop Header */}
          <header className="hidden md:flex h-14 bg-card border-b border-border items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToOverview}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempProjectName}
                    onChange={(e) => setTempProjectName(e.target.value)}
                    className="h-7 w-[200px] text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveProjectName();
                      if (e.key === 'Escape') {
                        setTempProjectName(projectName || "");
                        setIsEditingName(false);
                      }
                    }}
                  />
                  <button onClick={handleSaveProjectName} className="p-1.5 hover:bg-green-100 text-green-600 rounded-md transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => {
                    setTempProjectName(projectName || "");
                    setIsEditingName(false);
                  }} className="p-1.5 hover:bg-red-100 text-red-600 rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  {faviconUrl && (
                    <img
                      src={faviconUrl}
                      alt=""
                      className="w-5 h-5 object-contain border-none outline-none shadow-none ring-0"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-semibold text-foreground tracking-tight leading-none">{projectName || t('editor.project')}</span>
                       <button
                        onClick={() => setIsEditingName(true)}
                        className="opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted p-0.5 rounded-md transition-all h-fit"
                        title="Edit name"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                    {projectDomain && (
                      <a
                        href={`https://${projectDomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-muted-foreground hover:text-foreground hover:underline transition-colors leading-none mt-0.5 block"
                      >
                        {projectDomain.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Active Toggle */}
              {selectedPopupId && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => onToggleActive(selectedPopupId, isActive)}
                    className="scale-90"
                  />
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isActive ? t('editor.on') : t('editor.off')}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-0 md:p-2 relative bg-[#f1f1f4] dark:bg-[#0c0c0e]">
            {/* Subtle Grid Pattern for premium feel */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
            
            {/* Toolbar above canvas */}
            <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10">
              {/* Layout Toggle */}
              <div className="flex gap-1 bg-muted rounded-md p-0.5">
                <button
                  onClick={() => handleLayoutChange('modal')}
                  className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 text-xs font-medium rounded transition-all ${layoutType === 'modal'
                    ? 'bg-background shadow-sm text-foreground ring-1 ring-black/5'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <ModalIcon selected={layoutType === 'modal'} className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('editor.modal')}</span>
                </button>
                <button
                  onClick={() => handleLayoutChange('bar')}
                  className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 text-xs font-medium rounded transition-all ${layoutType === 'bar'
                    ? 'bg-background shadow-sm text-foreground ring-1 ring-black/5'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <BannerIcon selected={layoutType === 'bar'} className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('editor.banner')}</span>
                </button>
              </div>

              {/* Device Toggle - Desktop Only */}
              <div className="hidden md:flex gap-1 bg-muted rounded-md p-0.5">
                <button
                  onClick={() => setDeviceFrame('desktop')}
                  className={`p-1.5 rounded transition-all ${deviceFrame === 'desktop'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceFrame('phone')}
                  className={`p-1.5 rounded transition-all ${deviceFrame === 'phone'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="Phone"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Device Frame */}
            <div className="flex-1 flex items-center justify-center min-h-0 py-2 relative z-10">
              <div
                className={`bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/5 transition-all duration-500 flex-shrink-0 ${
                  isMobile 
                    ? 'w-full max-w-[320px] h-[550px]'
                    : deviceFrame === 'desktop'
                      ? 'w-full max-w-5xl aspect-[16/10]'
                      : 'w-[375px] h-[750px]'
                }`}
              >
                {/* Title Bar */}
                <div className={`flex items-center gap-2 px-3 bg-[#2a2a2a] ${deviceFrame === 'desktop' && !isMobile ? 'h-8' : 'h-6'}`}>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#28c840]" />
                  </div>
                  {deviceFrame === 'desktop' && !isMobile && (
                    <div className="flex-1 flex justify-center">
                      <div className="bg-[#3a3a3a] rounded px-4 py-0.5 text-[10px] text-gray-400">
                        {projectDomain || 'example.com'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div
                  className={`relative overflow-hidden ${
                    isMobile
                      ? 'h-[calc(100%-24px)]'
                      : deviceFrame === 'desktop' ? 'h-[calc(100%-32px)]' : 'h-[calc(100%-24px)]'
                  }`}
                >
                  {/* OG Image Background or Skeleton */}
                  {(domainScrape?.stored_images?.ogImage || domainScrape?.branding?.images?.ogImage) ? (
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        backgroundImage: `url(${domainScrape?.stored_images?.ogImage || domainScrape?.branding?.images?.ogImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white z-0 p-4 md:p-6 opacity-100">
                      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
                      <div className="h-3 w-full bg-gray-100 rounded mb-2" />
                      <div className="h-3 w-3/4 bg-gray-100 rounded mb-2" />
                      <div className="h-3 w-5/6 bg-gray-100 rounded mb-4" />
                      <div className="h-24 w-full bg-gray-100 rounded mb-4" />
                      <div className="h-3 w-full bg-gray-100 rounded mb-2" />
                      <div className="h-3 w-2/3 bg-gray-100 rounded" />
                    </div>
                  )}

                  {/* SDK Popup Container */}
                  <div
                    ref={canvasRef}
                    className="absolute inset-0 z-10"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: designConfig.position === 'bottom' ? 'flex-end' : 'flex-start',
                    }}
                  />

                  {/* Overlay messages */}
                  {!selectedPopupId && (
                       <Button
                         onClick={onCreatePopup}
                         className="shadow-lg animate-heartbeat hover:scale-105 transition-transform"
                       >
                         {t('banners.new_banner')}
                       </Button>
                  )}
                  {selectedPopupId && !sdkReady && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Floating AI Chat Button - Adjusted for mobile */}
            {/* {selectedPopupId && (
              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-50">
                <AIPopupChat
                  popupId={selectedPopupId}
                  branding={brandingOverrides}
                  logoUrl={defaultLogoUrl || null}
                  currentConfig={designConfig}
                  onApplyConfig={handleApplyAIConfig}
                />
              </div>
            )} */}
          </div>
        </main>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden md:block">
          {selectedPopupId && configPanelContent}
        </div>
      </div>
    </div>
  );
};
