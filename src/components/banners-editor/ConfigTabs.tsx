import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Palette, Settings2, Play, Save, Loader2 } from "lucide-react";
import { type PopupConfig, type PopupRules } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { ContentAccordion } from "./ContentAccordion";
import { ImageAccordion } from "./ImageAccordion";
import { ButtonsAccordion } from "./ButtonsAccordion";
import { AppearanceAccordion } from "./AppearanceAccordion";
import { BehaviorAccordion } from "./BehaviorAccordion";
import { RulesTriggersAccordion } from "./RulesTriggersAccordion";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfigTabsProps {
    designConfig: PopupConfig;
    setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
    rulesConfig: PopupRules;
    setRulesConfig: React.Dispatch<React.SetStateAction<PopupRules>>;
    brandingOverrides?: BrandingOverrides | null;
    projectId?: string;
    projectDomain?: string;
    onPreview?: () => void;
    onSave?: (silent?: boolean) => Promise<boolean>;
    isSaving?: boolean;
}

export const ConfigTabs = ({
    designConfig,
    setDesignConfig,
    rulesConfig,
    setRulesConfig,
    brandingOverrides,
    projectId,
    projectDomain,
    onPreview,
    onSave,
    isSaving,
}: ConfigTabsProps) => {
    const { t } = useLanguage();

    return (
        <Tabs defaultValue="design" className="h-full flex flex-col">
            <TabsList className="w-full h-14 bg-transparent p-0 gap-0 grid grid-cols-4 border-b border-border rounded-none mx-0 mt-0" style={{ width: '100%' }}>
                <TabsTrigger
                    value="design"
                    className="flex-col gap-1 h-full py-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground transition-all hover:text-foreground"
                >
                    <Palette className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{t('editor.design')}</span>
                </TabsTrigger>
                <TabsTrigger
                    value="rules"
                    className="flex-col gap-1 h-full py-0 rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground transition-all hover:text-foreground"
                >
                    <Settings2 className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{t('editor.rules')}</span>
                </TabsTrigger>
                <button
                    onClick={onPreview}
                    className="flex flex-col items-center justify-center gap-1 h-full py-0 rounded-none bg-transparent text-muted-foreground transition-all hover:text-foreground hover:bg-muted/10 border-b-2 border-transparent"
                >
                    <Play className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{t('editor.preview')}</span>
                </button>
                <button
                    onClick={() => onSave?.(false)}
                    disabled={isSaving}
                    className="flex flex-col items-center justify-center gap-1 h-full py-0 rounded-none bg-transparent text-muted-foreground transition-all hover:text-foreground hover:bg-muted/10 border-b-2 border-transparent disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span className="text-[10px] font-medium">{t('editor.save')}</span>
                </button>
            </TabsList>

            <TabsContent value="design" className="flex-1 mt-0 overflow-hidden">
                <ScrollArea className="h-full">
                    {/* Content - always open, independent */}
                    <ContentAccordion
                        designConfig={designConfig}
                        setDesignConfig={setDesignConfig}
                        brandingOverrides={brandingOverrides}
                    />
                    {/* Other design accordions - only one open at a time */}
                    <Accordion type="single" collapsible className="w-full">
                        <ImageAccordion
                            designConfig={designConfig}
                            setDesignConfig={setDesignConfig}
                            projectId={projectId}
                            projectDomain={projectDomain}
                        />
                        <ButtonsAccordion
                            designConfig={designConfig}
                            setDesignConfig={setDesignConfig}
                            brandingOverrides={brandingOverrides}
                        />
                        <AppearanceAccordion
                            designConfig={designConfig}
                            setDesignConfig={setDesignConfig}
                            brandingOverrides={brandingOverrides}
                        />
                        <BehaviorAccordion
                            designConfig={designConfig}
                            setDesignConfig={setDesignConfig}
                        />
                    </Accordion>
                </ScrollArea>
            </TabsContent>

            <TabsContent value="rules" className="flex-1 mt-0 overflow-hidden">
                <ScrollArea className="h-full">
                    <Accordion type="multiple" defaultValue={["url"]} className="w-full">
                        <RulesTriggersAccordion
                            rulesConfig={rulesConfig}
                            setRulesConfig={setRulesConfig}
                            projectDomain={projectDomain}
                        />
                    </Accordion>
                </ScrollArea>
            </TabsContent>
        </Tabs>
    );
};
