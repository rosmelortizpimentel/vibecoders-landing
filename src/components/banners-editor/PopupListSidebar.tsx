import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { type Popup } from "@/hooks/usePopups";
import { useLanguage } from "@/contexts/LanguageContext";
import { PopupNavigatorItem } from "./PopupNavigatorItem";
import { GlobalBrandingPopover } from "./GlobalBrandingModal";
import { DomainScrape, BrandingOverrides } from "@/hooks/useDomainBranding";
import { useIsMobile } from "@/hooks/use-mobile";

interface PopupListSidebarProps {
  popups: Popup[] | undefined;
  selectedPopupId: string | null;
  onSelectPopup: (id: string | null) => void;
  onCreatePopup: () => void;
  onToggleActive: (popupId: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDeletePopup: (popupId: string, e?: React.MouseEvent) => void;
  onRenamePopup?: (popupId: string, newName: string) => void;
  // Branding props
  domainScrape: DomainScrape | null | undefined;
  brandingOverrides: BrandingOverrides | null;
  onSaveBranding: (overrides: BrandingOverrides) => void;
  isSavingBranding: boolean;
  // Project info for resources
  projectId?: string;
  projectDomain?: string;
  // Resize props
  width?: number;
  onStartResize?: (e: React.MouseEvent) => void;
  // Callback when branding modal opens (for closing parent sheet on mobile)
  onBrandingOpen?: () => void;
  // Callback to request opening the mobile branding drawer (kept outside the sheet)
  onRequestBrandingOpen?: () => void;
}

export const PopupListSidebar = ({
  popups,
  selectedPopupId,
  onSelectPopup,
  onCreatePopup,
  onToggleActive,
  onDeletePopup,
  onRenamePopup,
  domainScrape,
  brandingOverrides,
  onSaveBranding,
  isSavingBranding,
  projectId,
  projectDomain,
  width = 180,
  onStartResize,
  onBrandingOpen,
  onRequestBrandingOpen,
}: PopupListSidebarProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter popups by search query
  const filteredPopups = popups?.filter((popup) => popup.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <aside
      className="bg-card border-r border-border flex flex-col h-full flex-shrink-0 relative"
      style={width ? { width, minWidth: 180 } : undefined}
    >
      {/* Logo at Top - Clickable to go to Dashboard */}
      {/* Header with New Banner Button */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <Button
          variant="default"
          className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm flex items-center justify-center gap-2 rounded-xl"
          onClick={onCreatePopup}
          title={t("editor.sidebar.create_popup")}
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-semibold">{t("editor.sidebar.create_popup")}</span>
        </Button>
      </div>

      {/* Search/Filter Input */}
      <div className="px-3 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("dashboard.search_popups")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs bg-background border-border"
          />
        </div>
      </div>

      {/* Popup List */}
      <ScrollArea className="flex-1">
        {filteredPopups?.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground mb-3">{t("editor.sidebar.no_popups")}</p>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={onCreatePopup}>
              {t("editor.sidebar.create_popup")}
            </Button>
          </div>
        ) : (
          <div className="py-1">
            {filteredPopups?.map((popup) => (
              <PopupNavigatorItem
                key={popup.id}
                popup={popup}
                isSelected={selectedPopupId === popup.id}
                onSelect={() => onSelectPopup(popup.id)}
                onToggleActive={onToggleActive}
                onDelete={onDeletePopup}
                onRename={onRenamePopup}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Branding at Bottom */}
      <div className="p-2 border-t border-border">
        {isMobile ? (
          <Button
            variant="outline"
            className="w-full h-8 text-xs gap-2 justify-start"
            onClick={() => {
              onBrandingOpen?.();
              onRequestBrandingOpen?.();
            }}
          >
            <Palette className="w-3.5 h-3.5" />
            {t("branding.branding")}
          </Button>
        ) : (
          <GlobalBrandingPopover
            domainScrape={domainScrape}
            currentOverrides={brandingOverrides}
            onSave={onSaveBranding}
            isSaving={isSavingBranding}
            projectId={projectId}
            projectDomain={projectDomain}
          />
        )}
      </div>

      {/* Resize Handle */}
      {onStartResize && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 transition-colors"
          onMouseDown={onStartResize}
        />
      )}
    </aside>
  );
};
