import { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  User, 
  Heart, 
  Rocket,
  ShieldAlert
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTranslation } from '@/hooks/useTranslation';
import { useFollowAction } from '@/hooks/useFollowAction';
import { useFollowList } from '@/hooks/useFollowList';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
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
import sheepLogo from '@/assets/vibecoders-logo.png';

interface ProfileSummary {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bannerUrl?: string;
  tagline?: string;
  activeAppsCount?: number;
  mutualConnectionsCount?: number;
  isFollowing?: boolean;
}

export default function Vibers() {
  const { stats, isLoading } = useDashboardStats();
  const { t } = useTranslation('vibers');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  // Removed filterUsers function to use direct filtering in useMemo

  const filteredFollowers = useMemo(() => 
    (stats?.followers || [])
      .filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => (b.activeAppsCount || 0) - (a.activeAppsCount || 0)),
    [stats?.followers, searchTerm]
  );

  const filteredFollowing = useMemo(() => 
    (stats?.following || [])
      .filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => (b.activeAppsCount || 0) - (a.activeAppsCount || 0)),
    [stats?.following, searchTerm]
  );

  return (
    <div className="flex-1 space-y-8 w-full max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('search')} 
            className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'followers' | 'following')} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl border border-border/50">
            <TabsTrigger value="followers" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
              {t('followersTab')}
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none pointer-events-none px-1.5 py-0 h-5 text-[10px] font-bold">
                {isLoading ? '...' : (stats?.followersCount ?? 0)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="following" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
              {t('followingTab')}
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-none pointer-events-none px-1.5 py-0 h-5 text-[10px] font-bold">
                {isLoading ? '...' : (stats?.followingCount ?? 0)}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="followers" className="m-0">
          <ViberGrid users={filteredFollowers} isLoading={isLoading} emptyMessage={t('empty.title')} emptySub={t('empty.description')} />
        </TabsContent>
        <TabsContent value="following" className="m-0">
          <ViberGrid users={filteredFollowing} isLoading={isLoading} emptyMessage={t('empty.title')} emptySub={t('empty.description')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ViberGrid({ users, isLoading, emptyMessage, emptySub }: { users: ProfileSummary[], isLoading: boolean, emptyMessage: string, emptySub: string }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="h-72 rounded-xl border-border/40 bg-card/50 overflow-hidden">
            <Skeleton className="h-24 w-full" />
            <div className="flex flex-col items-center -mt-10 px-4 pb-4">
              <Skeleton className="h-20 w-20 rounded-full border-4 border-background" />
              <Skeleton className="h-5 w-32 mt-4" />
              <Skeleton className="h-3 w-24 mt-2" />
              <Skeleton className="h-8 w-full mt-auto rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground/30" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{emptyMessage}</h3>
        <p className="text-muted-foreground text-center max-w-md mt-2">
          {emptySub}
        </p>
        <Button variant="outline" className="mt-8 rounded-full" asChild>
          <Link to="/explore">Explorar Comunidad</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.map((user) => (
        <ViberCard key={user.id} user={user} />
      ))}
    </div>
  );
}

