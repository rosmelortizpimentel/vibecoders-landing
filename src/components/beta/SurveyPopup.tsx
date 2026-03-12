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
      className={`flex items-start gap-4 py-2.5 px-4 bg-white rounded-xl border transition-all cursor-default group ${
        isDragging ? 'border-[#3D5AFE] shadow-xl ring-2 ring-[#3D5AFE]/5 z-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="flex h-8 w-8 items-center justify-center bg-gray-50 rounded-lg group-hover:bg-[#3D5AFE]/5 group-hover:text-[#3D5AFE] transition-colors touch-none flex-shrink-0"
      >
        <GripVertical className="h-4 w-4 text-gray-300" />
      </div>
      
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span className="text-[11px] font-mono font-bold text-gray-300 mt-0.5">
            0{index + 1}
          </span>
          <p className="font-semibold text-gray-900 text-[14px] leading-tight">
            {option.text}
          </p>
        </div>
        {option.description && (
          <p className="text-[12px] text-gray-500 leading-relaxed pl-6">
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
      <div className="bg-white md:rounded-[24px] w-full h-full md:h-auto md:max-w-[660px] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col">
        
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
            {/* Compact Premium Header */}
            <div className="px-5 py-4 bg-gradient-to-br from-[#3D5AFE] to-[#2A41C7] text-white relative flex-shrink-0">
              <button 
                onClick={handleClose}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition-colors z-10"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-white/10 rounded-md">
                  <ClipboardList className="h-3 w-3" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-80">
                  {activeSurvey.badge_text || t('defaultBadge')}
                </span>
              </div>
              
              <h2 className="text-[15px] font-bold leading-tight mb-1 pr-6">
                {activeSurvey.question}
              </h2>
              <p className="text-[11px] text-white/70 leading-normal font-medium max-w-[90%]">
                {activeSurvey.description || t('defaultDescription')}
              </p>
            </div>

            {/* Scrollable Content with Gradients */}
            <div className="relative flex-1 flex flex-col bg-[#F8FAFF]">
              <div 
                className="overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar" 
                style={{ maxHeight: 'calc(80vh - 160px)', minHeight: '320px' }}
              >
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
                  <div className="space-y-2 pt-4 pb-4">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      {t('commentLabel')}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t('commentPlaceholder')}
                      className="w-full min-h-[80px] p-3 bg-white border border-gray-100 rounded-xl text-[13px] focus:ring-2 focus:ring-[#3D5AFE]/20 focus:border-[#3D5AFE] outline-none transition-all placeholder:text-gray-300 shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#F8FAFF] to-transparent z-[5] pointer-events-none" />
            </div>

            {/* Sticky Footer with refined typography */}
            <div className="p-4 md:px-6 md:py-4 bg-white/90 backdrop-blur-md border-t border-gray-50 flex items-center gap-3 flex-shrink-0">
              <Button 
                variant="ghost" 
                onClick={handleClose}
                className="flex-1 text-gray-400 hover:text-gray-600 font-medium text-[13px] h-11"
              >
                {t('close')}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={responseMutation.isPending}
                className="flex-[2] bg-[#3D5AFE] hover:bg-[#2A41C7] text-white font-bold rounded-xl h-11 text-[13px] shadow-lg shadow-[#3D5AFE]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
