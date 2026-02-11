import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { NotificationPopover } from './NotificationPopover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SystemNotificationPopup } from './SystemNotificationPopup';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activePopupNotification, setActivePopupNotification] = useState<any>(null);

  useEffect(() => {
    if (notifications.length > 0 && !activePopupNotification) {
      const autoShowNotif = notifications.find(n => 
        !n.read_at && 
        n.type === 'system' && 
        (n.meta as any)?.auto_show === true
      );
      
      if (autoShowNotif) {
        setActivePopupNotification(autoShowNotif);
      }
    }
  }, [notifications, activePopupNotification]);

  const handleClosePopup = () => {
    if (activePopupNotification) {
      markAsRead(activePopupNotification.id);
    }
    setActivePopupNotification(null);
  };

  const handleManualPopupShow = (notification: any) => {
    setIsOpen(false); // Close the popover to prevent Radix UI locking issues
    setTimeout(() => {
      setActivePopupNotification(notification);
    }, 100);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative h-9 w-9 rounded-full transition-all duration-200 active:scale-90 group",
            isOpen ? "bg-primary text-white" : "text-muted-foreground hover:bg-primary hover:text-white"
          )}
        >
          <Bell className={cn(
            "h-5 w-5 transition-colors",
            unreadCount > 0 ? (isOpen ? "text-white" : "text-primary animate-pulse group-hover:text-white") : "currentColor"
          )} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground border-2 border-background animate-in zoom-in duration-300 shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 border-border bg-background/95 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden z-[100] w-auto" 
        align="end" 
        sideOffset={12}
        alignOffset={-4}
        collisionPadding={16}
      >
        <NotificationPopover 
          onClose={() => setIsOpen(false)} 
          onShowPopup={handleManualPopupShow}
        />
      </PopoverContent>
      
      {activePopupNotification && (
        <SystemNotificationPopup 
          isOpen={!!activePopupNotification} 
          onClose={handleClosePopup} 
          notification={activePopupNotification} 
        />
      )}
    </Popover>
  );
};
