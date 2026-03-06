import { useState, useMemo, useEffect } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { usePartnerships, PartnershipApp } from '@/hooks/usePartnerships';
import { PartnershipCard } from '@/components/partnerships/PartnershipCard';
import { useTranslation } from '@/hooks/useTranslation';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { usePageHeader } from '@/contexts/PageHeaderContext';

export default function PartnershipsDirectory() {
  const { data: apps = [], isLoading } = usePartnerships();
  const { categories } = useCategories();
  const { t: tPartner } = useTranslation('partnerships');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setHeaderContent } = usePageHeader();

  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-2 min-w-0">
        <UserPlus className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-foreground truncate">{tPartner('title', { defaultValue: 'Directorio de Partnerships' })}</span>
      </div>
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent, tPartner]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = !searchQuery || 
        app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [apps, searchQuery]);

  const handleContactClick = (app: PartnershipApp) => {
    if (!user) {
      navigate('/choose-plan'); 
      return;
    }

    if (user.id === app.owner.id) {
      return; // Can't contact yourself
    }

    // Redirect to chat with user query param to trigger conversation start logic
    navigate(`/chat?user=${app.owner.id}`);
  };

  return (
    <div className="flex-1 space-y-6 w-full max-w-full overflow-x-hidden min-w-0 px-0.5 pb-24">
      <header className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
          {tPartner('title', { defaultValue: 'Directorio de Partnerships' })}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {tPartner('subtitle', { defaultValue: 'Conecta con otros builders, encuentra inversores y forma alianzas estratégicas.' })}
        </p>
      </header>

      {/* Search Bar */}
      <div className="flex items-center gap-4 px-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={tPartner('filters.searchPlaceholder', { defaultValue: 'Buscar app...' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border shadow-sm focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse border border-border/50" />
          ))}
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
          {filteredApps.map(app => (
            <PartnershipCard key={app.id} app={app} onContactClick={handleContactClick} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-border/50 shadow-sm max-w-2xl mx-auto mt-8">
          <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            {tPartner('emptyState.title', { defaultValue: 'Sin resultados' })}
          </h3>
          <p className="text-muted-foreground">
            {tPartner('emptyState.description', { defaultValue: 'No se encontraron apps abiertas a partnerships.' })}
          </p>
        </div>
      )}
    </div>
  );
}
