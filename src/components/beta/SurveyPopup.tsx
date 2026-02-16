import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  GripVertical, 
  Loader2, 
  CheckCircle2,
  CalendarDays,
  ClipboardList,
  Trophy
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

interface SurveyOption {
  id: string;
  text: string;
  description?: string;
}

interface Survey {
  id: string;
  title: string;
  question: string;
  badge_text: string;
  description: string;
  show_comment_field: boolean;
  survey_options: SurveyOption[];
}

function SortableOptionItem({ option, index }: { option: SurveyOption; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-start gap-2 py-2 px-3 bg-white rounded-lg border transition-all cursor-default group ${
        isDragging ? 'border-[#3D5AFE] shadow-md ring-2 ring-[#3D5AFE]/10 z-50' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="flex h-6 w-6 items-center justify-center bg-gray-50 rounded hover:bg-[#3D5AFE]/5 group-hover:text-[#3D5AFE] transition-colors touch-none flex-shrink-0 mt-0.5"
      >
        <GripVertical className="h-3.5 w-3.5 text-gray-400" />
      </div>
      
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-gray-400 w-4 flex-shrink-0">
            {index + 1}
          </span>
          <p className="font-bold text-gray-900 text-[14px] leading-[1.2] truncate">
            {option.text}
          </p>
        </div>
        {option.description && (
          <p className="text-[13px] text-gray-500 leading-normal pl-6 line-clamp-2">
            {option.description}
          </p>
        )}
      </div>
    </div>
  );
}

export function SurveyPopup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation('survey');
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [comment, setComment] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: activeSurvey, isLoading } = useQuery({
    queryKey: ['active-survey', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: surveys, error: surveyError } = await supabase
        .from('surveys')
        .select(`
          id,
          title,
          question,
          badge_text,
          description,
          show_comment_field,
          survey_options (id, text, description, order_index)
        `)
        .eq('is_active', true)
        .limit(1);

      if (surveyError || !surveys || surveys.length === 0) return null;

      const survey = surveys[0];

      const { data: response, error: responseError } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('survey_id', survey.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (responseError || response) return null;

      return {
        ...survey,
        survey_options: survey.survey_options.sort((a, b) => a.order_index - b.order_index)
      } as Survey;
    },
    enabled: !!user,
  });

  const [orderedOptions, setOrderedOptions] = useState<SurveyOption[]>([]);

  useEffect(() => {
    if (activeSurvey) {
      setOrderedOptions(activeSurvey.survey_options);
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [activeSurvey]);

  const responseMutation = useMutation({
    mutationFn: async ({ skipped }: { skipped: boolean }) => {
      if (!user || !activeSurvey) return;

      const { error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: activeSurvey.id,
          user_id: user.id,
          ordered_option_ids: skipped ? [] : orderedOptions.map(o => o.id),
          comment: skipped ? null : comment,
          skipped
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      if (!variables.skipped) {
        setIsSubmitted(true);
        setTimeout(() => setIsVisible(false), 2000);
      } else {
        setIsVisible(false);
      }
      queryClient.invalidateQueries({ queryKey: ['active-survey'] });
    },
    onError: () => {
      toast.error(t('errorSaving'));
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedOptions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleClose = () => {
    responseMutation.mutate({ skipped: true });
  };

  const handleSubmit = () => {
    responseMutation.mutate({ skipped: false });
  };

  if (!isVisible || !activeSurvey) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white md:rounded-[24px] w-full h-full md:h-auto md:max-w-[440px] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col">
        
        {isSubmitted ? (
          <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('thankYou')}</h2>
              <p className="text-gray-500 text-sm">{t('thankYouDescription')}</p>
            </div>
        ) : (
          <>
            {/* Compact Header */}
            <div className="px-4 py-3 bg-[#3D5AFE] text-white relative flex-shrink-0 min-h-[80px] flex flex-col justify-center">
              <button 
                onClick={handleClose}
                className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-full transition-colors z-10"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList className="h-4 w-4 opacity-70" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  {activeSurvey.badge_text || t('defaultBadge')}
                </span>
              </div>
              
              <h2 className="text-base font-bold leading-tight truncate">
                {activeSurvey.question}
              </h2>
              <p className="text-[11px] text-white/80 truncate">
                {activeSurvey.description || t('defaultDescription')}
              </p>
            </div>

            {/* Scrollable Content with Gradients */}
            <div className="relative flex-1 flex flex-col">
              {/* Top Gradient */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#F8FAFF] to-transparent z-[5] pointer-events-none" />
              
              <div className="overflow-y-auto px-4 py-4 space-y-2 bg-[#F8FAFF]" style={{ height: 'calc(80vh - 180px)', minHeight: '300px' }}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={orderedOptions.map(o => o.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 pb-2">
                      {orderedOptions.map((option, index) => (
                        <SortableOptionItem 
                          key={option.id} 
                          option={option} 
                          index={index} 
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {activeSurvey.show_comment_field && (
                  <div className="space-y-1 pt-2 pb-6">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                      {t('commentLabel')}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t('commentPlaceholder')}
                      className="w-full min-h-[60px] p-2 bg-white border border-gray-100 rounded-lg text-[13px] focus:ring-1 focus:ring-[#3D5AFE] outline-none shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#F8FAFF] to-transparent z-[5] pointer-events-none" />
            </div>

            {/* Sticky Footer with Blur */}
            <div className="p-3 md:p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                onClick={handleClose}
                className="flex-1 text-gray-500 font-medium text-sm h-10"
              >
                {t('close')}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={responseMutation.isPending}
                className="flex-[2] bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white font-bold rounded-lg h-10 text-sm shadow-md"
              >
                {responseMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('submit')
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
