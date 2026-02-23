import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, MousePointerClick } from "lucide-react";
import { type PopupConfig, type BannerButton } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface ButtonsAccordionProps {
    designConfig: PopupConfig;
    setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
    brandingOverrides?: BrandingOverrides | null;
}

export const ButtonsAccordion = ({
    designConfig,
    setDesignConfig,
    brandingOverrides,
}: ButtonsAccordionProps) => {
    const { t } = useLanguage();
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

    const addButton = () => {
        if (buttons.length >= 3) return;
        const colors = getButtonColorsForIndex(buttons.length);
        const newButton: BannerButton = {
            text: t('editor.button'),
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

    const updateButtonStyle = (index: number, styleUpdates: Record<string, string>) => {
        setDesignConfig(prev => ({
            ...prev,
            buttons: prev.buttons?.map((btn, i) =>
                i === index ? { ...btn, style: { ...btn.style, ...styleUpdates } } : btn
            ) || [],
        }));
    };

    return (
        <AccordionItem value="buttons" className="border-b border-border">
            <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline hover:bg-muted/50 px-2 py-1.5 transition-all data-[state=open]:bg-primary/5 data-[state=open]:text-primary data-[state=open]:border-l-2 data-[state=open]:border-l-primary">
                <span className="flex items-center gap-1.5">
                    <MousePointerClick className="w-3 h-3 flex-shrink-0" />
                    {t('editor.sidebar.buttons')}
                    <span className="text-[8px] font-normal text-muted-foreground/60">({buttons.length}/3)</span>
                </span>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2 space-y-1.5">
                {buttons.map((btn, idx) => (
                    <div key={idx} className="p-1.5 border border-border rounded space-y-1">
                        {/* Row 1: Text + Action */}
                        <div className="flex items-center gap-1">
                            <Input
                                value={btn.text}
                                onChange={(e) => updateButton(idx, { text: e.target.value })}
                                className="h-[30px] text-[12px] flex-1"
                                placeholder={t('editor.sidebar.text')}
                            />
                            <Select
                                value={btn.action || 'link'}
                                onValueChange={(value: 'link' | 'close') => updateButton(idx, { action: value })}
                            >
                                <SelectTrigger className="h-[30px] w-16 text-[12px]">
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

                        {/* Row 2: URL (if link) */}
                        {btn.action === 'link' && (
                            <Input
                                value={btn.url || ''}
                                onChange={(e) => updateButton(idx, { url: e.target.value })}
                                className="h-[30px] text-[12px]"
                                placeholder="https://..."
                            />
                        )}

                        {/* Row 3: Colors */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <ColorPicker
                                    value={btn.style?.backgroundColor || '#3b82f6'}
                                    onChange={(color) => updateButtonStyle(idx, { backgroundColor: color })}
                                    brandingColors={brandingOverrides?.colors}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('editor.background')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ColorPicker
                                    value={btn.style?.textColor || '#ffffff'}
                                    onChange={(color) => updateButtonStyle(idx, { textColor: color })}
                                    brandingColors={brandingOverrides?.colors}
                                />
                                <span className="text-[10px] text-muted-foreground">{t('editor.text_color')}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {buttons.length < 3 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-6 text-[10px]"
                        onClick={addButton}
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        {t('editor.sidebar.add_button')}
                    </Button>
                )}
            </AccordionContent>
        </AccordionItem>
    );
};
