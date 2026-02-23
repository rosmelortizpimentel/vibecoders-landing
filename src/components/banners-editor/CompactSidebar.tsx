import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Popup, type PopupConfig, type PopupRules } from "@/hooks/usePopups";
import { type BrandingOverrides, type DomainScrape } from "@/hooks/useDomainBranding";
import { GlobalBrandingPopover } from "./GlobalBrandingModal";
import { PopupNavigatorItem } from "./PopupNavigatorItem";
import { ContentLayoutAccordion } from "./ContentLayoutAccordion";
import { AppearanceAccordion } from "./AppearanceAccordion";
import { RulesTriggersAccordion } from "./RulesTriggersAccordion";
import { useLanguage } from "@/contexts/LanguageContext";

type LayoutType = "modal" | "bar";

interface CompactSidebarProps {
  // Project & Branding
  projectId: string | undefined;
  domainScrape: DomainScrape | null | undefined;
  brandingOverrides: BrandingOverrides | null;
  onSaveBranding: (overrides: BrandingOverrides) => void;
  isSavingBranding: boolean;
  // Popups List
  popups: Popup[] | undefined;
  selectedPopupId: string | null;
  onSelectPopup: (id: string | null) => void;
  onCreatePopup: () => void;
  onToggleActive: (popupId: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDeletePopup: (popupId: string, e?: React.MouseEvent) => void;
  // Active Popup Editor
  popupName: string;
  setPopupName: (name: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  designConfig: PopupConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
  layoutType: LayoutType;
  handleLayoutChange: (value: LayoutType) => void;
  rulesConfig: PopupRules;
  setRulesConfig: React.Dispatch<React.SetStateAction<PopupRules>>;
}

export const CompactSidebar = ({
  projectId,
  domainScrape,
  brandingOverrides,
  onSaveBranding,
  isSavingBranding,
  popups,
  selectedPopupId,
  onSelectPopup,
  onCreatePopup,
  onToggleActive,
  onDeletePopup,
  popupName,
  setPopupName,
  isActive,
  setIsActive,
  designConfig,
  setDesignConfig,
  layoutType,
  handleLayoutChange,
  rulesConfig,
  setRulesConfig,
}: CompactSidebarProps) => {
  const { t } = useLanguage();
  
  // Scrape status for visual indicator
  const scrapeStatus = domainScrape?.status;
  const isProcessing = scrapeStatus === 'processing' || scrapeStatus === 'pending';
  const isCompleted = scrapeStatus === 'completed';
  const isFailed = scrapeStatus === 'failed';

  return (
    <aside className="w-[280px] bg-card border-l border-border flex flex-col h-full">
      {/* ZONE A: Project Settings - Branding Popover */}
      <div className="p-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <GlobalBrandingPopover
              domainScrape={domainScrape}
              currentOverrides={brandingOverrides}
              onSave={onSaveBranding}
              isSaving={isSavingBranding}
              projectId={projectId}
              projectDomain={domainScrape?.domain}
            />
          </div>
          {/* Scrape Status Indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-6 h-6">
                  {isProcessing && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {isFailed && (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {isProcessing && t('branding.analyzing')}
                {isCompleted && t('branding.scrape_complete')}
                {isFailed && t('branding.scrape_failed')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* ZONE B: Popups Navigator */}
      <div className="border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">{t('editor.sidebar.popups')}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onCreatePopup}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <ScrollArea className="h-[160px]">
          {popups?.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">{t('editor.sidebar.no_popups')}</p>
              <Button variant="outline" size="sm" className="text-xs" onClick={onCreatePopup}>
                {t('editor.sidebar.create_popup')}
              </Button>
            </div>
          ) : (
            popups?.map(popup => (
              <PopupNavigatorItem
                key={popup.id}
                popup={popup}
                isSelected={selectedPopupId === popup.id}
                onSelect={() => onSelectPopup(popup.id)}
                onToggleActive={onToggleActive}
                onDelete={onDeletePopup}
              />
            ))
          )}
        </ScrollArea>
      </div>

      {/* ZONE C: Active Popup Editor */}
      {selectedPopupId ? (
        <ScrollArea className="flex-1">
          {/* Content section - always open, independent */}
          <ContentLayoutAccordion
            popupName={popupName}
            setPopupName={setPopupName}
            isActive={isActive}
            setIsActive={setIsActive}
            layoutType={layoutType}
            handleLayoutChange={handleLayoutChange}
            designConfig={designConfig}
            setDesignConfig={setDesignConfig}
            brandingOverrides={brandingOverrides}
          />
          {/* Other sections - only one open at a time */}
          <Accordion type="single" collapsible className="w-full">
            <AppearanceAccordion
              designConfig={designConfig}
              setDesignConfig={setDesignConfig}
              brandingOverrides={brandingOverrides}
            />
            <RulesTriggersAccordion
              rulesConfig={rulesConfig}
              setRulesConfig={setRulesConfig}
              projectDomain={domainScrape?.domain}
            />
          </Accordion>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground text-center">
            {t('editor.sidebar.select_popup')}
          </p>
        </div>
      )}
    </aside>
  );
};
