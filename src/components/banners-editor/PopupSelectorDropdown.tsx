import { ChevronDown, Plus, MoreHorizontal, Power, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Popup } from "@/hooks/usePopups";

interface PopupSelectorDropdownProps {
  popups: Popup[] | undefined;
  selectedPopupId: string | null;
  onSelectPopup: (id: string) => void;
  onCreatePopup: () => void;
  onToggleActive: (popupId: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDeletePopup: (popupId: string, e?: React.MouseEvent) => void;
  currentPopupName?: string;
}

export const PopupSelectorDropdown = ({
  popups,
  selectedPopupId,
  onSelectPopup,
  onCreatePopup,
  onToggleActive,
  onDeletePopup,
  currentPopupName,
}: PopupSelectorDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 h-8 px-3 text-sm font-medium rounded-md border border-border bg-card hover:bg-accent transition-colors">
          <span className="truncate max-w-[150px]">{currentPopupName || "Select popup"}</span>
          <ChevronDown className="w-4 h-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-card border border-border">
        {popups && popups.length > 0 ? (
          <>
            {popups.map((popup) => (
              <DropdownMenuItem
                key={popup.id}
                className={`flex items-center justify-between cursor-pointer ${popup.id === selectedPopupId ? 'bg-accent' : ''
                  }`}
                onClick={() => onSelectPopup(popup.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${popup.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  <span className="truncate">{popup.name}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-card border border-border">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleActive(popup.id, popup.is_active, e as unknown as React.MouseEvent);
                      }}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      {popup.is_active ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePopup(popup.id, e as unknown as React.MouseEvent);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem onClick={onCreatePopup} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Create new popup
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
