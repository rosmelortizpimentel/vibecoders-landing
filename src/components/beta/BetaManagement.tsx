import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useBetaSquad } from '@/hooks/useBetaSquad';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DebouncedInput, DebouncedTextarea } from '@/components/ui/debounced-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  ThumbsUp,
  MessageSquare,
  Clock,
  Bug,
  Lightbulb,
  Palette,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

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

interface Feedback {
  id: string;
  type: string;
  content: string;
  rating: number | null;
  is_useful: boolean;
  created_at: string;
  tester: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
}

interface BetaManagementProps {
  appId: string;
  config: BetaConfig;
  onConfigChange: (updates: Partial<BetaConfig>) => void;
}

export function BetaManagement({ appId, config, onConfigChange }: BetaManagementProps) {
  const { t } = useTranslation('beta');
  const { updateTesterStatus, removeTester, markFeedbackUseful } = useBetaSquad(appId);
  
  const [testers, setTesters] = useState<Tester[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loadingTesters, setLoadingTesters] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

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
      const { data, error } = await supabase
        .from('beta_feedback')
        .select(`
          id,
          type,
          content,
          rating,
          is_useful,
          created_at,
          tester:profiles!beta_feedback_tester_id_fkey(id, username, name, avatar_url)
        `)
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback((data || []) as unknown as Feedback[]);
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

  const pendingTesters = testers.filter(t => t.status === 'pending');
  const acceptedTesters = testers.filter(t => t.status === 'accepted');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-primary" />
        <span className="font-medium">{t('manageBeta')}</span>
        {config.beta_active && (
          <Badge variant="secondary" className="ml-2">
            {acceptedTesters.length}/{config.beta_limit}
          </Badge>
        )}
      </div>

      {/* Config Section */}
      <div className="space-y-4">
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
                  to="/post/end-user-beta-testing-guide" 
                  target="_blank"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {t('viewGuide') || 'Ver guía'}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <DebouncedTextarea
                value={config.beta_instructions || ''}
                onValueChange={(value) => onConfigChange({ beta_instructions: value || null })}
                placeholder={t('instructionsPlaceholder')}
                rows={6}
                className="min-h-[160px]"
              />
            </div>
          </>
        )}
      </div>

      {config.beta_active && (
        <>
          <Separator />

          {/* Pending Requests */}
          {config.beta_mode === 'closed' && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('pendingRequests')} ({pendingTesters.length})
              </h4>
              {pendingTesters.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noPending')}</p>
              ) : (
                <div className="space-y-2">
                  {pendingTesters.map((tester) => (
                    <div 
                      key={tester.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={tester.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {(tester.profile?.name || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {tester.profile?.name || tester.profile?.username || 'User'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Accepted Testers */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              {t('acceptedTesters')} ({acceptedTesters.length})
            </h4>
            {acceptedTesters.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noTesters')}</p>
            ) : (
              <div className="space-y-2">
                {acceptedTesters.map((tester) => (
                  <div 
                    key={tester.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={tester.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {(tester.profile?.name || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium">
                          {tester.profile?.name || tester.profile?.username || 'User'}
                        </span>
                        {tester.feedback_count > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({tester.feedback_count} {t('feedbackCount').replace('{count}', '')})
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(tester.id)}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Feedback Inbox */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t('feedbackInbox')} ({feedback.length})
            </h4>
            {feedback.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noFeedback')}</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {feedback.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 rounded-lg border bg-card space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(item.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.tester?.name || item.tester?.username}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant={item.is_useful ? 'default' : 'outline'}
                        className="h-7 gap-1"
                        onClick={() => handleMarkUseful(item.id, item.is_useful)}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {item.is_useful ? t('marked') : t('markUseful')}
                      </Button>
                    </div>
                    <p className="text-sm">{item.content}</p>
                    {item.rating && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star}
                            className={star <= item.rating! ? 'text-yellow-400' : 'text-muted'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
