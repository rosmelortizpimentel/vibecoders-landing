import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDetail } from '@/hooks/useAppDetail';
import { useOwnerStats } from '@/hooks/useOwnerStats';
import { useAuth } from '@/hooks/useAuth';
import { useBetaSquad } from '@/hooks/useBetaSquad';
import Footer from '@/components/Footer';
import { AppDetailHeader } from '@/components/beta/AppDetailHeader';
import { AppSummaryCard } from '@/components/beta/AppSummaryCard';
import { TesterReportCard } from '@/components/beta/TesterReportCard';
import { AuthorFollowDialog } from '@/components/beta/AuthorFollowDialog';
import { BetaSquadCard } from '@/components/beta/BetaSquadCard';
import { BetaHallOfFame } from '@/components/beta/BetaHallOfFame';
import { BetaMissionCard } from '@/components/beta/BetaMissionCard';
import { BetaActionCard } from '@/components/beta/BetaActionCard';
import { BetaCommunityCard } from '@/components/beta/BetaCommunityCard';
import { FounderCard } from '@/components/profile/FounderCard';
import { useTesterFeedback } from '@/hooks/useTesterFeedback';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { parseMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { ProjectDNA } from '@/components/ProjectDNA';
import { 
  ArrowLeft, 
  Shield,
  ExternalLink, 
  Copy, 
  Check,
  FileText,
  LogOut,
  BadgeCheck,
  Globe,
  UserPlus,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  BadgeDollarSign
} from 'lucide-react';
import { ProBadge } from '@/components/ui/ProBadge';
import { UpgradeBadge } from '@/components/ui/UpgradeBadge';
import { PremiumComparisonModal } from '@/components/ui/PremiumComparisonModal';
import { useHasFeature } from '@/hooks/useFeatures';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppFounders } from '@/hooks/useAppFounders';
import { FounderSearchDialog } from '@/components/profile/FounderSearchDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

import { AppDetailView } from '@/components/profile/AppDetailView';
import { PublicApp } from '@/hooks/usePublicProfile';

