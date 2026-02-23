import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PopupConfig } from "@/hooks/usePopups";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Image as ImageIcon } from "lucide-react";
import { ResourceGalleryModal } from "./ResourceGalleryModal";

interface ImageAccordionProps {
    designConfig: PopupConfig;
    setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
    projectId?: string;
    projectDomain?: string;
}

interface ImageField {
    url?: string;
    position?: 'top' | 'left' | 'right' | 'background';
    height?: string;
    centered?: boolean;
}

export const ImageAccordion = ({
    designConfig,
    setDesignConfig,
    projectId,
    projectDomain,
}: ImageAccordionProps) => {
    const { t } = useLanguage();
    const [galleryOpen, setGalleryOpen] = useState(false);

    const content = designConfig.content || {};
    const image = ((content as { image?: ImageField }).image || {}) as ImageField;
    const isBanner = designConfig.type === 'bar';

    // Check if URL is valid (non-empty and looks like a URL)
    const hasValidUrl = Boolean(image.url && image.url.trim().length > 5);

    // Default position based on layout
    const defaultPosition = isBanner ? 'right' : 'top';
    const currentPosition = image.position || defaultPosition;

    const updateImage = (updates: Partial<ImageField>) => {
        setDesignConfig(prev => ({
            ...prev,
            content: {
                ...prev.content,
                image: { ...((prev.content as { image?: ImageField })?.image || {}), ...updates },
            },
        } as PopupConfig));
    };

    const handleSelectFromGallery = (url: string) => {
        updateImage({ url });
    };

    return (
        <>
            <AccordionItem value="image" className="border-b border-border">
                <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline hover:bg-muted/50 px-2 py-1.5 transition-all data-[state=open]:bg-primary/5 data-[state=open]:text-primary data-[state=open]:border-l-2 data-[state=open]:border-l-primary">
                    <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3 flex-shrink-0" />
                        {t('editor.sidebar.image')}
                    </span>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2 space-y-2">
                    {/* URL with Gallery Button */}
                    <div className="space-y-0.5">
                        <Label className="text-[9px] text-muted-foreground uppercase">{t('common.url')}</Label>
                        <div className="flex gap-1">
                            <Input
                                value={image.url || ''}
                                onChange={(e) => updateImage({ url: e.target.value })}
                                className="h-[30px] text-[12px] flex-1"
                                placeholder="https://..."
                            />
                            {projectId && projectDomain && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-[30px] w-[30px] shrink-0"
                                    onClick={() => setGalleryOpen(true)}
                                    title={t('resources.gallery')}
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Position & Height - only show if valid URL */}
                    {hasValidUrl && (
                        <>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-0.5">
                                    <Label className="text-[8px] text-muted-foreground uppercase">{t('editor.sidebar.position')}</Label>
                                    <Select
                                        value={currentPosition}
                                        onValueChange={(v) => updateImage({ position: v as ImageField['position'] })}
                                    >
                                        <SelectTrigger className="h-[30px] text-[12px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isBanner ? (
                                                <>
                                                    <SelectItem value="left">{t('editor.sidebar.left')}</SelectItem>
                                                    <SelectItem value="right">{t('editor.sidebar.right')}</SelectItem>
                                                </>
                                            ) : (
                                                <>
                                                    <SelectItem value="top">{t('editor.sidebar.top')}</SelectItem>
                                                    <SelectItem value="left">{t('editor.sidebar.left')}</SelectItem>
                                                    <SelectItem value="right">{t('editor.sidebar.right')}</SelectItem>
                                                    <SelectItem value="background">{t('editor.sidebar.background_pos')}</SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 space-y-0.5">
                                    <Label className="text-[8px] text-muted-foreground uppercase">{t('editor.sidebar.height')}</Label>
                                    <div className="flex items-center border rounded-md overflow-hidden h-6">
                                        <Input
                                            type="number"
                                            value={parseInt(image.height || '100') || 100}
                                            onChange={(e) => updateImage({ height: `${e.target.value}px` })}
                                            className="h-[30px] text-[12px] border-0 text-right pr-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            min={20}
                                            max={500}
                                        />
                                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 h-full flex items-center">px</span>
                                    </div>
                                </div>
                            </div>

                            {/* Centered option - only for modals with top position */}
                            {(!isBanner && currentPosition === 'top') && (
                                <div className="flex items-center justify-between">
                                    <Label className="text-[8px] text-muted-foreground uppercase">{t('editor.sidebar.centered')}</Label>
                                    <Switch
                                        checked={image.centered || false}
                                        onCheckedChange={(checked) => updateImage({ centered: checked })}
                                        className="scale-75"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>

            {/* Gallery Modal */}
            {projectId && projectDomain && (
                <ResourceGalleryModal
                    open={galleryOpen}
                    onOpenChange={setGalleryOpen}
                    projectId={projectId}
                    projectDomain={projectDomain}
                    onSelect={handleSelectFromGallery}
                />
            )}
        </>
    );
};
