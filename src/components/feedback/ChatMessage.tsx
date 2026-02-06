import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ImageAttachment } from './ImageAttachment';
import { MoreVertical, Pencil, Trash2, Mail, Check, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { FeedbackMessage } from '@/hooks/useFeedback';

interface ChatMessageProps {
  message: FeedbackMessage;
  isOwn: boolean;
  isAdmin?: boolean;
  onDelete?: (messageId: string) => Promise<void>;
  onUpdate?: (messageId: string, content: string) => Promise<void>;
  userEmail?: string | null;
}

export function ChatMessage({ message, isOwn, isAdmin, onDelete, onUpdate, userEmail }: ChatMessageProps) {
  const t = useTranslation('feedback');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const initials = message.sender?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const handleSendEmail = () => {
    if (!userEmail) return;
    const body = encodeURIComponent(message.content);
    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(userEmail)}&body=${body}`, '_blank');
  };

  const handleSaveEdit = async () => {
    if (!onUpdate || editContent.trim() === '' || editContent === message.content) {
      setIsEditing(false);
      return;
    }
    setIsProcessing(true);
    try {
      await onUpdate(message.id, editContent.trim());
      setIsEditing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsProcessing(true);
    try {
      await onDelete(message.id);
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  const showActions = isAdmin && isOwn;

  return (
    <>
      <div
        className={cn(
          'group flex gap-3 max-w-[85%]',
          isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.sender?.avatar_url || ''} alt={message.sender?.name || ''} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
          {/* Sender info */}
          <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
            {message.sender?.username && (
              <span className="text-xs font-medium text-foreground/80">
                @{message.sender.username}
              </span>
            )}
            {message.sender?.name && (
              <span className="text-xs text-muted-foreground">
                {message.sender.name}
              </span>
            )}
          </div>

          <div className="flex items-start gap-1">
            {/* Actions menu (before bubble when own) */}
            {showActions && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                  <DropdownMenuItem onClick={() => { setEditContent(message.content); setIsEditing(true); }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t.editMessage}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.deleteMessage}
                  </DropdownMenuItem>
                  {userEmail && (
                    <DropdownMenuItem onClick={handleSendEmail}>
                      <Mail className="h-4 w-4 mr-2" />
                      {t.sendEmail}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isEditing ? (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                  autoFocus
                />
                <div className="flex gap-1 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={isProcessing}>
                    <X className="h-3.5 w-3.5 mr-1" />
                    {t.cancelEdit}
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit} disabled={isProcessing}>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    {t.saveEdit}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'rounded-2xl px-4 py-2 text-sm',
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            )}
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className={cn(
              'flex flex-wrap gap-2 mt-1',
              isOwn ? 'justify-end' : 'justify-start'
            )}>
              {message.attachments.map((attachment) => (
                <ImageAttachment key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}

          <span className="text-xs text-muted-foreground">
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteMessageConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteMessageDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancelEdit}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.deleteMessage}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
