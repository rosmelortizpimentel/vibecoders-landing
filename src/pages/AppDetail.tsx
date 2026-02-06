import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDetail } from '@/hooks/useAppDetail';
import { useAuth } from '@/hooks/useAuth';
import { PublicHeader } from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { BetaSquadCard } from '@/components/beta/BetaSquadCard';
import { BetaTesterPanel } from '@/components/beta/BetaTesterPanel';
import { BetaHallOfFame } from '@/components/beta/BetaHallOfFame';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ExternalLink, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Lightbulb,
  Heart,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppDetail() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('beta');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const { app, loading, error, refetch } = useAppDetail(appId);
  
  const [showTesterPanel, setShowTesterPanel] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-16">
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
      <PublicHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tCommon('back')}
          </Button>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* App Header Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {app.logo_url ? (
                        <img
                          src={app.logo_url}
                          alt={app.name || 'App'}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                          <Globe className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold">
                          {app.name || 'Untitled App'}
                        </h1>
                        {app.is_verified && (
                          <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        )}
                      </div>
                      
                      {app.tagline && (
                        <p className="text-muted-foreground mt-1">{app.tagline}</p>
                      )}

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {app.status && (
                          <Badge 
                            variant="secondary"
                            className="gap-1"
                            style={{ 
                              backgroundColor: `${app.status.color}20`,
                              color: app.status.color 
                            }}
                          >
                            {app.status.name}
                          </Badge>
                        )}
                        {app.category && (
                          <Badge variant="outline">{app.category.name}</Badge>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className={cn(
                            "w-4 h-4",
                            app.user_liked && "fill-red-500 text-red-500"
                          )} />
                          <span>{app.likes_count}</span>
                        </div>
                        {(app.hours_ideation || app.hours_building) && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {(app.hours_ideation || 0) + (app.hours_building || 0)}h
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Visit Button */}
                      <div className="mt-4">
                        <Button asChild>
                          <a href={app.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('viewApp')}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {app.description && (
                <Card>
                  <CardContent className="p-6">
                    <p className="whitespace-pre-wrap">{app.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Tech Stack */}
              {app.stacks && app.stacks.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {app.stacks.map((stack) => (
                        <Badge key={stack.id} variant="secondary" className="gap-2 py-1 px-3">
                          {stack.logo_url && (
                            <img 
                              src={stack.logo_url} 
                              alt={stack.name}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          {stack.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tester Panel - Only for accepted testers */}
              {isAcceptedTester && showTesterPanel && (
                <BetaTesterPanel
                  appId={app.id}
                  betaLink={app.beta_link}
                  betaInstructions={app.beta_instructions}
                  onLeft={() => {
                    setShowTesterPanel(false);
                    refetch();
                  }}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Creator Card */}
              <Card>
                <CardContent className="p-4">
                  <Link 
                    to={app.owner?.username ? `/@${app.owner.username}` : '#'}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={app.owner?.avatar_url || undefined} />
                      <AvatarFallback>
                        {(app.owner?.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{t('appBy')}</p>
                      <p className="font-medium truncate">
                        {app.owner?.name || app.owner?.username || 'Unknown'}
                      </p>
                      {app.owner?.tagline && (
                        <p className="text-xs text-muted-foreground truncate">
                          {app.owner.tagline}
                        </p>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>

              {/* Beta Squad Card */}
              {app.beta_active && !app.is_owner && (
                <BetaSquadCard
                  appId={app.id}
                  betaLimit={app.beta_limit}
                  testersCount={app.testers_count}
                  userTesterStatus={app.user_tester_status}
                  isOwner={app.is_owner}
                  onJoined={() => refetch()}
                  onAccessMission={() => setShowTesterPanel(true)}
                />
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

              {/* Hours Breakdown */}
              {(app.hours_ideation || app.hours_building) && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    {app.hours_ideation && app.hours_ideation > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lightbulb className="w-4 h-4" />
                          <span>Ideation</span>
                        </div>
                        <span className="font-medium">{app.hours_ideation}h</span>
                      </div>
                    )}
                    {app.hours_building && app.hours_building > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Building</span>
                        </div>
                        <span className="font-medium">{app.hours_building}h</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}