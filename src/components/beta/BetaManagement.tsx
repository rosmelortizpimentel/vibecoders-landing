import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useBetaSquad } from '@/hooks/useBetaSquad';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DebouncedInput } from '@/components/ui/debounced-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';
import { FeedbackActionMenu } from './FeedbackActionMenu';
import { MarkdownEditor } from './MarkdownEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TesterSearchDialog } from './TesterSearchDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FlaskConical, 
  Check, 
  X, 
  UserMinus,
  UserPlus,
  MessageSquare,
  Bug,
  Lightbulb,
  Palette,
  HelpCircle,
  ExternalLink,
  Star,
  Users,
  Settings,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface BetaConfig {
  beta_active: boolean;
  beta_mode: string;
  beta_limit: number;
  beta_link: string | null;
  beta_instructions: string | null;
}

interface Tester {
  id: string;
  user_id: string;
  status: string;
  joined_at: string;
  feedback_count: number;
  profile: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
}

interface FeedbackAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
}

interface Feedback {
  id: string;
  type: string;
  content: string;
  rating: number | null;
  is_useful: boolean;
  status: 'open' | 'in_review' | 'closed';
  created_at: string;
  tester: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
  attachments: FeedbackAttachment[];
}

interface BetaManagementProps {
  appId: string;
  config: BetaConfig;
  onConfigChange: (updates: Partial<BetaConfig>) => void;
}

