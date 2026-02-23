import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, Layout, LayoutTemplate, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type PopupConfig, type BannerButton } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";

type LayoutType = "modal" | "bar";

interface ContentLayoutAccordionProps {
  popupName: string;
  setPopupName: (name: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  layoutType: LayoutType;
  handleLayoutChange: (value: LayoutType) => void;
  designConfig: PopupConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
  brandingOverrides?: BrandingOverrides | null;
}

export const ContentLayoutAccordion = ({
  popupName,
  setPopupName,
  isActive,
  setIsActive,
  layoutType,
  handleLayoutChange,
  designConfig,
  setDesignConfig,
  brandingOverrides,
}: ContentLayoutAccordionProps) => {
  const { t } = useLanguage();
  const content = designConfig.content || { headline: { text: '' }, body: { text: '' } };
  const buttons = designConfig.buttons || [];

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
      { backgroundColor: brandingOverrides.components.buttonPrimaryBg || '#3b82f6', textColor: brandingOverrides.components.buttonPrimaryText || '#ffffff' },
      { backgroundColor: brandingOverrides.components.buttonSecondaryBg || '#e5e7eb', textColor: brandingOverrides.components.buttonSecondaryText || '#374151' },
      { backgroundColor: 'transparent', textColor: brandingOverrides.colors?.text || '#6b7280' },
    ];
    return colors[index] || colors[0];
  };

  const updateContent = (field: 'headline' | 'body', updates: Record<string, unknown>) => {
    setDesignConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: { ...(prev.content?.[field] || {}), ...updates },
      },
    }));
  };

  const addButton = () => {
    if (buttons.length >= 3) return;
    const colors = getButtonColorsForIndex(buttons.length);
    const newButton: BannerButton = {
      text: 'Botón',
      action: 'link',
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

  const updateButton = (index: number, updates: Partial<BannerButton>) => {
    setDesignConfig(prev => ({
      ...prev,
      buttons: prev.buttons?.map((btn, i) => i === index ? { ...btn, ...updates } : btn) || [],
    }));
  };

  return (
    <Collapsible defaultOpen className="border-b border-border">
      <CollapsibleTrigger className="flex w-full items-center justify-between text-[10px] font-semibold uppercase text-muted-foreground hover:bg-muted/50 px-3 py-2 transition-all [&[data-state=open]>svg]:rotate-180">
        {t('editor.sidebar.content')}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-3">
        {/* Name & Active */}
        <div className="flex items-center gap-2">
          <Input
            value={popupName}
            onChange={(e) => setPopupName(e.target.value)}
            className="h-7 text-xs flex-1"
            placeholder={t('editor.sidebar.popup_name')}
          />
          <div className="flex items-center gap-1">
            <Label className="text-[9px] text-muted-foreground">{t('editor.sidebar.active')}</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} className="scale-75" />
          </div>
        </div>

        {/* Layout Type */}
        <div className="flex gap-1">
          <Button
            variant={layoutType === 'modal' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-7 text-[10px]"
            onClick={() => handleLayoutChange('modal')}
          >
            <LayoutTemplate className="w-3 h-3 mr-1" />
            {t('editor.modal')}
          </Button>
          <Button
            variant={layoutType === 'bar' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-7 text-[10px]"
            onClick={() => handleLayoutChange('bar')}
          >
            <Layout className="w-3 h-3 mr-1" />
            {t('editor.banner')}
          </Button>
        </div>

        {/* Headline */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase">{t('editor.sidebar.title')}</Label>
          <Input
            value={content.headline?.text || ''}
            onChange={(e) => updateContent('headline', { text: e.target.value })}
            className="h-7 text-xs"
          />
        </div>

        {/* Body */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase">{t('editor.sidebar.subtitle')}</Label>
          <Input
            value={content.body?.text || ''}
            onChange={(e) => updateContent('body', { text: e.target.value })}
            className="h-7 text-xs"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase">{t('editor.sidebar.image_url')}</Label>
          <Input
            value={(designConfig.content?.image as { url?: string } | undefined)?.url || ''}
            onChange={(e) => setDesignConfig(prev => ({
              ...prev,
              content: {
                ...prev.content,
                image: {
                  position: 'left' as const,
                  height: '28px',
                  ...(prev.content?.image || {}),
                  url: e.target.value
                },
              },
            }))}
            className="h-7 text-xs"
            placeholder="https://..."
          />
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground uppercase">{t('editor.sidebar.buttons')}</Label>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={addButton}
              disabled={buttons.length >= 3}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          {buttons.map((btn, idx) => (
            <div key={idx} className="flex items-center gap-1.5 p-1.5 border border-border rounded">
              <Input
                value={btn.text}
                onChange={(e) => updateButton(idx, { text: e.target.value })}
                className="h-6 text-[11px] flex-1"
                placeholder={t('editor.sidebar.text')}
              />
              <Select
                value={btn.action || 'link'}
                onValueChange={(value: 'link' | 'close') => updateButton(idx, { action: value })}
              >
                <SelectTrigger className="h-6 w-16 text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">{t('editor.sidebar.link')}</SelectItem>
                  <SelectItem value="close">{t('editor.sidebar.close')}</SelectItem>
                </SelectContent>
              </Select>
              <button onClick={() => removeButton(idx)} className="p-0.5 hover:bg-muted rounded">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
