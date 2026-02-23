import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Type,
  Image as ImageIcon,
  MousePointerClick,
  Palette,
  Plus,
  X,
  LayoutGrid,
  ListChecks,
  FileText
} from "lucide-react";
import { type PopupConfig, type ModalButton, type ModalFeature } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { useLanguage } from "@/contexts/LanguageContext";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface ModalDesignFormNewProps {
  designConfig: PopupConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
  defaultLogoUrl?: string | null;
  brandingOverrides?: BrandingOverrides | null;
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Open Sans', label: 'Open Sans' }
];

export const ModalDesignFormNew = ({
  designConfig,
  setDesignConfig,
  defaultLogoUrl,
  brandingOverrides,
}: ModalDesignFormNewProps) => {
  const { t } = useLanguage();
  // Get button colors from branding
  const getButtonColorsForIndex = (index: number) => {
    if (!brandingOverrides?.components) {
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
  // Get modal content with defaults (using unified 'content' field)
  const content = designConfig.content || {
    headline: { text: '', style: { color: '#1a1a1a' } },
    body: { text: '', style: { color: '#666666' } },
    image: { url: '', position: 'top' as const, height: '180px' },
    features: [],
  };

  const buttons = (designConfig.buttons as ModalButton[]) || [];
  const footer = designConfig.footer || { text: '', links: [{ text: '', url: '' }, { text: '', url: '' }] };
  const style = designConfig.style || { backgroundColor: '#ffffff', fontFamily: 'Inter', borderRadius: '16px' };

  // Update content helpers
  const updateContent = (field: 'headline' | 'body' | 'image', updates: Record<string, unknown>) => {
    setDesignConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        headline: prev.content?.headline || { text: '', style: { color: '#1a1a1a' } },
        body: prev.content?.body || { text: '', style: { color: '#666666' } },
        image: prev.content?.image || { url: '', position: 'top' as const, height: '180px' },
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
        headline: prev.content?.headline || { text: '', style: { color: '#1a1a1a' } },
        body: prev.content?.body || { text: '', style: { color: '#666666' } },
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

  // Features helpers
  const features = content.features || [];

  const addFeature = () => {
    if (features.length >= 5) return;
    setDesignConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        headline: prev.content?.headline || { text: '', style: { color: '#1a1a1a' } },
        body: prev.content?.body || { text: '', style: { color: '#666666' } },
        features: [...(prev.content?.features || []), { icon: '✓', text: '' }],
      },
    }));
  };

  const removeFeature = (index: number) => {
    setDesignConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        headline: prev.content?.headline || { text: '', style: { color: '#1a1a1a' } },
        body: prev.content?.body || { text: '', style: { color: '#666666' } },
        features: prev.content?.features?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const updateFeature = (index: number, updates: Partial<ModalFeature>) => {
    setDesignConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        headline: prev.content?.headline || { text: '', style: { color: '#1a1a1a' } },
        body: prev.content?.body || { text: '', style: { color: '#666666' } },
        features: prev.content?.features?.map((f, i) =>
          i === index ? { ...f, ...updates } : f
        ) || [],
      },
    }));
  };

  // Buttons helpers
  const addButton = () => {
    if (buttons.length >= 3) return;
    const buttonIndex = buttons.length;
    const colors = getButtonColorsForIndex(buttonIndex);
    const newButton: ModalButton = {
      text: '',
      action: 'close',
      url: '',
      style: {
        backgroundColor: colors.backgroundColor,
        textColor: colors.textColor,
        borderRadius: brandingOverrides?.typography?.borderRadius || '8px',
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

  const updateButton = (index: number, updates: Partial<ModalButton>) => {
    setDesignConfig(prev => ({
      ...prev,
      buttons: prev.buttons?.map((btn, i) =>
        i === index ? { ...btn, ...updates } : btn
      ) || [],
    }));
  };

  const updateButtonStyle = (index: number, styleUpdates: Partial<ModalButton['style']>) => {
    setDesignConfig(prev => ({
      ...prev,
      buttons: prev.buttons?.map((btn, i) =>
        i === index ? { ...btn, style: { ...(btn as ModalButton).style, ...styleUpdates } } : btn
      ) || [],
    }));
  };

  // Footer helpers
  const updateFooter = (updates: Partial<typeof footer>) => {
    setDesignConfig(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        text: prev.footer?.text || '',
        links: prev.footer?.links || [{ text: '', url: '' }, { text: '', url: '' }],
        ...updates,
      },
    }));
  };

  const updateFooterLink = (index: number, updates: { text?: string; url?: string }) => {
    setDesignConfig(prev => {
      const currentLinks = prev.footer?.links || [{ text: '', url: '' }, { text: '', url: '' }];
      const newLinks = [...currentLinks];
      newLinks[index] = { ...newLinks[index], ...updates };
      return {
        ...prev,
        footer: {
          ...prev.footer,
          text: prev.footer?.text || '',
          links: newLinks,
        },
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Card 2: Contenido de Texto */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Type className="w-4 h-4" />
            {t('modal.text_content')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.title')}</Label>
              <Input
                value={content.headline?.text || ''}
                onChange={(e) => updateContent('headline', { text: e.target.value, style: content.headline?.style })}
                className="h-[30px] border-border"
                placeholder="¡Oferta Especial!"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.title_color')}</Label>
              <div className="flex items-center gap-2">
                <ColorPicker
                  value={content.headline?.style?.color || '#1a1a1a'}
                  onChange={(color) => updateContentStyle('headline', { color })}
                  brandingColors={brandingOverrides?.colors}
                />
                <Input
                  value={content.headline?.style?.color || '#1a1a1a'}
                  onChange={(e) => updateContentStyle('headline', { color: e.target.value })}
                  className="h-[30px] font-mono text-[12px] border-border"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.subtitle_body')}</Label>
            <Textarea
              value={content.body?.text || ''}
              onChange={(e) => updateContent('body', { text: e.target.value, style: content.body?.style })}
              className="border-border min-h-[80px] resize-none"
              placeholder="Aprovecha 50% de descuento en todos los productos."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.subtitle_color')}</Label>
            <div className="flex items-center gap-2">
              <ColorPicker
                value={content.body?.style?.color || '#666666'}
                onChange={(color) => updateContentStyle('body', { color })}
                brandingColors={brandingOverrides?.colors}
              />
              <Input
                value={content.body?.style?.color || '#666666'}
                onChange={(e) => updateContentStyle('body', { color: e.target.value })}
                className="h-[30px] font-mono text-[12px] border-border flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Estructura y Estilo */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            {t('modal.structure_style')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.size')}</Label>
              <Select
                value={designConfig.size || 'medium'}
                onValueChange={(value: 'small' | 'medium' | 'large') => setDesignConfig(prev => ({ ...prev, size: value }))}
              >
                <SelectTrigger className="h-[30px] text-[12px] border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="small">{t('modal.size_small')}</SelectItem>
                  <SelectItem value="medium">{t('modal.size_medium')}</SelectItem>
                  <SelectItem value="large">{t('modal.size_large')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.font_family')}</Label>
              <Select
                value={style.fontFamily || 'Inter'}
                onValueChange={(value) => setDesignConfig(prev => ({
                  ...prev,
                  style: { ...prev.style, fontFamily: value }
                }))}
              >
                <SelectTrigger className="h-[30px] text-[12px] border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {FONT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.border_radius')}</Label>
              <Input
                value={style.borderRadius || '16px'}
                onChange={(e) => setDesignConfig(prev => ({
                  ...prev,
                  style: { ...prev.style, borderRadius: e.target.value }
                }))}
                className="h-[30px] text-[12px] border-border"
                placeholder="16px"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.close_button_x')}</Label>
              <Switch
                checked={designConfig.showCloseButton}
                onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, showCloseButton: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.close_on_overlay')}</Label>
              <Switch
                checked={designConfig.closeOnOverlay ?? true}
                onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, closeOnOverlay: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.background_color')}</Label>
              <div className="flex items-center gap-2">
                <ColorPicker
                  value={style.backgroundColor || '#ffffff'}
                  onChange={(color) => setDesignConfig(prev => ({
                    ...prev,
                    style: { ...prev.style, backgroundColor: color }
                  }))}
                  brandingColors={brandingOverrides?.colors}
                />
                <Input
                  value={style.backgroundColor || '#ffffff'}
                  onChange={(e) => setDesignConfig(prev => ({
                    ...prev,
                    style: { ...prev.style, backgroundColor: e.target.value }
                  }))}
                  className="h-[30px] font-mono text-[12px] border-border"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Imagen */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            {t('modal.image')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.image_url')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={(content.image as { url?: string })?.url || ''}
                  onChange={(e) => updateContent('image', {
                    url: e.target.value,
                    position: (content.image as { position?: string })?.position || 'top',
                    height: (content.image as { height?: string })?.height || '180px'
                  })}
                  className="h-[30px] border-border flex-1"
                  placeholder={defaultLogoUrl || "https://example.com/image.jpg"}
                />
                {defaultLogoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateContent('image', {
                      url: defaultLogoUrl,
                      position: (content.image as { position?: string })?.position || 'top',
                      height: (content.image as { height?: string })?.height || '180px'
                    })}
                    className="h-[30px] text-xs whitespace-nowrap"
                    title={t('modal.use_logo')}
                  >
                    <ImageIcon className="w-3 h-3 mr-1" />
                    {t('modal.use_logo')}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.position')}</Label>
              <Select
                value={(content.image as { position?: string })?.position || 'top'}
                onValueChange={(value: 'top' | 'left' | 'right' | 'background') => updateContent('image', {
                  url: (content.image as { url?: string })?.url || '',
                  position: value,
                  height: (content.image as { height?: string })?.height || '180px'
                })}
              >
                <SelectTrigger className="h-[30px] text-[12px] border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="top">{t('modal.pos_top')}</SelectItem>
                  <SelectItem value="left">{t('modal.pos_left')}</SelectItem>
                  <SelectItem value="right">{t('modal.pos_right')}</SelectItem>
                  <SelectItem value="background">{t('modal.pos_background')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.image_height')}</Label>
            <Input
              value={(content.image as { height?: string })?.height || '180px'}
              onChange={(e) => updateContent('image', {
                url: (content.image as { url?: string })?.url || '',
                position: (content.image as { position?: string })?.position || 'top',
                height: e.target.value
              })}
              className="h-[30px] border-border max-w-[200px]"
              placeholder="180px"
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 5: Features (Lista de beneficios) */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            {t('modal.features')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('modal.no_features')}</p>
          ) : (
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/20">
                  <Input
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, { icon: e.target.value })}
                    className="h-[30px] border-border w-16 text-center"
                    placeholder="✓"
                  />
                  <Input
                    value={feature.text}
                    onChange={(e) => updateFeature(index, { text: e.target.value })}
                    className="h-[30px] border-border flex-1"
                    placeholder="Free shipping"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-[30px] w-[30px] text-destructive hover:text-destructive"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {features.length < 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addFeature}
              className="mt-2 border-dashed border-2 border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('modal.add_feature')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Card 6: Botones (máx 3) */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <MousePointerClick className="w-4 h-4" />
            {t('modal.buttons')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buttons.map((button, index) => (
              <div key={index} className="p-4 border border-border rounded-lg bg-muted/20 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.button')} {index + 1}</span>
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
                  className="h-[30px] border-border"
                  placeholder="Get Offer"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={button.action}
                    onValueChange={(value: 'link' | 'close') => updateButton(index, { action: value })}
                  >
                    <SelectTrigger className="h-[30px] text-[12px] border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="close">{t('modal.action_close')}</SelectItem>
                      <SelectItem value="link">{t('modal.action_link')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {button.action === 'link' && (
                    <Input
                      value={button.url || ''}
                      onChange={(e) => updateButton(index, { url: e.target.value })}
                      className="h-[30px] border-border"
                      placeholder="/offer"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.btn_background')}</Label>
                    <div className="flex items-center gap-1">
                      <ColorPicker
                        value={button.style.backgroundColor}
                        onChange={(color) => updateButtonStyle(index, { backgroundColor: color })}
                        brandingColors={brandingOverrides?.colors}
                      />
                      <Input
                        value={button.style.backgroundColor}
                        onChange={(e) => updateButtonStyle(index, { backgroundColor: e.target.value })}
                        className="h-[30px] font-mono text-[12px] border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.btn_text')}</Label>
                    <div className="flex items-center gap-1">
                      <ColorPicker
                        value={button.style.textColor}
                        onChange={(color) => updateButtonStyle(index, { textColor: color })}
                        brandingColors={brandingOverrides?.colors}
                      />
                      <Input
                        value={button.style.textColor}
                        onChange={(e) => updateButtonStyle(index, { textColor: e.target.value })}
                        className="h-[30px] font-mono text-[12px] border-border"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.btn_border_radius')}</Label>
                  <Input
                    value={button.style.borderRadius}
                    onChange={(e) => updateButtonStyle(index, { borderRadius: e.target.value })}
                    className="h-[30px] border-border"
                    placeholder="8px"
                  />
                </div>
              </div>
            ))}

            {buttons.length < 3 && (
              <button
                onClick={addButton}
                className="h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">{t('modal.add_button')}</span>
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 7: Footer */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {t('modal.footer')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.footer_text')}</Label>
            <Input
              value={footer.text}
              onChange={(e) => updateFooter({ text: e.target.value })}
              className="h-8 border-border"
              placeholder="By continuing you agree to our"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-border rounded-lg space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.link_1')}</span>
              <Input
                value={footer.links?.[0]?.text || ''}
                onChange={(e) => updateFooterLink(0, { text: e.target.value })}
                className="h-9 border-border"
                placeholder="Terms"
              />
              <Input
                value={footer.links?.[0]?.url || ''}
                onChange={(e) => updateFooterLink(0, { url: e.target.value })}
                className="h-9 border-border"
                placeholder="/terms"
              />
            </div>

            <div className="p-3 border border-border rounded-lg space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">{t('modal.link_2')}</span>
              <Input
                value={footer.links?.[1]?.text || ''}
                onChange={(e) => updateFooterLink(1, { text: e.target.value })}
                className="h-8 border-border"
                placeholder="Privacy"
              />
              <Input
                value={footer.links?.[1]?.url || ''}
                onChange={(e) => updateFooterLink(1, { url: e.target.value })}
                className="h-8 border-border"
                placeholder="/privacy"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
