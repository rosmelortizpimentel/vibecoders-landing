import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Loader2, Palette, Image as ImageIcon, X } from "lucide-react";
import { DomainScrape, BrandingOverrides, getProjectLogoUrl } from "@/hooks/useDomainBranding";
import { FontPicker } from "@/components/ui/FontPicker";
import { useLanguage } from "@/contexts/LanguageContext";
import { ResourceGalleryModal } from "./ResourceGalleryModal";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface GlobalBrandingCommonProps {
  domainScrape: DomainScrape | null | undefined;
  currentOverrides: BrandingOverrides | null;
  onSave: (overrides: BrandingOverrides) => void;
  isSaving: boolean;
  projectId?: string;
  projectDomain?: string;
}

interface GlobalBrandingDrawerProps extends GlobalBrandingCommonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const parsePxValue = (value: string | undefined, fallback: number = 8): number => {
  if (!value) return fallback;
  const num = parseInt(value.replace("px", ""), 10);
  return Number.isNaN(num) ? fallback : num;
};

const BrandingPanel = ({
  domainScrape,
  currentOverrides,
  onSave,
  isSaving,
  projectId,
  projectDomain,
  onClose,
}: GlobalBrandingCommonProps & { onClose: () => void }) => {
  const { t } = useLanguage();
  const faviconUrl = domainScrape?.stored_images?.favicon || domainScrape?.branding?.images?.favicon;

  const [logoGalleryOpen, setLogoGalleryOpen] = useState(false);

  // Get current logo URL (override > scraped)
  const currentLogoUrl =
    currentOverrides?.images?.logo || getProjectLogoUrl(domainScrape?.stored_images, domainScrape?.branding);

  const [localOverrides, setLocalOverrides] = useState<BrandingOverrides>({
    colors: {
      primary: currentOverrides?.colors?.primary || domainScrape?.branding?.colors?.primary || "#3b82f6",
      accent: currentOverrides?.colors?.accent || domainScrape?.branding?.colors?.accent || "#8b5cf6",
      background: currentOverrides?.colors?.background || domainScrape?.branding?.colors?.background || "#ffffff",
      text: currentOverrides?.colors?.text || domainScrape?.branding?.colors?.textPrimary || "#1a1a1a",
      link: currentOverrides?.colors?.link || domainScrape?.branding?.colors?.link || "#3b82f6",
    },
    typography: {
      fontFamily:
        currentOverrides?.typography?.fontFamily ||
        domainScrape?.branding?.typography?.fontFamilies?.primary ||
        "Inter",
      borderRadius: currentOverrides?.typography?.borderRadius || domainScrape?.branding?.spacing?.borderRadius || "8px",
    },
    components: {
      buttonPrimaryBg:
        currentOverrides?.components?.buttonPrimaryBg ||
        domainScrape?.branding?.components?.buttonPrimary?.background ||
        "#3b82f6",
      buttonPrimaryText:
        currentOverrides?.components?.buttonPrimaryText ||
        domainScrape?.branding?.components?.buttonPrimary?.textColor ||
        "#ffffff",
      buttonPrimaryBorderRadius:
        currentOverrides?.components?.buttonPrimaryBorderRadius ||
        domainScrape?.branding?.components?.buttonPrimary?.borderRadius ||
        "8px",
      buttonSecondaryBg:
        currentOverrides?.components?.buttonSecondaryBg ||
        domainScrape?.branding?.components?.buttonSecondary?.background ||
        "#e5e7eb",
      buttonSecondaryText:
        currentOverrides?.components?.buttonSecondaryText ||
        domainScrape?.branding?.components?.buttonSecondary?.textColor ||
        "#374151",
      buttonSecondaryBorderRadius:
        currentOverrides?.components?.buttonSecondaryBorderRadius ||
        domainScrape?.branding?.components?.buttonSecondary?.borderRadius ||
        "8px",
    },
    images: {
      logo: currentOverrides?.images?.logo,
    },
  });

  useEffect(() => {
    if (domainScrape?.branding || currentOverrides) {
      setLocalOverrides({
        colors: {
          primary: currentOverrides?.colors?.primary || domainScrape?.branding?.colors?.primary || "#3b82f6",
          accent: currentOverrides?.colors?.accent || domainScrape?.branding?.colors?.accent || "#8b5cf6",
          background: currentOverrides?.colors?.background || domainScrape?.branding?.colors?.background || "#ffffff",
          text: currentOverrides?.colors?.text || domainScrape?.branding?.colors?.textPrimary || "#1a1a1a",
          link: currentOverrides?.colors?.link || domainScrape?.branding?.colors?.link || "#3b82f6",
        },
        typography: {
          fontFamily:
            currentOverrides?.typography?.fontFamily ||
            domainScrape?.branding?.typography?.fontFamilies?.primary ||
            "Inter",
          borderRadius:
            currentOverrides?.typography?.borderRadius || domainScrape?.branding?.spacing?.borderRadius || "8px",
        },
        components: {
          buttonPrimaryBg:
            currentOverrides?.components?.buttonPrimaryBg ||
            domainScrape?.branding?.components?.buttonPrimary?.background ||
            "#3b82f6",
          buttonPrimaryText:
            currentOverrides?.components?.buttonPrimaryText ||
            domainScrape?.branding?.components?.buttonPrimary?.textColor ||
            "#ffffff",
          buttonPrimaryBorderRadius:
            currentOverrides?.components?.buttonPrimaryBorderRadius ||
            domainScrape?.branding?.components?.buttonPrimary?.borderRadius ||
            "8px",
          buttonSecondaryBg:
            currentOverrides?.components?.buttonSecondaryBg ||
            domainScrape?.branding?.components?.buttonSecondary?.background ||
            "#e5e7eb",
          buttonSecondaryText:
            currentOverrides?.components?.buttonSecondaryText ||
            domainScrape?.branding?.components?.buttonSecondary?.textColor ||
            "#374151",
          buttonSecondaryBorderRadius:
            currentOverrides?.components?.buttonSecondaryBorderRadius ||
            domainScrape?.branding?.components?.buttonSecondary?.borderRadius ||
            "8px",
        },
        images: {
          logo: currentOverrides?.images?.logo,
        },
      });
    }
  }, [domainScrape, currentOverrides]);

  const handleSave = () => {
    onSave(localOverrides);
    onClose();
  };

  const updateColor = (path: "primary" | "accent" | "background" | "text" | "link", value: string) => {
    setLocalOverrides((prev) => ({
      ...prev,
      colors: { ...prev.colors, [path]: value },
    }));
  };

  const updateButtonStyle = (
    key:
      | "buttonPrimaryBg"
      | "buttonPrimaryText"
      | "buttonPrimaryBorderRadius"
      | "buttonSecondaryBg"
      | "buttonSecondaryText"
      | "buttonSecondaryBorderRadius",
    value: string,
  ) => {
    setLocalOverrides((prev) => ({
      ...prev,
      components: { ...prev.components, [key]: value },
    }));
  };

  const handleLogoSelect = (url: string) => {
    setLocalOverrides((prev) => ({
      ...prev,
      images: { ...prev.images, logo: url },
    }));
  };

  const handleRemoveLogo = () => {
    setLocalOverrides((prev) => ({
      ...prev,
      images: { ...prev.images, logo: undefined },
    }));
  };

  // Display logo: use local override or fall back to scraped
  const displayLogoUrl = localOverrides.images?.logo || currentLogoUrl;

  // Check if still analyzing
  const isAnalyzing = domainScrape?.status === "processing";

  return (
    <>
      <div className="space-y-4 relative">
        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium">{t("branding.analyzing")}</p>
              <p className="text-xs text-muted-foreground">
                {t("branding.analyzing_description") || "Extrayendo colores y estilos de tu sitio web..."}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            {faviconUrl && (
              <img
                src={faviconUrl}
                alt={t("branding.favicon_alt")}
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <h3 className="text-sm font-semibold">{t("branding.global_branding")}</h3>
          </div>
          {isAnalyzing && (
            <div className="flex items-center gap-1 text-[10px] text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              {t("branding.analyzing")}
            </div>
          )}
        </div>

        {/* Logo Section */}
        {projectId && projectDomain && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase">Logo</Label>
            <div className="flex items-center gap-3 p-2 border border-border rounded-md">
              {displayLogoUrl ? (
                <div className="relative w-12 h-12 rounded-md border border-border overflow-hidden bg-muted/50 flex items-center justify-center">
                  <img
                    src={displayLogoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-md border border-dashed border-border flex items-center justify-center bg-muted/30">
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setLogoGalleryOpen(true)}
                  disabled={isAnalyzing}
                >
                  {displayLogoUrl ? t("resources.change_logo") : t("resources.select")}
                </Button>
                {localOverrides.images?.logo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={handleRemoveLogo}
                    disabled={isAnalyzing}
                  >
                    <X className="w-3 h-3 mr-1" />
                    {t("resources.remove_logo")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Typography Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase">{t("branding.typography")}</Label>
            <FontPicker
              value={localOverrides.typography?.fontFamily || "Inter"}
              onChange={(font) =>
                setLocalOverrides((prev) => ({
                  ...prev,
                  typography: { ...prev.typography, fontFamily: font },
                }))
              }
              brandingFont={domainScrape?.branding?.typography?.fontFamilies?.primary}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase">{t("branding.border_radius")}</Label>
            <div className="flex items-center border border-border rounded-md overflow-hidden h-7">
              <Input
                type="number"
                min={0}
                value={parsePxValue(localOverrides.typography?.borderRadius)}
                onChange={(e) =>
                  setLocalOverrides((prev) => ({
                    ...prev,
                    typography: { ...prev.typography, borderRadius: `${e.target.value}px` },
                  }))
                }
                className="h-full border-0 rounded-none text-xs text-right pr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={isAnalyzing}
              />
              <span className="text-[10px] text-muted-foreground bg-muted px-2 h-full flex items-center border-l border-border">
                px
              </span>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase">{t("branding.colors")}</Label>
          <div className="grid grid-cols-5 gap-1">
            {[
              { label: t("branding.primary"), key: "primary", value: localOverrides.colors?.primary },
              { label: t("branding.accent"), key: "accent", value: localOverrides.colors?.accent },
              { label: t("branding.background"), key: "background", value: localOverrides.colors?.background },
              { label: t("branding.text"), key: "text", value: localOverrides.colors?.text },
              { label: t("branding.links"), key: "link", value: localOverrides.colors?.link },
            ].map((colorItem) => (
              <div key={colorItem.key} className="flex flex-col items-center gap-1 p-1.5 border border-border rounded-md">
                <ColorPicker value={colorItem.value || "#000000"} onChange={(color) => updateColor(colorItem.key as any, color)} />
                <span className="text-[8px] text-muted-foreground text-center">{colorItem.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Button Styles */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase">{t("branding.buttons")}</Label>
          <div className="grid grid-cols-2 gap-2">
            {/* Primary Button */}
            <div className="p-2 border border-border rounded-md space-y-1.5">
              <div
                className="w-full py-1.5 px-3 text-[10px] font-medium text-center"
                style={{
                  backgroundColor: localOverrides.components?.buttonPrimaryBg,
                  color: localOverrides.components?.buttonPrimaryText,
                  borderRadius: localOverrides.components?.buttonPrimaryBorderRadius || "8px",
                }}
              >
                {t("branding.primary_btn")}
              </div>
              <div className="flex items-center gap-1">
                <ColorPicker
                  value={localOverrides.components?.buttonPrimaryBg || "#3b82f6"}
                  onChange={(color) => updateButtonStyle("buttonPrimaryBg", color)}
                  brandingColors={localOverrides.colors}
                />
                <ColorPicker
                  value={localOverrides.components?.buttonPrimaryText || "#ffffff"}
                  onChange={(color) => updateButtonStyle("buttonPrimaryText", color)}
                  brandingColors={localOverrides.colors}
                />
                <div className="flex-1 flex items-center border border-border rounded-md overflow-hidden h-5">
                  <Input
                    type="number"
                    min={0}
                    value={parsePxValue(localOverrides.components?.buttonPrimaryBorderRadius)}
                    onChange={(e) => updateButtonStyle("buttonPrimaryBorderRadius", `${e.target.value}px`)}
                    className="h-full flex-1 border-0 rounded-none text-[10px] text-right pr-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center border-l border-border">
                    px
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Button */}
            <div className="p-2 border border-border rounded-md space-y-1.5">
              <div
                className="w-full py-1.5 px-3 text-[10px] font-medium text-center border"
                style={{
                  backgroundColor: localOverrides.components?.buttonSecondaryBg,
                  color: localOverrides.components?.buttonSecondaryText,
                  borderRadius: localOverrides.components?.buttonSecondaryBorderRadius || "8px",
                }}
              >
                {t("branding.secondary_btn")}
              </div>
              <div className="flex items-center gap-1">
                <ColorPicker
                  value={localOverrides.components?.buttonSecondaryBg || "#e5e7eb"}
                  onChange={(color) => updateButtonStyle("buttonSecondaryBg", color)}
                  brandingColors={localOverrides.colors}
                />
                <ColorPicker
                  value={localOverrides.components?.buttonSecondaryText || "#374151"}
                  onChange={(color) => updateButtonStyle("buttonSecondaryText", color)}
                  brandingColors={localOverrides.colors}
                />
                <div className="flex-1 flex items-center border border-border rounded-md overflow-hidden h-5">
                  <Input
                    type="number"
                    min={0}
                    value={parsePxValue(localOverrides.components?.buttonSecondaryBorderRadius)}
                    onChange={(e) => updateButtonStyle("buttonSecondaryBorderRadius", `${e.target.value}px`)}
                    className="h-full flex-1 border-0 rounded-none text-[10px] text-right pr-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center border-l border-border">
                    px
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={handleSave} disabled={isSaving || isAnalyzing}>
            {isSaving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {t("common.save")}
          </Button>
        </div>
      </div>

      {/* Logo Gallery Modal */}
      {projectId && projectDomain && (
        <ResourceGalleryModal
          open={logoGalleryOpen}
          onOpenChange={setLogoGalleryOpen}
          projectId={projectId}
          projectDomain={projectDomain}
          onSelect={handleLogoSelect}
          resourceType="logo"
          title={t("resources.change_logo")}
        />
      )}
    </>
  );
};

export const GlobalBrandingPopover = (props: GlobalBrandingCommonProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const triggerButton = (
    <Button variant="outline" className="w-full h-8 text-xs gap-2 justify-start">
      <Palette className="w-3.5 h-3.5" />
      {t("branding.branding")}
    </Button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent className="w-[420px] max-h-[500px] overflow-y-auto p-4" side="right" align="end" sideOffset={8}>
        <BrandingPanel {...props} onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

export const GlobalBrandingDrawer = ({ open, onOpenChange, ...props }: GlobalBrandingDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <div className="p-4 pt-2">
          <BrandingPanel {...props} onClose={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
