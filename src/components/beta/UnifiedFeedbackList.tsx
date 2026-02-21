import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, MessageSquare, Loader2, Eye, EyeOff, Bug, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS, fr, pt } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FeedbackAttachment {
  file_url: string;
  file_name: string;
  file_type: string;
}

interface RoadmapLane {
  id: string;
  name: string;
  color: string;
  display_order: number;
}

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
  attachments: FeedbackAttachment[];
  linked_card_id?: string | null;
}

interface UnifiedFeedbackListProps {
  appId: string;
}

export function UnifiedFeedbackList({ appId }: UnifiedFeedbackListProps) {
  const t = useTranslation('apps');
  const { language } = useLanguage();
  const { user } = useAuth();
  const [items, setItems] = useState<UnifiedFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'beta' | 'bug'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lanes, setLanes] = useState<RoadmapLane[]>([]);
  const [showBugDialog, setShowBugDialog] = useState(false);
  const [bugContent, setBugContent] = useState('');
  const [bugSubmitting, setBugSubmitting] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<UnifiedFeedbackItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    fetchLanes();
  }, [appId]);

  const fetchLanes = async () => {
    const { data } = await supabase
      .from('roadmap_lanes')
      .select('id, name, color, display_order')
      .eq('app_id', appId)
      .order('display_order');
    setLanes(data || []);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: publicFeedback } = await supabase
        .from('roadmap_feedback')
        .select('id, title, description, status, created_at, author_name, is_hidden, linked_card_id, roadmap_feedback_attachments(file_url, file_name, file_type)')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      const { data: betaFeedback } = await supabase
        .from('beta_feedback')
        .select(`id, type, content, status, created_at, tester:profiles!beta_feedback_tester_id_fkey(name, username, avatar_url), beta_feedback_attachments(file_url, file_name, file_type)`)
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      const unified: UnifiedFeedbackItem[] = [];

      (publicFeedback || []).forEach(f => {
        const atts = (f as any).roadmap_feedback_attachments || [];
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
          attachments: atts,
          linked_card_id: f.linked_card_id,
        });
      });

      (betaFeedback || []).forEach(f => {
        const tester = f.tester as unknown as { name: string | null; username: string | null; avatar_url: string | null } | null;
        const atts = (f as any).beta_feedback_attachments || [];
        unified.push({
          id: `beta-${f.id}`,
          realId: f.id,
          source: f.type === 'bug' ? 'bug' : 'beta',
          content: f.content,
          status: f.status,
          created_at: f.created_at,
          author_name: tester?.name || tester?.username || null,
          author_avatar: tester?.avatar_url || null,
          attachments: atts,
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

  const handleLaneChange = async (item: UnifiedFeedbackItem, value: string) => {
    // Only public feedback can be linked to roadmap lanes
    if (item.source !== 'public') {
      // For beta/bug feedback, just update the status field
      const { error } = await supabase.from('beta_feedback').update({ status: value }).eq('id', item.realId);
      if (error) { toast.error('Error updating status'); return; }
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: value } : i));
      return;
    }

    if (value === 'new') {
      // Remove linked card if exists
      if (item.linked_card_id) {
        await supabase.from('roadmap_cards').delete().eq('id', item.linked_card_id);
      }
      const { error } = await supabase.from('roadmap_feedback').update({ status: 'new', linked_card_id: null }).eq('id', item.realId);
      if (error) { toast.error('Error updating status'); return; }
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'new', linked_card_id: null } : i));
    } else {
      // value is a lane_id — create a roadmap card and link it
      const lane = lanes.find(l => l.id === value);
      if (!lane) return;

      // Get max display_order in that lane
      const { data: maxCard } = await supabase
        .from('roadmap_cards')
        .select('display_order')
        .eq('lane_id', value)
        .eq('app_id', appId)
        .order('display_order', { ascending: false })
        .limit(1);
      const nextOrder = (maxCard?.[0]?.display_order ?? -1) + 1;

      // If already linked to a card, move it; otherwise create new
      if (item.linked_card_id) {
        const { error } = await supabase.from('roadmap_cards').update({ lane_id: value, display_order: nextOrder }).eq('id', item.linked_card_id);
        if (error) { toast.error('Error moving card'); return; }
      } else {
        const { data: newCard, error: cardError } = await supabase.from('roadmap_cards').insert({
          app_id: appId,
          lane_id: value,
          title: item.title || item.content.substring(0, 100),
          description: item.content,
          display_order: nextOrder,
        }).select('id').single();
        if (cardError || !newCard) { toast.error('Error creating card'); return; }

        const { error: linkError } = await supabase.from('roadmap_feedback').update({
          status: lane.name.toLowerCase(),
          linked_card_id: newCard.id,
        }).eq('id', item.realId);
        if (linkError) { toast.error('Error linking feedback'); return; }

        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: lane.name.toLowerCase(), linked_card_id: newCard.id } : i));
        return;
      }

      // Update feedback status
      const { error } = await supabase.from('roadmap_feedback').update({ status: lane.name.toLowerCase() }).eq('id', item.realId);
      if (error) { toast.error('Error updating status'); return; }
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: lane.name.toLowerCase() } : i));
    }
  };

  const handleToggleVisibility = async (item: UnifiedFeedbackItem) => {
    if (item.source !== 'public') return;
    const newHidden = !item.is_hidden;
    const { error } = await supabase.from('roadmap_feedback').update({ is_hidden: newHidden }).eq('id', item.realId);
    if (error) { toast.error('Error updating visibility'); return; }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_hidden: newHidden } : i));
  };

  const handleDeleteFeedback = async () => {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);
    try {
      if (deleteConfirmItem.source === 'public') {
        // If it has a linked card, delete it first
        if (deleteConfirmItem.linked_card_id) {
          await supabase.from('roadmap_cards').delete().eq('id', deleteConfirmItem.linked_card_id);
        }
        const { error } = await supabase.from('roadmap_feedback').delete().eq('id', deleteConfirmItem.realId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('beta_feedback').delete().eq('id', deleteConfirmItem.realId);
        if (error) throw error;
      }

      setItems(prev => prev.filter(i => i.id !== deleteConfirmItem.id));
      toast.success(t.t('hub.feedbackDeleted') || 'Feedback deleted');
      setDeleteConfirmItem(null);
    } catch (err) {
      console.error('Error deleting feedback:', err);
      toast.error('Error deleting feedback');
    } finally {
      setIsDeleting(false);
    }
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
    if (statusFilter !== 'all') {
      if (statusFilter === 'new' && i.status !== 'new') return false;
      if (statusFilter !== 'new') {
        const lane = lanes.find(l => l.id === statusFilter);
        if (lane && i.status !== lane.name.toLowerCase()) return false;
      }
    }
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

  /** Get the current lane for an item based on its status */
  const getItemLaneValue = (item: UnifiedFeedbackItem): string => {
    if (item.source !== 'public') return item.status;
    const lane = lanes.find(l => l.name.toLowerCase() === item.status);
    return lane ? lane.id : 'new';
  };

  /** Get display info for current status */
  const getStatusDisplay = (item: UnifiedFeedbackItem) => {
    if (item.source !== 'public') {
      return { name: item.status.replace('_', ' '), color: undefined };
    }
    const lane = lanes.find(l => l.name.toLowerCase() === item.status);
    if (lane) return { name: lane.name, color: lane.color };
    return { name: 'New', color: undefined };
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
            <SelectTrigger className="w-36 h-8"><SelectValue placeholder={t.t('hub.statusFilter')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.t('hub.allStatuses')}</SelectItem>
              <SelectItem value="new">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  New
                </span>
              </SelectItem>
              {lanes.map(lane => (
                <SelectItem key={lane.id} value={lane.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lane.color }} />
                    {lane.name}
                  </span>
                </SelectItem>
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
          {filteredItems.map(item => {
            const statusInfo = getStatusDisplay(item);
            const currentValue = getItemLaneValue(item);

            return (
              <div key={item.id} className="p-4 rounded-lg border bg-card hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {item.title && <h4 className="font-medium text-sm text-foreground mb-1">{item.title}</h4>}
                    <p className="text-sm text-foreground">{item.content}</p>
                  </div>
                  {item.source === 'public' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleVisibility(item)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        title={item.is_hidden ? t.t('hub.hidden') : t.t('hub.visible')}
                      >
                        {item.is_hidden ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-600" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmItem(item)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors group"
                        title={t.t('hub.delete') || 'Delete'}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                      </button>
                    </div>
                  )}
                  {item.source !== 'public' && (
                    <button
                      onClick={() => setDeleteConfirmItem(item)}
                      className="shrink-0 p-1.5 rounded-md hover:bg-destructive/10 transition-colors group"
                      title={t.t('hub.delete') || 'Delete'}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                    </button>
                  )}
                </div>
                {/* Attachments */}
                {item.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.attachments.map((att, idx) => {
                      const isImage = att.file_type?.startsWith('image/');
                      const isPdf = att.file_type === 'application/pdf';
                      if (isImage) {
                        return (
                          <a key={idx} href={att.file_url} target="_blank" rel="noopener noreferrer">
                            <img src={att.file_url} alt={att.file_name} className="w-20 h-20 object-cover rounded-md border hover:opacity-80 transition-opacity" />
                          </a>
                        );
                      }
                      if (isPdf) {
                        return (
                          <a key={idx} href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border bg-muted/50 hover:bg-muted transition-colors text-xs text-muted-foreground">
                            <FileText className="w-4 h-4 text-red-500" />
                            <span className="max-w-[100px] truncate">{att.file_name}</span>
                            <Download className="w-3 h-3" />
                          </a>
                        );
                      }
                      return (
                        <a key={idx} href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1.5 rounded-md border bg-muted/50 text-xs text-muted-foreground hover:bg-muted">
                          <Download className="w-3 h-3" />
                          <span className="max-w-[100px] truncate">{att.file_name}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
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
                    {item.source === 'public' ? (
                      <Select value={currentValue} onValueChange={(v) => handleLaneChange(item, v)}>
                        <SelectTrigger className="h-6 text-[10px] w-auto min-w-[90px] border-none bg-secondary px-2">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: statusInfo.color || 'hsl(var(--muted-foreground) / 0.4)' }}
                            />
                            <span>{statusInfo.name}</span>
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">
                            <span className="flex items-center gap-2 text-xs">
                              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 shrink-0" />
                              New
                            </span>
                          </SelectItem>
                          {lanes.map(lane => (
                            <SelectItem key={lane.id} value={lane.id}>
                              <span className="flex items-center gap-2 text-xs">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lane.color }} />
                                {lane.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-2">
                        {item.status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Bug Dialog */}
      <Dialog open={showBugDialog} onOpenChange={setShowBugDialog}>
        <DialogContent className="sm:max-w-md [&>button.absolute]:hidden">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteConfirmItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.t('hub.deleteFeedback') || 'Delete Feedback'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.t('hub.deleteFeedbackConfirm') || 'Are you sure you want to delete this feedback? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t.t('hub.cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteFeedback();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t.t('hub.delete') || 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
