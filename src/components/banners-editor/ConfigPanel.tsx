import { type PopupConfig, type PopupRules } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { ConfigTabs } from "./ConfigTabs";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfigPanelProps {
    selectedPopupId: string | null;
    popupName: string;
    setPopupName: (name: string) => void;
    isActive: boolean;
    setIsActive: (active: boolean) => void;
    designConfig: PopupConfig;
    setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
    layoutType: "modal" | "bar";
    handleLayoutChange: (value: "modal" | "bar") => void;
    rulesConfig: PopupRules;
    setRulesConfig: React.Dispatch<React.SetStateAction<PopupRules>>;
    brandingOverrides?: BrandingOverrides | null;
    projectId?: string;
    projectDomain?: string;
    onPreview?: () => void;
    onSave?: (silent?: boolean) => Promise<boolean>;
    isSaving?: boolean;
    // Resize props
    width?: number;
    onStartResize?: (e: React.MouseEvent) => void;
}

export const ConfigPanel = ({
    selectedPopupId,
    designConfig,
    setDesignConfig,
    rulesConfig,
    setRulesConfig,
    brandingOverrides,
    projectId,
    projectDomain,
    onPreview,
    onSave,
    isSaving,
    width = 260,
    onStartResize,
}: ConfigPanelProps) => {
    const { t } = useLanguage();

    if (!selectedPopupId) {
        return (
            <aside
                className="bg-card border-l border-border flex-shrink-0 flex items-center justify-center relative h-full"
                style={width ? { width, minWidth: 260 } : undefined}
            >
                <p className="text-[11px] text-muted-foreground text-center px-4">
                    {t('editor.sidebar.select_popup')}
                </p>
            </aside>
        );
    }

    return (
        <aside
            className="bg-card border-l border-border flex flex-col h-full flex-shrink-0 relative"
            style={width ? { width, minWidth: 260 } : undefined}
        >
            {/* Resize Handle */}
            {onStartResize && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 transition-colors z-10"
                    onMouseDown={onStartResize}
                />
            )}

            <ConfigTabs
                designConfig={designConfig}
                setDesignConfig={setDesignConfig}
                rulesConfig={rulesConfig}
                setRulesConfig={setRulesConfig}
                brandingOverrides={brandingOverrides}
                projectId={projectId}
                projectDomain={projectDomain}
                onPreview={onPreview}
                onSave={onSave}
                isSaving={isSaving}
            />
        </aside>
    );
};
