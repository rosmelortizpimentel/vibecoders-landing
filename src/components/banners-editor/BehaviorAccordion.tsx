import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PopupConfig } from "@/hooks/usePopups";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Settings2 } from "lucide-react";

interface BehaviorAccordionProps {
    designConfig: PopupConfig;
    setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
}

export const BehaviorAccordion = ({
    designConfig,
    setDesignConfig,
}: BehaviorAccordionProps) => {
    const { t } = useLanguage();
    const isModal = designConfig.type === 'modal';
    const animation = (designConfig as unknown as { animation?: { enter?: string; exit?: string } }).animation;

    const setAnimation = (field: 'enter' | 'exit', value: string) => {
        setDesignConfig(prev => ({
            ...prev,
            animation: {
                ...((prev as unknown as { animation?: object }).animation || {}),
                [field]: value,
            },
        } as PopupConfig));
    };

    return (
        <AccordionItem value="behavior" className="border-b-0">
            <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline hover:bg-muted/50 px-2 py-1.5 transition-all data-[state=open]:bg-primary/5 data-[state=open]:text-primary data-[state=open]:border-l-2 data-[state=open]:border-l-primary">
                <span className="flex items-center gap-1.5">
                    <Settings2 className="w-3 h-3 flex-shrink-0" />
                    {t('editor.sidebar.behavior')}
                </span>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2 space-y-2">
                {/* Show Close Button */}
                <div className="flex items-center justify-between">
                    <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.close_button')}</Label>
                    <Switch
                        checked={designConfig.showCloseButton !== false}
                        onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, showCloseButton: checked }))}
                        className="scale-75"
                    />
                </div>

                {/* Close on Overlay (Modal only) */}
                {isModal && (
                    <div className="flex items-center justify-between">
                        <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.close_overlay')}</Label>
                        <Switch
                            checked={(designConfig as unknown as { closeOnOverlayClick?: boolean }).closeOnOverlayClick !== false}
                            onCheckedChange={(checked) => setDesignConfig(prev => ({
                                ...prev,
                                closeOnOverlayClick: checked
                            } as PopupConfig))}
                            className="scale-75"
                        />
                    </div>
                )}

                {/* Enter Animation */}
                <div className="flex items-center justify-between">
                    <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.animation_in')}</Label>
                    <Select
                        value={animation?.enter || (isModal ? 'scaleIn' : 'slideDown')}
                        onValueChange={(value) => setAnimation('enter', value)}
                    >
                        <SelectTrigger className="h-[30px] w-20 text-[12px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {isModal ? (
                                <>
                                    <SelectItem value="scaleIn">{t('editor.animation.scale')}</SelectItem>
                                    <SelectItem value="fadeIn">{t('editor.animation.fade')}</SelectItem>
                                    <SelectItem value="none">{t('common.none')}</SelectItem>
                                </>
                            ) : (
                                <>
                                    <SelectItem value="slideDown">Slide ↓</SelectItem>
                                    <SelectItem value="slideUp">Slide ↑</SelectItem>
                                    <SelectItem value="fadeIn">{t('editor.animation.fade')}</SelectItem>
                                    <SelectItem value="none">{t('common.none')}</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Exit Animation */}
                <div className="flex items-center justify-between">
                    <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.animation_out')}</Label>
                    <Select
                        value={animation?.exit || (isModal ? 'scaleOut' : 'slideUp')}
                        onValueChange={(value) => setAnimation('exit', value)}
                    >
                        <SelectTrigger className="h-[30px] w-20 text-[12px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {isModal ? (
                                <>
                                    <SelectItem value="scaleOut">{t('editor.animation.scale')}</SelectItem>
                                    <SelectItem value="fadeOut">{t('editor.animation.fade')}</SelectItem>
                                    <SelectItem value="none">{t('common.none')}</SelectItem>
                                </>
                            ) : (
                                <>
                                    <SelectItem value="slideUp">Slide ↑</SelectItem>
                                    <SelectItem value="slideDown">Slide ↓</SelectItem>
                                    <SelectItem value="fadeOut">{t('editor.animation.fade')}</SelectItem>
                                    <SelectItem value="none">{t('common.none')}</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};
