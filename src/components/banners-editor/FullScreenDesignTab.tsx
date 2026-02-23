import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutGrid,
  Square,
  Minus,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  Plus,
  X,
  Settings2
} from "lucide-react";
import { type PopupConfig, type BannerButton, DEFAULT_MODAL_CONFIG, DEFAULT_BANNER_CONFIG } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { ModalDesignFormNew } from "./ModalDesignFormNew";
import { ColorPicker } from "@/components/ui/ColorPicker";

type LayoutType = "modal" | "bar";

interface FullScreenDesignTabProps {
  popupName: string;
  setPopupName: (name: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  designConfig: PopupConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
  layoutType: LayoutType;
  handleLayoutChange: (value: LayoutType) => void;
  defaultLogoUrl?: string | null;
  brandingOverrides?: BrandingOverrides | null;
}

const FONT_OPTIONS = [
  'Inter',
  'Lato',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Montserrat',
  'Arial',
  'Helvetica',
];

export const FullScreenDesignTab = ({
  popupName,
  setPopupName,
  isActive,
  setIsActive,
  designConfig,
  setDesignConfig,
  layoutType,
  handleLayoutChange,
  defaultLogoUrl,
  brandingOverrides,
}: FullScreenDesignTabProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get button colors from branding
  const getButtonColorsForIndex = (index: number) => {
    if (!brandingOverrides?.components) {
      // Default colors if no branding
      const defaults = [
        { backgroundColor: '#3b82f6', textColor: '#ffffff' },
        { backgroundColor: '#e5e7eb', textColor: '#374151' },
        { backgroundColor: 'transparent', textColor: '#6b7280' },
      ];
      return defaults[index] || defaults[0];
    }

    const colors = [
      {
        backgroundColor: brandingOverrides.components.buttonPrimaryBg || '#3b82f6',
        textColor: brandingOverrides.components.buttonPrimaryText || '#ffffff'
      },
      {
        backgroundColor: brandingOverrides.components.buttonSecondaryBg || '#e5e7eb',
        textColor: brandingOverrides.components.buttonSecondaryText || '#374151'
      },
      {
        backgroundColor: 'transparent',
        textColor: brandingOverrides.colors?.text || '#6b7280'
      },
    ];
    return colors[index] || colors[0];
  };

  const onLayoutChange = (newLayout: LayoutType) => {
    if (newLayout === 'modal' && designConfig.type !== 'modal') {
      setDesignConfig(prev => ({
        ...DEFAULT_MODAL_CONFIG,
        colors: prev.colors,
      }));
    } else if (newLayout === 'bar' && designConfig.type !== 'bar') {
      setDesignConfig(prev => ({
        ...DEFAULT_BANNER_CONFIG,
        colors: {
          ...DEFAULT_BANNER_CONFIG.colors,
          background: prev.colors.background,
        },
        content: {
          ...DEFAULT_BANNER_CONFIG.content,
          image: {
            ...DEFAULT_BANNER_CONFIG.content?.image,
            url: defaultLogoUrl || '',
          },
        },
      }));
    }
    handleLayoutChange(newLayout);
  };

  // Banner-specific helpers
  const imageUrl = designConfig.content?.image?.url || defaultLogoUrl || '';
  const content = designConfig.content || {
    headline: { text: '', style: { color: '#0F206C', fontWeight: '700', fontSize: '15px' } },
    body: { text: '', style: { color: '#333333', fontSize: '14px' } },
    image: { url: defaultLogoUrl || '', position: 'left' as const, height: '28px' },
  };
  const buttons = designConfig.buttons || [];

  // Reset imageLoaded when URL changes
  useEffect(() => {
    setImageLoaded(false);
  }, [imageUrl]);

  // Parse pixel value from string (e.g., "28px" -> 28)
  const parsePixelValue = (value: string | undefined): number => {
    if (!value) return 0;
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  // Handle pixel input - only allow positive integers
  const handlePixelInput = (e: React.ChangeEvent<HTMLInputElement>, updateFn: (value: string) => void) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(value, 10);
    if (value === '' || numValue >= 0) {
      updateFn(`${numValue || 0}px`);
    }
  };

  const updateContent = (field: 'headline' | 'body' | 'image', updates: Record<string, unknown>) => {
    setDesignConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: {
          ...(prev.content?.[field] || {}),
          ...updates,
        },
      },
    }));
  };

  const updateContentStyle = (field: 'headline' | 'body', styleUpdates: Record<string, string>) => {
    setDesignConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: {
          ...(prev.content?.[field] || { text: '', style: {} }),
          style: {
            ...(prev.content?.[field]?.style || {}),
            ...styleUpdates,
          },
        },
      },
    }));
  };

  const updateImage = (updates: Record<string, unknown>) => {
    setDesignConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        image: {
          ...(prev.content?.image || { url: '', position: 'left', height: '28px' }),
          ...updates,
        },
      },
    }));
  };

  const addButton = () => {
    if (buttons.length >= 3) return;
    const buttonIndex = buttons.length;
    const colors = getButtonColorsForIndex(buttonIndex);
    const newButton: BannerButton = {
      text: 'New button',
      action: 'link',
      url: '',
      style: {
        backgroundColor: colors.backgroundColor,
        textColor: colors.textColor,
        borderRadius: brandingOverrides?.typography?.borderRadius || '9999px',
      },
    };
    setDesignConfig(prev => ({
      ...prev,
      buttons: [...(prev.buttons || []), newButton],
    }));
  };

  const removeButton = (index: number) => {
    setDesignConfig(prev => ({
      ...prev,
      buttons: prev.buttons?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateButton = (index: number, updates: Partial<BannerButton>) => {
    setDesignConfig(prev => ({
      ...prev,
      buttons: prev.buttons?.map((btn, i) =>
        i === index ? { ...btn, ...updates } : btn
      ) || [],
    }));
  };

  const updateButtonStyle = (index: number, styleUpdates: Partial<BannerButton['style']>) => {
    setDesignConfig(prev => ({
      ...prev,
      buttons: prev.buttons?.map((btn, i) =>
        i === index ? { ...btn, style: { ...btn.style, ...styleUpdates } } : btn
      ) || [],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Section A: General Configuration */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Popup Name */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Popup Name</Label>
              <Input
                value={popupName}
                onChange={(e) => setPopupName(e.target.value)}
                className="h-9 border-border"
                placeholder="PROMO-NAVIDAD"
              />
            </div>

            {/* Active Switch */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Status</Label>
              <div className="flex items-center gap-3 h-9">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Layout Type */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Layout Type</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => onLayoutChange('modal')}
                  className={`flex-1 h-9 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-2 ${layoutType === 'modal'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <Square className="w-4 h-4" />
                  Modal
                </button>
                <button
                  onClick={() => onLayoutChange('bar')}
                  className={`flex-1 h-9 text-sm font-medium rounded-md border transition-all flex items-center justify-center gap-2 ${layoutType === 'bar'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <Minus className="w-4 h-4" />
                  Banner
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render different forms based on layout type */}
      {layoutType === 'modal' ? (
        /* MODAL FORM - New component */
        <ModalDesignFormNew
          designConfig={designConfig}
          setDesignConfig={setDesignConfig}
          defaultLogoUrl={defaultLogoUrl}
          brandingOverrides={brandingOverrides}
        />
      ) : (
        /* BANNER FORM */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section B: Text Content (FIRST) */}
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Title</Label>
                <Input
                  value={content.headline?.text || ''}
                  onChange={(e) => updateContent('headline', { text: e.target.value })}
                  className="h-9 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Title Color</Label>
                <div className="flex items-center gap-2">
                  <ColorPicker
                    value={content.headline?.style?.color || '#0F206C'}
                    onChange={(color) => updateContentStyle('headline', { color })}
                    brandingColors={brandingOverrides?.colors}
                  />
                  <Input
                    value={content.headline?.style?.color || '#0F206C'}
                    onChange={(e) => updateContentStyle('headline', { color: e.target.value })}
                    className="h-9 font-mono text-sm border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Subtitle</Label>
                <Input
                  value={content.body?.text || ''}
                  onChange={(e) => updateContent('body', { text: e.target.value })}
                  className="h-9 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Subtitle Color</Label>
                <div className="flex items-center gap-2">
                  <ColorPicker
                    value={content.body?.style?.color || '#333333'}
                    onChange={(color) => updateContentStyle('body', { color })}
                    brandingColors={brandingOverrides?.colors}
                  />
                  <Input
                    value={content.body?.style?.color || '#333333'}
                    onChange={(e) => updateContentStyle('body', { color: e.target.value })}
                    className="h-9 font-mono text-sm border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section C: Structure & Position (SECOND) */}
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                Structure & Position
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Position</Label>
                <Select
                  value={designConfig.position || 'top'}
                  onValueChange={(value: 'top' | 'bottom') => setDesignConfig(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger className="h-9 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Fixed (Sticky)</Label>
                <Switch
                  checked={designConfig.fixed}
                  onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, fixed: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Close Button (X)</Label>
                <Switch
                  checked={designConfig.showCloseButton}
                  onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, showCloseButton: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Font Family</Label>
                <Select
                  value={designConfig.style?.fontFamily || 'Inter'}
                  onValueChange={(value) => setDesignConfig(prev => ({
                    ...prev,
                    style: { ...prev.style, fontFamily: value }
                  }))}
                >
                  <SelectTrigger className="h-9 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Load Font Checkbox */}
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    id="loadFont"
                    checked={designConfig.style?.loadFont || false}
                    onCheckedChange={(checked) => setDesignConfig(prev => ({
                      ...prev,
                      style: { ...prev.style, loadFont: checked }
                    }))}
                  />
                  <Label htmlFor="loadFont" className="text-xs text-muted-foreground cursor-pointer">
                    Download font if not available
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Background Color</Label>
                <div className="flex items-center gap-2">
                  <ColorPicker
                    value={designConfig.colors.background}
                    onChange={(color) => setDesignConfig(prev => ({
                      ...prev,
                      colors: { ...prev.colors, background: color }
                    }))}
                    brandingColors={brandingOverrides?.colors}
                  />
                  <Input
                    value={designConfig.colors.background}
                    onChange={(e) => setDesignConfig(prev => ({
                      ...prev,
                      colors: { ...prev.colors, background: e.target.value }
                    }))}
                    className="h-9 font-mono text-sm border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section D: Image (THIRD) - Always show for banners */}
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Image URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={designConfig.content?.image?.url || ''}
                    onChange={(e) => updateImage({ url: e.target.value })}
                    className="h-9 border-border flex-1"
                    placeholder={defaultLogoUrl || "https://..."}
                  />
                  {defaultLogoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateImage({ url: defaultLogoUrl })}
                      className="h-9 text-xs whitespace-nowrap"
                      title="Use site logo"
                    >
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Use logo
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Position</Label>
                <Select
                  value={designConfig.content?.image?.position || 'left'}
                  onValueChange={(value: 'left' | 'right') => updateImage({ position: value })}
                >
                  <SelectTrigger className="h-9 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Image Height</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={parsePixelValue(designConfig.content?.image?.height)}
                    onChange={(e) => handlePixelInput(e, (val) => updateImage({ height: val }))}
                    className="h-9 border-border flex-1"
                  />
                  <span className="text-sm font-medium text-muted-foreground">px</span>
                </div>
              </div>

              {/* Image Preview with height ruler - only show if URL exists and loads */}
              {imageUrl && imageLoaded && (
                <div className="relative border-2 border-dashed border-destructive/50 rounded-lg p-4 bg-muted/10">
                  <div className="flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      style={{ height: designConfig.content?.image?.height || '28px' }}
                      className="object-contain"
                    />
                  </div>
                  {/* Height ruler indicator */}
                  <div className="absolute right-3 top-4 bottom-4 flex items-center">
                    <div className="relative flex flex-col items-center h-full">
                      <div className="w-px h-full bg-muted-foreground/40" />
                      <div className="absolute top-0 w-2 h-px bg-muted-foreground/40" />
                      <div className="absolute bottom-0 w-2 h-px bg-muted-foreground/40" />
                      <span className="absolute top-1/2 -translate-y-1/2 right-3 text-xs font-mono text-muted-foreground bg-background px-1 whitespace-nowrap">
                        {parsePixelValue(designConfig.content?.image?.height)}PX
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden image to check if it loads */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(false)}
                  className="hidden"
                  alt=""
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section E: Buttons (Banner only) */}
      {layoutType === 'bar' && (
        <Card className="border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MousePointerClick className="w-4 h-4" />
              Buttons (Max 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {buttons.map((button, index) => (
                <div key={index} className="p-4 border border-border rounded-lg bg-muted/20 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Button {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeButton(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                    value={button.text}
                    onChange={(e) => updateButton(index, { text: e.target.value })}
                    className="h-9 border-border"
                    placeholder="Button text"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={button.action}
                      onValueChange={(value: 'link' | 'close') => updateButton(index, { action: value })}
                    >
                      <SelectTrigger className="h-9 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="close">Close</SelectItem>
                      </SelectContent>
                    </Select>
                    {button.action === 'link' && (
                      <Input
                        value={button.url}
                        onChange={(e) => updateButton(index, { url: e.target.value })}
                        className="h-9 border-border"
                        placeholder="/path or URL"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Background</Label>
                      <div className="flex items-center gap-1">
                        <ColorPicker
                          value={button.style.backgroundColor}
                          onChange={(color) => updateButtonStyle(index, { backgroundColor: color })}
                          brandingColors={brandingOverrides?.colors}
                        />
                        <Input
                          value={button.style.backgroundColor}
                          onChange={(e) => updateButtonStyle(index, { backgroundColor: e.target.value })}
                          className="h-8 font-mono text-xs border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Text</Label>
                      <div className="flex items-center gap-1">
                        <ColorPicker
                          value={button.style.textColor}
                          onChange={(color) => updateButtonStyle(index, { textColor: color })}
                          brandingColors={brandingOverrides?.colors}
                        />
                        <Input
                          value={button.style.textColor}
                          onChange={(e) => updateButtonStyle(index, { textColor: e.target.value })}
                          className="h-8 font-mono text-xs border-border"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {buttons.length < 3 && (
                <button
                  onClick={addButton}
                  className="h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm font-medium">Add button</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
