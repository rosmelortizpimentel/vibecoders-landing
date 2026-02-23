import { Square, MoreHorizontal, Trash2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Popup } from "@/hooks/usePopups";

interface PopupsListProps {
  popups: Popup[] | undefined;
  selectedPopupId: string | null;
  onSelect: (id: string) => void;
  onToggleActive: (id: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onCreateNew: () => void;
  isCreating: boolean;
}

export const PopupsList = ({
  popups,
  selectedPopupId,
  onSelect,
  onToggleActive,
  onDelete,
  onCreateNew,
  isCreating,
}: PopupsListProps) => {
  const isEmpty = !popups || popups.length === 0;

  return (
    <>
      <div className="panel-section flex items-center justify-between">
        <span className="panel-label">Popups</span>
        <button
          onClick={onCreateNew}
          className={`p-1.5 rounded-[4px] transition-all ${isEmpty
              ? "bg-primary text-primary-foreground animate-pulse hover:bg-primary/90"
              : "hover:bg-accent"
            }`}
          disabled={isCreating}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {popups?.map((popup) => (
          <div
            key={popup.id}
            onClick={() => onSelect(popup.id)}
            className={`nav-item group ${selectedPopupId === popup.id ? "nav-item-active" : ""}`}
          >
            <Square className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span className="truncate flex-1">{popup.name}</span>
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 border border-black ${popup.is_active ? "bg-green-600" : "bg-red-600"}`} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="p-0.5 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={(e) => onToggleActive(popup.id, popup.is_active, e as unknown as React.MouseEvent)}>
                  {popup.is_active ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => onDelete(popup.id, e as unknown as React.MouseEvent)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        {(!popups || popups.length === 0) && (
          <p className="text-[11px] text-muted-foreground text-center py-4">
            No popups yet. Create one to get started.
          </p>
        )}
      </div>
    </>
  );
};
