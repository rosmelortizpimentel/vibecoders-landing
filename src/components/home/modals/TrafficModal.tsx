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
        <DialogHeader className="px-6 pt-6 pb-4 bg-gray-50/50 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Traffic Breakdown
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Analysis of how users are interacting with your profile and projects.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Profile Views</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{profileViews}</p>
              <Progress value={(profileViews / totalViews) * 100} className="h-1 mt-2 bg-muted transition-all" />
            </div>
            <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <AppWindow className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">App Clicks</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{appClicks}</p>
              <Progress value={(appClicks / totalViews) * 100} className="h-1 mt-2 bg-muted transition-all" />
            </div>
          </div>

          {/* App List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Clicks by Project</h3>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search apps..."
                  className="pl-8 h-8 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

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
