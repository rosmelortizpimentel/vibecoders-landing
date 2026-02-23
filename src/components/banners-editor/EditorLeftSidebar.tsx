import { Code } from "lucide-react";
import { PopupsList } from "./PopupsList";
import { BrandingSection } from "@/components/BrandingSection";
import { type Popup } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";

interface EditorLeftSidebarProps {
  projectId: string | undefined;
  projectDomain: string | undefined;
  projectBrandingOverrides: BrandingOverrides | null;
  popups: Popup[] | undefined;
  selectedPopupId: string | null;
  onSelectPopup: (id: string) => void;
  onToggleActive: (id: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDeletePopup: (id: string, e?: React.MouseEvent) => void;
  onCreatePopup: () => void;
  isCreatingPopup: boolean;
  onOpenScriptModal: () => void;
  width?: number;
  onStartResize?: (e: React.MouseEvent) => void;
}

export const EditorLeftSidebar = ({
  projectId,
  projectDomain,
  projectBrandingOverrides,
  popups,
  selectedPopupId,
  onSelectPopup,
  onToggleActive,
  onDeletePopup,
  onCreatePopup,
  isCreatingPopup,
  onOpenScriptModal,
  width = 220,
  onStartResize,
}: EditorLeftSidebarProps) => {
  return (
    <aside
      className="bg-surface border-r border-border flex flex-col relative"
      style={{ width, minWidth: 220 }}
    >
      {/* Install Script Button */}
      <div className="p-3 border-b border-border">
        <button
          onClick={onOpenScriptModal}
          className="w-full h-8 text-xs font-medium rounded-[4px] bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <Code className="w-3.5 h-3.5" strokeWidth={1.5} />
          Install Script
        </button>
      </div>

      {/* Popups List */}
      <PopupsList
        popups={popups}
        selectedPopupId={selectedPopupId}
        onSelect={onSelectPopup}
        onToggleActive={onToggleActive}
        onDelete={onDeletePopup}
        onCreateNew={onCreatePopup}
        isCreating={isCreatingPopup}
      />

      {/* Branding Section - always rendered to avoid hook order issues */}
      <div className="p-3 border-t border-border">
        <BrandingSection
          projectId={projectId}
          domain={projectDomain}
          currentOverrides={projectBrandingOverrides}
        />
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
