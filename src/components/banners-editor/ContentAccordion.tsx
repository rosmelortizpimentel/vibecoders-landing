import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type PopupConfig } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";
import { Type, ChevronDown } from "lucide-react";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface ContentAccordionProps {
    designConfig: PopupConfig;
    setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
    brandingOverrides?: BrandingOverrides | null;
}

interface ContentField {
    text?: string;
    style?: { color?: string };
}

interface ImageField {
    url?: string;
    position?: 'top' | 'left' | 'right' | 'background';
    height?: string;
}

export const ContentAccordion = ({
    designConfig,
    setDesignConfig,
    brandingOverrides,
}: ContentAccordionProps) => {
    const { t } = useLanguage();

    const content = designConfig.content || { headline: { text: '' }, body: { text: '' } };
    const headline = (content.headline || {}) as ContentField;
    const body = (content.body || {}) as ContentField;
    const image = ((content as { image?: ImageField }).image || {}) as ImageField;

    const updateContent = (field: 'headline' | 'body', updates: Record<string, unknown>) => {
        setDesignConfig(prev => ({
            ...prev,
            content: {
                ...prev.content,
                [field]: { ...(prev.content?.[field] || {}), ...updates },
            },
        }));
    };

    const updateImage = (updates: Partial<ImageField>) => {
        setDesignConfig(prev => ({
            ...prev,
            content: {
                ...prev.content,
                image: { ...((prev.content as { image?: ImageField })?.image || {}), ...updates },
            },
        } as PopupConfig));
    };

    return (
        <Collapsible defaultOpen className="border-b border-border">
            <CollapsibleTrigger className="flex w-full items-center justify-between text-[9px] font-semibold uppercase text-muted-foreground hover:bg-muted/50 px-2 py-1.5 transition-all [&[data-state=open]>svg.chevron]:rotate-180">
                <span className="flex items-center gap-1.5">
                    <Type className="w-3 h-3 flex-shrink-0" />
                    {t('editor.sidebar.content')}
                </span>
                <ChevronDown className="chevron h-4 w-4 shrink-0 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pb-2 space-y-2">
                {/* Title */}
                <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.title')}</Label>
                        <ColorPicker
                            value={headline.style?.color || '#1a1a1a'}
                            onChange={(color) => updateContent('headline', { style: { ...headline.style, color } })}
                            brandingColors={brandingOverrides?.colors}
                        />
                    </div>
                    <Input
                        value={headline.text || ''}
                        onChange={(e) => updateContent('headline', { text: e.target.value })}
                        className="h-[30px] text-[12px]"
                        placeholder={t('editor.sidebar.title_placeholder')}
                    />
                </div>

                {/* Subtitle */}
                <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.subtitle')}</Label>
                        <ColorPicker
                            value={body.style?.color || '#666666'}
                            onChange={(color) => updateContent('body', { style: { ...body.style, color } })}
                            brandingColors={brandingOverrides?.colors}
                        />
                    </div>
                    <Input
                        value={body.text || ''}
                        onChange={(e) => updateContent('body', { text: e.target.value })}
                        className="h-[30px] text-[12px]"
                        placeholder={t('editor.sidebar.subtitle_placeholder')}
                    />
                </div>

            </CollapsibleContent>
        </Collapsible>
    );
};
