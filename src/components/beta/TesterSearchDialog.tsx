import { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Search, Users, UserPlus, Loader2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfileSummary {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
}

interface TesterSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (userId: string) => Promise<{ success: boolean; alreadyExists?: boolean; error?: string }>;
}

export function TesterSearchDialog({ isOpen, onClose, onSelect }: TesterSearchDialogProps) {
  const { t } = useTranslation('beta');
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ProfileSummary[]>([]);
  const [suggestions, setSuggestions] = useState<ProfileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch people the user follows or who follow the user
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from('follows')
          .select('follower_id, profiles!follows_follower_id_fkey(id, name, username, avatar_url)')
          .eq('following_id', user.id)
          .limit(10),
        supabase
          .from('follows')
          .select('following_id, profiles!follows_following_id_fkey(id, name, username, avatar_url)')
          .eq('follower_id', user.id)
          .limit(10),
      ]);

      const followers = (followersRes.data || []).map((f: { follower_id: string; profiles: ProfileSummary | null }) => f.profiles);
      const following = (followingRes.data || []).map((f: { following_id: string; profiles: ProfileSummary | null }) => f.profiles);

      // Unique profiles
      const combined = [...followers, ...following].reduce((acc: ProfileSummary[], curr: ProfileSummary | null) => {
        if (!curr) return acc;
        if (!acc.find(p => p.id === curr.id)) {
          acc.push({
            id: curr.id,
            name: curr.name || 'User',
            username: curr.username || 'unknown',
            avatar_url: curr.avatar_url || undefined,
          });
        }
        return acc;
      }, []);

      setSuggestions(combined);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      fetchSuggestions();
    }
  }, [isOpen, user, fetchSuggestions]);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .or(`username.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .neq('id', user?.id || '')
        .limit(10);

      if (error) throw error;
      setResults((data || []).map(p => ({
        id: p.id,
        name: p.name || 'User',
        username: p.username || 'unknown',
        avatar_url: p.avatar_url || undefined,
      })));
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  const handleAdd = async (userId: string) => {
    setAddingId(userId);
    try {
      const res = await onSelect(userId);
      if (res.success) {
        if (res.alreadyExists) {
          toast.info(t('userAlreadyInSquad'));
        } else {
          toast.success(t('testerAddedSuccessfully'));
        }
      } else {
        toast.error(res.error || t('failedToAddTester'));
      }
    } finally {
      setAddingId(null);
    }
  };

  const displayList = searchTerm.trim().length >= 2 ? results : suggestions;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden sm:rounded-2xl border-none shadow-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            {t('searchTesterTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('searchTesterDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-border bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-10 h-11 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-[300px]">
          <div className="p-4 space-y-1">
            {searchTerm.trim().length < 2 && suggestions.length > 0 && (
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
                {t('suggestedFromNetwork')}
              </h4>
            )}
            
            {isSearching || (isLoading && searchTerm.trim().length < 2) ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-sm">{t('searchingUsers')}</p>
              </div>
            ) : displayList.length > 0 ? (
              displayList.map((profile) => (
                <div 
                  key={profile.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {profile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold leading-none mb-1">
                        {profile.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        @{profile.username}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 gap-1.5 text-xs hover:bg-primary hover:text-primary-foreground group-hover:opacity-100 transition-all"
                    onClick={() => handleAdd(profile.id)}
                    disabled={addingId === profile.id}
                  >
                    {addingId === profile.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {t('add')}
                  </Button>
                </div>
              ))
            ) : searchTerm.trim().length >= 2 ? (
              <div className="text-center py-12 px-6">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">{t('noResults') || `No users found for "${searchTerm}"`}</p>
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                <p className="text-sm text-muted-foreground">{t('startTypingToSearch')}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
          <Button variant="ghost" onClick={onClose} size="sm">
            {t('close') || 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
