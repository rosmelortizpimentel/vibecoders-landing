import { cn } from '@/lib/utils';

interface CardStyleSelectorProps {
  value: string;
  onChange: (style: string) => void;
}

const CARD_STYLES = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Limpio y sin distracciones',
    previewClass: 'border border-border bg-card',
  },
  {
    id: 'elevated',
    label: 'Elevado',
    description: 'Con sombra sutil',
    previewClass: 'border-0 bg-card shadow-lg',
  },
  {
    id: 'outlined',
    label: 'Bordeado',
    description: 'Borde más pronunciado',
    previewClass: 'border-2 border-foreground/20 bg-card',
  },
];

export function CardStyleSelector({ value, onChange }: CardStyleSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {CARD_STYLES.map(style => (
        <button
          key={style.id}
          type="button"
          onClick={() => onChange(style.id)}
          className={cn(
            'p-4 rounded-lg border-2 transition-all text-left',
            value === style.id
              ? 'border-primary bg-primary/5'
              : 'border-transparent bg-muted/30 hover:bg-muted/50'
          )}
        >
          {/* Preview Card */}
          <div className={cn('w-full h-16 rounded-md mb-3', style.previewClass)}>
            <div className="p-2">
              <div className="w-8 h-1.5 bg-foreground/30 rounded mb-1" />
              <div className="w-12 h-1 bg-foreground/20 rounded" />
            </div>
          </div>
          
          <p className="font-medium text-sm">{style.label}</p>
          <p className="text-xs text-muted-foreground">{style.description}</p>
        </button>
      ))}
    </div>
  );
}
