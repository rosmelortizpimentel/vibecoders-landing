import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useApps } from '@/hooks/useApps';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Map, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { VerifyDomainModal } from '@/components/me/VerifyDomainModal';

export default function Roadmap() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation('common');
  const { t: tRoadmap } = useTranslation('roadmap');
  const { apps, loading, verifyApp, refetch } = useApps();

  const [verifyModal, setVerifyModal] = useState<{ open: boolean; appId: string; appName: string; appUrl: string; token: string }>({
    open: false, appId: '', appName: '', appUrl: '', token: '',
  });

  const verifiedApps = apps.filter(a => a.is_verified);
  const unverifiedApps = apps.filter(a => !a.is_verified);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderAppCard = (app: typeof apps[0], verified: boolean) => {
    const appSlug = (app.name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return (
      <Card
        key={app.id}
        className={`group transition-all border ${verified ? 'hover:shadow-lg cursor-pointer hover:border-primary/30' : 'opacity-50'}`}
        onClick={verified ? () => navigate(`/roadmap-editor/${app.id}`) : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {app.logo_url ? (
              <img src={app.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Map className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{app.name || 'App'}</h3>
              {app.tagline && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{app.tagline}</p>}
              <div className="flex items-center gap-2 mt-2">
                {verified ? (
                  <>
                    <Badge variant="secondary" className="text-[10px]">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {tRoadmap('verified')}
                    </Badge>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs h-7 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVerifyModal({
                        open: true,
                        appId: app.id,
                        appName: app.name || 'App',
                        appUrl: app.url,
                        token: app.verification_token || '',
                      });
                    }}
                  >
                    <ShieldAlert className="w-3 h-3 mr-1" />
                    {tRoadmap('verifyButton')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container px-4 py-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          {t('navigation.roadmap')}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {tRoadmap('listDescriptionPre')} <strong>{tRoadmap('listDescriptionBold')}</strong> {tRoadmap('listDescriptionPost')}
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Map className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">{tRoadmap('noVerifiedApps')}</p>
          <Button variant="outline" onClick={() => navigate('/me/apps')}>
            {tRoadmap('goToApps')}
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Verified Apps */}
          {verifiedApps.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {tRoadmap('verifiedSection')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {verifiedApps.map(app => renderAppCard(app, true))}
              </div>
            </div>
          )}

          {/* Unverified Apps */}
          {unverifiedApps.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                {tRoadmap('unverifiedSection')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {unverifiedApps.map(app => renderAppCard(app, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verify Domain Modal */}
      <VerifyDomainModal
        open={verifyModal.open}
        onOpenChange={(open) => setVerifyModal(prev => ({ ...prev, open }))}
        appName={verifyModal.appName}
        appUrl={verifyModal.appUrl}
        verificationToken={verifyModal.token}
        onVerify={() => verifyApp(verifyModal.appId)}
        onSuccess={refetch}
      />
    </div>
  );
}
