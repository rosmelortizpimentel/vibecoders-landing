import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Loader2, Eye, EyeOff, Bug, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, fr, pt } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface UnifiedFeedbackItem {
  id: string;
  realId: string;
  source: 'public' | 'beta' | 'bug';
  content: string;
  title?: string;
  status: string;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
  is_hidden?: boolean;
}

interface UnifiedFeedbackListProps {
  appId: string;
}

const ALL_STATUSES = ['new', 'reviewed', 'planned', 'in_progress', 'done', 'declined', 'open', 'closed'];

export function UnifiedFeedbackList({ appId }: UnifiedFeedbackListProps) {
  const t = useTranslation('apps');
  const { language } = useLanguage();
  const { user } = useAuth();
  const [items, setItems] = useState<UnifiedFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'beta' | 'bug'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showBugDialog, setShowBugDialog] = useState(false);
  const [bugContent, setBugContent] = useState('');
  const [bugSubmitting, setBugSubmitting] = useState(false);

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
        .select('id, title, description, status, created_at, author_name, is_hidden')
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
          realId: f.id,
          source: 'public',
          content: f.description,
          title: f.title,
          status: f.status,
          created_at: f.created_at,
          author_name: f.author_name,
          author_avatar: null,
          is_hidden: f.is_hidden ?? false,
        });
      });

      (betaFeedback || []).forEach(f => {
        const tester = f.tester as unknown as { name: string | null; username: string | null; avatar_url: string | null } | null;
        unified.push({
          id: `beta-${f.id}`,
          realId: f.id,
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

  const handleStatusChange = async (item: UnifiedFeedbackItem, newStatus: string) => {
    const table = item.source === 'public' ? 'roadmap_feedback' : 'beta_feedback';
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', item.realId);
    if (error) { toast.error('Error updating status'); return; }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
  };

  const handleToggleVisibility = async (item: UnifiedFeedbackItem) => {
    if (item.source !== 'public') return;
    const newHidden = !item.is_hidden;
    const { error } = await supabase.from('roadmap_feedback').update({ is_hidden: newHidden }).eq('id', item.realId);
    if (error) { toast.error('Error updating visibility'); return; }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_hidden: newHidden } : i));
  };

  const handleSubmitBug = async () => {
    if (!bugContent.trim() || !user) return;
    setBugSubmitting(true);
    try {
      const { error } = await supabase.from('beta_feedback').insert({
        app_id: appId,
        tester_id: user.id,
        type: 'bug',
        content: bugContent.trim(),
        status: 'open',
      });
      if (error) throw error;
      toast.success(t.t('hub.bugReported') || 'Bug reported');
      setBugContent('');
      setShowBugDialog(false);
      fetchAll();
    } catch {
      toast.error('Error reporting bug');
    } finally {
      setBugSubmitting(false);
    }
  };

  const filteredItems = items.filter(i => {
    if (filter !== 'all' && i.source !== filter) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

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
      {/* Filters and actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.t('hub.allFeedback')}</SelectItem>
              <SelectItem value="public">{t.t('hub.publicFeedback')}</SelectItem>
              <SelectItem value="beta">{t.t('hub.betaFeedback')}</SelectItem>
              <SelectItem value="bug">{t.t('hub.bugFeedback')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8"><SelectValue placeholder={t.t('hub.statusFilter')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.t('hub.allStatuses')}</SelectItem>
              {ALL_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowBugDialog(true)} className="gap-1.5">
          <Bug className="w-3.5 h-3.5" />
          {t.t('hub.reportBug')}
        </Button>
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
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {item.title && <h4 className="font-medium text-sm text-foreground mb-1">{item.title}</h4>}
                  <p className="text-sm text-foreground">{item.content}</p>
                </div>
                {/* Visibility toggle for public items */}
                {item.source === 'public' && (
                  <button
                    onClick={() => handleToggleVisibility(item)}
                    className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors"
                    title={item.is_hidden ? t.t('hub.hidden') : t.t('hub.visible')}
                  >
                    {item.is_hidden ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                )}
              </div>
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
                  <Select value={item.status} onValueChange={(v) => handleStatusChange(item, v)}>
                    <SelectTrigger className="h-6 text-[10px] w-auto min-w-[80px] border-none bg-secondary px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map(s => (
                        <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Bug Dialog */}
      <Dialog open={showBugDialog} onOpenChange={setShowBugDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              {t.t('hub.reportBug')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t.t('hub.bugDescription')}</Label>
              <Textarea
                value={bugContent}
                onChange={e => setBugContent(e.target.value)}
                placeholder={t.t('hub.bugDescriptionPh') || 'Describe the bug...'}
                rows={4}
                className="resize-none"
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBugDialog(false)}>{t.t('hub.cancel') || 'Cancel'}</Button>
            <Button onClick={handleSubmitBug} disabled={bugSubmitting || !bugContent.trim()}>
              {bugSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {t.t('hub.reportBug')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
