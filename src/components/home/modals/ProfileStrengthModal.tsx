import { ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ProfileStrengthModalProps {
  isOpen: boolean;
  onClose: () => void;
  strength: number;
}

export function ProfileStrengthModal({ isOpen, onClose, strength }: ProfileStrengthModalProps) {
  // Common profile strength items (Simplified logic for visualization)
  const items = [
    { label: 'Información básica', completed: true },
    { label: 'Foto de perfil', completed: true },
    { label: 'Banner personalizado', completed: strength > 40 },
    { label: 'Redes sociales vinculadas', completed: strength > 70 },
    { label: 'Bio detallada', completed: strength > 90 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-xl font-bold">Fortaleza del Perfil</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Progreso actual</span>
              <span className="text-primary font-bold">{Math.round(strength)}%</span>
            </div>
            <Progress value={strength} className="h-2" />
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Checklist de optimización
            </h4>
            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <span className={item.completed ? 'text-sm font-medium text-foreground' : 'text-sm text-muted-foreground'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/50 border-t border-border flex justify-end">
          <Button onClick={onClose} size="sm">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
