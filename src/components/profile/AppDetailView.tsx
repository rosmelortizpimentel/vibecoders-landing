import * as React from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { PublicApp } from '@/hooks/usePublicProfile';
import { ProjectDNA } from '@/components/ProjectDNA';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BadgeCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { FounderCard } from './FounderCard';

interface AppDetailViewProps {
  apps: PublicApp[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  defaultOwner?: {
    id: string;
    username: string;
    name: string | null;
    avatar_url: string | null;
    tagline: string | null;
  };
}

interface Contributor {
  id: string;
  user_id: string;
  profile: {
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
}

export function AppDetailView({ apps, selectedIndex, onClose, onNavigate, defaultOwner }: AppDetailViewProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation('publicProfile');
  const [screenshotIndex, setScreenshotIndex] = React.useState(0);
  const [contributors, setContributors] = React.useState<Contributor[]>([]);
  const [loadingContributors, setLoadingContributors] = React.useState(false);

  // Fetch contributors when app changes
  React.useEffect(() => {
    if (selectedIndex === null) return;
    const app = apps[selectedIndex];
    
    const fetchContributors = async () => {
      setLoadingContributors(true);
      const { data, error } = await supabase
        .from('beta_testers')
        .select(`
          id,
          user_id,
          profile:profiles!beta_testers_user_id_fkey(username, name, avatar_url)
        `)
        .eq('app_id', app.id)
        .eq('status', 'accepted');
        
      if (!error && data) {
        // Transform data to match interface if needed (Supabase returns array or object)
        setContributors(data as unknown as Contributor[]);
      } else {
        setContributors([]);
      }
      setLoadingContributors(false);
    };

    fetchContributors();
  }, [selectedIndex, apps]);
  React.useEffect(() => {
    if (selectedIndex === null) return;
    const app = apps[selectedIndex];
    if (!app.screenshots || app.screenshots.length <= 1) return;

    const interval = setInterval(() => {
      setScreenshotIndex(prev => (prev + 1) % app.screenshots!.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedIndex, apps]);

  // Reset index when app changes
  React.useEffect(() => {
    setScreenshotIndex(0);
  }, [selectedIndex]);
  
  if (selectedIndex === null) return null;
  
  const currentApp = apps[selectedIndex];
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (selectedIndex + 1) % apps.length;
    onNavigate(nextIndex);
  };
  
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (selectedIndex - 1 + apps.length) % apps.length;
    onNavigate(prevIndex);
  };

  const appUrl = (() => {
    try {
      const normalized = currentApp.url.trim();
      const urlWithProtocol = normalized.startsWith('http://') || normalized.startsWith('https://') 
        ? normalized 
        : `https://${normalized}`;
      const url = new URL(urlWithProtocol);
      url.searchParams.set('ref', 'vibecoders.la');
      return url.toString();
    } catch {
      return currentApp.url;
    }
  })();

  const content = (
    <div className="flex flex-col h-full bg-white">
      {/* Hero / Background Carousel */}
      <div 
        className="relative w-full aspect-video overflow-hidden"
        style={{ 
          backgroundColor: currentApp.screenshots && currentApp.screenshots.length > 0 
            ? '#1c1c1c' 
            : (currentApp.id.charCodeAt(0) % 2 === 0 ? '#485FC7' : '#69CF95')
        }}
      >
        {currentApp.screenshots && currentApp.screenshots.length > 0 ? (
          <div className="absolute inset-0 w-full h-full">
            {currentApp.screenshots.map((url, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out transform ${
                  idx === screenshotIndex ? 'opacity-40 scale-105' : 'opacity-0 scale-100'
                }`}
              >
                <img 
                  src={url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
        
        {/* Logo Overlay - Centered normally, or at bottom edge if screenshots exist */}
        <div className={`absolute inset-x-0 flex justify-center ${
          currentApp.screenshots && currentApp.screenshots.length > 0 
            ? 'bottom-0 translate-y-1/2' 
            : 'inset-y-0 items-center'
        }`}>
          <div className="relative group">
            <div className="p-1.5 bg-white rounded-2xl shadow-xl">
              {currentApp.logo_url ? (
                <img 
                  src={currentApp.logo_url} 
                  alt={currentApp.name || ''} 
                  className="w-20 h-20 rounded-xl object-cover animate-in zoom-in duration-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-300">
                    {currentApp.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 flex-1 overflow-y-auto ${
        currentApp.screenshots && currentApp.screenshots.length > 0 ? 'pt-14' : ''
      }`}>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {currentApp.name}
            </h2>
            {currentApp.is_verified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BadgeCheck className="h-6 w-6 text-primary flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {t('verifiedOwner')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <p className="text-gray-500 font-medium leading-relaxed mb-3 max-w-[90%]">
            {currentApp.tagline}
          </p>

          {currentApp.category && (
            <div className="mb-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {currentApp.category.name}
              </span>
            </div>
          )}

          {currentApp.description && (
            <div className="text-sm text-gray-600 mb-8 leading-relaxed max-w-full text-left w-full border-t border-gray-50 pt-6">
              <p className="whitespace-pre-wrap">{currentApp.description}</p>
            </div>
          )}
        </div>


        {/* Project DNA Section */}
        {(currentApp.hours_ideation > 0 || currentApp.hours_building > 0) && (
          <div className="mb-8 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              {t('projectDNA')}
            </h3>
            <ProjectDNA 
              ideationHours={currentApp.hours_ideation} 
              buildHours={currentApp.hours_building}
              className="h-2 mb-4"
            />
            <div className={`grid gap-4 ${currentApp.hours_ideation > 0 && currentApp.hours_building > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {currentApp.hours_ideation > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('ideation')}</p>
                  <p className="text-lg font-bold text-gray-900">{currentApp.hours_ideation}h</p>
                </div>
              )}
              {currentApp.hours_building > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('construction')}</p>
                  <p className="text-lg font-bold text-gray-900">{currentApp.hours_building}h</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentApp.stacks.map(stack => (
              <div 
                key={stack.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm"
              >
                <img src={stack.logo_url} alt={stack.name} className="w-4 h-4 object-contain" />
                <span className="text-xs font-medium text-gray-700">{stack.name}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Footer CTA */}
        {contributors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              CONTRIBUIDORES
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {contributors.map((tester) => (
                <TooltipProvider key={tester.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href={`/@${tester.profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-transform hover:scale-110 block"
                      >
                       <Avatar className="w-8 h-8 border-2 border-white shadow-sm ring-1 ring-gray-100">
                         <AvatarImage src={tester.profile.avatar_url || undefined} />
                         <AvatarFallback className="text-[10px] bg-gray-100 text-gray-500 font-bold">
                           {(tester.profile.name || 'U').charAt(0).toUpperCase()}
                         </AvatarFallback>
                       </Avatar>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-center p-2">
                      <p className="font-bold text-xs">{tester.profile.name}</p>
                      <p className="text-[10px] text-muted-foreground">@{tester.profile.username}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
        
        {/* Founder Card */}
        {(() => {
          const owner = currentApp.owner || (defaultOwner ? {
            id: defaultOwner.id,
            username: defaultOwner.username,
            full_name: defaultOwner.name || '',
            avatar_url: defaultOwner.avatar_url,
            tagline: defaultOwner.tagline
          } : null);

          if (!owner) return null;

          return (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                FOUNDER
              </h3>
              <FounderCard profile={owner} />
            </div>
          );
        })()}
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-gray-100 bg-white md:sticky bottom-0">
        <Button 
          asChild 
          className="w-full h-12 text-base font-semibold bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/90 rounded-xl"
        >
          <a href={appUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
            {t('visitWebsite')}
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="p-0 border-none max-w-none w-screen h-[100dvh] flex flex-col sm:rounded-none overflow-hidden">
          <DialogHeader className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-14 flex flex-row items-center justify-between px-4 sm:px-4 space-y-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full w-10 h-10 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <DialogTitle className="text-sm font-bold truncate max-w-[200px]">
              {currentApp.name}
            </DialogTitle>

            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrev}
                className="rounded-full w-10 h-10 hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNext}
                className="rounded-full w-10 h-10 hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-14 pb-20">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={selectedIndex !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 sm:max-w-md border-l-gray-100">
        <SheetHeader className="sr-only">
          <SheetTitle>{currentApp.name}</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
