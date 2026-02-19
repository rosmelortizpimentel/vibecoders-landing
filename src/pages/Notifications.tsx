import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CheckCheck, BellOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, isLoading, refetch } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const { t } = useTranslation('notifications');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read_at;
    return true;
  });

  return (
    <div className="container px-4 py-6 max-w-5xl mx-auto pt-2 pb-24">
      <div className="animate-in fade-in duration-500">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">
              {t('subtitle')}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllAsRead()}
              className="gap-2 hov-button"
            >
              <CheckCheck className="w-4 h-4" />
              {t('markAllAsRead')}
            </Button>
          )}
        </div>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <CardHeader className="p-0 border-b border-border/50">
              <div className="px-6 flex items-center justify-between h-14">
                <TabsList className="bg-transparent h-auto p-0 gap-6">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-4"
                  >
                    {t('tabs.all')}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="unread" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-4 relative"
                  >
                    {t('tabs.unread')}
                    {unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
               {isLoading && notifications.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20">
                   <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
                   <p className="mt-4 text-sm text-muted-foreground">{t('loading')}</p>
                 </div>
               ) : filteredNotifications.length > 0 ? (
                 <div className="divide-y divide-border/50">
                   {filteredNotifications.map((notification) => (
                     <NotificationItem 
                       key={notification.id} 
                       notification={notification} 
                       onRead={markAsRead}
                       onDelete={deleteNotification}
                     />
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <BellOff className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-lg font-medium">{t('empty')}</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
                      {activeTab === 'unread' 
                        ? t('emptyStates.unread')
                        : t('emptyStates.all')}
                    </p>
                    <Button 
                     variant="link" 
                     className="mt-4 text-primary"
                     onClick={() => setActiveTab('all')}
                    >
                      {t('viewAll')}
                    </Button>
                 </div>
               )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};
