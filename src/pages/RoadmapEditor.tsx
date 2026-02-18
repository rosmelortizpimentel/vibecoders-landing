import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoadmap, useRoadmapFeedback, RoadmapLane, RoadmapCard } from '@/hooks/useRoadmap';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FontSelector } from '@/components/me/FontSelector';
import { ColorPicker } from '@/components/me/ColorPicker';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Plus, Settings, GripVertical, MoreVertical, Pencil, Trash2, ExternalLink, MoveRight, MessageSquare, Link2, ChevronDown, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Responsive Dialog/Drawer wrapper
function ResponsiveModal({ open, onOpenChange, title, children, footer, isMobile }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isMobile: boolean;
}) {
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="px-0">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4">{children}</div>
          {footer && <DrawerFooter className="px-0 pt-4">{footer}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

// Sortable card component
function SortableCard({ card, lane, onEdit, onMove, onDelete, t }: {
  card: RoadmapCard;
  lane: RoadmapLane;
  onEdit: () => void;
  onMove: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', card, laneId: lane.id } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className="cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow border"
        style={{ borderLeftColor: lane.color, borderLeftWidth: 3 }}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0" {...attributes} {...listeners}>
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight" style={{ fontFamily: lane.font !== 'Inter' ? lane.font : undefined }}>
                  {card.title}
                </p>
                {card.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" /> {t('editor.editCard')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMove}>
                  <MoveRight className="w-4 h-4 mr-2" /> {t('editor.moveCard')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> {t('editor.deleteCard')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sortable lane wrapper (for lane reordering) - desktop only
function SortableLaneWrapper({ lane, header, children }: { lane: RoadmapLane; header: React.ReactNode; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `sortable-lane-${lane.id}`, data: { type: 'sortable-lane', lane } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-72 flex flex-col">
      <div className="flex items-center gap-1 mb-3 px-1">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        {header}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

// Droppable lane container
function DroppableLane({ laneId, children }: { laneId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `lane-${laneId}`, data: { type: 'lane', laneId } });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'space-y-2 min-h-[200px] rounded-lg p-2 transition-colors',
        isOver ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-muted/30'
      )}
    >
      {children}
    </div>
  );
}

export default function RoadmapEditor() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation('roadmap');
  const isMobile = useIsMobile();
  const roadmap = useRoadmap(appId);
  const feedbackHook = useRoadmapFeedback(appId);

  const [app, setApp] = useState<any>(null);
  const [appLoading, setAppLoading] = useState(true);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [editingLane, setEditingLane] = useState<RoadmapLane | null>(null);
  const [editingCard, setEditingCard] = useState<RoadmapCard | null>(null);
  const [addingCardToLane, setAddingCardToLane] = useState<string | null>(null);
  const [deletingLane, setDeletingLane] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);
  const [movingCard, setMovingCard] = useState<RoadmapCard | null>(null);

  // Form states
  const [laneForm, setLaneForm] = useState({ name: '', color: '#3D5AFE', font: 'Inter' });
  const [cardForm, setCardForm] = useState({ title: '', description: '' });
  const [settingsForm, setSettingsForm] = useState({ custom_title: '', font_family: 'Inter', is_public: true, favicon_url: '' });

  // Feedback management
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [linkingFeedback, setLinkingFeedback] = useState<string | null>(null);
  const [deletingFeedback, setDeletingFeedback] = useState<string | null>(null);

  // Mobile lane accordion
  const [openLanes, setOpenLanes] = useState<Set<string>>(new Set());

  // DnD state
  const [activeCard, setActiveCard] = useState<RoadmapCard | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = roadmap.cards.find(c => c.id === active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Lane reordering
    if (activeData?.type === 'sortable-lane') {
      if (overData?.type !== 'sortable-lane') return;
      const activeLane = activeData.lane as RoadmapLane;
      const overLane = overData.lane as RoadmapLane;
      if (activeLane.id === overLane.id) return;
      const oldIndex = roadmap.lanes.findIndex(l => l.id === activeLane.id);
      const newIndex = roadmap.lanes.findIndex(l => l.id === overLane.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove([...roadmap.lanes], oldIndex, newIndex);
      await roadmap.reorderLanes(reordered);
      return;
    }

    // Card reordering
    const activeCardId = active.id as string;
    const sourceLaneId = activeData?.laneId as string;
    let targetLaneId: string;
    let targetIndex: number;

    if (overData?.type === 'lane') {
      targetLaneId = overData.laneId as string;
      const laneCards = roadmap.cards.filter(c => c.lane_id === targetLaneId);
      targetIndex = laneCards.length;
    } else if (overData?.type === 'card') {
      targetLaneId = overData.laneId as string;
      const overCard = overData.card as RoadmapCard;
      const laneCards = roadmap.cards
        .filter(c => c.lane_id === targetLaneId && c.id !== activeCardId)
        .sort((a, b) => a.display_order - b.display_order);
      targetIndex = laneCards.findIndex(c => c.id === overCard.id);
      if (targetIndex === -1) targetIndex = laneCards.length;
    } else {
      return;
    }

    if (sourceLaneId === targetLaneId && overData?.type === 'card') {
      const laneCards = roadmap.cards
        .filter(c => c.lane_id === sourceLaneId)
        .sort((a, b) => a.display_order - b.display_order);
      const oldIndex = laneCards.findIndex(c => c.id === activeCardId);
      if (oldIndex === targetIndex) return;
    }

    try {
      await roadmap.moveCard(activeCardId, targetLaneId, targetIndex);
    } catch {
      toast.error(t('editor.errorMovingCard'));
    }
  };

  // Fetch app data
  useEffect(() => {
    if (!appId || !user) return;
    (async () => {
      const { data } = await supabase.from('apps').select('*').eq('id', appId).eq('user_id', user.id).single();
      setApp(data);
      setAppLoading(false);
    })();
  }, [appId, user]);

  // Sync settings form
  useEffect(() => {
    if (roadmap.settings) {
      setSettingsForm({
        custom_title: roadmap.settings.custom_title || '',
        font_family: roadmap.settings.font_family || 'Inter',
        is_public: roadmap.settings.is_public,
        favicon_url: roadmap.settings.favicon_url || '',
      });
    }
  }, [roadmap.settings]);

  // Open all lanes by default on mobile
  useEffect(() => {
    if (isMobile && roadmap.lanes.length > 0) {
      setOpenLanes(new Set(roadmap.lanes.map(l => l.id)));
    }
  }, [isMobile, roadmap.lanes.length]);

  if (authLoading || appLoading || roadmap.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">App not found</p>
        <Button variant="ghost" onClick={() => navigate('/me/apps')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('editor.backToApps')}
        </Button>
      </div>
    );
  }

  if (!app.is_verified) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">{t('editor.verifiedOnly')}</p>
        <Button variant="ghost" onClick={() => navigate('/me/apps')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('editor.backToApps')}
        </Button>
      </div>
    );
  }

  if (!roadmap.settings) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-semibold">{t('editor.initialize')}</h2>
        <p className="text-muted-foreground text-sm">{t('editor.initializeDesc')}</p>
        <Button onClick={async () => {
          try {
            await roadmap.initializeRoadmap();
            toast.success('Roadmap initialized!');
          } catch (err) {
            toast.error('Error initializing roadmap');
          }
        }}>
          {t('editor.initialize')}
        </Button>
        <div>
          <Button variant="ghost" onClick={() => navigate('/me/apps')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('editor.backToApps')}
          </Button>
        </div>
      </div>
    );
  }

  const appSlug = (app.name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSaveSettings = async () => {
    try {
      await roadmap.updateSettings(settingsForm);
      setShowSettings(false);
      toast.success('Settings saved');
    } catch { toast.error('Error saving settings'); }
  };

  const handleSaveLane = async () => {
    try {
      if (editingLane?.id) {
        await roadmap.updateLane(editingLane.id, laneForm);
      } else {
        await roadmap.createLane(laneForm.name, laneForm.color);
      }
      setEditingLane(null);
      setLaneForm({ name: '', color: '#3D5AFE', font: 'Inter' });
    } catch { toast.error('Error saving lane'); }
  };

  const handleSaveCard = async () => {
    try {
      if (editingCard) {
        await roadmap.updateCard(editingCard.id, { title: cardForm.title, description: cardForm.description || null });
      } else if (addingCardToLane) {
        await roadmap.createCard(addingCardToLane, cardForm.title, cardForm.description || undefined);
      }
      setEditingCard(null);
      setAddingCardToLane(null);
      setCardForm({ title: '', description: '' });
    } catch { toast.error('Error saving card'); }
  };

  const handleRespondFeedback = async () => {
    if (!respondingTo || !responseText.trim()) return;
    try {
      await feedbackHook.respondToFeedback(respondingTo, responseText.trim());
      setRespondingTo(null);
      setResponseText('');
      toast.success('Response sent');
    } catch { toast.error('Error sending response'); }
  };

  const toggleLane = (laneId: string) => {
    setOpenLanes(prev => {
      const next = new Set(prev);
      if (next.has(laneId)) next.delete(laneId); else next.add(laneId);
      return next;
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/roadmap')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold truncate">{app.name || 'App'} — {t('title')}</h1>
            {roadmap.settings.is_public && (
              <Link
                to={`/roadmap/${appSlug}`}
                target="_blank"
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="truncate">/roadmap/{appSlug}</span>
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Preview button */}
          {roadmap.settings.is_public && (
            <Button variant="default" size="sm" asChild>
              <a href={`/roadmap/${appSlug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{t('editor.preview')}</span>
              </a>
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setShowFeedbackPanel(!showFeedbackPanel)}>
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Feedback ({feedbackHook.feedback.length})</span>
                <span className="sm:hidden ml-1">{feedbackHook.feedback.length}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">Feedback</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">{t('editor.settings')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">{t('editor.settings')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={() => {
                setLaneForm({ name: '', color: '#3D5AFE', font: 'Inter' });
                setEditingLane({} as RoadmapLane);
              }}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">{t('editor.addLane')}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="sm:hidden">{t('editor.addLane')}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Desktop: horizontal scroll with DnD */}
        <div className="hidden md:block">
          <SortableContext items={roadmap.lanes.map(l => `sortable-lane-${l.id}`)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
              {roadmap.lanes.map(lane => {
                const laneCards = roadmap.cards
                  .filter(c => c.lane_id === lane.id)
                  .sort((a, b) => a.display_order - b.display_order);

                return (
                  <SortableLaneWrapper
                    key={lane.id}
                    lane={lane}
                    header={
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lane.color }} />
                          <h3 className="font-semibold text-sm">{lane.name}</h3>
                          <span className="text-xs text-muted-foreground">({laneCards.length})</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setLaneForm({ name: lane.name, color: lane.color, font: lane.font });
                              setEditingLane(lane);
                            }}>
                              <Pencil className="w-4 h-4 mr-2" /> {t('editor.editLane')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingLane(lane.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> {t('editor.deleteLane')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    }
                  >
                    <DroppableLane laneId={lane.id}>
                      <SortableContext items={laneCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        {laneCards.map(card => (
                          <SortableCard
                            key={card.id}
                            card={card}
                            lane={lane}
                            t={t}
                            onEdit={() => {
                              setCardForm({ title: card.title, description: card.description || '' });
                              setEditingCard(card);
                            }}
                            onMove={() => setMovingCard(card)}
                            onDelete={() => setDeletingCard(card.id)}
                          />
                        ))}
                      </SortableContext>
                      {laneCards.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-8">{t('editor.noCards')}</p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() => {
                          setCardForm({ title: '', description: '' });
                          setAddingCardToLane(lane.id);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> {t('editor.addCard')}
                      </Button>
                    </DroppableLane>
                  </SortableLaneWrapper>
                );
              })}
            </div>
          </SortableContext>
        </div>

        {/* Mobile: Collapsible stacked lanes */}
        <div className="md:hidden space-y-3">
          {roadmap.lanes.map(lane => {
            const laneCards = roadmap.cards
              .filter(c => c.lane_id === lane.id)
              .sort((a, b) => a.display_order - b.display_order);

            return (
              <Collapsible key={lane.id} open={openLanes.has(lane.id)} onOpenChange={() => toggleLane(lane.id)}>
                <div className="rounded-xl border bg-card overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lane.color }} />
                        <span className="font-semibold text-sm">{lane.name}</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{laneCards.length}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setLaneForm({ name: lane.name, color: lane.color, font: lane.font });
                              setEditingLane(lane);
                            }}>
                              <Pencil className="w-4 h-4 mr-2" /> {t('editor.editLane')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingLane(lane.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> {t('editor.deleteLane')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", openLanes.has(lane.id) && "rotate-180")} />
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-2">
                      {laneCards.map(card => (
                        <Card key={card.id} className="shadow-sm border" style={{ borderLeftColor: lane.color, borderLeftWidth: 3 }}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm leading-tight" style={{ fontFamily: lane.font !== 'Inter' ? lane.font : undefined }}>
                                  {card.title}
                                </p>
                                {card.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setCardForm({ title: card.title, description: card.description || '' });
                                    setEditingCard(card);
                                  }}>
                                    <Pencil className="w-4 h-4 mr-2" /> {t('editor.editCard')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setMovingCard(card)}>
                                    <MoveRight className="w-4 h-4 mr-2" /> {t('editor.moveCard')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setDeletingCard(card.id)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" /> {t('editor.deleteCard')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {laneCards.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">{t('editor.noCards')}</p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() => {
                          setCardForm({ title: '', description: '' });
                          setAddingCardToLane(lane.id);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> {t('editor.addCard')}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <Card className="shadow-lg border w-72 rotate-2 opacity-90" style={{ borderLeftWidth: 3, borderLeftColor: roadmap.lanes.find(l => l.id === activeCard.lane_id)?.color }}>
              <CardContent className="p-3">
                <p className="font-medium text-sm">{activeCard.title}</p>
                {activeCard.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activeCard.description}</p>}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Feedback Panel */}
      {showFeedbackPanel && (
        <div className="border-t pt-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Feedback ({feedbackHook.feedback.length})
          </h2>
          {feedbackHook.feedback.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('public.noFeedback')}</p>
          )}
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {feedbackHook.feedback.map(fb => (
              <Card key={fb.id} className="border">
                <CardContent className="p-3 md:p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{fb.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{fb.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {t(`public.status.${fb.status}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">❤️ {fb.likes_count}</span>
                    </div>
                  </div>
                  {fb.owner_response && (
                    <div className="bg-muted/50 rounded p-2 text-xs">
                      <span className="font-medium">{t('public.ownerResponse')}:</span> {fb.owner_response}
                    </div>
                  )}
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    <Select
                      value={fb.status}
                      onValueChange={(v) => feedbackHook.updateFeedbackStatus(fb.id, v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-24 sm:w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['new', 'reviewed', 'planned', 'in_progress', 'done', 'declined'].map(s => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {t(`public.status.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                      setRespondingTo(fb.id);
                      setResponseText(fb.owner_response || '');
                    }}>
                      {t('public.reply')}
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => setLinkingFeedback(fb.id)}>
                      <Link2 className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2 text-destructive hover:text-destructive" onClick={() => setDeletingFeedback(fb.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {fb.linked_card_id && (
                    <p className="text-[10px] text-primary">
                      🔗 {roadmap.cards.find(c => c.id === fb.linked_card_id)?.title || 'Linked card'}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Settings */}
      <ResponsiveModal open={showSettings} onOpenChange={setShowSettings} title={t('editor.settings')} isMobile={isMobile}
        footer={<>
          <Button variant="outline" onClick={() => setShowSettings(false)}>{t('editor.cancel')}</Button>
          <Button onClick={handleSaveSettings}>{t('editor.save')}</Button>
        </>}
      >
        <div className="space-y-2">
          <Label>{t('editor.customTitle')}</Label>
          <Input
            value={settingsForm.custom_title}
            onChange={e => setSettingsForm(prev => ({ ...prev, custom_title: e.target.value }))}
            placeholder={t('editor.customTitlePlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('editor.fontFamily')}</Label>
          <FontSelector value={settingsForm.font_family} onChange={v => setSettingsForm(prev => ({ ...prev, font_family: v }))} />
        </div>
        <div className="flex items-center justify-between">
          <Label>{t('editor.isPublic')}</Label>
          <Switch checked={settingsForm.is_public} onCheckedChange={v => setSettingsForm(prev => ({ ...prev, is_public: v }))} />
        </div>
        <div className="space-y-2">
          <Label>{t('editor.faviconUrl')}</Label>
          <Input
            value={settingsForm.favicon_url}
            onChange={e => setSettingsForm(prev => ({ ...prev, favicon_url: e.target.value }))}
            placeholder="https://example.com/favicon.ico"
          />
        </div>
      </ResponsiveModal>

      {/* Lane Dialog */}
      <ResponsiveModal open={!!editingLane} onOpenChange={() => setEditingLane(null)} title={editingLane?.id ? t('editor.editLane') : t('editor.addLane')} isMobile={isMobile}
        footer={<>
          <Button variant="outline" onClick={() => setEditingLane(null)}>{t('editor.cancel')}</Button>
          <Button onClick={handleSaveLane} disabled={!laneForm.name.trim()}>{t('editor.save')}</Button>
        </>}
      >
        <div className="space-y-2">
          <Label>{t('editor.laneName')}</Label>
          <Input value={laneForm.name} onChange={e => setLaneForm(prev => ({ ...prev, name: e.target.value }))} />
        </div>
        <ColorPicker
          label={t('editor.laneColor')}
          value={laneForm.color}
          onChange={(color) => setLaneForm(prev => ({ ...prev, color }))}
        />
        <div className="space-y-2">
          <Label>{t('editor.laneFont')}</Label>
          <FontSelector value={laneForm.font} onChange={v => setLaneForm(prev => ({ ...prev, font: v }))} />
        </div>
      </ResponsiveModal>

      {/* Card Dialog */}
      <ResponsiveModal open={!!editingCard || !!addingCardToLane} onOpenChange={() => { setEditingCard(null); setAddingCardToLane(null); }} title={editingCard ? t('editor.editCard') : t('editor.addCard')} isMobile={isMobile}
        footer={<>
          <Button variant="outline" onClick={() => { setEditingCard(null); setAddingCardToLane(null); }}>{t('editor.cancel')}</Button>
          <Button onClick={handleSaveCard} disabled={!cardForm.title.trim()}>{t('editor.save')}</Button>
        </>}
      >
        <div className="space-y-2">
          <Label>{t('editor.cardTitle')}</Label>
          <Input value={cardForm.title} onChange={e => setCardForm(prev => ({ ...prev, title: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>{t('editor.cardDescription')}</Label>
          <Textarea value={cardForm.description} onChange={e => setCardForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="resize-none" />
        </div>
      </ResponsiveModal>

      {/* Move Card Dialog */}
      <ResponsiveModal open={!!movingCard} onOpenChange={() => setMovingCard(null)} title={t('editor.moveCard')} isMobile={isMobile}>
        <div className="space-y-2">
          {roadmap.lanes.filter(l => l.id !== movingCard?.lane_id).map(lane => (
            <Button
              key={lane.id}
              variant="outline"
              className="w-full justify-start"
              onClick={async () => {
                if (movingCard) {
                  await roadmap.moveCard(movingCard.id, lane.id, 0);
                  setMovingCard(null);
                }
              }}
            >
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: lane.color }} />
              {lane.name}
            </Button>
          ))}
        </div>
      </ResponsiveModal>

      {/* Respond to Feedback */}
      <ResponsiveModal open={!!respondingTo} onOpenChange={() => setRespondingTo(null)} title={t('public.reply')} isMobile={isMobile}
        footer={<>
          <Button variant="outline" onClick={() => setRespondingTo(null)}>{t('editor.cancel')}</Button>
          <Button onClick={handleRespondFeedback} disabled={!responseText.trim()}>{t('editor.save')}</Button>
        </>}
      >
        <Textarea value={responseText} onChange={e => setResponseText(e.target.value)} rows={4} className="resize-none" />
      </ResponsiveModal>

      {/* Link Feedback to Card */}
      <ResponsiveModal open={!!linkingFeedback} onOpenChange={() => setLinkingFeedback(null)} title={t('editor.linkToCard')} isMobile={isMobile}>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={async () => {
            if (linkingFeedback) {
              await feedbackHook.linkToCard(linkingFeedback, null);
              setLinkingFeedback(null);
            }
          }}>
            {t('editor.unlink')}
          </Button>
          {roadmap.cards.map(card => (
            <Button key={card.id} variant="outline" className="w-full justify-start" onClick={async () => {
              if (linkingFeedback) {
                await feedbackHook.linkToCard(linkingFeedback, card.id);
                setLinkingFeedback(null);
              }
            }}>
              {card.title}
            </Button>
          ))}
        </div>
      </ResponsiveModal>

      {/* Delete Lane Confirm */}
      <AlertDialog open={!!deletingLane} onOpenChange={() => setDeletingLane(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.laneTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.laneDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => {
              if (deletingLane) {
                await roadmap.deleteLane(deletingLane);
                setDeletingLane(null);
              }
            }}>
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Card Confirm */}
      <AlertDialog open={!!deletingCard} onOpenChange={() => setDeletingCard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.cardTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.cardDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => {
              if (deletingCard) {
                await roadmap.deleteCard(deletingCard);
                setDeletingCard(null);
              }
            }}>
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Feedback Confirm */}
      <AlertDialog open={!!deletingFeedback} onOpenChange={() => setDeletingFeedback(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.feedbackTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.feedbackDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => {
              if (deletingFeedback) {
                await feedbackHook.deleteFeedback(deletingFeedback);
                setDeletingFeedback(null);
              }
            }}>
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
