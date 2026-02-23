import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { type PopupConfig, DEFAULT_MODAL_CONFIG, DEFAULT_BANNER_CONFIG } from "@/hooks/usePopups";
import { ModalDesignFormNew } from "./ModalDesignFormNew";
import { BannerDesignForm } from "./BannerDesignForm";

type LayoutType = "modal" | "bar";

interface DesignTabProps {
  popupName: string;
  setPopupName: (name: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  designConfig: PopupConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
  layoutType: LayoutType;
  handleLayoutChange: (value: LayoutType) => void;
  defaultLogoUrl?: string | null;
}

export const DesignTab = ({
  popupName,
  setPopupName,
  isActive,
  setIsActive,
  designConfig,
  setDesignConfig,
  layoutType,
  handleLayoutChange,
  defaultLogoUrl,
}: DesignTabProps) => {
  const { t } = useLanguage();

  const onLayoutChange = (newLayout: LayoutType) => {
    // When changing layout, reset config to appropriate defaults
    if (newLayout === 'modal' && designConfig.type !== 'modal') {
      setDesignConfig(prev => ({
        ...DEFAULT_MODAL_CONFIG,
        colors: prev.colors, // Keep colors
      }));
    } else if (newLayout === 'bar' && designConfig.type !== 'bar') {
      setDesignConfig(prev => ({
        ...DEFAULT_BANNER_CONFIG,
        colors: {
          ...DEFAULT_BANNER_CONFIG.colors,
          background: prev.colors.background,
        },
      }));
    }
    handleLayoutChange(newLayout);
  };

  return (
    <div className="p-3 space-y-3">
      {/* Layout Type - First and prominent */}
      <div>
        <span className="panel-label">Layout</span>
        <div className="mt-1.5 flex gap-1">
          <button
            onClick={() => onLayoutChange('modal')}
            className={`flex-1 h-[30px] text-[11px] font-medium rounded-[4px] border transition-colors ${layoutType === 'modal'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border hover:bg-accent'
              }`}
          >
            Modal
          </button>
          <button
            onClick={() => onLayoutChange('bar')}
            className={`flex-1 h-8 text-[11px] font-medium rounded-[4px] border transition-colors ${layoutType === 'bar'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border hover:bg-accent'
              }`}
          >
            Banner
          </button>
        </div>
      </div>

      {/* Popup Settings - Compact row */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            value={popupName}
            onChange={(e) => setPopupName(e.target.value)}
            className="input-figma h-[30px] text-[11px]"
            placeholder="Popup name..."
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Label className="text-[10px] text-muted-foreground">Active</Label>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            className="scale-90"
          />
        </div>
      </div>

      {/* Layout-specific forms */}
      {layoutType === 'modal' ? (
        <ModalDesignFormNew
          designConfig={designConfig}
          setDesignConfig={setDesignConfig}
          defaultLogoUrl={defaultLogoUrl}
        />
      ) : (
        <BannerDesignForm
          designConfig={designConfig}
          setDesignConfig={setDesignConfig}
          defaultLogoUrl={defaultLogoUrl}
        />
      )}
    </div>
  );
};
