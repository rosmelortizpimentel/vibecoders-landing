import { UserPlus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/useTranslation';
import { PublicApp } from '@/hooks/usePublicApps';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface PartnershipCardProps {
  app: PublicApp;
  onContactClick: (app: PublicApp) => void;
}

export function PartnershipCard({ app, onContactClick }: PartnershipCardProps) {
  const { t: tPartner } = useTranslation('partnerships');
  const { user } = useAuth();

  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-md flex flex-col h-full ring-1 ring-border/50">
      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Logo and Title */}
        <Link to={`/app/${app.id}`} className="flex items-start gap-4 mb-4 group/header">
          <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm transition-transform duration-200 group-hover/header:scale-105">
            {app.logo_url ? (
              <img src={app.logo_url} alt={app.name || ''} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">{app.name?.charAt(0) || 'A'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground leading-tight truncate group-hover/header:text-primary transition-colors">
              {app.name}
            </h3>
            <p className="text-sm font-light text-muted-foreground mt-0.5">
              {app.tagline}
            </p>
          </div>
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {app.partnership_types?.map((type) => (
            <span key={type} className="px-2 py-0.5 rounded-full bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20 text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {tPartner(`types.${type}`)}
            </span>
          ))}
          {app.category && (
            <span className="px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground text-[10px] font-bold uppercase tracking-wider border border-border/50">
              {app.category.name}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
          {app.description}
        </p>

        {/* Footer: Owner info & Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/60">
          <Link to={`/@${app.owner?.username}`} className="flex items-center gap-2 min-w-0 overflow-hidden hover:opacity-80 transition-opacity">
            <Avatar className="h-8 w-8 flex-shrink-0 border border-border shadow-sm">
              <AvatarImage src={app.owner?.avatar_url || undefined} alt={app.owner?.name || ''} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                {(app.owner?.name || 'U').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{app.owner?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">@{app.owner?.username}</p>
            </div>
          </Link>

          {app.open_to_partnerships && user?.id !== app.owner?.id && (
            <button
              onClick={() => onContactClick(app)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-bold shrink-0 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">{tPartner('card.interested', { defaultValue: 'Me interesa' })}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
