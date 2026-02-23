import { useState, useRef, useEffect, useMemo } from "react";
import { Square, Minus, MoreHorizontal, Trash2, Power, Pencil, Clock } from "lucide-react";
import { type Popup } from "@/hooks/usePopups";
import { format } from "date-fns";
import { es, fr, ptBR } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface PopupNavigatorItemProps {
  popup: Popup;
  isSelected: boolean;
  onSelect: () => void;
  onToggleActive: (popupId: string, currentActive: boolean, e?: React.MouseEvent) => void;
  onDelete: (popupId: string, e?: React.MouseEvent) => void;
  onRename?: (popupId: string, newName: string) => void;
}

export const PopupNavigatorItem = ({
  popup,
  isSelected,
  onSelect,
  onToggleActive,
  onDelete,
  onRename,
}: PopupNavigatorItemProps) => {
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(popup.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const isModal = popup.config?.type === 'modal';

  // Check if popup is scheduled
  const scheduling = popup.rules?.scheduling;
  const isScheduled = scheduling?.enabled && scheduling?.startAt && scheduling?.endAt;

  // Format schedule tooltip in user-friendly format
  const scheduleTooltip = useMemo(() => {
    if (!isScheduled || !scheduling?.startAt || !scheduling?.endAt) return '';
    try {
      const startDate = new Date(scheduling.startAt);
      const endDate = new Date(scheduling.endAt);
      const locale = language === 'es' ? es : language === 'fr' ? fr : language === 'pt' ? ptBR : undefined;
      const startStr = format(startDate, 'MMM d, h:mm a', locale ? { locale } : undefined);
      const endStr = format(endDate, 'MMM d, h:mm a', locale ? { locale } : undefined);
      return `${startStr} → ${endStr}`;
    } catch {
      return t('editor.popup.scheduled');
    }
  }, [isScheduled, scheduling?.startAt, scheduling?.endAt, language, t]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Position cursor at end of text instead of selecting all
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  // Sync editName when popup.name changes (after save/refresh)
  useEffect(() => {
    setEditName(popup.name);
  }, [popup.name]);

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== popup.name && onRename) {
      onRename(popup.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(popup.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors group cursor-pointer ${isSelected
        ? 'bg-foreground text-background'
        : 'hover:bg-muted/50'
        }`}
    >
      {/* Status Dot - Matte colors with black borders */}
      {/* Switch Toggle */}
      <div onClick={(e) => e.stopPropagation()} className="flex mr-1">
        <Switch
          checked={popup.is_active}
          onCheckedChange={() => onToggleActive(popup.id, popup.is_active)}
          className={`scale-75 ${isSelected ? 'data-[state=unchecked]:bg-muted' : ''}`}
        />
      </div>

      {/* Name - Editable */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-medium flex-1 max-w-[90px] bg-background text-foreground px-1 py-0.5 rounded border border-border outline-none"
        />
      ) : (
        <span
          className="text-xs font-medium truncate flex-1 max-w-[90px]"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {popup.name}
        </span>
      )}

      {/* Scheduled Indicator */}
      {isScheduled && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Clock className={`w-3 h-3 flex-shrink-0 ${isSelected ? 'text-background/70' : 'text-blue-500'}`} />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {scheduleTooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'hover:bg-background/10' : 'hover:bg-muted'
              }`}
          >
            <MoreHorizontal className="w-3 h-3" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Pencil className="w-3 h-3 mr-2" />
            {t('editor.popup.rename')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(popup.id, popup.is_active);
            }}
          >
            <Power className="w-3 h-3 mr-2" />
            {popup.is_active ? t('editor.popup.deactivate') : t('editor.popup.activate')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(popup.id, e as unknown as React.MouseEvent);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-3 h-3 mr-2" />
            {t('editor.popup.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};