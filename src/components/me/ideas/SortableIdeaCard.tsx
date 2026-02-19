import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Idea } from './IdeaDetail';

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '');
}

interface SortableIdeaCardProps {
  idea: Idea;
  getDaysTag: (createdAt: string) => string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string, newDone: boolean) => void;
  t: (key: string) => string;
  isDragDisabled?: boolean;
}

export function SortableIdeaCard({
  idea,
  getDaysTag,
  onSelect,
  onDelete,
  onToggleDone,
  t,
  isDragDisabled = false,
}: SortableIdeaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDone = idea.is_done || false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border p-3 transition-all",
        isDragging && "z-50 shadow-xl opacity-80 ring-2 ring-primary/30",
        isDone
          ? "bg-muted/30 border-border/50"
          : "bg-amber-50/50 dark:bg-amber-950/20 border-border hover:shadow-md"
      )}
    >
      {/* Drag handle - top left on hover */}
      {!isDragDisabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}

      {/* Top row: title + days badge */}
      <div className="flex items-start gap-2 mb-1.5 pl-4 group-hover:pl-5 transition-all">
        <h3 className={cn(
          "flex-1 font-bold text-xs leading-tight line-clamp-1",
          isDone && "line-through opacity-60"
        )}>
          {idea.title}
        </h3>
        {idea.created_at && !isDone && (
          <Badge 
            variant="outline" 
            className="shrink-0 text-[9px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-border"
          >
            {getDaysTag(idea.created_at)}
          </Badge>
        )}
      </div>

      {/* Description */}
      {idea.description && (
        <p className={cn(
          "text-xs text-muted-foreground whitespace-pre-line line-clamp-5 leading-relaxed",
          isDone && "opacity-50"
        )}>
          {stripMarkdown(idea.description)}
        </p>
      )}

      {/* Hover actions: checkbox left, edit/delete right */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Toggle done checkbox */}
        <button
          className={cn(
            "shrink-0 rounded-full border-2 w-5 h-5 flex items-center justify-center transition-all",
            isDone
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/80"
              : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10"
          )}
          onClick={() => onToggleDone(idea.id, !isDone)}
          title={isDone ? t('ideas.markPending') : t('ideas.markDone')}
        >
          {isDone && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
          )}
        </button>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-accent"
            onClick={() => onSelect(idea.id)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(idea.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
