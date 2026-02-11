import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SystemNotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    id: string;
    meta: {
      title: string;
      subtitle?: string;
      message?: string;
      image_url?: string;
      button_text?: string;
      button_link?: string;
    }
  };
}

export function SystemNotificationPopup({ isOpen, onClose, notification }: SystemNotificationPopupProps) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!notification.meta?.image_url) return;
      
      const path = String(notification.meta.image_url);
      if (path.startsWith('http')) {
        setImageUrl(path);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from('broadcasts')
          .createSignedUrl(path, 3600);

        if (error) throw error;
        setImageUrl(data.signedUrl);
      } catch (err) {
        console.error('Error getting signed URL for popup:', err);
      }
    };

    if (isOpen) {
      getSignedUrl();
    }
  }, [isOpen, notification.meta?.image_url]);

  const handleAction = () => {
    const link = notification.meta.button_link;
    if (link) {
      window.open(link.startsWith('http') ? link : `https://${link}`, '_blank');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-primary/10 rounded-2xl overflow-hidden shadow-2xl">
        <DialogHeader className="pt-6 pb-2">
          <div className="mx-auto mb-4 flex justify-center">
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg ring-2 ring-primary/5">
              <AvatarImage src={vibecodersLogo} alt="VibeCoders" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">VC</AvatarFallback>
            </Avatar>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-slate-900 px-4">
            {notification.meta.title}
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600 px-6 pt-2 leading-relaxed">
            {notification.meta.subtitle || notification.meta.message}
          </DialogDescription>
        </DialogHeader>

        {imageUrl && (
          <div className="px-6 py-2">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner max-h-[300px] flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt="Notification" 
                className="w-full h-auto object-contain max-h-[300px] transition-transform hover:scale-105 duration-500" 
              />
            </div>
          </div>
        )}

        <DialogFooter className="px-6 pb-6 pt-4 flex flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="flex-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            Cerrar
          </Button>
          {notification.meta.button_text && (
            <Button 
              onClick={handleAction} 
              className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              {notification.meta.button_text}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
