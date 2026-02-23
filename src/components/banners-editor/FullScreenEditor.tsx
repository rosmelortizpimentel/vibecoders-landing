import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, ChevronRight, Play, Save, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type PopupConfig, type PopupRules, type Popup } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { FullScreenDesignTab } from "./FullScreenDesignTab";
import { FullScreenRulesTab } from "./FullScreenRulesTab";
import { FullScreenCodeTab } from "./FullScreenCodeTab";
import { PopupSelectorDropdown } from "./PopupSelectorDropdown";
import { toast } from "sonner";

type LayoutType = "modal" | "bar";

const SDK_URL = "https://cdn.toggleup.io/v1/sdk.js";

interface FullScreenEditorProps {
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
  handleSave: () => Promise<boolean>;
  isSaving: boolean;
  onCreatePopup: () => void;
  onToggleActive: (popupId: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDeletePopup: (popupId: string, e?: React.MouseEvent) => void;
  onBackToOverview: () => void;
  brandingOverrides?: BrandingOverrides | null;
}

export const FullScreenEditor = ({
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
  brandingOverrides,
}: FullScreenEditorProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("design");
  const [isExecuting, setIsExecuting] = useState(false);

  // Load SDK dynamically with manual mode
  const loadSDK = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.ToggleupSDK) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(`script[src="${SDK_URL}"]`);
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
      script.setAttribute("data-manual", ""); // Modo manual - no auto-init
      script.async = true;

      script.onload = () => {
        const checkSDK = setInterval(() => {
          if (window.ToggleupSDK) {
            clearInterval(checkSDK);
            // Inicializar manualmente
            window.ToggleupSDK.init();
            resolve();
          }
        }, 100);
      };

      script.onerror = () => reject(new Error("Failed to load SDK"));
      document.body.appendChild(script);
    });
  }, []);

  // Cargar SDK inmediatamente al montar el componente
  useEffect(() => {
    if (apiKey) {
      loadSDK().catch((error) => {
        console.error("[Editor] Error loading SDK on mount:", error);
      });
    }
  }, [apiKey, loadSDK]);

  // Cleanup SDK on unmount
  useEffect(() => {
    return () => {
      const script = document.querySelector(`script[src="${SDK_URL}"]`);
      if (script) {
        document.body.removeChild(script);
      }
      delete window.ToggleupSDK;
    };
  }, []);

  // Execute popup in same page
  const handleExecute = async () => {
    if (!selectedPopupId) return;

    setIsExecuting(true);

    try {
      // 1. Guardar cambios primero
      const saved = await handleSave();
      if (!saved) {
        setIsExecuting(false);
        return;
      }

      // 2. Verificar que el SDK esté cargado (ya debería estarlo)
      if (!window.ToggleupSDK) {
        await loadSDK();
      }

      // 3. Mostrar popup con el config actual del editor
      if (window.ToggleupSDK) {
        window.ToggleupSDK.showPopup(designConfig);
      }
    } catch (error) {
      console.error("[Editor] Error executing popup:", error);
      toast.error("Error al ejecutar el popup");
    } finally {
      setIsExecuting(false);
    }
  };

  const currentPopup = popups?.find(p => p.id === selectedPopupId);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {/* Back to Project Overview */}
          <button
            onClick={onBackToOverview}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">{projectName || "Project"}</span>
          </button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />

          {/* Popup Selector */}
          <PopupSelectorDropdown
            popups={popups}
            selectedPopupId={selectedPopupId}
            onSelectPopup={onSelectPopup}
            onCreatePopup={onCreatePopup}
            onToggleActive={onToggleActive}
            onDeletePopup={onDeletePopup}
            currentPopupName={currentPopup?.name}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExecute}
            disabled={isExecuting || !selectedPopupId}
            className="h-9 px-4 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-black hover:border-gray-400 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Run</span>
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedPopupId}
            className="h-9 px-4 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={1.5} />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
        {!selectedPopupId ? (
          <Card className="border border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No popup selected</h3>
              <p className="text-sm text-muted-foreground mb-4">Create a new popup to start editing</p>
              <button
                onClick={onCreatePopup}
                className="h-9 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Create Popup
              </button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="h-11 bg-gray-100/50 p-1 rounded-lg w-full sm:w-auto inline-flex">
              <TabsTrigger
                value="design"
                className="h-9 px-6 text-sm font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:hover:text-gray-700 rounded-md transition-all"
              >
                Design
              </TabsTrigger>
              <TabsTrigger
                value="rules"
                className="h-9 px-6 text-sm font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:hover:text-gray-700 rounded-md transition-all"
              >
                Rules
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="h-9 px-6 text-sm font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:hover:text-gray-700 rounded-md transition-all"
              >
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="mt-0">
              <FullScreenDesignTab
                popupName={popupName}
                setPopupName={setPopupName}
                isActive={isActive}
                setIsActive={setIsActive}
                designConfig={designConfig}
                setDesignConfig={setDesignConfig}
                layoutType={layoutType}
                handleLayoutChange={handleLayoutChange}
                defaultLogoUrl={defaultLogoUrl}
                brandingOverrides={brandingOverrides}
              />
            </TabsContent>

            <TabsContent value="rules" className="mt-0">
              <FullScreenRulesTab
                rulesConfig={rulesConfig}
                setRulesConfig={setRulesConfig}
              />
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              <FullScreenCodeTab
                apiKey={apiKey}
                projectDomain={projectDomain}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};
