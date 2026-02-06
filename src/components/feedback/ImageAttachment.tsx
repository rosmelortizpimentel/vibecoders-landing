import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { FeedbackAttachment } from '@/hooks/useFeedback';

interface ImageAttachmentProps {
  attachment: FeedbackAttachment;
}

export function ImageAttachment({ attachment }: ImageAttachmentProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
      >
        <img
          src={attachment.file_url}
          alt={attachment.file_name}
          className="h-20 w-20 object-cover"
        />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <img
            src={attachment.file_url}
            alt={attachment.file_name}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
