import { X, ChevronLeft, ChevronRight, ExternalLink, Heart, Upload, ImageIcon, BadgeCheck, AlertCircle, Trash2, Calendar, LayoutTemplate, Zap, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { PublicApp } from '@/hooks/usePublicProfile';
import { parseMarkdown } from '@/lib/markdown';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getStatusColors } from '@/lib/appStatusColors';

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

interface Founder {
  id: string;
  user_id: string;
  role: string;
  profile: {
    id: string;
    username: string;
    name: string | null;
    avatar_url: string | null;
    tagline: string | null;
  };
}

export function AppDetailView({ apps, selectedIndex, onClose, onNavigate, defaultOwner }: AppDetailViewProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useTranslation('publicProfile');
  const { t: tPartner } = useTranslation('partnerships');
  const [screenshotIndex, setScreenshotIndex] = React.useState(0);
  const [contributors, setContributors] = React.useState<Contributor[]>([]);
  const [loadingContributors, setLoadingContributors] = React.useState(false);
  const [foundersList, setFoundersList] = React.useState<Founder[]>([]);
  const [loadingFounders, setLoadingFounders] = React.useState(false);

  // Fetch contributors when app changes
  React.useEffect(() => {
    if (selectedIndex === null) return;
    const app = apps[selectedIndex];
    
    const fetchContributors = async () => {
      setLoadingContributors(true);
      
      const { data: contributorsData } = await supabase
        .from('beta_testers')
        .select(`
          id,
          user_id,
          profile:profiles!beta_testers_user_id_fkey(username, name, avatar_url)
        `)
        .eq('app_id', app.id)
        .eq('status', 'accepted');

      if (contributorsData) {
        setContributors(contributorsData as unknown as Contributor[]);
      } else {
        setContributors([]);
      }

      setLoadingContributors(false);
    };

    const fetchFounders = async () => {
      setLoadingFounders(true);
      
      const { data: foundersData } = await supabase
        .from('app_founders')
        .select(`
          id,
          user_id,
          role,
          profile:profiles(id, username, name, avatar_url, tagline)
        `)
        .eq('app_id', app.id)
        .order('role', { ascending: false }); // 'owner' comes before 'co-founder'

      if (foundersData) {
        setFoundersList(foundersData);
      } else {
        setFoundersList([]);
      }

      setLoadingFounders(false);
    };

    fetchContributors();
    fetchFounders();
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

  const currentOnClose = () => {
    onClose();
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
    <div className="flex flex-col h-full bg-white relative">
      {/* Explicit Close Button for Desktop - High z-index to ensure clickability */}
      {!isMobile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            currentOnClose();
          }}
          className="absolute top-4 right-4 z-[70] w-10 h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all shadow-md border border-white/20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      {/* Hero / Background Carousel Section */}
      <div className="relative shrink-0">
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
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                    idx === screenshotIndex ? 'opacity-100' : 'opacity-0'
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
        </div>

        {/* Logo Overlay - Positioned over the boundary */}
        <div className={`absolute inset-x-0 flex justify-center z-10 ${
          currentApp.screenshots && currentApp.screenshots.length > 0 
            ? 'bottom-0 translate-y-1/2' 
            : 'top-0 h-full items-center'
        }`}>
          <div className="relative group">
            <div className={`p-1.5 bg-white rounded-full shadow-xl transition-transform duration-300 scale-100 ring-1 ring-black/5`}>
              {currentApp.logo_url ? (
                <img 
                  src={currentApp.logo_url} 
                  alt={currentApp.name || ''} 
                  className={`${
                    currentApp.screenshots && currentApp.screenshots.length > 0 
                      ? 'w-20 h-20' 
                      : 'w-32 h-32'
                  } rounded-full object-contain animate-in zoom-in duration-500`}
                />
              ) : (
                <div className={`${
                  currentApp.screenshots && currentApp.screenshots.length > 0 
                    ? 'w-20 h-20' 
                    : 'w-32 h-32'
                } rounded-full bg-gray-50 flex items-center justify-center`}>
                  <span className={`${
                    currentApp.screenshots && currentApp.screenshots.length > 0 
                      ? 'text-2xl' 
                      : 'text-4xl'
                  } font-bold text-gray-300`}>
                    {currentApp.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 flex-1 overflow-y-auto ${
        currentApp.screenshots && currentApp.screenshots.length > 0 ? 'pt-20' : ''
      }`}>
        <div className="flex flex-col items-center text-center">
          {/* Custom Badges Layer */}
          <div className="flex items-center gap-1.5 mb-3 justify-center">
            {currentApp.open_to_partnerships && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#00C853]/10 text-[#00C853] flex-shrink-0 cursor-help border border-[#00C853]/20">
                      <UserPlus className="w-2.5 h-2.5" />
                      Partnerships
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">
                      {currentApp.partnership_types?.map((type: string) => tPartner(`types.${type}`)).join(', ')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {currentApp.beta_active && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative group cursor-help flex-shrink-0">
                      <div className="absolute -inset-[1px] bg-indigo-500/30 rounded-full animate-ping opacity-75 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        <Zap className="w-3 h-3 fill-current" />
                        Open Beta
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-sm">{t('openBetaTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {currentApp.status && (() => {
              const statusColors = getStatusColors(currentApp.status.slug);
              return (
                <span 
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} flex-shrink-0`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusColors.dot}`} />
                  {currentApp.status.name.toUpperCase()}
                </span>
              );
            })()}
          </div>

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

          {currentApp.description && (
            <div 
              className="text-xs text-gray-500 mb-6 max-w-[90%] text-center leading-relaxed prose prose-sm dark:prose-invert italic"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(currentApp.description) }}
            />
          )}

          {currentApp.tags && currentApp.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {currentApp.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>



        {/* Tech Stack */}
        {currentApp.stacks.length > 0 && (
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
        )}
        {/* Contributors */}
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
        
        {/* Partnership section */}
        {currentApp.open_to_partnerships && (
          <div className="mb-8 p-6 bg-[#00C853]/5 border border-[#00C853]/10 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-[#00C853]/10 rounded-lg">
                <UserPlus className="w-4 h-4 text-[#00C853]" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {tPartner('detail.title')}
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              {tPartner('detail.description')}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {currentApp.partnership_types?.map((type: string) => (
                <span 
                  key={type}
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-[#00C853]/20 text-[#00C853] shadow-sm"
                >
                  {tPartner(`types.${type}`)}
                </span>
              ))}
            </div>

            <Button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chat?user=${currentApp.owner?.id}`);
              }}
              className="w-full bg-[#00C853] hover:bg-[#00C853]/90 text-white rounded-xl h-11 text-sm font-bold shadow-md shadow-[#00C853]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {tPartner('detail.contactButton')}
            </Button>
          </div>
        )}

        {/* Founders Section */}
        {foundersList.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              {foundersList.length > 1 ? t('founders') : t('founder')}
            </h3>
            <div className="space-y-4">
              {foundersList.map((founder) => (
                <FounderCard 
                  key={founder.id} 
                  profile={{
                    id: founder.profile.id,
                    username: founder.profile.username,
                    full_name: founder.profile.name || founder.profile.username || 'Unknown',
                    avatar_url: founder.profile.avatar_url,
                    tagline: founder.profile.tagline
                  }} 
                />
              ))}
            </div>
          </div>
        ) : (
          /* Fallback to defaultOwner if foundersList is not yet loaded or empty */
          (() => {
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
                  {t('founder')}
                </h3>
                <FounderCard profile={owner} />
              </div>
            );
          })()
        )}
      </div>

      {/* Footer CTA - only on desktop (mobile has its own fixed version) */}
      {!isMobile && (
        <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
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
      )}
    </div>
  );

  const footerCTA = (
    <div className="p-4 border-t border-gray-100 bg-white">
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
  );

  if (isMobile) {
    return (
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => { if (!open) currentOnClose(); }}>
        <DialogContent className="p-0 border-none max-w-none w-screen h-[100dvh] flex flex-col sm:rounded-none overflow-hidden [&>button]:hidden">
          <DialogHeader className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-14 flex flex-row items-center justify-between px-4 sm:px-4 space-y-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={currentOnClose}
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
          <div className="flex-1 overflow-y-auto mt-14 pb-4">
            {content}
          </div>
          {/* Fixed bottom CTA for mobile */}
          <div className="shrink-0">
            {footerCTA}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={selectedIndex !== null} onOpenChange={(open) => { if (!open) currentOnClose(); }}>
      <SheetContent side="right" className="p-0 sm:max-w-md border-l-gray-100 [&>button]:hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>{currentApp.name}</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
