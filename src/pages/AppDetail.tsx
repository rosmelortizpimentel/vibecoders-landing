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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { parseMarkdown } from '@/lib/markdown';
import { 
  ArrowLeft, 
  Shield,
  ExternalLink, 
  Copy, 
  Check,
  FileText,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
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

export default function AppDetail() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('beta');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const { app, loading, error, refetch } = useAppDetail(appId);
  const { stats: ownerStats, loading: statsLoading } = useOwnerStats(app?.owner?.id);
  const { leaveBeta, leaving } = useBetaSquad(appId || '');
  
  const [copied, setCopied] = useState(false);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followDialogTab, setFollowDialogTab] = useState<'followers' | 'following'>('followers');

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

  const isAcceptedTester = app.user_tester_status?.status === 'accepted';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Custom Header with App branding */}
      <AppDetailHeader 
        appName={app.name}
        appTagline={app.tagline}
        logoUrl={app.logo_url}
      />
      
      <main className="flex-1 container mx-auto px-4 py-4 md:py-6">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tCommon('back')}
          </Button>

          <div className="space-y-4">
            {/* Top Row: Author (mobile) + App Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Author Card - Full width on mobile, right side on desktop */}
              <div className="md:order-2 md:col-span-1">
                <Card>
                  <CardContent className="p-4">
                    <Link 
                      to={app.owner?.username ? `/@${app.owner.username}` : '#'}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="w-11 h-11 flex-shrink-0">
                        <AvatarImage src={app.owner?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(app.owner?.name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm">
                          {app.owner?.name || app.owner?.username || 'Unknown'}
                        </p>
                        {app.owner?.tagline && (
                          <p className="text-xs text-muted-foreground truncate">
                            {app.owner.tagline}
                          </p>
                        )}
                      </div>
                    </Link>
                    {/* Social stats */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <button
                        onClick={openFollowersDialog}
                        className="hover:text-primary transition-colors"
                      >
                        <span className="font-medium text-foreground">
                          {statsLoading ? '...' : ownerStats.followersCount}
                        </span>{' '}
                        {t('authorFollowers')}
                      </button>
                      <span>·</span>
                      <button
                        onClick={openFollowingDialog}
                        className="hover:text-primary transition-colors"
                      >
                        <span className="font-medium text-foreground">
                          {statsLoading ? '...' : ownerStats.followingCount}
                        </span>{' '}
                        {t('authorFollowing')}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* App Summary Card - Full width on mobile, left side on desktop */}
              <div className="md:order-1 md:col-span-2">
                <AppSummaryCard
                  appId={app.id}
                  name={app.name}
                  tagline={app.tagline}
                  logoUrl={app.logo_url}
                  url={app.url}
                  isVerified={app.is_verified}
                  status={app.status}
                  stacks={app.stacks}
                  appName={app.name || undefined}
                />
              </div>
            </div>

            {/* Beta Squad Card for non-testers */}
            {app.beta_active && !app.is_owner && !isAcceptedTester && (
              <BetaSquadCard
                appId={app.id}
                betaLimit={app.beta_limit}
                testersCount={app.testers_count}
                userTesterStatus={app.user_tester_status}
                isOwner={app.is_owner}
                onJoined={() => refetch()}
                onAccessMission={() => refetch()}
              />
            )}

            {/* Welcome to Squad - Only for accepted testers */}
            {isAcceptedTester && (
              <Card className="border-primary/20">
                <CardContent className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{t('welcome')}</h3>
                  </div>

                  {/* Instructions */}
                  {app.beta_instructions && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        {t('instructions')}
                      </div>
                      <div 
                        className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(app.beta_instructions) }}
                      />
                    </div>
                  )}

                  {/* Access Link */}
                  {app.beta_link ? (
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => window.open(app.beta_link!, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('accessLink')}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyLink}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center py-2">
                      {t('noLink')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tester Report Card - Flip animation between list and form */}
            {isAcceptedTester && (
              <TesterReportCard appId={app.id} />
            )}

            {/* Hall of Fame */}
            {app.beta_active && app.testers && app.testers.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <BetaHallOfFame 
                    testers={app.testers} 
                    totalCount={app.testers_count} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Leave Squad button - Only for accepted testers */}
            {isAcceptedTester && (
              <div className="pt-2">
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
            )}
          </div>
        </div>
      </main>

      <Footer />

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
    </div>
  );
}
