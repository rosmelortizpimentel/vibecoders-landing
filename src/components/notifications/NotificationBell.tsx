import React, { useState } from 'react';
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

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

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
        <NotificationPopover onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};
