import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Search, Trophy, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likesByApp: Record<string, { name: string, count: number }>;
}

export function LikesModal({
  isOpen,
  onClose,
  likesByApp
}: LikesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const appList = Object.values(likesByApp).sort((a, b) => b.count - a.count);
  const filteredApps = appList.filter(app => 
    app.count > 0 && app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalLikes = appList.reduce((acc, current) => acc + current.count, 0);
  const maxLikes = Math.max(...appList.map(a => a.count), 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-full h-[100dvh] sm:h-auto p-0 overflow-hidden sm:rounded-2xl rounded-none border-none shadow-2xl flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 bg-gray-50/50 border-b border-gray-100 shrink-0">
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Tabla de Posiciones de Likes
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          {/* Top Performer Highlight */}
          {appList.length > 0 && appList[0].count > 0 && (
            <div className="p-4 bg-gradient-to-br from-indigo-50/30 to-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-0.5">Mejor Desempeño</p>
                  <p className="text-base font-bold text-gray-900 leading-tight">{appList[0].name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-primary leading-none">{appList[0].count}</span>
                <p className="text-[9px] font-bold text-primary uppercase mt-0.5">Likes</p>
              </div>
            </div>
          )}

          {/* List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Ranking de Proyectos</h3>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredApps.length > 0 ? (
                filteredApps.map((app, idx) => {
                  const isTop = idx === 0 && app.count > 0;
                  return (
                    <div key={idx} className="p-4 bg-card hover:bg-muted/30 rounded-lg border border-transparent hover:border-border transition-all group relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-muted-foreground w-4">#{idx + 1}</span>
                             <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{app.name}</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <span className="text-sm font-bold text-foreground">{app.count}</span>
                             <Heart className={cn("w-3 h-3 transition-colors", isTop ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary")} />
                           </div>
                        </div>
                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                          <div 
                             className={cn(
                               "h-full rounded-full transition-all duration-700",
                               isTop ? "bg-primary" : "bg-primary/40 group-hover:bg-primary/60"
                             )}
                             style={{ width: `${(app.count / maxLikes) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No projects found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center rotate-0">
           <span className="text-xs font-medium text-muted-foreground">Total de likes en la plataforma</span>
           <span className="text-sm font-bold text-foreground">{totalLikes}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
