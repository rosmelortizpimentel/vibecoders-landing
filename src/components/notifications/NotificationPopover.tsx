import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCheck, BellOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface NotificationPopoverProps {
  onClose?: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications();
  const navigate = useNavigate();
  const { t } = useTranslation('notifications');

  const handleViewAll = () => {
    if (onClose) onClose();
    setTimeout(() => {
      navigate('/notifications');
    }, 10);
  };

  return (
    <div className="w-[calc(100vw-32px)] sm:w-[380px] flex flex-col h-[500px] overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{t('title')}</h3>
          {unreadCount > 0 && (
            <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-extrabold line-height-none shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[11px] gap-1.5 text-muted-foreground hover:bg-primary hover:text-white transition-colors px-2"
            onClick={(e) => {
              e.stopPropagation();
              markAllAsRead();
            }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {t('markAllAsRead')}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col min-h-full w-full">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-32 w-full">
                <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-border/50 w-full mb-4">
                {notifications.slice(0, 5).map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onRead={markAsRead}
                    onDelete={deleteNotification}
                    onClose={onClose}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 py-12 px-6 text-center space-y-4 w-full">
                 <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-2 border border-border/20 shadow-inner">
                    <BellOff className="w-8 h-8 text-muted-foreground/20" />
                 </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">{t('popover.emptyTitle')}</p>
                    <p className="text-sm text-muted-foreground">
                       {t('popover.emptySubtitle')}
                    </p>
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/10 shrink-0 select-none">
        <Button 
          variant="default" 
          className="w-full h-11 text-xs font-bold hov-button shadow-lg shadow-primary/5 active:scale-[0.98] transition-transform"
          onClick={handleViewAll}
        >
          {t('viewAll')}
        </Button>
      </div>
    </div>
  );
};
