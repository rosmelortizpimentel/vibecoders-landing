import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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

import { AppDetailView } from '@/components/profile/AppDetailView';
import { PublicApp } from '@/hooks/usePublicProfile';

export default function AppDetail() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('beta');
  const { t: tCommon } = useTranslation('common');
  const { t: tProfile } = useTranslation('publicProfile');
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
                            <p className="text-sm text-gray-500 font-medium line-clamp-2 mt-0.5">
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
            <Tabs defaultValue="app" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start rounded-none h-auto p-0 gap-8">
                  <TabsTrigger 
                    value="app" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-bold text-gray-400 data-[state=active]:text-gray-900"
                  >
                    Proyecto
                  </TabsTrigger>
                  <TabsTrigger 
                    value="founders" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-bold text-gray-400 data-[state=active]:text-gray-900"
                  >
                    Founders
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="app" className="mt-0">
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
                                className="w-24 h-24 rounded-2xl object-cover shadow-sm ring-1 ring-gray-100"
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
                              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
                                {app.name}
                              </h1>
                              {app.is_verified && (
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
                            <p className="text-lg text-gray-500 font-medium mb-4">
                              {app.tagline}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                              <Button 
                                asChild 
                                size="sm"
                                className="rounded-full bg-gray-900 hover:bg-gray-800"
                              >
                                <a 
                                  href={app.url.startsWith('http') ? app.url : `https://${app.url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center gap-2"
                                >
                                  {tCommon('visitWebsite')}
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                              
                              {app.status && (
                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/5 text-primary border border-primary/10">
                                   {app.status.name}
                                 </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {app.description && (
                          <div className="mt-8 pt-8 border-t border-gray-50">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                              {t('aboutApp')}
                            </h3>
                            <div 
                              className="prose prose-sm max-w-none text-gray-600 leading-relaxed dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(app.description) }}
                            />
                          </div>
                        )}


                        {/* Tech Stack */}
                        {app.stacks && app.stacks.length > 0 && (
                          <div className="mt-8 pt-8 border-t border-gray-50">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                              {t('techStack')}
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {app.stacks.map(stack => (
                                <div 
                                  key={stack.id}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100"
                                >
                                  <img src={stack.logo_url} alt={stack.name} className="w-5 h-5 object-contain" />
                                  <span className="text-xs font-semibold text-gray-700">{stack.name}</span>
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

                  {/* Right Column (1/3) - Sidebar (Beta Squad + Founder) */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Squad Card */}
                    {app.beta_active && !app.is_owner && !isAcceptedTester && (
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
                    )}

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
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  founder.role === 'owner' 
                                    ? 'bg-primary/5 text-primary border-primary/20' 
                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}>
                                  {founder.role === 'owner' ? 'Owner' : 'Co-founder'}
                                </span>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="founders" className="mt-0">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="flex items-center justify-end">
                    {canManageFounders && (
                      <Button 
                        onClick={() => setIsFounderSearchOpen(true)}
                        className="rounded-full gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Agregar Co-Founder
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {founders.map((founder) => (
                      <Card key={founder.id} className="border-none shadow-sm bg-white overflow-hidden group">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16 border-2 border-white shadow-sm ring-1 ring-gray-100">
                              <AvatarImage src={founder.profile?.avatar_url || undefined} />
                              <AvatarFallback className="text-xl font-bold">
                                {(founder.profile?.name || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <Link 
                                to={`/@${founder.profile?.username}`}
                                className="font-bold text-gray-900 hover:text-primary transition-colors truncate block"
                              >
                                {founder.profile?.name || founder.profile?.username || 'Unknown'}
                                {founder.role === 'owner' && (
                                  <BadgeCheck className="inline-block h-4 w-4 text-primary ml-1.5 align-text-bottom" />
                                )}
                              </Link>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                                @{founder.profile?.username}
                              </p>
                              
                              <div className="mt-3 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  founder.role === 'owner' 
                                    ? 'bg-primary/5 text-primary border-primary/20' 
                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}>
                                  {founder.role === 'owner' ? 'Owner' : 'Co-founder'}
                                </span>
                              </div>
                            </div>

                            {canManageFounders && founder.role === 'co-founder' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <LogOut className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover Co-founder</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      ¿Estás seguro que deseas remover a <strong>{founder.profile?.name || founder.profile?.username}</strong> como co-founder? 
                                      Perderá todos los privilegios de edición sobre este proyecto.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => removeFounder.mutate(founder.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {!canManageFounders && (
                     <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3 text-sm text-gray-500">
                        <Shield className="w-4 h-4 text-primary" />
                        Solo el dueño original puede gestionar el equipo de founders.
                     </div>
                  )}
                </div>

                <FounderSearchDialog
                  isOpen={isFounderSearchOpen}
                  onClose={() => setIsFounderSearchOpen(false)}
                  onSelect={handleInviteFounder}
                  existingFounderIds={founders.map(f => f.user_id)}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

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
