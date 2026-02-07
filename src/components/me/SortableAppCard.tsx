import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppData } from '@/hooks/useApps';
import { AppCard } from './AppCard';

interface SortableAppCardProps {
  app: AppData;
  onExpand: () => void;
  onToggleVisibility: () => void;
   onVerify: () => void;
}

 export function SortableAppCard({ app, onExpand, onToggleVisibility, onVerify }: SortableAppCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AppCard
        app={app}
        onExpand={onExpand}
        onToggleVisibility={onToggleVisibility}
        onVerify={onVerify}
        dragHandleProps={{ ...listeners, ref: setActivatorNodeRef }}
      />
    </div>
  );
}
