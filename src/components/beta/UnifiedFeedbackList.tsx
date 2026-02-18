import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, fr, pt } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface UnifiedFeedbackItem {
  id: string;
  source: 'public' | 'beta' | 'bug';
  content: string;
  title?: string;
  status: string;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
}

interface UnifiedFeedbackListProps {
  appId: string;
}

export function UnifiedFeedbackList({ appId }: UnifiedFeedbackListProps) {
  const t = useTranslation('apps');
  const { language } = useLanguage();
  const [items, setItems] = useState<UnifiedFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'beta' | 'bug'>('all');

  const getDateLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'fr': return fr;
      case 'pt': return pt;
      default: return es;
    }
  };

  useEffect(() => {
    fetchAll();
  }, [appId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: publicFeedback } = await supabase
        .from('roadmap_feedback')
        .select('id, title, description, status, created_at, author_name')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      const { data: betaFeedback } = await supabase
        .from('beta_feedback')
        .select(`id, type, content, status, created_at, tester:profiles!beta_feedback_tester_id_fkey(name, username, avatar_url)`)
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      const unified: UnifiedFeedbackItem[] = [];

      (publicFeedback || []).forEach(f => {
        unified.push({
          id: `public-${f.id}`,
          source: 'public',
          content: f.description,
          title: f.title,
          status: f.status,
          created_at: f.created_at,
          author_name: f.author_name,
          author_avatar: null,
        });
      });

      (betaFeedback || []).forEach(f => {
        const tester = f.tester as unknown as { name: string | null; username: string | null; avatar_url: string | null } | null;
        unified.push({
          id: `beta-${f.id}`,
          source: f.type === 'bug' ? 'bug' : 'beta',
          content: f.content,
          status: f.status,
          created_at: f.created_at,
          author_name: tester?.name || tester?.username || null,
          author_avatar: tester?.avatar_url || null,
        });
      });

      unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setItems(unified);
    } catch (err) {
      console.error('Error fetching unified feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.source === filter);

  const getSourceBadge = (source: 'public' | 'beta' | 'bug') => {
    switch (source) {
      case 'public':
        return <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-600 bg-blue-50">{t.t('hub.publicFeedback')}</Badge>;
      case 'beta':
        return <Badge variant="outline" className="text-[10px] border-green-300 text-green-600 bg-green-50">{t.t('hub.betaFeedback')}</Badge>;
      case 'bug':
        return <Badge variant="outline" className="text-[10px] border-red-300 text-red-600 bg-red-50">{t.t('hub.bugFeedback')}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.t('hub.allFeedback')}</SelectItem>
            <SelectItem value="public">{t.t('hub.publicFeedback')}</SelectItem>
            <SelectItem value="beta">{t.t('hub.betaFeedback')}</SelectItem>
            <SelectItem value="bug">{t.t('hub.bugFeedback')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p>{t.t('hub.noFeedback')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div key={item.id} className="p-4 rounded-lg border bg-card hover:border-primary/20 transition-colors">
              {item.title && <h4 className="font-medium text-sm text-foreground mb-1">{item.title}</h4>}
              <p className="text-sm text-foreground">{item.content}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {item.author_avatar && (
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={item.author_avatar} />
                      <AvatarFallback className="text-[9px]">{item.author_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                  )}
                  <span className="text-xs text-muted-foreground">{item.author_name || 'Anónimo'}</span>
                  <span className="text-muted-foreground/40 text-[10px]">•</span>
                  <span className="text-xs text-muted-foreground/60">{format(new Date(item.created_at), 'dd MMM', { locale: getDateLocale() })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getSourceBadge(item.source)}
                  <Badge variant="secondary" className="text-[10px]">{item.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
