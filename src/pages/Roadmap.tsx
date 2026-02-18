import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Map, ExternalLink, ArrowRight } from 'lucide-react';

interface AppWithRoadmap {
  id: string;
  name: string | null;
  tagline: string | null;
  logo_url: string | null;
  url: string;
  is_verified: boolean;
}

export default function Roadmap() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation('common');
  const { t: tRoadmap } = useTranslation('roadmap');
  const [apps, setApps] = useState<AppWithRoadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('apps')
        .select('id, name, tagline, logo_url, url, is_verified')
        .eq('user_id', user.id)
        .eq('is_verified', true)
        .order('display_order');
      setApps((data || []) as AppWithRoadmap[]);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          {t('navigation.roadmap')}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {tRoadmap('listDescription')}
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
        <div className="grid gap-4 sm:grid-cols-2">
          {apps.map(app => {
            const appSlug = (app.name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return (
              <Card key={app.id} className="group hover:shadow-lg transition-all cursor-pointer border hover:border-primary/30" onClick={() => navigate(`/roadmap-editor/${app.id}`)}>
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
                        <Badge variant="secondary" className="text-[10px]">✓ Verified</Badge>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
