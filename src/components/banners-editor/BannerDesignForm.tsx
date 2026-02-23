import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, LayoutTemplate, Type, Image, MousePointerClick, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { type PopupConfig, type BannerButton } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface BannerDesignFormProps {
  designConfig: PopupConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
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

export const BannerDesignForm = ({
  designConfig,
  setDesignConfig,
  defaultLogoUrl,
  brandingOverrides,
}: BannerDesignFormProps) => {
  const { t } = useLanguage();

  // Use defaultLogoUrl as initial value for image URL if not already set
  const imageUrl = designConfig.content?.image?.url || defaultLogoUrl || '';

  const content = designConfig.content || {
    headline: { text: '', style: { color: '#0F206C', fontWeight: '700', fontSize: '15px' } },
    body: { text: '', style: { color: '#333333', fontSize: '14px' } },
    image: { url: defaultLogoUrl || '', position: 'left' as const, height: '28px' },
  };

  const buttons = designConfig.buttons || [];

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

  const addButton = () => {
    if (buttons.length >= 3) return;
    const newButton: BannerButton = {
      text: 'Nuevo botón',
      action: 'link',
      url: '',
      style: {
        backgroundColor: '#0F206C',
        textColor: '#ffffff',
        borderRadius: '9999px',
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
    <>
      {/* Layout Section */}
      <div>
        <span className="panel-label flex items-center gap-1.5">
          <LayoutTemplate className="w-3 h-3 text-primary" strokeWidth={1.5} /> {t('banner.layout').toUpperCase()}
        </span>
        <div className="mt-2 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-label">{t('banner.position')}</Label>
              <Select
                value={designConfig.position || 'top'}
                onValueChange={(value: 'top' | 'bottom') => setDesignConfig(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger className="input-figma mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">{t('banner.pos_top')}</SelectItem>
                  <SelectItem value="bottom">{t('banner.pos_bottom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2 h-[30px]">
                <Label className="text-label">{t('banner.fixed')}</Label>
                <Switch
                  checked={designConfig.fixed}
                  onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, fixed: checked }))}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-label">{t('banner.show_close')}</Label>
            <Switch
              checked={designConfig.showCloseButton}
              onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, showCloseButton: checked }))}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div>
        <span className="panel-label flex items-center gap-1.5">
          <Type className="w-3 h-3 text-primary" strokeWidth={1.5} /> {t('banner.content').toUpperCase()}
        </span>
        <div className="mt-2 space-y-3">
          {/* Headline */}
          <div>
            <Label className="text-label">{t('banner.title')}</Label>
            <Input
              value={content.headline?.text || ''}
              onChange={(e) => updateContent('headline', { text: e.target.value })}
              className="input-figma mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <ColorPicker
              value={content.headline?.style?.color || '#0F206C'}
              onChange={(color) => updateContentStyle('headline', { color })}
              brandingColors={brandingOverrides?.colors}
            />
            <Input
              value={content.headline?.style?.color || '#0F206C'}
              onChange={(e) => updateContentStyle('headline', { color: e.target.value })}
              className="input-figma flex-1 font-mono text-[11px]"
            />
          </div>

          {/* Body/Subtitle */}
          <div>
            <Label className="text-label">{t('banner.subtitle')}</Label>
            <Input
              value={content.body?.text || ''}
              onChange={(e) => updateContent('body', { text: e.target.value })}
              className="input-figma mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <ColorPicker
              value={content.body?.style?.color || '#333333'}
              onChange={(color) => updateContentStyle('body', { color })}
              brandingColors={brandingOverrides?.colors}
            />
            <Input
              value={content.body?.style?.color || '#333333'}
              onChange={(e) => updateContentStyle('body', { color: e.target.value })}
              className="input-figma flex-1 font-mono text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div>
        <span className="panel-label flex items-center gap-1.5">
          <Image className="w-3 h-3 text-primary" strokeWidth={1.5} /> {t('banner.image').toUpperCase()}
        </span>
        <div className="mt-2 space-y-3">
          <div>
            <Label className="text-label">{t('banner.image_url')}</Label>
            <Input
              value={imageUrl}
              onChange={(e) => updateContent('image', { url: e.target.value })}
              className="input-figma mt-1"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-label">{t('banner.position_img')}</Label>
              <Select
                value={content.image?.position || 'left'}
                onValueChange={(value: 'left' | 'right') => updateContent('image', { position: value })}
              >
                <SelectTrigger className="input-figma mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">{t('banner.pos_left')}</SelectItem>
                  <SelectItem value="right">{t('banner.pos_right')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-label">{t('banner.height')}</Label>
              <Input
                value={content.image?.height || '28px'}
                onChange={(e) => updateContent('image', { height: e.target.value })}
                className="input-figma mt-1"
                placeholder="28px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons Section */}
      <div>
        <span className="panel-label flex items-center gap-1.5">
          <MousePointerClick className="w-3 h-3 text-primary" strokeWidth={1.5} /> {t('banner.buttons').toUpperCase()}
        </span>
        <div className="mt-2 space-y-3">
          {buttons.map((button, index) => (
            <div key={index} className="p-3 border border-border rounded-md bg-card/50 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t('banner.button')} {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive hover:text-destructive"
                  onClick={() => removeButton(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <Input
                value={button.text}
                onChange={(e) => updateButton(index, { text: e.target.value })}
                className="input-figma"
                placeholder={t('banner.button_text')}
              />

              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={button.action}
                  onValueChange={(value: 'link' | 'close') => updateButton(index, { action: value })}
                >
                  <SelectTrigger className="input-figma">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">{t('editor.sidebar.link')}</SelectItem>
                    <SelectItem value="close">{t('banner.close')}</SelectItem>
                  </SelectContent>
                </Select>
                {button.action === 'link' && (
                  <Input
                    value={button.url}
                    onChange={(e) => updateButton(index, { url: e.target.value })}
                    className="input-figma"
                    placeholder="/ruta o URL"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-label text-[10px]">{t('banner.bg_color')}</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <ColorPicker
                      value={button.style.backgroundColor}
                      onChange={(color) => updateButtonStyle(index, { backgroundColor: color })}
                      brandingColors={brandingOverrides?.colors}
                    />
                    <Input
                      value={button.style.backgroundColor}
                      onChange={(e) => updateButtonStyle(index, { backgroundColor: e.target.value })}
                      className="input-figma flex-1 font-mono text-[10px] h-[30px]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-label text-[10px]">{t('banner.text_color')}</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <ColorPicker
                      value={button.style.textColor}
                      onChange={(color) => updateButtonStyle(index, { textColor: color })}
                      brandingColors={brandingOverrides?.colors}
                    />
                    <Input
                      value={button.style.textColor}
                      onChange={(e) => updateButtonStyle(index, { textColor: e.target.value })}
                      className="input-figma flex-1 font-mono text-[10px] h-[30px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {buttons.length < 3 && (
            <Button
              variant="outline"
              className="w-full h-[30px] text-xs border-dashed"
              onClick={addButton}
            >
              <Plus className="h-3 w-3 mr-1" />
              {t('banner.add_button')}
            </Button>
          )}
        </div>
      </div>

      {/* Styles Section */}
      <div>
        <span className="panel-label flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-primary" strokeWidth={1.5} /> {t('banner.styles').toUpperCase()}
        </span>
        <div className="mt-2 space-y-3">
          <div>
            <Label className="text-label">{t('banner.background_color')}</Label>
            <div className="flex items-center gap-2 mt-1">
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
                className="input-figma flex-1 font-mono text-[11px]"
              />
            </div>
          </div>
          <div>
            <Label className="text-label">{t('banner.font_family')}</Label>
            <Select
              value={designConfig.style?.fontFamily || 'Inter'}
              onValueChange={(value) => setDesignConfig(prev => ({
                ...prev,
                style: { ...prev.style, fontFamily: value }
              }))}
            >
              <SelectTrigger className="input-figma mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-label">{t('banner.border_radius')}</Label>
            <Select
              value={designConfig.style?.borderRadius || '0px'}
              onValueChange={(value: '0px' | '8px' | '16px') => setDesignConfig(prev => ({
                ...prev,
                style: { ...prev.style, borderRadius: value }
              }))}
            >
              <SelectTrigger className="input-figma mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0px">0px</SelectItem>
                <SelectItem value="8px">8px</SelectItem>
                <SelectItem value="16px">16px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
};