function ViberCard({ user }: { user: ProfileSummary }) {
  const navigate = useNavigate();
  const { follow, unfollow, isProcessing } = useFollowAction();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const { t } = useTranslation('vibers');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following' | 'mutual'>('followers');

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFollowing) {
      setShowConfirm(true);
    } else {
      handleFinalToggle();
    }
  };

  const handleFinalToggle = async () => {
    if (isProcessing) return;
    if (isFollowing) {
      const success = await unfollow(user.id);
      if (success) setIsFollowing(false);
    } else {
      const success = await follow(user.id);
      if (success) setIsFollowing(true);
    }
    setShowConfirm(false);
  };

  const openModal = (e: React.MouseEvent, type: 'followers' | 'following' | 'mutual') => {
    e.preventDefault();
    e.stopPropagation();
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 group h-full">
        <div className="relative h-24 overflow-hidden shrink-0 bg-muted/20">
          {user.bannerUrl ? (
            <img 
              src={user.bannerUrl} 
              alt="Banner" 
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/5 to-indigo-500/10" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
        </div>

        <div className="relative -mt-10 flex flex-col items-center px-4 pb-6 flex-1">
          <Link to={`/@${user.username}`} className="relative group/avatar shrink-0">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl scale-100 group-hover/avatar:scale-105 transition-transform duration-300">
              <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
              <AvatarFallback className="bg-muted/50 text-xl font-bold flex items-center justify-center overflow-hidden">
                <img src={sheepLogo} alt="sheep fallback" className="w-12 h-12 grayscale opacity-40" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          </Link>

          <div className="mt-3 flex flex-col items-center text-center w-full">
            <h3 className="text-base font-bold text-foreground leading-tight truncate w-full px-2">
              {user.name}
            </h3>
            {user.tagline && (
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight italic line-clamp-1 px-2">
                {user.tagline}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground/60 font-medium truncate w-full px-2">
              @{user.username}
            </p>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 w-full flex-1 justify-center">
            {(user.activeAppsCount || 0) > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Rocket className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {user.activeAppsCount} {t('activeApps')}
                </span>
              </div>
            )}
            
            {(user.mutualConnectionsCount || 0) > 0 && (
              <button 
                onClick={(e) => openModal(e, 'mutual')}
                className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-primary transition-colors py-1 group/mutual"
              >
                <div className="flex -space-x-2 mr-0.5">
                  <div className="w-4 h-4 rounded-full border border-background bg-muted overflow-hidden flex items-center justify-center">
                    <img src={sheepLogo} className="w-2.5 h-2.5 grayscale opacity-50" />
                  </div>
                  <div className="w-4 h-4 rounded-full border border-background bg-primary/20" />
                </div>
                <span className="font-medium underline-offset-4 group-hover/mutual:underline">
                  {t(user.mutualConnectionsCount === 1 ? 'mutualConnections_one' : 'mutualConnections_other', { count: user.mutualConnectionsCount })}
                </span>
              </button>
            )}
          </div>

          <div className="mt-5 w-full shrink-0">
            <Button 
              size="sm" 
              variant={isFollowing ? "outline" : "default"}
              className={cn(
                "w-full rounded-xl font-bold text-xs transition-all duration-300 h-9",
                isFollowing ? "bg-background/50 border-primary/30 hover:bg-destructive/10 hover:border-destructive hover:text-destructive group/unfollow" : "bg-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              )}
              onClick={handleToggle}
              disabled={isProcessing}
            >
              {isFollowing ? (
                <>
                  <span className="group-hover/unfollow:hidden">
                    {t('following')}
                  </span>
                  <span className="hidden group-hover/unfollow:inline text-destructive">
                    {t('confirmUnfollow.confirm')}
                  </span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 mr-2 fill-current" />
                  {t('follow')}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmUnfollowDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleFinalToggle}
        userName={user.name}
      />

      <ConnectionsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user.id}
        userName={user.name}
        type={modalType}
      />
    </>
  );
}

function ConfirmUnfollowDialog({ isOpen, onClose, onConfirm, userName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, userName: string }) {
  const { t } = useTranslation('vibers');
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[380px] rounded-3xl border-border/40 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            {t('confirmUnfollow.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {t('confirmUnfollow.message', { name: userName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel className="rounded-xl border-border text-xs font-semibold">
            {t('confirmUnfollow.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold"
          >
            {t('confirmUnfollow.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConnectionsModal({ isOpen, onClose, userId, userName, type }: { isOpen: boolean, onClose: () => void, userId: string, userName: string, type: 'followers' | 'following' | 'mutual' }) {
  const { t } = useTranslation('vibers');
  const [searchTerm, setSearchTerm] = useState('');
  const { profiles, loading } = useFollowList(userId, type === 'mutual' ? 'followers' : type);

  const filteredProfiles = profiles.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const titleMap = {
    followers: t('followersTab'),
    following: t('followingTab'),
    mutual: t('mutualContactsTab')
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/40 p-0 overflow-hidden rounded-3xl flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span className="truncate">{titleMap[type]} - {userName}</span>
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('search')} 
              className="pl-10 h-9 bg-muted/30 border-none rounded-xl text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProfiles.length > 0 ? (
            <div className="space-y-1">
              {filteredProfiles.map((profile) => (
                <Link 
                  key={profile.id} 
                  to={`/@${profile.username}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || ''} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                        {profile.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {profile.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        @{profile.username}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <User className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">{t('empty.title')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
