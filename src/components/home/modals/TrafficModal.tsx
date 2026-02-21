import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Search, Monitor, AppWindow } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface TrafficModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileViews: number;
  appClicks: number;
  clicksByApp: Record<string, { name: string, count: number }>;
}

export function TrafficModal({
  isOpen,
  onClose,
  profileViews,
  appClicks,
  clicksByApp
}: TrafficModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const totalViews = profileViews + appClicks;
  const appList = Object.values(clicksByApp).sort((a, b) => b.count - a.count);
  const filteredApps = appList.filter(app => 
    app.count > 0 && app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Find max clicks to calculate relative progress
  const maxClicks = Math.max(...appList.map(a => a.count), 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-full h-[100dvh] sm:h-auto p-0 overflow-hidden sm:rounded-2xl rounded-none border-none shadow-2xl flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 bg-gray-50/50 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" />
            Desglose de Tráfico
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Monitor className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Vistas de Perfil</span>
              </div>
              <p className="text-xl font-bold text-foreground leading-none">{profileViews}</p>
              <Progress value={(profileViews / totalViews) * 100} className="h-1 mt-2 bg-muted transition-all" />
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <AppWindow className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Clics en Apps</span>
              </div>
              <p className="text-xl font-bold text-foreground leading-none">{appClicks}</p>
              <Progress value={(appClicks / totalViews) * 100} className="h-1 mt-2 bg-muted transition-all" />
            </div>
          </div>

          {/* App List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Clics por Proyecto</h3>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredApps.length > 0 ? (
                filteredApps.map((app, idx) => (
                  <div key={idx} className="p-3 bg-card hover:bg-muted/30 rounded-lg border border-transparent hover:border-border transition-all group">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{app.name}</span>
                       <span className="text-sm font-bold text-foreground">{app.count} <span className="text-[10px] font-medium text-muted-foreground uppercase ml-0.5">clicks</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-primary/60 rounded-full group-hover:bg-primary transition-all duration-700"
                           style={{ width: `${(app.count / maxClicks) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">
                        {Math.round((app.count / (appClicks || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No apps found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
