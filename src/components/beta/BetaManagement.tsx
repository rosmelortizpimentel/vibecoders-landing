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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  MessageSquare,
  Bug,
  Lightbulb,
  Palette,
  HelpCircle,
  ExternalLink,
  Star,
  Users,
  ChevronDown,
  Settings,
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
  const { updateTesterStatus, removeTester, markFeedbackUseful } = useBetaSquad(appId);
  
  const [testers, setTesters] = useState<Tester[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loadingTesters, setLoadingTesters] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [testerFilter, setTesterFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'open' | 'in_review' | 'closed'>('all');

  useEffect(() => {
    if (config.beta_active) {
      fetchTesters();
      fetchFeedback();
    }
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
      let attachmentsByFeedback: Record<string, FeedbackAttachment[]> = {};
      
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

  const handleRemove = async (testerId: string) => {
    const result = await removeTester(testerId);
    if (result.success) {
      toast.success(t('remove'));
      fetchTesters();
    }
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

  // Collapsible states
  const [configOpen, setConfigOpen] = useState(true);
  const [testersOpen, setTestersOpen] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(true);

  return (
    <div className="space-y-4">
      {/* Gestionar Beta Section */}
      <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="font-medium">{t('manageBeta')}</span>
            {config.beta_active && (
              <Badge variant="secondary" className="ml-2">
                {acceptedTesters.length}/{config.beta_limit}
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            configOpen && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          {/* Config Section */}
          <div className="flex items-center justify-between">
            <Label htmlFor="beta-active">{t('activateBeta')}</Label>
            <Switch
              id="beta-active"
              checked={config.beta_active}
              onCheckedChange={(checked) => onConfigChange({ beta_active: checked })}
            />
          </div>

          {config.beta_active && (
            <>
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
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      {config.beta_active && (
        <>
          {/* Testers Section */}
          <Collapsible open={testersOpen} onOpenChange={setTestersOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">Testers</span>
                <Badge variant="secondary" className="ml-1">
                  {testers.length}
                </Badge>
                {pendingTesters.length > 0 && (
                  <Badge variant="default" className="ml-1">
                    {pendingTesters.length} {t('pendingRequests').toLowerCase()}
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                testersOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3">
              <div className="flex justify-end">
                <Select value={testerFilter} onValueChange={(v) => setTesterFilter(v as typeof testerFilter)}>
                  <SelectTrigger className="w-32 h-8">
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

              {filteredTesters.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noTesters')}</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredTesters.map((tester) => (
                    <div 
                      key={tester.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={tester.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {(tester.profile?.name || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">
                            {tester.profile?.name || tester.profile?.username || 'User'}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={tester.status === 'accepted' ? 'default' : tester.status === 'pending' ? 'secondary' : 'outline'}
                              className="text-xs h-5"
                            >
                              {tester.status === 'accepted' ? t('statusAccepted') : 
                               tester.status === 'pending' ? t('statusPending') : t('statusRejected')}
                            </Badge>
                            {tester.feedback_count > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {tester.feedback_count} {t('feedbackCount').replace('{count}', '')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {tester.status === 'pending' && (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => handleAccept(tester.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleReject(tester.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {tester.status !== 'pending' && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemove(tester.id)}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Feedback Inbox Section */}
          <Collapsible open={feedbackOpen} onOpenChange={setFeedbackOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-medium">{t('feedbackInbox')}</span>
                <Badge variant="secondary" className="ml-1">
                  {feedback.length}
                </Badge>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                feedbackOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3">
              <div className="flex justify-end">
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
                <p className="text-sm text-muted-foreground">{t('noFeedback')}</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredFeedback.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-lg border bg-card space-y-2"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getTypeIcon(item.type)}
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(item.type)}
                          </Badge>
                          <FeedbackStatusBadge status={item.status} />
                          <Link 
                            to={item.tester?.username ? `/@${item.tester.username}` : '#'}
                            className="text-xs text-muted-foreground hover:underline"
                          >
                            {item.tester?.name || item.tester?.username}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'dd MMM, HH:mm', {
                              locale: language === 'es' ? es : enUS
                            })}
                          </span>
                          <FeedbackActionMenu
                            feedbackId={item.id}
                            isUseful={item.is_useful}
                            status={item.status}
                            onMarkUseful={() => handleMarkUseful(item.id, item.is_useful)}
                            onMarkResolved={() => handleMarkResolved(item.id)}
                            onClose={() => handleCloseFeedback(item.id)}
                            onDelete={() => handleDeleteFeedback(item.id)}
                          />
                        </div>
                      </div>
                      <p className="text-sm">{item.content}</p>
                      
                      {/* Attachments */}
                      {item.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {item.attachments.map((att) => (
                            <button
                              key={att.id}
                              onClick={() => window.open(att.file_url, '_blank')}
                              className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
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

                      {item.rating && (
                        <div className="flex gap-0.5 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={cn(
                                "w-4 h-4",
                                star <= item.rating! ? 'fill-primary text-primary' : 'text-muted'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
}