export default function AppDetail() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('beta');
  const { t: tCommon } = useTranslation('common');
  const { t: tProfile } = useTranslation('publicProfile');
  const { t: tPartner } = useTranslation('partnerships');
  const { user } = useAuth();
  const { app, loading, error, refetch } = useAppDetail(appId);
  const { feedback } = useTesterFeedback(appId);
  const { stats: ownerStats, loading: statsLoading } = useOwnerStats(app?.owner?.id);
  const { leaveBeta, leaving } = useBetaSquad(appId || '');
  
  const [copied, setCopied] = useState(false);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followDialogTab, setFollowDialogTab] = useState<'followers' | 'following'>('followers');
  const [showPublicDetail, setShowPublicDetail] = useState(false);
  const [isFounderSearchOpen, setIsFounderSearchOpen] = useState(false);
  const { 
    founders, 
    inviteFounder, 
    removeFounder,
    canManageFounders 
  } = useAppFounders(appId || '');

  const ownerFounder = founders.find(f => f.role === 'owner');
  const ownerProfile = ownerFounder 
    ? { ...ownerFounder.profile, id: ownerFounder.user_id } 
    : app?.owner;

  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState<number | null>(null);

  const { hasFeature: hasPremiumFeature, isLoading: isLoadingTier } = useHasFeature('co_founders_management');
  const { isPro, isFounder, isFree } = useSubscription();
  const isPremium = hasPremiumFeature || isPro || isFounder;
  
  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedScreenshotIndex === null) return;
      
      if (e.key === 'ArrowLeft') {
        setSelectedScreenshotIndex(prev => (prev !== null ? (prev - 1 + (app?.screenshots?.length || 0)) % (app?.screenshots?.length || 1) : null));
      } else if (e.key === 'ArrowRight') {
        setSelectedScreenshotIndex(prev => (prev !== null ? (prev + 1) % (app?.screenshots?.length || 1) : null));
      } else if (e.key === 'Escape') {
        setSelectedScreenshotIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedScreenshotIndex, app?.screenshots]);
  
  const handleCopyLink = () => {
    if (app?.beta_link) {
      navigator.clipboard.writeText(app.beta_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied');
    }
  };

  const handleLeave = async () => {
    const result = await leaveBeta();
    if (result.success) {
      toast.success(t('leftBeta'));
      refetch();
    }
  };

  const openFollowersDialog = () => {
    setFollowDialogTab('followers');
    setFollowDialogOpen(true);
  };

  const openFollowingDialog = () => {
    setFollowDialogTab('following');
    setFollowDialogOpen(true);
  };

  const handleInviteFounder = async (userId: string) => {
    try {
      await inviteFounder.mutateAsync({ userId });
      setIsFounderSearchOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedScreenshotIndex === null || !app.screenshots) return;
      
      if (e.key === 'ArrowLeft') {
        setSelectedScreenshotIndex((prev) => (prev !== null ? (prev - 1 + app!.screenshots!.length) % app!.screenshots!.length : null));
      } else if (e.key === 'ArrowRight') {
        setSelectedScreenshotIndex((prev) => (prev !== null ? (prev + 1) % app!.screenshots!.length : null));
      } 
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedScreenshotIndex, app]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 h-14 md:h-16 flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 h-14 md:h-16" />
        </div>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold mb-4">{t('appNotFound')}</h1>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tCommon('back')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const allAttachments = feedback.flatMap(f => f.attachments || []);

  const isAcceptedTester = app?.user_tester_status?.status === 'accepted';

  // Map AppDetailData to PublicApp for AppDetailView
  const publicApp: PublicApp = {
    id: app.id,
    url: app.url,
    name: app.name,
    tagline: app.tagline,
    description: app.description,
    logo_url: app.logo_url,
    is_verified: app.is_verified,
    hours_ideation: app.hours_ideation || 0,
    hours_building: app.hours_building || 0,
    screenshots: app.screenshots || [],
    status: app.status,
    category: app.category,
    tags: app.tags || [],
    beta_active: app.beta_active || false,
    open_to_partnerships: app.open_to_partnerships || false,
    partnership_types: app.partnership_types || [],
    stacks: app.stacks,
    owner: {
      id: app.owner.id,
      username: app.owner.username || '',
      full_name: app.owner.name || '',
      avatar_url: app.owner.avatar_url,
      tagline: app.owner.tagline
    }
  };

  return (
    <div className="space-y-6">
      <main>
        <div className="max-w-7xl mx-auto">
          {isAcceptedTester ? (
            /* TESTER VIEW (Beta Dashboard) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column (2/3) - Mission */}
              <div className="md:col-span-2 space-y-6">
                
                {/* App Info & Founder Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* App Info Card - Clickable to open detail */}
                  <Card 
                    className="h-full border-primary/20 bg-primary/5 hover:border-primary/40 cursor-pointer transition-colors group"
                    onClick={() => setShowPublicDetail(true)}
                  >
                    <CardContent className="p-5 flex flex-col h-full justify-center">
                      <div className="flex items-center gap-4">
                         <div className="shrink-0">
                            {app.logo_url ? (
                              <img 
                                src={app.logo_url} 
                                alt={app.name || ''} 
                                className="w-14 h-14 rounded-xl object-cover shadow-sm bg-white group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center border border-primary/10">
                                <span className="text-xl font-bold text-gray-300">
                                  {app.name?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}
                         </div>
                         <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight truncate group-hover:text-primary transition-colors">
                              {app.name}
                            </h3>
                            <p className="text-sm text-gray-500 font-light line-clamp-2 mt-0.5">
                              {app.tagline}
                            </p>
                         </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Founder Card */}
                  <div className="h-full">
                     <FounderCard profile={{
                        id: app.owner.id,
                        username: app.owner.username || '',
                        full_name: app.owner.name || '',
                        avatar_url: app.owner.avatar_url,
                        tagline: app.owner.tagline
                     }} />
                  </div>
                </div>

                <BetaMissionCard 
                  instructions={app.beta_instructions} 
                  betaLink={app.beta_link} 
                  attachments={allAttachments}
                />
              </div>

              {/* Right Column (1/3) - Command Center */}
              <div className="md:col-span-1 space-y-6">
                {/* Actions */}
                <div className="h-auto">
                   <BetaActionCard appId={app.id} />
                </div>
                
                {/* Community */}
                <div className="h-auto">
                  <BetaCommunityCard 
                    testers={app.testers} 
                    totalCount={app.testers_count} 
                  />
                </div>

                {/* Leave Squad */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="w-full text-destructive hover:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('leaveBeta')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('leaveBeta')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('leaveConfirm')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLeave} disabled={leaving}>
                        {leaving ? '...' : t('leaveBeta')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            /* PUBLIC/OWNER VIEW - Upgraded to match PublicProfile detail style */
            <div className="w-full">

              <div className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column (2/3) - Main App Content */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* App Hero Card */}
                    <Card className="overflow-hidden border-none shadow-sm bg-white">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          {/* Logo */}
                          <div className="shrink-0 mx-auto md:mx-0">
                            {app.logo_url ? (
                                <img 
                                  src={app.logo_url} 
                                  alt={app.name || ''} 
                                  className="w-24 h-24 rounded-2xl object-contain bg-white shadow-sm ring-1 ring-gray-100"
                                />
                            ) : (
                              <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center ring-1 ring-gray-100">
                                <span className="text-3xl font-bold text-gray-300">
                                  {app.name?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 text-center md:text-left min-w-0">
                            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                               <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                                 {app.name}
                               </h1>
                               {app.is_verified && (
                                 <TooltipProvider>
                                   <Tooltip>
                                     <TooltipTrigger asChild>
                                       <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1C1C1C] text-white shrink-0">
                                         <Check className="w-3 h-3 stroke-[4]" />
                                       </div>
                                     </TooltipTrigger>
                                     <TooltipContent side="top">
                                       App Verificada por VibeCoders
                                     </TooltipContent>
                                   </Tooltip>
                                 </TooltipProvider>
                               )}
                            </div>
                            <p className="text-base text-gray-500 font-light mb-4 text-left">
                              {app.tagline}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                              <Button 
                                asChild 
                                variant="outline"
                                className="rounded-full bg-transparent border-[#1C1C1C] text-[#1C1C1C] hover:bg-gray-50 hover:text-[#1C1C1C] font-medium text-xs h-auto py-1 px-3"
                              >
                                <a 
                                  href={app.url.startsWith('http') ? app.url : `https://${app.url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center gap-2"
                                >
                                  {tCommon('visitWebsite')}
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </Button>
                              
                              {app.status && (
                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-normal bg-transparent text-[#1C1C1C] border border-[#1C1C1C]">
                                   {app.status.name}
                                 </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description Section - Now "Sobre esta app" */}
                        <div className="mt-4 pt-6 border-t border-[#f0f0f0]">
                          <h3 className="text-[12px] font-bold text-[#555] uppercase tracking-[0.1em] mb-4">
                            {t('aboutApp', { defaultValue: 'Sobre esta app' })}
                          </h3>
                          {app.description ? (
                            <div 
                              className="prose prose-sm max-w-none text-gray-600 leading-relaxed dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(app.description) }}
                            />
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              El founder aún no ha agregado una descripción detallada.
                            </p>
                          )}
                        </div>

                        {/* Screenshot Gallery */}
                        {app.screenshots && app.screenshots.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-[#f0f0f0]">
                            <h3 className="text-[12px] font-bold text-[#555] uppercase tracking-[0.1em] mb-5">
                              {tCommon('screenshots', { defaultValue: 'SCREENSHOTS' })}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {app.screenshots.slice(0, 3).map((url, index) => {
                                const isLast = index === 2 && app.screenshots!.length > 3;
                                return (
                                  <div 
                                    key={index}
                                    className="aspect-video relative rounded-[8px] overflow-hidden bg-gray-50 border border-gray-100 group/img cursor-zoom-in shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:shadow-md hover:border-primary/20"
                                    onClick={() => setSelectedScreenshotIndex(index)}
                                  >
                                    <img 
                                      src={url} 
                                      alt={`${app.name} screenshot ${index + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                    />
                                    {isLast && (
                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-colors group-hover/img:bg-black/70">
                                        <span className="text-white font-bold text-sm">
                                          Ver todas (+{app.screenshots!.length - 3})
                                        </span>
                                      </div>
                                    )}
                                    {!isLast && <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Tech Stack */}
                        {app.stacks && app.stacks.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-[#f0f0f0]">
                            <h3 className="text-[12px] font-bold text-[#555] uppercase tracking-[0.1em] mb-4">
                              {t('techStack', { defaultValue: 'STACK TECNOLÓGICO' })}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {app.stacks.map(stack => (
                                <div 
                                  key={stack.id}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100"
                                >
                                  <img src={stack.logo_url} alt={stack.name} className="w-5 h-5 object-contain" />
                                  <span className="text-xs font-normal text-gray-700">{stack.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Contributors / Testers Hall of Fame */}
                    {app.testers && app.testers.length > 0 && (
                       <div className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
                            {t('contributors')}
                          </h3>
                          <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-6">
                               <BetaHallOfFame 
                                testers={app.testers} 
                                totalCount={app.testers_count} 
                               />
                            </CardContent>
                          </Card>
                       </div>
                    )}
                  </div>

                  {/* Right Column (1/3) - Sidebar (Founder + Partnership + Beta Squad) */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Founder Card */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
                        {founders.length > 1 ? tProfile('founders') : tProfile('founder')}
                      </h3>
                      <div className="space-y-4">
                        {founders.map((founder) => (
                           <div key={founder.id} className="relative group">
                              <FounderCard profile={{
                                id: founder.user_id,
                                username: founder.profile?.username || '',
                                full_name: founder.profile?.name || '',
                                avatar_url: founder.profile?.avatar_url,
                                tagline: founder.profile?.username || ''
                              }} />
                              
                              <div className="absolute top-4 right-4 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-normal uppercase tracking-wider border ${
                                  (founder.role === 'owner' && founders.length === 1)
                                    ? 'bg-primary/5 text-primary border-primary/20' 
                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}>
                                  {(founder.role === 'owner' && founders.length === 1) ? 'Owner' : 'Co-founder'}
                                </span>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* Partnership section */}
                    {app.open_to_partnerships && (
                      <div className="p-4 bg-[#F5FBF8] border border-[#D1D5DB]/30 rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-[#1C1C1C]">
                          <UserPlus className="w-12 h-12" />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-[#1C1C1C]/5 rounded-lg">
                            <UserPlus className="w-4 h-4 text-[#1C1C1C]" />
                          </div>
                          <h3 className="text-[10px] font-bold text-[#1C1C1C] uppercase tracking-[0.2em]">
                            {tPartner('detail.title')}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed pr-6">
                          {tPartner('detail.description')}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {app.partnership_types?.map((type: string) => {
                            return (
                              <span 
                                key={type}
                                className="px-2.5 py-1 rounded-full text-[9px] font-normal uppercase tracking-wider bg-transparent border border-[#D1D5DB] text-[#374151] shadow-xs"
                              >
                                {tPartner(`types.${type}`)}
                              </span>
                            );
                          })}
                        </div>

                        {/* Contact button */}
                        {ownerProfile?.id && (
                          <Button 
                            onClick={() => {
                              navigate(`/chat?user=${ownerProfile.id}`);
                            }}
                            className="w-full bg-[#68CF94] hover:bg-[#68CF94]/90 text-[#1C1C1C] rounded-xl h-10 text-xs font-semibold shadow-lg shadow-[#68CF94]/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            <Avatar className="w-5 h-5 border border-black/10">
                              <AvatarImage src={ownerProfile.avatar_url} />
                              <AvatarFallback className="bg-white/20 text-[8px]">
                                {ownerProfile.name?.charAt(0) || ownerProfile.username?.charAt(0) || 'O'}
                              </AvatarFallback>
                            </Avatar>
                            {tPartner('detail.contactButton')}
                          </Button>
                        )}
                      </div>
                    )}
                    {/* For Sale section */}
                    {app.status?.slug === 'for-sale' && (
                      <div className="p-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-[#1C1C1C]">
                          <BadgeDollarSign className="w-12 h-12" />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-[#1C1C1C]/5 rounded-lg">
                            <BadgeDollarSign className="w-4 h-4 text-[#1C1C1C]" />
                          </div>
                          <h3 className="text-[10px] font-bold text-[#1C1C1C] uppercase tracking-[0.2em]">
                            {tPartner('forSale.title')}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed pr-6">
                          {tPartner('forSale.description')}
                        </p>

                        {/* Contact button */}
                        {ownerProfile?.id && (
                          <Button 
                            onClick={() => {
                              navigate(`/chat?user=${ownerProfile.id}`);
                            }}
                            className="w-full bg-[#1C1C1C] hover:bg-black text-[#FFFFFF] rounded-xl h-10 text-xs font-semibold shadow-lg shadow-black/20 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                          >
                            <Avatar className="w-5 h-5 border border-white/10">
                              <AvatarImage src={ownerProfile.avatar_url} />
                              <AvatarFallback className="bg-white/10 text-[8px]">
                                {ownerProfile.name?.charAt(0) || ownerProfile.username?.charAt(0) || 'O'}
                              </AvatarFallback>
                            </Avatar>
                            {tPartner('forSale.contactButton')}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Beta Squad Section */}
                    {app.beta_active && !app.is_owner && !isAcceptedTester && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
                          {t('openForTesting', { defaultValue: 'OPEN FOR TESTING' })}
                        </h3>
                        <BetaSquadCard
                          appId={app.id}
                          betaLimit={app.beta_limit}
                          testersCount={app.testers_count}
                          userTesterStatus={app.user_tester_status}
                          isOwner={app.is_owner}
                          betaInstructions={app.beta_instructions}
                          onJoined={() => refetch()}
                          onAccessMission={() => refetch()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox UI */}
      {selectedScreenshotIndex !== null && app.screenshots && (
        <Dialog open={selectedScreenshotIndex !== null} onOpenChange={() => setSelectedScreenshotIndex(null)}>
          <DialogContent 
            overlayClassName="bg-black/90"
            className="max-w-7xl border-none bg-transparent p-0 overflow-hidden shadow-none flex items-center justify-center pointer-events-none"
            hideClose
          >
            <div className="relative w-full h-[90vh] flex items-center justify-center p-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button 
                onClick={() => setSelectedScreenshotIndex(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation arrows */}
              {app.screenshots.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScreenshotIndex((prev) => (prev !== null ? (prev - 1 + app.screenshots!.length) % app.screenshots!.length : null));
                    }}
                    className="absolute left-4 z-50 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScreenshotIndex((prev) => (prev !== null ? (prev + 1) % app.screenshots!.length : null));
                    }}
                    className="absolute right-4 z-50 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              {/* Image */}
              <img 
                src={app.screenshots[selectedScreenshotIndex]} 
                alt={`Screenshot ${selectedScreenshotIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none shadow-2xl"
              />

              {/* Index Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
                {selectedScreenshotIndex + 1} / {app.screenshots.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Author Follow Dialog */}
      <AuthorFollowDialog
        open={followDialogOpen}
        onOpenChange={setFollowDialogOpen}
        authorId={app.owner?.id || ''}
        authorName={app.owner?.name}
        initialTab={followDialogTab}
        followersCount={ownerStats.followersCount}
        followingCount={ownerStats.followingCount}
      />

      {/* Public App Detail Preview (for Testers) */}
      {isAcceptedTester && (
        <AppDetailView
          apps={[publicApp]}
          selectedIndex={showPublicDetail ? 0 : null}
          onClose={() => setShowPublicDetail(false)}
          onNavigate={() => {}}
          defaultOwner={publicApp.owner ? {
            ...publicApp.owner,
            name: publicApp.owner.full_name
          } : undefined}
        />
      )}
    </div>
  );
}
