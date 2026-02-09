import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTesterFeedback, TesterFeedback, FeedbackAttachment } from '@/hooks/useTesterFeedback';
import { BetaFeedbackForm } from './BetaFeedbackForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MessageSquare, Pencil, Trash2, MoreVertical, Circle, Clock, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageCarouselDialog } from './ImageCarouselDialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BetaActionCardProps {
  appId: string;
}

export function BetaActionCard({ appId }: BetaActionCardProps) {
  const { t } = useTranslation('beta');
  const { feedback, refetch, deleteFeedback, responding } = useTesterFeedback(appId);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState<{ url: string; name: string }[]>([]);
  const [carouselInitialIndex, setCarouselInitialIndex] = useState(0);

  const [editingItem, setEditingItem] = useState<TesterFeedback | null>(null);
  const [selectedItem, setSelectedItem] = useState<TesterFeedback | null>(null);

  const handleFormSuccess = () => {
    setOpen(false);
    setEditOpen(false);
    setEditingItem(null);
    refetch();
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'open': 
        return "bg-amber-100/10 text-amber-500 border-amber-500/20";
      case 'in_review': 
        return "bg-blue-100/10 text-blue-500 border-blue-500/20";
      case 'closed': 
      case 'fixed':
        return "bg-emerald-100/10 text-emerald-500 border-emerald-500/20";
      default: 
        return "bg-muted text-muted-foreground border-transparent";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return t('feedbackOpen');
      case 'in_review': return t('feedbackInReview');
      case 'closed': return t('feedbackClosed');
      case 'fixed': return 'Fixed';
      default: return status;
    }
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!deleteId) return;
    try {
      await deleteFeedback(deleteId);
      toast.success(t('reportDeleted') || 'Report deleted');
      setDeleteId(null);
      refetch();
    } catch (err) {
      toast.error('Error deleting report');
    }
  };

  const handleEdit = (item: TesterFeedback, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditOpen(true);
  };

  const handleShowDetail = (item: TesterFeedback) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const openImageCarousel = (images: FeedbackAttachment[], index: number) => {
    setCarouselImages(images.map(img => ({ url: img.file_url, name: img.file_name })));
    setCarouselInitialIndex(index);
    setCarouselOpen(true);
  };

  const recentFeedback = feedback.slice(0, 5);

  return (
    <>
      <Card className="h-full border-primary/20 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground/90">
            <MessageSquare className="w-4 h-4 text-primary" />
            {t('reportTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <Button 
            className="w-full relative group transition-all hover:scale-[1.01]" 
            variant="outline"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('reportNewFinding')}
          </Button>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {t('myReports')}
            </p>
            {recentFeedback.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {t('noReportsYet')}
              </p>
            ) : (
              <div className="space-y-3">
                {recentFeedback.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleShowDetail(item)}
                    className="p-3 rounded-lg bg-muted/30 border border-primary/5 space-y-2 relative group cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] font-normal leading-relaxed text-foreground/80 line-clamp-3">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] h-5 px-1.5 font-medium border", getStatusBadgeStyles(item.status))}
                        >
                          {getStatusLabel(item.status)}
                        </Badge>
                        
                        {item.status === 'open' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleEdit(item, e)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>{t('edit')}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(item.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{t('delete')}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 font-medium">
                       {new Date(item.created_at).toLocaleDateString(navigator.language, { 
                         day: 'numeric', 
                         month: 'short', 
                         hour: '2-digit', 
                         minute: '2-digit' 
                       })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-xl max-h-[85vh] p-0 !flex flex-col overflow-hidden">
          <div className="p-6 pb-2 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                 <Plus className="w-5 h-5 text-primary" />
                 {t('reportNewFinding')}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y">
            <div className="p-6">
              <BetaFeedbackForm 
                appId={appId} 
                onSuccess={handleFormSuccess}
                onCancel={() => setOpen(false)}
                showCancel
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(v) => {
        if (!v) {
          setEditOpen(false);
          setEditingItem(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-xl max-h-[85vh] p-0 !flex flex-col overflow-hidden">
          <div className="p-6 pb-2 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-primary" />
                {t('editReport')}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y">
            <div className="p-6">
              <BetaFeedbackForm 
                appId={appId} 
                mode="edit"
                feedbackId={editingItem?.id}
                initialData={editingItem ? {
                  type: editingItem.type,
                  content: editingItem.content,
                  rating: editingItem.rating,
                  attachments: editingItem.attachments
                } : undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => setEditOpen(false)}
                showCancel
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-xl w-[95vw] rounded-xl max-h-[85vh] p-0 !flex flex-col overflow-hidden">
          <div className="p-6 pb-2 border-b">
            <DialogHeader>
              <div className="flex items-center justify-between mt-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs font-medium border px-2 py-0.5", selectedItem && getStatusBadgeStyles(selectedItem.status))}
                >
                  {selectedItem && getStatusLabel(selectedItem.status)}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {selectedItem && new Date(selectedItem.created_at).toLocaleString()}
                </div>
              </div>
              <DialogTitle className="text-xl mt-4">{t('reportDetail')}</DialogTitle>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 touch-pan-y">
            <div className="p-6 pt-2">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-primary/5 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedItem?.content}
                  </div>
                </div>
                
                {selectedItem?.attachments?.length && selectedItem.attachments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('attachments')}</h4>
                    <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedItem.attachments.map((att, idx) => (
                        <div 
                          key={att.id} 
                          onClick={() => openImageCarousel(selectedItem.attachments, idx)}
                          className="aspect-video rounded-lg bg-muted flex items-center justify-center border hover:border-primary/40 cursor-pointer transition-colors overflow-hidden group"
                        >
                          {att.file_type?.startsWith('image/') ? (
                            <img src={att.file_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedItem?.status === 'open' && (
            <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={(e) => handleEdit(selectedItem, e)}>
                <Pencil className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => {
                setDeleteId(selectedItem.id);
                setDetailOpen(false);
              }}>
                <Trash2 className="w-4 h-4 mr-2" />
                {t('delete')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ImageCarouselDialog
        images={carouselImages}
        initialIndex={carouselInitialIndex}
        open={carouselOpen}
        onOpenChange={setCarouselOpen}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