export function BetaManagement({ appId, config, onConfigChange }: BetaManagementProps) {
  const { t } = useTranslation('beta');
  const { language } = useLanguage();
  const { updateTesterStatus, removeTester, markFeedbackUseful, addTester } = useBetaSquad(appId);
  
  const [testers, setTesters] = useState<Tester[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loadingTesters, setLoadingTesters] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [testerFilter, setTesterFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'open' | 'in_review' | 'closed'>('all');
  const [testerToRemove, setTesterToRemove] = useState<Tester | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (config.beta_active) {
      fetchTesters();
      fetchFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.beta_active, appId]);

  const fetchTesters = async () => {
    setLoadingTesters(true);
    try {
      const { data, error } = await supabase
        .from('beta_testers')
        .select(`
          id,
          user_id,
          status,
          joined_at,
          feedback_count,
          profile:profiles!beta_testers_user_id_fkey(id, username, name, avatar_url)
        `)
        .eq('app_id', appId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setTesters((data || []) as unknown as Tester[]);
    } catch (err) {
      console.error('Error fetching testers:', err);
    } finally {
      setLoadingTesters(false);
    }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const { data: feedbackData, error } = await supabase
        .from('beta_feedback')
        .select(`
          id,
          type,
          content,
          rating,
          is_useful,
          status,
          created_at,
          tester:profiles!beta_feedback_tester_id_fkey(id, username, name, avatar_url)
        `)
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch attachments
      const feedbackIds = (feedbackData || []).map(f => f.id);
      const attachmentsByFeedback: Record<string, FeedbackAttachment[]> = {};
      
      if (feedbackIds.length > 0) {
        const { data: attachments } = await supabase
          .from('beta_feedback_attachments')
          .select('id, feedback_id, file_url, file_name, file_type')
          .in('feedback_id', feedbackIds);

        (attachments || []).forEach(att => {
          const feedbackId = (att as unknown as { feedback_id: string }).feedback_id;
          if (!attachmentsByFeedback[feedbackId]) {
            attachmentsByFeedback[feedbackId] = [];
          }
          attachmentsByFeedback[feedbackId].push({
            id: att.id,
            file_url: att.file_url,
            file_name: att.file_name,
            file_type: att.file_type,
          });
        });
      }

      const feedbackWithAttachments = (feedbackData || []).map(f => ({
        ...f,
        status: (f.status || 'open') as 'open' | 'in_review' | 'closed',
        attachments: attachmentsByFeedback[f.id] || [],
      }));

      setFeedback(feedbackWithAttachments as unknown as Feedback[]);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleAccept = async (testerId: string) => {
    const result = await updateTesterStatus(testerId, 'accepted');
    if (result.success) {
      toast.success(t('accept'));
      fetchTesters();
    }
  };

  const handleReject = async (testerId: string) => {
    const result = await updateTesterStatus(testerId, 'rejected');
    if (result.success) {
      toast.success(t('reject'));
      fetchTesters();
    }
  };

  const confirmRemoveTester = async () => {
    if (!testerToRemove) return;
    const result = await removeTester(testerToRemove.id);
    if (result.success) {
      toast.success(t('remove'));
      fetchTesters();
    }
    setTesterToRemove(null);
  };

  const handleMarkUseful = async (feedbackId: string, currentValue: boolean) => {
    const result = await markFeedbackUseful(feedbackId, !currentValue);
    if (result.success) {
      setFeedback(prev => prev.map(f => 
        f.id === feedbackId ? { ...f, is_useful: !currentValue } : f
      ));
    }
  };

  const handleMarkResolved = async (feedbackId: string) => {
    const { error } = await supabase
      .from('beta_feedback')
      .update({ 
        status: 'in_review',
        resolved_by_owner: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', feedbackId);

    if (!error) {
      setFeedback(prev => prev.map(f => 
        f.id === feedbackId ? { ...f, status: 'in_review' as const } : f
      ));
      toast.success(t('markResolved'));
    }
  };

  const handleCloseFeedback = async (feedbackId: string) => {
    const { error } = await supabase
      .from('beta_feedback')
      .update({ status: 'closed' })
      .eq('id', feedbackId);

    if (!error) {
      setFeedback(prev => prev.map(f => 
        f.id === feedbackId ? { ...f, status: 'closed' as const } : f
      ));
      toast.success(t('feedbackClosed'));
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    const { error } = await supabase
      .from('beta_feedback')
      .delete()
      .eq('id', feedbackId);

    if (!error) {
      setFeedback(prev => prev.filter(f => f.id !== feedbackId));
      toast.success(t('deleteReport'));
    }
  };

  const handleAddTester = async (userId: string) => {
    const res = await addTester(userId);
    if (res.success) {
      fetchTesters();
    }
    return res;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4 text-destructive" />;
      case 'ux': return <Palette className="w-4 h-4 text-primary" />;
      case 'feature': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      default: return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bug': return t('reportBug');
      case 'ux': return t('reportUx');
      case 'feature': return t('reportFeature');
      default: return t('reportOther');
    }
  };

  // Filter and sort testers
  const filteredTesters = testers
    .filter(t => testerFilter === 'all' || t.status === testerFilter)
    .sort((a, b) => {
      const order = { accepted: 0, pending: 1, rejected: 2 };
      return (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3);
    });

  const filteredFeedback = feedback.filter(f => 
    feedbackFilter === 'all' || f.status === feedbackFilter
  );

  const pendingTesters = testers.filter(t => t.status === 'pending');
  const acceptedTesters = testers.filter(t => t.status === 'accepted');
  const openFeedback = feedback.filter(f => f.status === 'open');

  return (
    <div className="space-y-4">
      {/* Activate Beta Switch - Always visible */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div className="space-y-0.5">
          <Label className="text-base font-medium">{t('activateBeta')}</Label>
          <p className="text-sm text-muted-foreground">
            {config.beta_active 
              ? t('betaActiveDescription')
              : t('betaInactiveDescription')}
          </p>
        </div>
        <Switch
          checked={config.beta_active}
          onCheckedChange={(checked) => onConfigChange({ beta_active: checked })}
        />
      </div>

      {config.beta_active && (
        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox" className="gap-1.5 md:gap-2 relative">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Feedback</span>
              {openFeedback.length > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {openFeedback.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="squad" className="gap-1.5 md:gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Squad</span>
              <Badge variant="secondary" className="h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full text-xs">
                {acceptedTesters.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-1.5 md:gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Inbox Feedback Content */}
          <TabsContent value="inbox" className="mt-4 space-y-4">
            <div className="flex justify-end items-center">
              <Select value={feedbackFilter} onValueChange={(v) => setFeedbackFilter(v as typeof feedbackFilter)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filterAll')}</SelectItem>
                  <SelectItem value="open">{t('filterOpen')}</SelectItem>
                  <SelectItem value="in_review">{t('filterInReview')}</SelectItem>
                  <SelectItem value="closed">{t('filterClosed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredFeedback.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>{t('noFeedback')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedback.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-lg border bg-card hover:border-primary/20 transition-colors group"
                  >
                    {/* Content - Main Focus */}
                    <p className="text-base text-foreground mb-3">{item.content}</p>
                    
                    {/* Attachments */}
                    {item.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.attachments.map((att) => (
                          <button
                            key={att.id}
                            onClick={() => window.open(att.file_url, '_blank')}
                            className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity border"
                          >
                            <img
                              src={att.file_url}
                              alt={att.file_name}
                              className="h-16 w-16 object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Footer: User Info & Actions */}
                    <div className="flex items-center justify-between mt-2">
                       <div className="flex items-center gap-3">
                          <Link 
                            to={item.tester?.username ? `/@${item.tester.username}` : '#'}
                            className="flex items-center gap-2 group/user"
                          >
                            <Avatar className="w-6 h-6 border border-border">
                              <AvatarImage src={item.tester?.avatar_url || ''} />
                              <AvatarFallback className="text-[10px]">{item.tester?.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-muted-foreground group-hover/user:text-foreground transition-colors leading-none">
                                {item.tester?.name || item.tester?.username}
                              </span>
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider mt-1",
                                item.status === 'open' ? "text-blue-500" : 
                                item.status === 'in_review' ? "text-yellow-500" : "text-muted-foreground"
                              )}>
                                {item.status === 'open' ? t('feedbackOpen') : 
                                 item.status === 'in_review' ? t('feedbackInReview') : t('feedbackClosed')}
                              </span>
                            </div>
                          </Link>
                          
                          {/* Date separator */}
                          <span className="text-muted-foreground/40 text-[10px]">•</span>
                          
                          <span className="text-xs text-muted-foreground/60">
                             {format(new Date(item.created_at), 'dd MMM', {
                                locale: language === 'es' ? es : enUS
                             })}
                          </span>
                       </div>

                       {/* Actions & subtle status indicator if needed, but user wanted clean. 
                           I'll keep just the menu. */}
                        <div className="flex items-center gap-1">
                           <Button
                             size="sm"
                             variant="ghost"
                             className={cn(
                               "h-8 w-8 rounded-full p-0 transition-all",
                               item.is_useful ? "text-red-500 hover:text-red-600 bg-red-50" : "text-muted-foreground/40 hover:text-red-500 hover:bg-red-50"
                             )}
                             onClick={() => handleMarkUseful(item.id, item.is_useful)}
                             title={item.is_useful ? t('markedUseful') : t('markUseful')}
                           >
                             <Heart className={cn("w-4 h-4", item.is_useful && "fill-current")} />
                           </Button>

                           <FeedbackActionMenu
                             feedbackId={item.id}
                             status={item.status}
                             onMarkResolved={() => handleMarkResolved(item.id)}
                             onClose={() => handleCloseFeedback(item.id)}
                             onDelete={() => handleDeleteFeedback(item.id)}
                           />
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Squad & Solicitudes Content */}
          <TabsContent value="squad" className="mt-4 space-y-4">
            <div className="flex justify-end items-center py-2 px-1 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => setIsSearchOpen(true)}
                  className="gap-2 h-9 px-4 rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('addTester') || 'Agregar Tester'}</span>
                </Button>
                <Select value={testerFilter} onValueChange={(v) => setTesterFilter(v as typeof testerFilter)}>
                  <SelectTrigger className="w-32 h-9 rounded-full bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filterAll')}</SelectItem>
                    <SelectItem value="pending">{t('pendingRequests')}</SelectItem>
                    <SelectItem value="accepted">{t('acceptedTesters')}</SelectItem>
                    <SelectItem value="rejected">Rechazados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

                {filteredTesters.map((tester) => (
                  <div 
                    key={tester.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-card border-none shadow-sm hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={tester.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(tester.profile?.name || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/@${tester.profile?.username}`}
                            target="_blank"
                            className="text-sm font-semibold truncate hover:text-primary transition-colors"
                          >
                            {tester.profile?.name || tester.profile?.username || 'User'}
                          </Link>
                          <Badge 
                            variant={tester.status === 'accepted' ? 'default' : tester.status === 'pending' ? 'secondary' : 'outline'}
                            className="text-[10px] h-5 px-1.5"
                          >
                            {tester.status === 'accepted' ? t('statusAccepted') : 
                             tester.status === 'pending' ? t('statusPending') : t('statusRejected')}
                          </Badge>
                        </div>
                        <Link 
                          to={`/@${tester.profile?.username}`}
                          target="_blank"
                          className="text-[11px] text-muted-foreground block hover:text-primary transition-colors"
                        >
                          @{tester.profile?.username || 'user'}
                        </Link>
                        {tester.feedback_count > 0 && (
                          <div className="flex items-center text-[10px] text-muted-foreground mt-1">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {tester.feedback_count} {t('feedbackCount').replace('{count}', '')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {tester.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 p-0"
                            onClick={() => handleAccept(tester.id)}
                            title={t('accept')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 p-0"
                            onClick={() => handleReject(tester.id)}
                            title={t('reject')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {tester.status !== 'pending' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 p-0"
                          onClick={() => setTesterToRemove(tester)}
                          title={t('remove')}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
          </TabsContent>

          {/* Configuration Content */}
          <TabsContent value="config" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('betaMode')}</Label>
                <Select
                  value={config.beta_mode}
                  onValueChange={(value) => onConfigChange({ beta_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t('modeOpen')}</SelectItem>
                    <SelectItem value="closed">{t('modeClosed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('limit')}</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={config.beta_limit === 0 ? '' : config.beta_limit}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      onConfigChange({ beta_limit: 0 });
                    } else {
                      const num = parseInt(value);
                      if (!isNaN(num) && num >= 1 && num <= 100) {
                        onConfigChange({ beta_limit: num });
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const num = parseInt(e.target.value);
                    if (isNaN(num) || num < 1) {
                      onConfigChange({ beta_limit: 1 });
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('secretLink')}</Label>
              <DebouncedInput
                value={config.beta_link || ''}
                onValueChange={(value) => onConfigChange({ beta_link: value || null })}
                placeholder={t('secretLinkPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('instructionsLabel')}</Label>
                <Link 
                  to="/post/writing-tester-instructions" 
                  target="_blank"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {t('viewGuide')}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <MarkdownEditor
                value={config.beta_instructions || ''}
                onChange={(value) => onConfigChange({ beta_instructions: value || null })}
                placeholder={t('instructionsPlaceholder')}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Remove Tester Confirmation Dialog */}
      <AlertDialog open={!!testerToRemove} onOpenChange={(open) => !open && setTesterToRemove(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-destructive" />
              {t('confirmRemoveTitle') || 'Remove Tester'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmRemoveDescription') || 'Are you sure you want to remove'}{' '}
              <span className="font-semibold text-foreground">
                {testerToRemove?.profile?.name || testerToRemove?.profile?.username || 'this user'}
              </span>
              {' '}{t('confirmRemoveFromSquad') || 'from your beta squad? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveTester}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('confirmRemove') || 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TesterSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleAddTester}
      />
    </div>
  );
}
