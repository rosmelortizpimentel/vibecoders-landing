import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS, fr, pt } from 'date-fns/locale';
import { Heart, UserPlus, FlaskConical, Bell, MessageSquare, Trash2, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Notification } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete?: (id: string) => void;
  onClose?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onRead,
  onDelete,
  onClose
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('notifications');
  const { language } = useLanguage();

  const getDateLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'fr': return fr;
      case 'pt': return pt;
      case 'es':
      default: return es;
    }
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case 'app_like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'beta_req': return <FlaskConical className="w-4 h-4 text-purple-500" />;
      case 'system': return <Bell className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getContent = () => {
    const actorName = notification.actor?.name || notification.actor?.username || t('messages.someone');
    const appName = notification.meta?.app_name || t('messages.yourApp');

    switch (notification.type) {
      case 'app_like':
        return (
          <p className="text-[13px]">
            <span className="font-bold">{actorName}</span> {t('messages.appLike')} <span className="font-bold">{String(appName)}</span>
          </p>
        );
      case 'follow':
        return (
          <p className="text-[13px]">
            <span className="font-bold">{actorName}</span> {t('messages.follow')}
          </p>
        );
      case 'beta_req':
        return (
          <p className="text-[13px]">
            <span className="font-bold">{actorName}</span> {t('messages.betaReq')} <span className="font-bold">{String(appName)}</span>
          </p>
        );
      case 'system':
        return (
          <p className="text-[13px]">
            {String(notification.meta?.message || t('messages.systemFallback'))}
          </p>
        );
      default:
        return <p className="text-[13px]">{t('messages.generic')}</p>;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRead(notification.id);
    if (notification.resource_slug) {
      navigate(notification.resource_slug);
    } else if (notification.type === 'follow' && notification.actor?.username) {
      navigate(`/@${notification.actor.username}`);
    }
    if (onClose) onClose();
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "flex gap-3 py-3 px-4 cursor-pointer transition-all duration-200 group relative overflow-hidden w-full",
        notification.read_at 
          ? "bg-background hover:bg-accent/30" 
          : "bg-[#F8F9FA] hover:bg-[#F1F3F5]"
      )}
    >
      {/* Unread indicator pill */}
      {!notification.read_at && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full bg-secondary shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
      )}
      <Avatar className={cn(
        "w-9 h-9 border border-border transition-opacity",
        notification.read_at && "opacity-60"
      )}>
        {notification.actor?.avatar_url ? (
          <AvatarImage src={notification.actor.avatar_url} />
        ) : (
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {notification.actor?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <div className={cn("shrink-0 transition-opacity", notification.read_at && "opacity-40")}>
              {getIcon()}
            </div>
            <div className={cn(
              "flex-1 min-w-0 transition-colors",
              notification.read_at ? "text-muted-foreground" : "text-slate-900 font-medium"
            )}>
              {getContent()}
            </div>
          </div>
          <span className={cn(
            "text-[9px] uppercase font-medium transition-opacity mt-0.5 ml-6",
            notification.read_at ? "text-muted-foreground/60" : "text-muted-foreground"
          )}>
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: getDateLocale() })}
          </span>
        </div>

        {/* Primary Action Button (e.g. Ver Perfil) - Always visible if applicable */}
        <div className="shrink-0 flex items-center gap-2 pr-12 group-hover:pr-[84px] transition-all duration-200">
          {notification.type === 'follow' && !notification.read_at && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-[11px] px-2 hov-button whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                if (notification.actor?.username) {
                   navigate(`/@${notification.actor.username}`);
                }
              }}
            >
              {t('actions.viewProfile')}
            </Button>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4 group-hover:translate-x-0">
        {!notification.read_at && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground shadow-sm hov-button"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification.id);
            }}
            title={t('actions.markAsRead')}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full bg-background border border-border hover:bg-red-500 hover:text-white shadow-sm hov-button"
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(notification.id);
          }}
          title={t('actions.delete')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
