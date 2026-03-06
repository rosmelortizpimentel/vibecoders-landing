import { useEffect, useRef } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSection {
  id: string;
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  visible?: boolean;
}

interface FiltersBottomSheetProps {
  open: boolean;
  onClose: () => void;
  sections: FilterSection[];
  onApply: () => void;
  onClear: () => void;
}

export function FiltersBottomSheet({ open, onClose, sections, onApply, onClear }: FiltersBottomSheetProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const visibleSections = sections.filter(s => s.visible !== false);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-200 ease-out max-h-[80vh] flex flex-col",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle + Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-[#eee]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-base font-bold text-foreground">Filtros</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {visibleSections.map((section) => (
            <div key={section.id}>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{section.label}</p>
              <div className="flex flex-wrap gap-2">
                {section.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => section.onChange(opt.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      section.value === opt.id
                        ? "bg-[#68CF94] text-[#1C1C1C] border-[#68CF94]"
                        : "bg-white text-[#1C1C1C]/60 border-[#e5e5e5] hover:bg-muted/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-[#eee]">
          <button
            onClick={() => { onClear(); }}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-muted/60 hover:bg-muted transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={() => { onApply(); onClose(); }}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#68CF94] hover:opacity-90 transition-opacity"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </>
  );
}
