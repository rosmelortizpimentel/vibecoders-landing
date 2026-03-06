import { useState, useMemo } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { usePartnerships, PartnershipApp } from '@/hooks/usePartnerships';
import { PartnershipCard } from '@/components/partnerships/PartnershipCard';
import { useTranslation } from '@/hooks/useTranslation';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Footer from '@/components/Footer';
import { useCategories } from '@/hooks/useCategories';

export default function PartnershipsDirectory() {
  const { data: apps = [], isLoading } = usePartnerships();
  const { categories } = useCategories();
  const { t: tPartner } = useTranslation('partnerships');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = !searchQuery || 
        app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || app.partnership_types?.includes(selectedType);
      
      const matchesCategory = selectedCategory === 'all' || app.category?.id === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [apps, searchQuery, selectedType, selectedCategory]);

  const handleContactClick = (app: PartnershipApp) => {
    if (!user) {
      navigate('/choose-plan'); 
      return;
    }

    if (user.id === app.owner.id) {
      return; // Can't contact yourself
    }

    // pre-fill chat
    const message = tPartner('chatPrefill', { 
      appName: app.name, 
      defaultValue: `Hola, vi tu app ${app.name} en el directorio de partnerships y me interesa conectar.`
    });
    
    // Redirect to chat with pre-filled message
    navigate(`/chat/${app.owner.id}`, { state: { initialMessage: message } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur border-border/40">
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">V</span>
            </div>
            <span className="font-bold text-lg hidden sm:block tracking-tight text-foreground">VibeCoders</span>
          </Link>
          <div className="flex items-center gap-2">
             <UserPlus className="w-5 h-5 text-primary" />
             <span className="font-bold text-foreground tracking-tight hidden sm:inline-block">
               {tPartner('title', { defaultValue: 'Directorio de Partnerships' })}
             </span>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <header className="mb-10 max-w-2xl text-center md:text-left mx-auto md:mx-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            {tPartner('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {tPartner('subtitle', { defaultValue: 'Encuentra proyectos buscando Tech, Growth o Investors y colabora para impulsarlos.' })}
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="relative w-full sm:w-auto flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={tPartner('searchPlaceholder', { defaultValue: 'Buscar app...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border shadow-sm focus-visible:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[160px] bg-card border-border shadow-sm">
                <SelectValue placeholder="Tipo de Partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tPartner('allTypes', { defaultValue: 'Todos los tipos' })}</SelectItem>
                <SelectItem value="investor">{tPartner('types.investor.label', { defaultValue: 'Inversor' })}</SelectItem>
                <SelectItem value="tech_partner">{tPartner('types.tech_partner.label', { defaultValue: 'Tech' })}</SelectItem>
                <SelectItem value="growth_partner">{tPartner('types.growth_partner.label', { defaultValue: 'Growth' })}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px] bg-card border-border shadow-sm">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tCommon('allCategories', { defaultValue: 'Todas las categorías' })}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse border border-border/50" />
            ))}
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map(app => (
              <PartnershipCard key={app.id} app={app} onContactClick={handleContactClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-border/50 shadow-sm max-w-2xl mx-auto">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">{tPartner('emptyState.title', { defaultValue: 'Sin resultados' })}</h3>
            <p className="text-muted-foreground">{tPartner('emptyState.description', { defaultValue: 'Modifica los filtros de búsqueda para encontrar apps.' })}</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
